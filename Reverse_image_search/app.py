from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import base64
import os
from io import BytesIO
import json

app = Flask(__name__, static_folder='static')
CORS(app)

# API Configuration - These should be set as environment variables
API_CONFIG = {
    'google_api_key': os.getenv('GOOGLE_API_KEY', ''),
    'google_cx': os.getenv('GOOGLE_CX', ''),
    'bing_api_key': os.getenv('BING_API_KEY', ''),
    'tineye_api_key': os.getenv('TINEYE_API_KEY', ''),
    'tineye_secret': os.getenv('TINEYE_SECRET', ''),
}

class ReverseImageSearch:
    """Base class for reverse image search implementations"""
    
    @staticmethod
    def google_search(image_data, api_key, cx):
        """Google Reverse Image Search using Custom Search API
        
        Note: Google Custom Search API doesn't directly support reverse image search.
        For true reverse image search, you would need to:
        1. Upload image to Google Images search page (requires web scraping)
        2. Or use Google Vision API to extract features and search by description
        3. Or use a third-party service that wraps Google's reverse image search
        
        This implementation provides a basic search functionality.
        """
        try:
            # For demonstration, we'll use the image search API
            # In production, you'd need to implement actual reverse image search
            url = "https://www.googleapis.com/customsearch/v1"
            
            # Convert image to base64 for potential use
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Note: This is a placeholder - actual reverse image search requires
            # uploading the image to Google Images or using Vision API
            params = {
                'key': api_key,
                'cx': cx,
                'searchType': 'image',
                'q': 'image search',  # Placeholder query
                'num': 10
            }
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'results': data.get('items', [])[:10],
                    'total_results': data.get('searchInformation', {}).get('totalResults', '0'),
                    'note': 'Google Custom Search API requires additional setup for true reverse image search'
                }
            return {'success': False, 'error': f'API returned status {response.status_code}'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def bing_visual_search(image_data, api_key):
        """Bing Visual Search API"""
        try:
            endpoint = "https://api.bing.microsoft.com/v7.0/images/visualsearch"
            headers = {
                'Ocp-Apim-Subscription-Key': api_key
            }
            
            # Bing Visual Search requires multipart/form-data with the image file
            files = {
                'image': ('image.jpg', BytesIO(image_data), 'image/jpeg')
            }
            
            # Optional: You can also provide knowledgeRequest parameter
            data = {
                'knowledgeRequest': json.dumps({
                    'filters': {
                        'site': ''
                    }
                })
            }
            
            response = requests.post(endpoint, headers=headers, files=files, data=data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                tags = data.get('tags', [])
                results = []
                total_results = 0
                
                for tag in tags:
                    actions = tag.get('actions', [])
                    for action in actions:
                        if action.get('actionType') == 'VisualSearch':
                            results.extend(action.get('data', {}).get('value', []))
                            total_results = len(action.get('data', {}).get('value', []))
                
                return {
                    'success': True,
                    'results': results[:10],  # Limit to 10 results
                    'total_results': total_results or len(results)
                }
            elif response.status_code == 401:
                return {'success': False, 'error': 'Invalid API key'}
            else:
                error_text = response.text[:200] if response.text else 'Unknown error'
                return {'success': False, 'error': f'API returned status {response.status_code}: {error_text}'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def tineye_search(image_data, api_key, secret):
        """TinEye Reverse Image Search API"""
        try:
            import hmac
            import hashlib
            import time
            
            endpoint = "https://api.tineye.com/rest/search/"
            timestamp = str(int(time.time()))
            
            # TinEye uses HMAC authentication
            message = f"{api_key}{timestamp}"
            signature = hmac.new(
                secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            headers = {
                'x-api-key': api_key,
                'x-api-signature': signature,
                'x-api-timestamp': timestamp
            }
            
            files = {'image': ('image.jpg', image_data, 'image/jpeg')}
            response = requests.post(endpoint, headers=headers, files=files, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'results': data.get('results', []),
                    'total_results': data.get('total_results', 0)
                }
            return {'success': False, 'error': f'API returned status {response.status_code}'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def yandex_search(image_url):
        """Yandex Reverse Image Search (web scraping approach)"""
        try:
            # Yandex doesn't have a public API, so this would require web scraping
            # For now, return a placeholder
            return {
                'success': False,
                'error': 'Yandex API requires web scraping implementation',
                'note': 'Yandex reverse image search is available at https://yandex.com/images/'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/compare', methods=['POST'])
def compare_apis():
    """Compare multiple reverse image search APIs"""
    try:
        data = request.json
        image_data = data.get('image_data')  # Base64 encoded image
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
        except:
            return jsonify({'error': 'Invalid image data format'}), 400
        
        results = {}
        
        # Google Search
        if API_CONFIG['google_api_key'] and API_CONFIG['google_cx']:
            results['google'] = ReverseImageSearch.google_search(
                image_bytes,
                API_CONFIG['google_api_key'],
                API_CONFIG['google_cx']
            )
        else:
            results['google'] = {'success': False, 'error': 'API key not configured'}
        
        # Bing Visual Search
        if API_CONFIG['bing_api_key']:
            results['bing'] = ReverseImageSearch.bing_visual_search(
                image_bytes,
                API_CONFIG['bing_api_key']
            )
        else:
            results['bing'] = {'success': False, 'error': 'API key not configured'}
        
        # TinEye Search
        if API_CONFIG['tineye_api_key'] and API_CONFIG['tineye_secret']:
            results['tineye'] = ReverseImageSearch.tineye_search(
                image_bytes,
                API_CONFIG['tineye_api_key'],
                API_CONFIG['tineye_secret']
            )
        else:
            results['tineye'] = {'success': False, 'error': 'API key not configured'}
        
        # Yandex (placeholder)
        results['yandex'] = ReverseImageSearch.yandex_search(None)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services', methods=['GET'])
def get_services():
    """Get information about available services"""
    services = {
        'google': {
            'name': 'Google Reverse Image Search',
            'api_docs': 'https://developers.google.com/custom-search/v1/overview',
            'configured': bool(API_CONFIG['google_api_key'] and API_CONFIG['google_cx']),
            'features': ['Web results', 'Image similarity', 'Source detection']
        },
        'bing': {
            'name': 'Bing Visual Search',
            'api_docs': 'https://www.microsoft.com/en-us/bing/apis/bing-visual-search-api',
            'configured': bool(API_CONFIG['bing_api_key']),
            'features': ['Visual similarity', 'Product search', 'Landmark recognition']
        },
        'tineye': {
            'name': 'TinEye',
            'api_docs': 'https://tineye.com/api',
            'configured': bool(API_CONFIG['tineye_api_key'] and API_CONFIG['tineye_secret']),
            'features': ['Exact matches', 'Modified image detection', 'Usage tracking']
        },
        'yandex': {
            'name': 'Yandex Images',
            'api_docs': 'https://yandex.com/images/',
            'configured': False,
            'features': ['Web scraping required', 'No official API']
        }
    }
    return jsonify(services)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

