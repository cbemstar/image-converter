// Image Converter App for Webflow-native UI
// All selectors use data-wf attributes. Add these attributes to your Webflow elements as described in the comments.
// Requires JSZip (add via CDN in Webflow project settings)

// --- Selectors (update your Webflow elements to match these data-wf attributes) ---
const dropArea = document.querySelector('[data-wf="drop-area"]'); // Drop area div
const fileInput = document.querySelector('[data-wf="file-input"]'); // Hidden file input
const selectBtn = document.querySelector('[data-wf="select-btn"]'); // Button to trigger file input
const progress = document.querySelector('[data-wf="progress"]'); // Progress/status text
const downloadLink = document.querySelector('[data-wf="download-link"]'); // Download ZIP link
const previewTable = document.querySelector('[data-wf="preview-table"]'); // Preview table/container (tbody or div)
const apiKeyInput = document.querySelector('[data-wf="api-key"]'); // Webflow API key input
const siteIdInput = document.querySelector('[data-wf="site-id"]'); // Webflow Site ID input
const prefixInput = document.querySelector('[data-wf="asset-prefix"]'); // Asset prefix input

// --- Constants ---
const MAX_WIDTH = 3840;
const MAX_HEIGHT = 9999;
const QUALITY = 0.95;

// --- Drag & Drop Events ---
if (dropArea) {
  dropArea.addEventListener('dragover', e => {
    e.preventDefault();
    dropArea.classList.add('is-dragover');
  });
  dropArea.addEventListener('dragleave', e => {
    e.preventDefault();
    dropArea.classList.remove('is-dragover');
  });
  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('is-dragover');
    handleFiles(e.dataTransfer.files);
  });
}

// --- File Input Events ---
if (fileInput && selectBtn) {
  selectBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => {
    handleFiles(e.target.files);
  });
}

// --- Handle Files ---
function handleFiles(files) {
  if (!files || !files.length) return;
  const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (!imageFiles.length) {
    alert('Please select image files only.');
    return;
  }
  if (progress) progress.textContent = `Processing ${imageFiles.length} image(s)...`;
  if (previewTable) previewTable.innerHTML = '';
  processImages(imageFiles);
}

// --- Process Images ---
async function processImages(files) {
  if (typeof JSZip === 'undefined') {
    alert('JSZip library is required.');
    return;
  }
  const zip = new JSZip();
  let processed = 0;
  const convertedFiles = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const webpBlob = await convertToWebP(file, MAX_WIDTH, MAX_HEIGHT, QUALITY);
      const filename = file.name.replace(/\.[^.]+$/, '') + '.webp';
      zip.file(filename, webpBlob);
      showPreview(i + 1, file, webpBlob, filename);
      convertedFiles.push({ blob: webpBlob, original: file, filename });
    } catch (err) {
      showError(i + 1, file.name, err);
    }
    processed++;
    if (progress) progress.textContent = `Processed ${processed} of ${files.length} image(s).`;
  }
  if (files.length > 1 && downloadLink) {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.style.display = 'inline-block';
    if (progress) progress.textContent = `Done! Download all converted images as ZIP below.`;
  } else if (downloadLink) {
    downloadLink.style.display = 'none';
  }
  if (convertedFiles.length) {
    await offerWebflowUpload(convertedFiles);
  }
}

// --- Show Preview ---
function showPreview(index, file, webpBlob, filename) {
  if (!previewTable) return;
  const row = document.createElement('div');
  row.className = 'preview-row';
  const reader = new FileReader();
  reader.onload = function (e) {
    let size = webpBlob.size;
    let sizeStr = size < 1024 * 1024 ? (size / 1024).toFixed(1) + ' KB' : (size / 1024 / 1024).toFixed(2) + ' MB';
    const downloadUrl = URL.createObjectURL(webpBlob);
    row.innerHTML = `
      <span>${index}</span>
      <img src="${e.target.result}" alt="preview" style="max-width:80px;max-height:80px;border-radius:4px;" />
      <span>${file.name}</span>
      <span>${sizeStr}</span>
      <a href="${downloadUrl}" download="${filename}" style="color:blue;">Download</a>
    `;
    previewTable.appendChild(row);
  };
  reader.readAsDataURL(webpBlob);
}

// --- Show Error ---
function showError(index, filename, err) {
  if (!previewTable) return;
  const row = document.createElement('div');
  row.className = 'preview-row error';
  row.innerHTML = `<span>${index}</span><span style="color:red;">Failed</span><span>${filename}</span><span></span><span></span>`;
  previewTable.appendChild(row);
}

// --- Convert to WebP ---
function convertToWebP(file, maxW, maxH, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      let [w, h] = [img.width, img.height];
      let scale = Math.min(maxW / w, maxH / h, 1);
      let nw = Math.round(w * scale), nh = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, nw, nh);
      canvas.toBlob(blob => {
        if (!blob) reject(new Error('Conversion failed'));
        else resolve(blob);
      }, 'image/webp', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// --- Upload to Webflow Assets (optional, backend required) ---
async function offerWebflowUpload(convertedFiles) {
  if (!apiKeyInput || !siteIdInput || !prefixInput) return;
  const apiKey = apiKeyInput.value.trim();
  const siteId = siteIdInput.value.trim();
  const prefix = prefixInput.value.trim() || 'Compressed';
  if (!apiKey || !siteId) {
    if (progress) progress.textContent += ' (Provide your Webflow API key and Site ID above to upload to Webflow Assets)';
    return;
  }
  if (progress) progress.textContent = 'Uploading converted images to Webflow Assets...';
  for (let i = 0; i < convertedFiles.length; i++) {
    const { blob, filename } = convertedFiles[i];
    const assetName = `${prefix} - Compressed ${filename}`;
    try {
      const formData = new FormData();
      formData.append('file', blob, assetName);
      formData.append('apiKey', apiKey);
      formData.append('siteId', siteId);
      formData.append('assetName', assetName);
      // Send to backend server instead of Webflow API directly
      const res = await fetch('http://localhost:4000/upload-to-webflow', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(`Upload failed: ${errData.error || res.statusText}`);
      }
      if (progress) progress.textContent = `Uploaded ${i + 1} of ${convertedFiles.length} to Webflow Assets...`;
    } catch (err) {
      if (progress) progress.textContent = `Error uploading ${assetName}: ${err.message}`;
    }
  }
  if (progress) progress.textContent = `All uploads to Webflow Assets complete!`;
}

// --- End of image-converter.js ---
