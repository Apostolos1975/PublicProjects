# PII Checker

A simple web application that scans documents for Personally Identifiable Information (PII).

## Features

- **Multiple Document Formats**: Supports PDF, DOCX, and TXT files
- **Comprehensive PII Detection**: Detects various types of PII including:
  - Email addresses
  - Social Security Numbers (SSN)
  - Credit card numbers
  - US phone numbers
  - IP addresses
  - Dates of birth
  - Passport numbers
  - Driver license numbers
- **User-Friendly Interface**: Clean, modern web interface with drag-and-drop file upload
- **Detailed Results**: Shows all detected PII with context and categorization

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Upload a document (PDF, DOCX, or TXT) by dragging and dropping or clicking to browse

4. View the scan results showing any detected PII

## Supported File Types

- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)

## PII Detection

The system uses pattern matching to detect:
- **Email Addresses**: Standard email format
- **SSN**: XXX-XX-XXXX or XXXXXXXXX format
- **Credit Cards**: 16-digit card numbers
- **Phone Numbers**: US phone number formats
- **IP Addresses**: IPv4 addresses
- **Dates**: Potential date of birth formats
- **Passport Numbers**: Common passport number patterns
- **Driver License**: Driver license number patterns

## Security Note

Uploaded files are automatically deleted after processing. No files are stored on the server.

## License

MIT License

