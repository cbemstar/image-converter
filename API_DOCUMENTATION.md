# Image Conversion Tool - API Documentation

## Overview
The Image Conversion Tool is a client-side web application that allows users to convert images between different formats (WebP, JPEG, PNG) with customizable quality and dimension settings. It features drag-and-drop functionality, batch processing, and ZIP download capabilities.

## Table of Contents
1. [Public APIs](#public-apis)
2. [Core Functions](#core-functions)
3. [UI Components](#ui-components)
4. [Event Handlers](#event-handlers)
5. [Configuration Options](#configuration-options)
6. [Usage Examples](#usage-examples)
7. [CSS Classes](#css-classes)
8. [Dependencies](#dependencies)

---

## Public APIs

### Global Variables
- `window._webpImages`: Array containing processed image objects
- `window.parent`: Reference to parent window (for iframe communication)

### PostMessage API
The application communicates with parent windows through postMessage:

```javascript
// Sent to parent window
{
  type: 'setIframeHeight',
  height: number // Document body scroll height
}
```

---

## Core Functions

### `handleFiles(files)`
**Purpose**: Processes uploaded files and initiates conversion

**Parameters**:
- `files` (FileList): List of files from drag-and-drop or file input

**Behavior**:
- Filters for image files only
- Validates conversion parameters
- Initializes progress tracking
- Calls `processImages()` for conversion

**Example**:
```javascript
// Called automatically by event handlers
handleFiles(event.dataTransfer.files);
```

### `processImages(files, maxW, maxH, quality, format)`
**Purpose**: Converts multiple images asynchronously with progress tracking

**Parameters**:
- `files` (Array): Array of image files
- `maxW` (number): Maximum width in pixels
- `maxH` (number): Maximum height in pixels  
- `quality` (number): Compression quality (0.1 - 1.0)
- `format` (string): Output format ('webp', 'jpeg', 'png')

**Returns**: Promise that resolves when all images are processed

**Behavior**:
- Creates ZIP archive for batch download
- Updates progress bar and status
- Calls `showPreview()` for each successful conversion
- Calls `showError()` for failed conversions

**Example**:
```javascript
await processImages(imageFiles, 1920, 1080, 0.8, 'webp');
```

### `convertToFormat(file, maxW, maxH, quality, format)`
**Purpose**: Converts a single image file to the specified format

**Parameters**:
- `file` (File): Image file to convert
- `maxW` (number): Maximum width constraint
- `maxH` (number): Maximum height constraint
- `quality` (number): Compression quality
- `format` (string): Target format

**Returns**: Promise resolving to `{blob, filename}`
- `blob` (Blob): Converted image data
- `filename` (string): Generated filename with appropriate extension

**Algorithm**:
1. Create Image object from file
2. Calculate scaled dimensions maintaining aspect ratio
3. Draw to canvas with new dimensions
4. Convert to target format using `canvas.toBlob()`

**Example**:
```javascript
const {blob, filename} = await convertToFormat(
  imageFile, 
  1920, 
  1080, 
  0.9, 
  'jpeg'
);
```

### `showPreview(index, file, blob, filename)`
**Purpose**: Creates and displays a preview row in the results table

**Parameters**:
- `index` (number): Image index in processing queue
- `file` (File): Original image file
- `blob` (Blob): Converted image blob
- `filename` (string): Generated filename

**Behavior**:
- Creates table row with preview thumbnail
- Adds download link for individual file
- Includes rename functionality
- Shows file size information

### `showError(index, filename, err)`
**Purpose**: Displays error information for failed conversions

**Parameters**:
- `index` (number): Image index
- `filename` (string): Original filename
- `err` (Error): Error object

**Behavior**:
- Creates table row with error status
- Displays filename and error indication

### `sendHeightToParent()`
**Purpose**: Communicates iframe height to parent window

**Behavior**:
- Calculates document body scroll height
- Sends postMessage to parent window
- Used for responsive iframe sizing

---

## UI Components

### File Upload Area (`#drop-area`)
**Purpose**: Drag-and-drop zone for file selection

**Features**:
- Visual feedback on drag over/leave
- Click to open file selector
- Accepts multiple image files
- Responsive design for mobile

**HTML Structure**:
```html
<div id="drop-area" class="border-2 border-dashed">
  <p>Drag & drop your image files here</p>
  <input type="file" id="fileElem" accept="image/*" multiple style="display:none">
  <button onclick="fileElem.click()">Select Images</button>
</div>
```

### Control Panel (`#controls`)
**Purpose**: Image conversion parameter controls

**Components**:
- **Max Width Input** (`#max-width`): Range 1-99999 pixels
- **Max Height Input** (`#max-height`): Range 1-99999 pixels  
- **Quality Input** (`#quality`): Range 0.1-1.0 with 0.01 steps
- **Format Selector** (`#output-format`): WebP, JPEG, PNG options

**Default Values**:
- Max Width: 99999px
- Max Height: 99999px
- Quality: 0.95
- Format: WebP

### Progress Indicators
**Components**:
- **Progress Status** (`#progress-status`): Text status updates
- **Progress Bar** (`#progress-bar`): Visual progress indicator

**States**:
- Processing: Shows current progress (X/Y images)
- Complete: Shows "Done! Processed X images"

### Preview Table (`#preview-table`)
**Purpose**: Displays conversion results with management options

**Columns**:
1. **Checkbox**: For batch selection
2. **Index**: Sequential number
3. **Preview**: Thumbnail with zoom functionality
4. **Original Filename**: Original file name
5. **Rename**: Individual rename button
6. **File Size**: Converted file size
7. **Download**: Individual download link

**Features**:
- Responsive design with mobile optimizations
- Individual image renaming
- Batch selection with "Select All" option
- Modal preview on thumbnail click

### Download Controls
**Components**:
- **Download All ZIP** (`#download-link`): Downloads all images as ZIP
- **Download Selected** (`#download-selected`): Downloads selected images as ZIP

**Behavior**:
- Appears only when images are processed
- ZIP generation using JSZip library
- Automatic cleanup of blob URLs

### Bulk Rename Controls (`#bulk-rename-controls`)
**Purpose**: Batch rename functionality

**Components**:
- **Base Name Input** (`#bulk-rename-base`): Template name
- **Start Number Input** (`#bulk-rename-start`): Starting sequence number
- **Apply Button** (`#bulk-rename-btn`): Execute bulk rename

**Algorithm**:
```javascript
// Example: Base="Photo", Start=1 → Photo1.webp, Photo2.webp, etc.
filename = `${baseName}${startNumber + index}.${extension}`;
```

### Image Modal (`#image-modal`)
**Purpose**: Full-size image preview overlay

**Features**:
- Click thumbnail magnify icon to open
- Full-screen overlay with dark background
- Close button and click-outside-to-close
- Responsive sizing (max 90vw/90vh)

---

## Event Handlers

### Drag and Drop Events
```javascript
// Drag over - visual feedback
dropArea.addEventListener('dragover', e => {
  e.preventDefault();
  dropArea.style.borderColor = '#333';
});

// Drag leave - reset appearance  
dropArea.addEventListener('dragleave', e => {
  e.preventDefault();
  dropArea.style.borderColor = '#888';
});

// Drop - process files
dropArea.addEventListener('drop', e => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});
```

### File Selection
```javascript
// File input change
fileElem.addEventListener('change', e => {
  handleFiles(e.target.files);
});
```

### Download Management
```javascript
// Download selected images
document.getElementById('download-selected').addEventListener('click', async function() {
  // Create ZIP from selected images
  // Trigger download
});
```

### Selection Management
```javascript
// Select all checkbox
document.getElementById('select-all').addEventListener('change', function(e) {
  const checked = e.target.checked;
  document.querySelectorAll('.select-image').forEach(cb => {
    cb.checked = checked;
  });
});
```

### Dynamic Actions (Event Delegation)
```javascript
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('rename-btn')) {
    // Handle rename button click
  } else if (e.target.classList.contains('save-rename-btn')) {
    // Handle save rename
  } else if (e.target.closest('.magnify-icon')) {
    // Handle thumbnail zoom
  } else if (e.target.classList.contains('close-modal')) {
    // Handle modal close
  }
});
```

---

## Configuration Options

### Image Processing Settings
```javascript
const config = {
  maxWidth: 99999,      // Maximum width in pixels
  maxHeight: 99999,     // Maximum height in pixels
  quality: 0.95,        // Compression quality (0.1-1.0)
  format: 'webp'        // Output format: 'webp', 'jpeg', 'png'
};
```

### Validation Rules
- **Max Width/Height**: 1-99999 pixels
- **Quality**: 0.1-1.0 (PNG ignores quality setting)
- **Formats**: Only 'webp', 'jpeg', 'png' supported
- **File Types**: Only files with `image/*` MIME type

### Default Filenames
- Pattern: `originalname.extension`
- Extensions: `.webp`, `.jpg`, `.png`
- Bulk rename: `basename{number}.extension`

---

## Usage Examples

### Basic Usage
```html
<!-- Include the HTML file in your project -->
<iframe src="Image-to-WebP-Converter.html" width="100%" height="800"></iframe>
```

### Programmatic File Processing
```javascript
// Simulate file drop
const files = document.getElementById('fileElem').files;
handleFiles(files);
```

### Custom Configuration
```javascript
// Set custom values before processing
document.getElementById('max-width').value = 1920;
document.getElementById('max-height').value = 1080;
document.getElementById('quality').value = 0.8;
document.getElementById('output-format').value = 'jpeg';
```

### Batch Operations
```javascript
// Bulk rename all images
document.getElementById('bulk-rename-base').value = 'Photo';
document.getElementById('bulk-rename-start').value = 1;
document.getElementById('bulk-rename-btn').click();

// Select all images
document.getElementById('select-all').click();

// Download selected
document.getElementById('download-selected').click();
```

### Modal Preview
```javascript
// Open modal programmatically
const modal = document.getElementById('image-modal');
const modalImg = modal.querySelector('img');
modalImg.src = 'data:image/jpeg;base64,...';
modal.classList.add('active');
```

---

## CSS Classes

### Layout Classes
- `.download-btns-responsive`: Responsive button container
- `.preview-img-container`: Container for preview thumbnails
- `.overflow-x-auto`: Horizontal scroll for table

### Interactive Classes
- `.download-btn`: Styled download buttons
- `.rename-btn`: Rename action buttons
- `.save-rename-btn`: Save rename buttons
- `.select-image`: Individual image checkboxes
- `.magnify-icon`: Thumbnail zoom icons

### Visual Classes
- `.preview`: Thumbnail image styling
- `.close-modal`: Modal close button
- `.active`: Modal active state

### Responsive Breakpoints
- `@media (max-width: 768px)`: Tablet styles
- `@media (max-width: 600px)`: Mobile button layout
- `@media (max-width: 480px)`: Small mobile optimizations
- `@media (max-width: 360px)`: Extra small mobile

---

## Dependencies

### External Libraries
1. **Tailwind CSS**: `https://cdn.tailwindcss.com`
   - Purpose: Utility-first CSS framework
   - Usage: Layout, spacing, colors, responsive design

2. **JSZip**: `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`
   - Purpose: ZIP file generation
   - Usage: Bundle multiple images for download

### Browser APIs
- **Canvas API**: Image processing and conversion
- **File API**: File reading and processing
- **Blob API**: Binary data handling
- **URL API**: Object URL creation for downloads
- **PostMessage API**: Parent-child communication
- **MutationObserver**: DOM change monitoring

### Browser Compatibility
- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Required features**: Canvas, File API, Blob, ES6 Promises
- **Optional features**: WebP support (fallback to JPEG/PNG)

---

## Error Handling

### Common Errors
1. **Invalid file types**: Filtered out during file selection
2. **Conversion failures**: Displayed in error rows
3. **Missing parameters**: Validated with fallback defaults
4. **Browser compatibility**: Graceful degradation

### Error Display
```javascript
// Error row in preview table
function showError(index, filename, err) {
  // Creates row with error status
  // Shows filename and error indication
}
```

### Validation
```javascript
// Parameter validation example
if (isNaN(maxW) || maxW < 1 || maxW > 99999) maxW = 99999;
if (isNaN(quality) || quality < 0.1 || quality > 1) quality = 0.95;
```

---

## Performance Considerations

### Optimization Features
- **Asynchronous processing**: Non-blocking image conversion
- **Memory management**: Automatic cleanup of blob URLs
- **Progressive loading**: Individual image processing
- **Efficient DOM updates**: Minimal reflows during table updates

### Limitations
- **Client-side processing**: Limited by browser memory
- **File size limits**: Depends on available RAM
- **Batch size**: No hard limit, but performance degrades with large batches

### Best Practices
- Process images in reasonable batches (< 50-100 images)
- Monitor memory usage for large images
- Use appropriate quality settings to balance size/quality
- Test on target devices for performance validation

---

## Integration Guide

### Embedding as iFrame
```html
<iframe src="Image-to-WebP-Converter.html" 
        width="100%" 
        height="800"
        style="border: none; border-radius: 8px;">
</iframe>
```

### Responsive Integration
```javascript
// Listen for height changes
window.addEventListener('message', function(event) {
  if (event.data.type === 'setIframeHeight') {
    const iframe = document.getElementById('converter-iframe');
    iframe.style.height = event.data.height + 'px';
  }
});
```

### Custom Styling
The application uses CSS custom properties and can be themed by overriding:
- Color scheme: `#172f37` (dark), `#cde5da` (light)
- Fonts: Inherits from parent or uses system defaults
- Border radius: `0.375rem` (6px) standard

---

This documentation covers all public APIs, functions, and components available in the Image Conversion Tool. For additional customization or integration support, refer to the source code comments and CSS styling sections.