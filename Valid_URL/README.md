# URL Validator

A web application that extracts URLs from various file formats, validates them, and allows you to delete invalid entries directly from the source files.

## Features

- **Multi-format Support**: Works with Excel (.xlsx, .xls), Word (.docx), CSV (.csv), and Firefox bookmarks (.json)
- **URL Extraction**: Automatically finds all URLs in your files using pattern matching
- **URL Validation**: Checks each URL's HTTP status code
- **Delete Functionality**: Remove unwanted URLs directly from the source file
- **Download Modified Files**: Download your cleaned files with deleted entries removed
- **Status Filtering**: Filter results by status (Success, Errors, CORS Blocked)
- **Progress Tracking**: Real-time progress indicator during validation
- **Modern UI**: Clean, responsive design that works on desktop and mobile

## Usage

1. **Open the application**: Simply open `index.html` in a modern web browser
2. **Upload a file**: Drag and drop or click to browse for a file
   - Supported formats: Excel (.xlsx, .xls), Word (.docx), CSV (.csv), Firefox Bookmarks (.json)
3. **Wait for validation**: The app will extract URLs and validate each one
4. **Review results**: See all URLs with their status codes in a table
5. **Delete entries**: Click the "Delete" button next to any URL to remove it from the file
6. **Download**: Click "Download Modified File" to get your cleaned file

## File Format Details

### Excel Files
- Extracts URLs from all cells across all sheets
- Tracks cell locations for precise deletion
- Supports both .xlsx and .xls formats

### Word Documents
- Extracts URLs from document text and hyperlinks
- Note: Word file regeneration may be limited (see Limitations)

### CSV Files
- Parses all rows and columns
- Extracts URLs from any cell
- Preserves CSV structure when deleting entries

### Firefox Bookmarks
- Parses Firefox JSON bookmark export format
- Extracts URLs from all bookmarks and folders
- Maintains folder structure when deleting entries

## Status Codes

- **200 - OK**: URL is accessible and working
- **Error codes (4xx, 5xx)**: Server returned an error
- **CORS Blocked**: Browser security prevents checking this URL
- **Timeout**: Request took too long to respond

## Limitations

- **CORS Restrictions**: Some websites block cross-origin requests, preventing status verification
- **Word File Modification**: Full Word document regeneration requires complex libraries. Currently, Word files are exported as text files when modified
- **Large Files**: Very large files may cause performance issues. Consider splitting large files
- **Network Dependency**: Requires internet connection to validate URLs

## Technical Details

### Libraries Used
- **SheetJS (xlsx.js)**: Excel file parsing and generation
- **Mammoth.js**: Word document text extraction
- **FileSaver.js**: Client-side file downloads

### Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Edge, Safari (latest versions)

## How It Works

1. **File Parsing**: The app reads your file and extracts all URLs using regex pattern matching
2. **URL Validation**: Each URL is checked using the Fetch API with appropriate timeout handling
3. **Results Display**: URLs are shown in a table with status badges and source information
4. **Deletion**: When you delete an entry, it's removed from the in-memory file structure
5. **File Generation**: Modified files are regenerated from the updated data structure
6. **Download**: Files are downloaded using the FileSaver.js library

## Privacy

All processing happens entirely in your browser. No files or URLs are sent to any server. Your data stays on your device.

## License

This project is open source and available for personal and commercial use.

