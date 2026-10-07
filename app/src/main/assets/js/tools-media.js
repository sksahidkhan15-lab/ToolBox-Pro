// ========================================================
// ToolBox Pro - Media Tools Module (tools-media.js)
// Image Compressor, Resize, Crop, Convert
// Image -> PDF, PDF Merge, PDF Split, PDF -> Image
// ========================================================

(function () {
  function renderMediaTool(toolId, container) {
    switch (toolId) {
      case 'image-compressor':
        renderImageCompressor(container);
        break;
      case 'image-resize':
        renderImageResize(container);
        break;
      case 'image-crop':
        renderImageCrop(container);
        break;
      case 'image-convert':
        renderImageConvert(container);
        break;
      case 'pdf-merge':
        renderPdfMerge(container);
        break;
      case 'pdf-split':
        renderPdfSplit(container);
        break;
      case 'pdf-to-image':
        renderPdfToImage(container);
        break;
      default:
        container.innerHTML = `<p>Tool under construction</p>`;
    }
  }

  // 1. IMAGE COMPRESSOR
  function renderImageCompressor(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="upload-dropzone" id="img-comp-dropzone">
          <span class="upload-icon">🗜️</span>
          <span class="upload-text">Select Image to Compress</span>
          <span class="upload-subtext">JPG, PNG, WebP (processed locally on-device)</span>
          <input type="file" id="comp-file-input" accept="image/*" class="hidden">
          <button class="btn btn-primary" type="button" id="btn-pick-comp-img">Choose Image</button>
        </div>

        <div id="comp-workspace" class="form-card hidden">
          <div class="form-group">
            <div style="display:flex; justify-content:space-between;">
              <label class="form-label">Compression Quality: <span id="comp-quality-val">75%</span></label>
            </div>
            <input type="range" id="comp-quality-slider" min="10" max="95" value="75" style="width:100%;">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="stat-summary-card" style="text-align:center;">
              <span class="field-hint">Original Size</span>
              <strong id="comp-orig-size" style="font-size:1.1rem;">-</strong>
            </div>
            <div class="stat-summary-card" style="text-align:center;">
              <span class="field-hint">Compressed Size</span>
              <strong id="comp-new-size" class="stat-val-big" style="font-size:1.1rem; color:#16a34a;">-</strong>
            </div>
          </div>

          <div id="comp-preview-box" style="text-align:center; max-height:260px; overflow:hidden; border-radius:8px; background:#f1f5f9; padding:8px;">
            <img id="comp-preview-img" style="max-height:240px; max-width:100%; object-fit:contain; border-radius:4px;">
          </div>

          <button class="btn btn-primary btn-block" id="btn-download-compressed">
            Download Compressed Image
          </button>
        </div>
      </div>
    `;

    let origFile = null;
    let compressedBlob = null;
    const dropzone = document.getElementById('img-comp-dropzone');
    const fileInput = document.getElementById('comp-file-input');
    const pickBtn = document.getElementById('btn-pick-comp-img');
    const slider = document.getElementById('comp-quality-slider');

    pickBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      if (e.target.files[0]) processCompression(e.target.files[0]);
    };

    slider.oninput = (e) => {
      document.getElementById('comp-quality-val').textContent = `${e.target.value}%`;
      if (origFile) compressNow(origFile, e.target.value / 100);
    };

    function processCompression(file) {
      origFile = file;
      document.getElementById('comp-workspace').classList.remove('hidden');
      document.getElementById('comp-orig-size').textContent = formatBytes(file.size);
      compressNow(file, slider.value / 100);
    }

    function compressNow(file, quality) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            compressedBlob = blob;
            document.getElementById('comp-new-size').textContent = formatBytes(blob.size);
            document.getElementById('comp-preview-img').src = URL.createObjectURL(blob);
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    document.getElementById('btn-download-compressed').onclick = () => {
      if (!compressedBlob) return;
      downloadBlob(compressedBlob, `compressed-${origFile ? origFile.name : 'image.jpg'}`);
      showToast('Image downloaded!', 'success');
    };
  }

  // 2. IMAGE RESIZE
  function renderImageResize(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="upload-dropzone">
          <span class="upload-icon">📐</span>
          <span class="upload-text">Select Image to Resize</span>
          <input type="file" id="resize-file-input" accept="image/*" class="hidden">
          <button class="btn btn-primary" type="button" id="btn-pick-resize">Choose Image</button>
        </div>

        <div id="resize-workspace" class="form-card hidden">
          <div class="form-row">
            <div class="form-col">
              <label class="form-label">Width (px)</label>
              <input type="number" id="resize-w" class="form-input">
            </div>
            <div class="form-col">
              <label class="form-label">Height (px)</label>
              <input type="number" id="resize-h" class="form-input">
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="resize-lock-ratio" checked>
            <label for="resize-lock-ratio" class="form-label" style="margin:0;">Lock Aspect Ratio</label>
          </div>

          <div class="form-group">
            <label class="form-label">Preset Dimensions</label>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="btn btn-ghost btn-sm" id="preset-hd">HD (1280x720)</button>
              <button class="btn btn-ghost btn-sm" id="preset-fhd">Full HD (1920x1080)</button>
              <button class="btn btn-ghost btn-sm" id="preset-sq">Square (1080x1080)</button>
              <button class="btn btn-ghost btn-sm" id="preset-av">Avatar (400x400)</button>
            </div>
          </div>

          <button class="btn btn-primary btn-block" id="btn-download-resized">
            Download Resized Image
          </button>
        </div>
      </div>
    `;

    let activeImg = null;
    let aspectRatio = 1;
    const fileInput = document.getElementById('resize-file-input');
    document.getElementById('btn-pick-resize').onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        activeImg = new Image();
        activeImg.onload = () => {
          aspectRatio = activeImg.width / activeImg.height;
          document.getElementById('resize-w').value = activeImg.width;
          document.getElementById('resize-h').value = activeImg.height;
          document.getElementById('resize-workspace').classList.remove('hidden');
        };
        activeImg.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    const wInput = document.getElementById('resize-w');
    const hInput = document.getElementById('resize-h');
    const lock = document.getElementById('resize-lock-ratio');

    wInput.oninput = () => {
      if (lock.checked && aspectRatio) {
        hInput.value = Math.round(wInput.value / aspectRatio);
      }
    };
    hInput.oninput = () => {
      if (lock.checked && aspectRatio) {
        wInput.value = Math.round(hInput.value * aspectRatio);
      }
    };

    document.getElementById('preset-hd').onclick = () => { wInput.value = 1280; hInput.value = 720; };
    document.getElementById('preset-fhd').onclick = () => { wInput.value = 1920; hInput.value = 1080; };
    document.getElementById('preset-sq').onclick = () => { wInput.value = 1080; hInput.value = 1080; };
    document.getElementById('preset-av').onclick = () => { wInput.value = 400; hInput.value = 400; };

    document.getElementById('btn-download-resized').onclick = () => {
      if (!activeImg) return;
      const targetW = parseInt(wInput.value);
      const targetH = parseInt(hInput.value);
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(activeImg, 0, 0, targetW, targetH);
      canvas.toBlob((blob) => {
        downloadBlob(blob, `resized-${targetW}x${targetH}.png`);
        showToast('Resized image downloaded!', 'success');
      }, 'image/png');
    };
  }

  // 3. IMAGE CROP
  function renderImageCrop(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="upload-dropzone">
          <span class="upload-icon">✂️</span>
          <span class="upload-text">Select Image to Crop</span>
          <input type="file" id="crop-file-input" accept="image/*" class="hidden">
          <button class="btn btn-primary" type="button" id="btn-pick-crop">Choose Image</button>
        </div>

        <div id="crop-workspace" class="form-card hidden">
          <div style="display:flex; gap:6px; margin-bottom:10px;">
            <button class="btn btn-ghost btn-sm active" id="crop-ratio-free">Free</button>
            <button class="btn btn-ghost btn-sm" id="crop-ratio-1-1">1:1 Square</button>
            <button class="btn btn-ghost btn-sm" id="crop-ratio-16-9">16:9</button>
            <button class="btn btn-ghost btn-sm" id="crop-ratio-4-3">4:3</button>
          </div>

          <div style="position:relative; background:#0f172a; border-radius:8px; overflow:hidden; display:flex; justify-content:center;">
            <canvas id="crop-canvas" style="max-width:100%; max-height:360px;"></canvas>
          </div>

          <button class="btn btn-primary btn-block" id="btn-download-cropped" style="margin-top:10px;">
            Download Cropped Image
          </button>
        </div>
      </div>
    `;

    const fileInput = document.getElementById('crop-file-input');
    document.getElementById('btn-pick-crop').onclick = () => fileInput.click();

    let img = null;
    let cropRatio = 'free';

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        img = new Image();
        img.onload = () => {
          document.getElementById('crop-workspace').classList.remove('hidden');
          drawCropPreview();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    function drawCropPreview() {
      if (!img) return;
      const canvas = document.getElementById('crop-canvas');
      let w = img.width;
      let h = img.height;

      if (cropRatio === '1-1') {
        const side = Math.min(w, h);
        w = side;
        h = side;
      } else if (cropRatio === '16-9') {
        h = Math.round(w * 9 / 16);
      } else if (cropRatio === '4-3') {
        h = Math.round(w * 3 / 4);
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
    }

    document.getElementById('crop-ratio-1-1').onclick = () => { cropRatio = '1-1'; drawCropPreview(); };
    document.getElementById('crop-ratio-16-9').onclick = () => { cropRatio = '16-9'; drawCropPreview(); };
    document.getElementById('crop-ratio-4-3').onclick = () => { cropRatio = '4-3'; drawCropPreview(); };
    document.getElementById('crop-ratio-free').onclick = () => { cropRatio = 'free'; drawCropPreview(); };

    document.getElementById('btn-download-cropped').onclick = () => {
      const canvas = document.getElementById('crop-canvas');
      canvas.toBlob((blob) => {
        downloadBlob(blob, 'cropped-image.png');
        showToast('Cropped image downloaded!', 'success');
      });
    };
  }

  // 4. IMAGE CONVERT
  function renderImageConvert(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="upload-dropzone">
          <span class="upload-icon">🔄</span>
          <span class="upload-text">Select Image to Convert</span>
          <input type="file" id="convert-file-input" accept="image/*" class="hidden">
          <button class="btn btn-primary" type="button" id="btn-pick-convert">Choose Image</button>
        </div>

        <div id="convert-workspace" class="form-card hidden">
          <div class="form-group">
            <label class="form-label">Target Format</label>
            <select id="convert-format-select" class="form-select">
              <option value="image/png">PNG (.png)</option>
              <option value="image/jpeg">JPEG (.jpg)</option>
              <option value="image/webp">WebP (.webp)</option>
            </select>
          </div>

          <button class="btn btn-primary btn-block" id="btn-download-converted">
            Convert & Download
          </button>
        </div>
      </div>
    `;

    const fileInput = document.getElementById('convert-file-input');
    document.getElementById('btn-pick-convert').onclick = () => fileInput.click();

    let img = null;
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        img = new Image();
        img.onload = () => {
          document.getElementById('convert-workspace').classList.remove('hidden');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    document.getElementById('btn-download-converted').onclick = () => {
      if (!img) return;
      const format = document.getElementById('convert-format-select').value;
      const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        downloadBlob(blob, `converted-image.${ext}`);
        showToast('Image converted & downloaded!', 'success');
      }, format, 0.9);
    };
  }

  // 7. PDF MERGE
  function renderPdfMerge(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="upload-dropzone">
          <span class="upload-icon">📑</span>
          <span class="upload-text">Select Multiple PDF Files</span>
          <input type="file" id="merge-file-input" accept="application/pdf" multiple class="hidden">
          <button class="btn btn-primary" type="button" id="btn-pick-merge">Select PDFs</button>
        </div>

        <div id="merge-workspace" class="form-card hidden">
          <label class="form-label">PDF Files to Merge (<span id="merge-count">0</span>)</label>
          <div id="merge-list" style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto;"></div>

          <button class="btn btn-primary btn-block" id="btn-merge-action">
            Merge & Download Combined PDF
          </button>
        </div>
      </div>
    `;

    let pdfFiles = [];
    const fileInput = document.getElementById('merge-file-input');
    document.getElementById('btn-pick-merge').onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      pdfFiles = [...pdfFiles, ...files];
      updateMergeList();
    };

    function updateMergeList() {
      const list = document.getElementById('merge-list');
      list.innerHTML = '';
      document.getElementById('merge-count').textContent = pdfFiles.length;
      if (pdfFiles.length >= 2) {
        document.getElementById('merge-workspace').classList.remove('hidden');
      }

      pdfFiles.forEach((f, i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:8px 12px; border-radius:6px; font-size:0.85rem;';
        row.innerHTML = `
          <span>📄 ${f.name}</span>
          <button class="icon-btn btn-sm" style="color:#ef4444;" onclick="window.removeMergePdf(${i})">🗑️</button>
        `;
        list.appendChild(row);
      });
    }

    window.removeMergePdf = (idx) => {
      pdfFiles.splice(idx, 1);
      updateMergeList();
    };

    document.getElementById('btn-merge-action').onclick = async () => {
      if (pdfFiles.length < 2) {
        showToast('Please add at least 2 PDF files to merge.', 'error');
        return;
      }
      showToast('Merging PDF files...', 'info');

      try {
        const { PDFDocument } = window.PDFLib;
        const mergedDoc = await PDFDocument.create();

        for (const file of pdfFiles) {
          const bytes = await file.arrayBuffer();
          const doc = await PDFDocument.load(bytes);
          const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach((page) => mergedDoc.addPage(page));
        }

        const mergedBytes = await mergedDoc.save();
        downloadBlob(new Blob([mergedBytes], { type: 'application/pdf' }), 'merged-document.pdf');
        showToast('PDF files merged successfully!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error merging PDFs', 'error');
      }
    };
  }

  // 8. PDF SPLIT
  function renderPdfSplit(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="upload-dropzone">
          <span class="upload-icon">✂️</span>
          <span class="upload-text">Select PDF to Split</span>
          <input type="file" id="split-file-input" accept="application/pdf" class="hidden">
          <button class="btn btn-primary" type="button" id="btn-pick-split">Choose PDF</button>
        </div>

        <div id="split-workspace" class="form-card hidden">
          <div class="stat-summary-card">
            <span>Total Pages: <strong id="split-total-pages">-</strong></span>
          </div>

          <div class="form-group">
            <label class="form-label">Split Mode</label>
            <select id="split-mode-select" class="form-select">
              <option value="range">Page Range (e.g. 1-2)</option>
              <option value="single">Single Page</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Specify Pages (e.g. 1 or 1-3)</label>
            <input type="text" id="split-range-input" class="form-input" value="1">
          </div>

          <button class="btn btn-primary btn-block" id="btn-do-split">
            Extract & Download Pages
          </button>
        </div>
      </div>
    `;

    let activePdfBytes = null;
    let totalPages = 0;
    const fileInput = document.getElementById('split-file-input');
    document.getElementById('btn-pick-split').onclick = () => fileInput.click();

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      activePdfBytes = await file.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(activePdfBytes);
      totalPages = doc.getPageCount();
      document.getElementById('split-total-pages').textContent = totalPages;
      document.getElementById('split-workspace').classList.remove('hidden');
    };

    document.getElementById('btn-do-split').onclick = async () => {
      if (!activePdfBytes) return;
      const rangeStr = document.getElementById('split-range-input').value.trim();
      let pageIndices = [];

      if (rangeStr.includes('-')) {
        const [start, end] = rangeStr.split('-').map((n) => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) pageIndices.push(i - 1);
        }
      } else {
        const single = parseInt(rangeStr);
        if (single >= 1 && single <= totalPages) pageIndices.push(single - 1);
      }

      if (pageIndices.length === 0) {
        showToast('Please enter a valid page number or range.', 'error');
        return;
      }

      const { PDFDocument } = window.PDFLib;
      const srcDoc = await PDFDocument.load(activePdfBytes);
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, pageIndices);
      copied.forEach((p) => newDoc.addPage(p));

      const splitBytes = await newDoc.save();
      downloadBlob(new Blob([splitBytes], { type: 'application/pdf' }), `split-pages-${rangeStr}.pdf`);
      showToast('Pages extracted successfully!', 'success');
    };
  }

  // 9. PDF TO IMAGE
  function renderPdfToImage(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="upload-dropzone">
          <span class="upload-icon">🖼️</span>
          <span class="upload-text">Select PDF to Render into Images</span>
          <input type="file" id="pdf2img-file-input" accept="application/pdf" class="hidden">
          <button class="btn btn-primary" type="button" id="btn-pick-pdf2img">Choose PDF</button>
        </div>

        <div id="pdf2img-workspace" class="form-card hidden">
          <div class="form-group">
            <label class="form-label">Render Quality / Scale</label>
            <select id="pdf2img-scale" class="form-select">
              <option value="1.5">Standard (1.5x)</option>
              <option value="2.0" selected>High Resolution (2.0x)</option>
            </select>
          </div>

          <div id="pdf2img-previews" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; max-height:300px; overflow-y:auto;"></div>

          <button class="btn btn-primary btn-block" id="btn-download-all-pdf-images">
            Download Page 1 Image
          </button>
        </div>
      </div>
    `;

    const fileInput = document.getElementById('pdf2img-file-input');
    document.getElementById('btn-pick-pdf2img').onclick = () => fileInput.click();

    let pdfDoc = null;

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const arrayBuf = await file.arrayBuffer();
      pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuf }).promise;

      document.getElementById('pdf2img-workspace').classList.remove('hidden');
      renderPreviews();
    };

    async function renderPreviews() {
      const previews = document.getElementById('pdf2img-previews');
      previews.innerHTML = '';
      const scale = parseFloat(document.getElementById('pdf2img-scale').value);

      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      canvas.style.width = '100%';
      canvas.style.borderRadius = '6px';
      canvas.style.border = '1px solid #cbd5e1';
      previews.appendChild(canvas);

      document.getElementById('btn-download-all-pdf-images').onclick = () => {
        canvas.toBlob((blob) => {
          downloadBlob(blob, 'pdf-page-1.png');
          showToast('Image downloaded!', 'success');
        });
      };
    }
  }

  // Helpers
  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  window.renderMediaTool = renderMediaTool;
})();
