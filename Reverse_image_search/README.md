# Reverse Image Search API Comparison

A web service that compares multiple reverse image search solutions (with API integrations) across the internet. This tool allows you to upload an image and compare results from different reverse image search APIs side-by-side.

## Features

- **Multiple API Support**: Compare results from Google, Bing, TinEye, and Yandex
- **Modern UI**: Beautiful, responsive web interface
- **Real-time Comparison**: See results from all APIs simultaneously
- **Service Status**: View which APIs are configured and ready to use

## Supported APIs

1. **Google Reverse Image Search** - Using Google Custom Search API
2. **Bing Visual Search** - Microsoft Bing Visual Search API
3. **TinEye** - TinEye Reverse Image Search API
4. **Yandex Images** - (Web scraping - no official API)

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up API keys (optional, but required for full functionality):

**Option 1: Using a .env file (Recommended)**

Create a `.env` file in the project root directory with the following content:

```env
# Google Custom Search API
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX=your_custom_search_engine_id_here

# Bing Visual Search API
BING_API_KEY=your_bing_api_key_here

# TinEye API
TINEYE_API_KEY=your_tineye_api_key_here
TINEYE_SECRET=your_tineye_secret_here
```

**Option 2: Using environment variables**

On Windows (PowerShell):
```powershell
$env:GOOGLE_API_KEY="your_google_api_key"
$env:GOOGLE_CX="your_google_cx_id"
$env:BING_API_KEY="your_bing_api_key"
$env:TINEYE_API_KEY="your_tineye_api_key"
$env:TINEYE_SECRET="your_tineye_secret"
$env:YANDEX_API_KEY="your_yandex_api_key"
$env:YANDEX_FOLDER_ID="your_yandex_folder_id"
```

On Linux/Mac:
```bash
export GOOGLE_API_KEY="your_google_api_key"
export GOOGLE_CX="your_google_cx_id"
export BING_API_KEY="your_bing_api_key"
export TINEYE_API_KEY="your_tineye_api_key"
export TINEYE_SECRET="your_tineye_secret"
export YANDEX_API_KEY="your_yandex_api_key"
export YANDEX_FOLDER_ID="your_yandex_folder_id"
```

### Getting API Keys

- **Google**: [Google Cloud Console](https://console.cloud.google.com/) - Enable Custom Search API
  - ⚠️ **Important**: Google Custom Search API does NOT support true reverse image search. It only searches by text queries. You'll also need to create a [Custom Search Engine](https://cse.google.com/) to get the CX (Custom Search Engine ID). This is a limitation - Google doesn't provide a public reverse image search API.
- **Bing**: [Azure Portal](https://portal.azure.com/) - Create a Bing Search v7 resource
  - ✅ Supports true reverse image search via Visual Search API
- **TinEye**: [TinEye API](https://services.tineye.com/TinEyeAPI) - Sign up for API access
  - ✅ Supports true reverse image search
- **Yandex**: [Yandex Cloud](https://cloud.yandex.com/) - Create a service account with Search API access
  - ✅ Supports true reverse image search via [Yandex Cloud Search API](https://yandex.cloud/en/docs/search-api/concepts/pic-search)
  - Requires: API Key and Folder ID from Yandex Cloud

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Upload an image and click "Search All APIs" to compare results

## Project Structure

```
Reverse_image_search/
├── app.py                 # Flask backend with API integrations
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── static/
    ├── index.html        # Main HTML page
    ├── styles.css        # Styling
    └── app.js            # Frontend JavaScript
```

## API Endpoints

- `GET /` - Main web interface
- `GET /api/services` - Get information about available services
- `POST /api/compare` - Compare image across all APIs

## Notes

- Some APIs require authentication and API keys
- The current implementation includes full API integrations for all supported services
- Full API implementations may require additional setup and authentication
- Yandex uses the official Yandex Cloud Search API for reverse image search

## License

MIT License - Feel free to use and modify as needed.

