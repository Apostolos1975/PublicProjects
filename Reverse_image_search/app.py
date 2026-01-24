from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import base64
import os
from io import BytesIO
import json

# Try to load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    # Load .env file from the current directory
    env_loaded = load_dotenv()
    if env_loaded:
        print("✓ .env file loaded successfully")
    else:
        print("⚠ .env file not found or couldn't be loaded")
except ImportError:
    print("⚠ python-dotenv not installed. Install it with: pip install python-dotenv")
    print("  Environment variables must be set manually.")

app = Flask(__name__, static_folder='static')
CORS(app)

# API Configuration - These should be set as environment variables or in .env file
API_CONFIG = {
    'google_api_key': os.getenv('GOOGLE_API_KEY', '').strip(),
    'google_cx': os.getenv('GOOGLE_CX', '').strip(),
    'bing_api_key': os.getenv('BING_API_KEY', '').strip(),
    'tineye_api_key': os.getenv('TINEYE_API_KEY', '').strip(),
    'tineye_secret': os.getenv('TINEYE_SECRET', '').strip(),
    'yandex_api_key': os.getenv('YANDEX_API_KEY', '').strip(),
    'yandex_folder_id': os.getenv('YANDEX_FOLDER_ID', '').strip(),
}

# Debug: Print configuration status (without showing actual keys)
print("\nAPI Configuration Status:")
print(f"  Google API Key: {'✓ Configured' if API_CONFIG['google_api_key'] else '✗ Not configured'}")
print(f"  Google CX: {'✓ Configured' if API_CONFIG['google_cx'] else '✗ Not configured'}")
print(f"  Bing API Key: {'✓ Configured' if API_CONFIG['bing_api_key'] else '✗ Not configured'}")
print(f"  TinEye API Key: {'✓ Configured' if API_CONFIG['tineye_api_key'] else '✗ Not configured'}")
print(f"  Yandex API Key: {'✓ Configured' if API_CONFIG['yandex_api_key'] else '✗ Not configured'}")
print(f"  Yandex Folder ID: {'✓ Configured' if API_CONFIG['yandex_folder_id'] else '✗ Not configured'}")
print()

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
            else:
                # Try to get detailed error message from Google's API response
                try:
                    error_data = response.json()
                    error_message = error_data.get('error', {}).get('message', 'Unknown error')
                    error_code = error_data.get('error', {}).get('code', response.status_code)
                    return {
                        'success': False, 
                        'error': f'Google API Error ({error_code}): {error_message}',
                        'details': error_data.get('error', {})
                    }
                except:
                    # If JSON parsing fails, return the raw response
                    error_text = response.text[:500] if response.text else 'Unknown error'
                    return {
                        'success': False, 
                        'error': f'API returned status {response.status_code}',
                        'details': error_text
                    }
        except Exception as e:
            return {'success': False, 'error': f'Request failed: {str(e)}'}
    
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
    def yandex_search(image_data, api_key, folder_id):
        """Yandex Reverse Image Search using Yandex Cloud Search API
        
        Documentation: https://yandex.cloud/en/docs/search-api/concepts/pic-search
        """
        try:
            endpoint = "https://searchapi.api.cloud.yandex.net/v2/image/search_by_image"
            
            headers = {
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            }
            
            # Encode image to base64 for JSON transmission
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prepare request body
            payload = {
                'folderId': folder_id,
                'image': image_base64
            }
            
            response = requests.post(endpoint, headers=headers, json=payload, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                # Extract results from Yandex API response
                # The structure may vary, so we'll handle different possible formats
                results = []
                total_results = 0
                
                # Try to extract results from various possible response structures
                if 'results' in data:
                    results = data.get('results', [])
                    total_results = len(results)
                elif 'items' in data:
                    results = data.get('items', [])
                    total_results = len(results)
                elif 'images' in data:
                    results = data.get('images', [])
                    total_results = len(results)
                else:
                    # If structure is unknown, return the full response for debugging
                    results = [data] if data else []
                    total_results = 1 if data else 0
                
                return {
                    'success': True,
                    'results': results[:10],  # Limit to 10 results
                    'total_results': total_results,
                    'raw_response': data  # Include full response for reference
                }
            elif response.status_code == 401:
                return {'success': False, 'error': 'Invalid API key or unauthorized'}
            elif response.status_code == 403:
                return {'success': False, 'error': 'Access forbidden. Check folder ID and API key permissions.'}
            elif response.status_code == 400:
                try:
                    error_data = response.json()
                    error_message = error_data.get('message', 'Bad request')
                    return {'success': False, 'error': f'Bad request: {error_message}'}
                except:
                    return {'success': False, 'error': 'Bad request - check image format and size'}
            else:
                error_text = response.text[:500] if response.text else 'Unknown error'
                return {
                    'success': False, 
                    'error': f'API returned status {response.status_code}',
                    'details': error_text
                }
        except requests.exceptions.Timeout:
            return {'success': False, 'error': 'Request timeout - Yandex API did not respond in time'}
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': f'Network error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Unexpected error: {str(e)}'}

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
        
        # Google Search (Note: Custom Search API doesn't support true reverse image search)
        if API_CONFIG['google_api_key'] and API_CONFIG['google_cx']:
            results['google'] = ReverseImageSearch.google_search(
                image_bytes,
                API_CONFIG['google_api_key'],
                API_CONFIG['google_cx']
            )
        else:
            results['google'] = {
                'success': False, 
                'error': 'API key or Custom Search Engine ID (CX) not configured',
                'note': 'Google Custom Search API requires both API key and CX. Note: This API does not support true reverse image search - it only searches by text queries.'
            }
        
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
        
        # Yandex Search
        if API_CONFIG['yandex_api_key'] and API_CONFIG['yandex_folder_id']:
            results['yandex'] = ReverseImageSearch.yandex_search(
                image_bytes,
                API_CONFIG['yandex_api_key'],
                API_CONFIG['yandex_folder_id']
            )
        else:
            results['yandex'] = {
                'success': False, 
                'error': 'API key or Folder ID not configured',
                'note': 'Yandex Cloud Search API requires both API key and Folder ID. Get them from https://cloud.yandex.com/'
            }
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services', methods=['GET'])
def get_services():
    """Get information about available services"""
    services = {
        'google': {
            'name': 'Google Custom Search (Limited)',
            'api_docs': 'https://developers.google.com/custom-search/v1/overview',
            'configured': bool(API_CONFIG['google_api_key'] and API_CONFIG['google_cx']),
            'features': ['Text-based image search only', 'Requires Custom Search Engine (CX)', 'Does not support true reverse image search'],
            'note': 'Google does not provide a public reverse image search API. Custom Search API only searches by text queries, not by image upload.'
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
            'name': 'Yandex Cloud Search API',
            'api_docs': 'https://yandex.cloud/en/docs/search-api/concepts/pic-search',
            'configured': bool(API_CONFIG['yandex_api_key'] and API_CONFIG['yandex_folder_id']),
            'features': ['True reverse image search', 'Cloud-based API', 'Requires Yandex Cloud account']
        }
    }
    return jsonify(services)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

