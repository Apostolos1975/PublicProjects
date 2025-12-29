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

Create a `.env` file or set environment variables:

```bash
# Google Custom Search API
export GOOGLE_API_KEY="your_google_api_key"
export GOOGLE_CX="your_google_cx_id"

# Bing Visual Search API
export BING_API_KEY="your_bing_api_key"

# TinEye API
export TINEYE_API_KEY="your_tineye_api_key"
export TINEYE_SECRET="your_tineye_secret"
```

### Getting API Keys

- **Google**: [Google Cloud Console](https://console.cloud.google.com/) - Enable Custom Search API
- **Bing**: [Azure Portal](https://portal.azure.com/) - Create a Bing Search v7 resource
- **TinEye**: [TinEye API](https://services.tineye.com/TinEyeAPI) - Sign up for API access

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
- The current implementation includes basic integration examples
- Full API implementations may require additional setup and authentication
- Yandex reverse image search doesn't have an official API and would require web scraping

## License

MIT License - Feel free to use and modify as needed.

