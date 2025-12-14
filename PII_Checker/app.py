from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import re
from werkzeug.utils import secure_filename
import PyPDF2
import docx
from typing import List, Dict, Tuple
from pii_patterns import PII_PATTERNS

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'doc'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        raise Exception(f"Error reading DOCX: {str(e)}")

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            return file.read()
    except Exception as e:
        raise Exception(f"Error reading TXT: {str(e)}")

def extract_text(file_path: str, file_type: str) -> str:
    """Extract text from document based on file type."""
    if file_type == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type in ['docx', 'doc']:
        return extract_text_from_docx(file_path)
    elif file_type == 'txt':
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

# PII Detection Patterns are imported from pii_patterns module

def detect_pii(text: str) -> Dict:
    """Detect PII in text and return findings."""
    findings = {
        'has_pii': False,
        'categories': {},
        'total_matches': 0,
        'matches': []
    }
    
    for pii_type, pii_info in PII_PATTERNS.items():
        pattern = pii_info['pattern']
        matches = re.finditer(pattern, text, re.IGNORECASE)
        match_list = []
        
        for match in matches:
            # Get context around the match (50 chars before and after)
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 50)
            context = text[start:end]
            
            match_list.append({
                'value': match.group(),
                'position': match.start(),
                'context': context.strip()
            })
        
        if match_list:
            findings['has_pii'] = True
            findings['categories'][pii_type] = {
                'name': pii_info['name'],
                'description': pii_info['description'],
                'count': len(match_list),
                'matches': match_list
            }
            findings['total_matches'] += len(match_list)
            findings['matches'].extend([
                {
                    'type': pii_type,
                    'type_name': pii_info['name'],
                    'value': m['value'],
                    'position': m['position'],
                    'context': m['context']
                } for m in match_list
            ])
    
    # Sort matches by position
    findings['matches'].sort(key=lambda x: x['position'])
    
    return findings

@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html')

@app.route('/api/check-pii', methods=['POST'])
def check_pii():
    """Endpoint to check for PII in uploaded document."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Supported: PDF, DOCX, TXT'}), 400
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Extract text based on file type
        file_ext = filename.rsplit('.', 1)[1].lower()
        text = extract_text(file_path, file_ext)
        
        if not text.strip():
            os.remove(file_path)
            return jsonify({'error': 'Could not extract text from document'}), 400
        
        # Detect PII
        findings = detect_pii(text)
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'text_length': len(text),
            'findings': findings
        })
    
    except Exception as e:
        # Clean up file if it exists
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

