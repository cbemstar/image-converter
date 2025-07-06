# Image Conversion Tool - Quick Reference Guide

## Essential APIs

### Core Functions
```javascript
// Process uploaded files
handleFiles(files: FileList) → void

// Convert multiple images 
processImages(files, maxW, maxH, quality, format) → Promise

// Convert single image
convertToFormat(file, maxW, maxH, quality, format) → Promise<{blob, filename}>

// Show preview in table
showPreview(index, file, blob, filename) → void

// Display error
showError(index, filename, err) → void
```

### Key DOM Elements
```javascript
// File input and drop area
document.getElementById('fileElem')      // Hidden file input
document.getElementById('drop-area')     // Drag & drop zone

// Controls
document.getElementById('max-width')     // Max width input
document.getElementById('max-height')    // Max height input  
document.getElementById('quality')       // Quality input (0.1-1.0)
document.getElementById('output-format') // Format selector

// Progress tracking
document.getElementById('progress-status') // Text status
document.getElementById('progress-bar')   // Visual progress

// Downloads
document.getElementById('download-link')     // Download all ZIP
document.getElementById('download-selected') // Download selected ZIP

// Preview table
document.getElementById('preview-table')     // Results table
document.getElementById('select-all')        // Select all checkbox
```

## Common Usage Patterns

### Basic Setup
```javascript
// Set conversion parameters
document.getElementById('max-width').value = 1920;
document.getElementById('max-height').value = 1080;
document.getElementById('quality').value = 0.8;
document.getElementById('output-format').value = 'webp';

// Process files
const fileInput = document.getElementById('fileElem');
fileInput.addEventListener('change', e => handleFiles(e.target.files));
```

### Programmatic Conversion
```javascript
// Convert single image
const {blob, filename} = await convertToFormat(
  imageFile,    // File object
  1920,         // Max width
  1080,         // Max height  
  0.9,          // Quality
  'webp'        // Format
);

// Create download link
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
```

### Batch Operations
```javascript
// Bulk rename
document.getElementById('bulk-rename-base').value = 'Photo';
document.getElementById('bulk-rename-start').value = 1;
document.getElementById('bulk-rename-btn').click();

// Select all images
document.getElementById('select-all').click();

// Download selected
document.getElementById('download-selected').click();
```

## Configuration Options

### Image Settings
| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Max Width | 1-99999 | 99999 | Maximum width in pixels |
| Max Height | 1-99999 | 99999 | Maximum height in pixels |
| Quality | 0.1-1.0 | 0.95 | Compression quality |
| Format | webp/jpeg/png | webp | Output format |

### File Types
- **Accepted**: Any file with `image/*` MIME type
- **Filtered**: Non-image files are automatically excluded
- **Extensions**: `.webp`, `.jpg`, `.png` based on output format

## Event Handlers

### File Upload
```javascript
// Drag and drop
dropArea.addEventListener('drop', e => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});

// File selection
fileElem.addEventListener('change', e => {
  handleFiles(e.target.files);
});
```

### Dynamic Actions
```javascript
// Event delegation for dynamic elements
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('rename-btn')) {
    // Handle rename
  } else if (e.target.classList.contains('save-rename-btn')) {
    // Handle save rename
  } else if (e.target.closest('.magnify-icon')) {
    // Handle image zoom
  }
});
```

## CSS Classes

### Interactive Elements
- `.download-btn` - Individual download buttons
- `.rename-btn` - Rename action buttons  
- `.select-image` - Image selection checkboxes
- `.magnify-icon` - Thumbnail zoom icons

### Layout Components
- `.download-btns-responsive` - Responsive button container
- `.preview-img-container` - Preview thumbnail container
- `.preview` - Thumbnail image styling

### States
- `.active` - Modal active state
- `.hidden` - Hidden elements

## Global Variables

```javascript
// Processed images array
window._webpImages = [
  {
    index: number,
    file: File,
    webpBlob: Blob,
    filename: string
  }
];

// Parent window reference (for iframe)
window.parent
```

## Common Errors & Solutions

### File Processing
```javascript
// Validate file types
const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
if (!imageFiles.length) {
  alert('Please select image files only.');
  return;
}
```

### Parameter Validation
```javascript
// Validate numeric inputs
let maxW = parseInt(maxWidthInput.value, 10);
if (isNaN(maxW) || maxW < 1 || maxW > 99999) maxW = 99999;

let quality = parseFloat(qualityInput.value);
if (isNaN(quality) || quality < 0.1 || quality > 1) quality = 0.95;
```

## iFrame Integration

### Basic Embedding
```html
<iframe src="Image-to-WebP-Converter.html" 
        width="100%" 
        height="800"
        style="border: none;">
</iframe>
```

### Responsive Height
```javascript
// Listen for height updates
window.addEventListener('message', function(event) {
  if (event.data.type === 'setIframeHeight') {
    document.getElementById('converter-iframe').style.height = 
      event.data.height + 'px';
  }
});
```

## Performance Tips

### Memory Management
- Process images in batches of 50-100 for optimal performance
- Monitor memory usage with large images
- Use appropriate quality settings to balance size/quality

### Browser Compatibility
- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Required**: Canvas API, File API, Blob API, ES6 Promises
- **Optional**: WebP support (graceful fallback)

## Dependencies

### External CDNs
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- JSZip for ZIP generation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```

### Browser APIs
- Canvas API (image processing)
- File API (file handling)
- Blob API (binary data)
- URL API (object URLs)
- PostMessage API (iframe communication)

---

For complete documentation with detailed examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).