// ========================================================
// ToolBox Pro - PDF QR Code Editor & Manager Module
// Provides interactive QR code detection, selection, rotation,
// moving, resizing, editing, deleting, covering, replacing,
// and baking into exported PDF documents using pdf-lib & jsQR.
// ========================================================

(function () {
  'use strict';

  // State for active PDF Editor instance
  let editorState = {
    pdfBytes: null,
    pdfDoc: null,         // pdfjs document
    pdfLibDoc: null,      // pdf-lib document
    totalPages: 0,
    currentPage: 1,
    zoomScale: 1.25,
    pageViewport: null,
    originalPageWidthPt: 0,
    originalPageHeightPt: 0,
    qrElements: [],       // Array of QR annotations on pages: { id, page, x, y, width, height, rotation, dataUrl, content, isExisting, coverUnderneath }
    selectedQrId: null,
    isDragging: false,
    isResizing: false,
    dragStart: { mouseX: 0, mouseY: 0, qrX: 0, qrY: 0 },
    resizeStart: { mouseX: 0, mouseY: 0, width: 0, height: 0 }
  };

  function renderPdfEditor(container) {
    container.innerHTML = `
      <div class="tool-pane pdf-editor-pane">
        <!-- Dropzone / File Loader -->
        <div id="pdf-qr-dropzone" class="upload-dropzone">
          <span class="upload-icon">📑</span>
          <span class="upload-text">Open PDF to Edit or Replace QR Codes</span>
          <span class="upload-subtext">Detects, scans, edits, replaces, or adds QR codes directly on any page</span>
          <input type="file" id="pdf-qr-file-input" accept="application/pdf" class="hidden">
          <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; justify-content: center;">
            <button class="btn btn-primary" type="button" id="btn-pick-pdf-qr">
              <svg viewBox="0 0 24 24" class="svg-icon-btn"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" stroke-width="2" fill="none"/></svg>
              Select PDF File
            </button>
            <button class="btn btn-secondary" type="button" id="btn-sample-pdf-qr">
              Try Sample PDF with QR
            </button>
          </div>
        </div>

        <!-- Main PDF Editor Workspace -->
        <div id="pdf-qr-workspace" class="pdf-qr-workspace hidden">
          <!-- Top Editor Controls Bar -->
          <div class="pdf-editor-toolbar">
            <div class="toolbar-group page-controls">
              <button class="btn btn-sm btn-icon" id="pdf-prev-page" title="Previous Page">◀</button>
              <span class="page-indicator">
                <span id="pdf-current-page-num">1</span> / <span id="pdf-total-page-num">1</span>
              </span>
              <button class="btn btn-sm btn-icon" id="pdf-next-page" title="Next Page">▶</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group zoom-controls">
              <button class="btn btn-sm btn-icon" id="pdf-zoom-out" title="Zoom Out">−</button>
              <span id="pdf-zoom-val" class="zoom-value">125%</span>
              <button class="btn btn-sm btn-icon" id="pdf-zoom-in" title="Zoom In">+</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group action-controls">
              <button class="btn btn-sm btn-outline" id="btn-scan-detect-qr" title="Auto-detect existing QR on this page">
                <svg viewBox="0 0 24 24" class="svg-btn-icon"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2 M7 7h3v3H7z M14 7h3v3h-3z M7 14h3v3H7z M14 14h3v3h-3z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                <span>Detect QR</span>
              </button>
              <button class="btn btn-sm btn-outline" id="btn-manual-area-qr" title="Select QR Area / Scanned Box">
                <svg viewBox="0 0 24 24" class="svg-btn-icon"><path d="M4 4h4v2H6v2H4V4zm16 0h-4v2h2v2h2V4zM4 20h4v-2H6v-2H4v4zm16 0h-4v-2h2v-2h2v4z" fill="currentColor"/></svg>
                <span>Select Area</span>
              </button>
              <button class="btn btn-sm btn-primary" id="btn-add-new-qr" title="Add a brand new QR Code">
                <span>+ Add QR</span>
              </button>
              <button class="btn btn-sm btn-success" id="btn-export-pdf" title="Save and Export Modified PDF">
                <svg viewBox="0 0 24 24" class="svg-btn-icon"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <!-- Selection & Operation Floating Toolbar (Mobile-friendly, shown when QR is selected) -->
          <div id="qr-selected-toolbar" class="qr-floating-toolbar hidden">
            <div class="qr-toolbar-header">
              <span class="qr-toolbar-title" id="selected-qr-title">QR Code Selected</span>
              <button class="btn-tool-close" id="btn-close-qr-toolbar">&times;</button>
            </div>
            <div class="qr-toolbar-buttons">
              <button class="btn-action-pill" id="action-edit-qr" title="Read or modify QR link/content">
                <span class="pill-icon">✏️</span>
                <span class="pill-label">Edit QR</span>
              </button>
              <button class="btn-action-pill" id="action-replace-qr" title="Generate new or upload replacement">
                <span class="pill-icon">🔄</span>
                <span class="pill-label">Replace</span>
              </button>
              <button class="btn-action-pill" id="action-rotate-qr" title="Rotate 90 degrees">
                <span class="pill-icon">🔃</span>
                <span class="pill-label">Rotate</span>
              </button>
              <button class="btn-action-pill" id="action-duplicate-qr" title="Duplicate QR code">
                <span class="pill-icon">📋</span>
                <span class="pill-label">Duplicate</span>
              </button>
              <button class="btn-action-pill pill-danger" id="action-delete-qr" title="Delete or cover existing QR">
                <span class="pill-icon">🗑️</span>
                <span class="pill-label">Delete</span>
              </button>
            </div>
          </div>

          <!-- PDF Canvas & Interactive Overlay Container -->
          <div class="pdf-viewer-scroll-wrap" id="pdf-scroll-wrap">
            <div class="pdf-page-container" id="pdf-page-container">
              <!-- Rendered page canvas -->
              <canvas id="pdf-render-canvas"></canvas>
              <!-- Interactive annotation / QR overlay layer -->
              <div id="pdf-overlay-layer" class="pdf-overlay-layer"></div>
              <!-- Manual Area Select Box -->
              <div id="manual-selection-box" class="manual-selection-box hidden"></div>
            </div>
          </div>

          <!-- Bottom Status & Detection hint -->
          <div class="pdf-status-bar">
            <span id="pdf-status-info">Ready. Tap any existing QR code or tap <strong>Detect QR</strong> to scan.</span>
          </div>
        </div>

        <!-- MODAL: ADD / EDIT / REPLACE QR CODE -->
        <div id="modal-qr-editor" class="modal-backdrop hidden">
          <div class="modal-card modal-qr-dialog">
            <div class="modal-header">
              <h4 id="modal-qr-title">Configure QR Code</h4>
              <button class="modal-close" id="btn-close-qr-modal">&times;</button>
            </div>
            <div class="modal-body">
              <!-- Tabs: Generate New | Upload Image | Content Presets -->
              <div class="qr-modal-tabs">
                <button class="qr-tab-btn active" data-tab="create">Generate New</button>
                <button class="qr-tab-btn" data-tab="upload">Upload Image</button>
              </div>

              <!-- Tab 1: Create / Edit Content -->
              <div id="tab-content-create" class="qr-tab-pane">
                <div class="form-group">
                  <label class="form-label">Data Type</label>
                  <select id="qr-data-type" class="form-select">
                    <option value="url">Website URL (https://...)</option>
                    <option value="text">Plain Text</option>
                    <option value="phone">Phone / WhatsApp</option>
                    <option value="email">Email Address</option>
                    <option value="wifi">Wi-Fi Network</option>
                  </select>
                </div>

                <div class="form-group" id="group-qr-text">
                  <label class="form-label" id="label-qr-text">QR Content / Target</label>
                  <textarea id="input-qr-content" class="form-input" rows="3" placeholder="https://example.com"></textarea>
                </div>

                <!-- Wi-Fi Specific Fields (hidden by default) -->
                <div id="wifi-config-fields" class="form-card hidden" style="padding:10px; margin-bottom:10px;">
                  <div class="form-group">
                    <label class="form-label">SSID (Network Name)</label>
                    <input type="text" id="wifi-ssid" class="form-input" placeholder="Home_WiFi">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="text" id="wifi-password" class="form-input" placeholder="WPA2 Password">
                  </div>
                </div>

                <!-- Options: Cover underlying original QR -->
                <div class="form-group">
                  <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
                    <input type="checkbox" id="check-cover-original" checked>
                    <span><strong>Cover / Erase original QR</strong> underneath (Prevents old QR from showing)</span>
                  </label>
                </div>

                <!-- Live Preview -->
                <div class="qr-modal-preview">
                  <div class="qr-preview-box">
                    <canvas id="modal-qr-preview-canvas" width="160" height="160"></canvas>
                  </div>
                  <span class="qr-preview-hint" id="modal-preview-text">Live Preview</span>
                </div>
              </div>

              <!-- Tab 2: Upload Image -->
              <div id="tab-content-upload" class="qr-tab-pane hidden">
                <div class="upload-dropzone" style="padding:20px; border-radius:8px;">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">Upload Custom QR Image</span>
                  <span class="upload-subtext">PNG, JPG, SVG or WebP</span>
                  <input type="file" id="input-upload-qr-file" accept="image/*" class="hidden">
                  <button class="btn btn-sm btn-primary" type="button" id="btn-pick-upload-qr">Select Image</button>
                </div>
                <div id="uploaded-qr-preview-box" class="qr-modal-preview hidden" style="margin-top:12px;">
                  <img id="img-uploaded-preview" style="max-width:140px; max-height:140px; border-radius:6px; border:1px solid #cbd5e1;">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" id="btn-cancel-qr-modal">Cancel</button>
              <button class="btn btn-primary" id="btn-apply-qr-modal">Apply to PDF</button>
            </div>
          </div>
        </div>
      </div>
    `;

    bindPdfEditorEvents();
  }

  // Bind all interactive events
  function bindPdfEditorEvents() {
    const fileInput = document.getElementById('pdf-qr-file-input');
    const pickBtn = document.getElementById('btn-pick-pdf-qr');
    const sampleBtn = document.getElementById('btn-sample-pdf-qr');

    if (pickBtn) pickBtn.onclick = () => fileInput.click();
    if (fileInput) {
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const arrayBuf = await file.arrayBuffer();
        loadPdfDocument(arrayBuf);
      };
    }

    if (sampleBtn) {
      sampleBtn.onclick = () => createSamplePdfWithQr();
    }

    // Page controls
    document.getElementById('pdf-prev-page').onclick = () => changePage(-1);
    document.getElementById('pdf-next-page').onclick = () => changePage(1);

    // Zoom controls
    document.getElementById('pdf-zoom-in').onclick = () => changeZoom(0.2);
    document.getElementById('pdf-zoom-out').onclick = () => changeZoom(-0.2);

    // Main action buttons
    document.getElementById('btn-scan-detect-qr').onclick = () => autoDetectQrOnCurrentPage();
    document.getElementById('btn-manual-area-qr').onclick = () => toggleManualAreaSelection();
    document.getElementById('btn-add-new-qr').onclick = () => openAddNewQrDialog();
    document.getElementById('btn-export-pdf').onclick = () => exportModifiedPdf();

    // Toolbar buttons
    document.getElementById('action-edit-qr').onclick = () => editSelectedQr();
    document.getElementById('action-replace-qr').onclick = () => replaceSelectedQr();
    document.getElementById('action-rotate-qr').onclick = () => rotateSelectedQr();
    document.getElementById('action-duplicate-qr').onclick = () => duplicateSelectedQr();
    document.getElementById('action-delete-qr').onclick = () => deleteSelectedQr();
    document.getElementById('btn-close-qr-toolbar').onclick = () => deselectQr();

    // Modal controls
    initModalControls();
  }

  // Generate a sample PDF containing a clean QR Code to allow instantaneous testing
  async function createSamplePdfWithQr() {
    try {
      showToast('Generating sample PDF with QR code...', 'info');
      const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]); // Standard A4 points
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const normalFont = await doc.embedFont(StandardFonts.Helvetica);

      page.drawText('ToolBox Pro - Sample Invoice & Pass', {
        x: 50,
        y: 780,
        size: 20,
        font,
        color: rgb(0.01, 0.52, 0.78)
      });

      page.drawText('This sample document contains an embedded QR code for testing detection & replacement.', {
        x: 50,
        y: 750,
        size: 11,
        font: normalFont,
        color: rgb(0.2, 0.25, 0.3)
      });

      page.drawText('Document ID: INV-2026-98124  •  Date: Oct 07, 2026', {
        x: 50,
        y: 730,
        size: 10,
        font: normalFont,
        color: rgb(0.4, 0.45, 0.5)
      });

      // Generate a QR code data URL
      const qrDataUrl = await window.QRCode.toDataURL('https://toolboxpro.app/verify/inv-98124', {
        width: 250,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });

      const qrImage = await doc.embedPng(qrDataUrl);
      // Draw QR Code on the sample document
      page.drawRectangle({
        x: 190,
        y: 470,
        width: 180,
        height: 180,
        borderColor: rgb(0.85, 0.9, 0.95),
        borderWidth: 2,
        color: rgb(0.98, 0.99, 1.0)
      });

      page.drawImage(qrImage, {
        x: 200,
        y: 480,
        width: 160,
        height: 160
      });

      page.drawText('Scan or Tap QR to verify credentials', {
        x: 205,
        y: 455,
        size: 10,
        font: normalFont,
        color: rgb(0.3, 0.35, 0.4)
      });

      const pdfBytes = await doc.save();
      loadPdfDocument(pdfBytes.buffer);
    } catch (e) {
      console.error(e);
      showToast('Failed to create sample PDF: ' + e.message, 'error');
    }
  }

  // Load PDF Document into pdfjs and pdf-lib
  async function loadPdfDocument(arrayBuffer) {
    try {
      showToast('Loading PDF document...', 'info');
      editorState.pdfBytes = arrayBuffer;
      editorState.qrElements = [];
      editorState.selectedQrId = null;
      editorState.currentPage = 1;

      // Load using pdfjsLib
      editorState.pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      editorState.totalPages = editorState.pdfDoc.numPages;

      // Load using PDFLib
      editorState.pdfLibDoc = await window.PDFLib.PDFDocument.load(arrayBuffer.slice(0));

      document.getElementById('pdf-total-page-num').textContent = editorState.totalPages;
      document.getElementById('pdf-current-page-num').textContent = 1;

      document.getElementById('pdf-qr-dropzone').classList.add('hidden');
      document.getElementById('pdf-qr-workspace').classList.remove('hidden');

      await renderCurrentPage();

      // Automatically run auto-detect on page 1 for immediate feedback
      setTimeout(() => {
        autoDetectQrOnCurrentPage(true);
      }, 300);

    } catch (err) {
      console.error('Error loading PDF:', err);
      showToast('Could not load PDF document. Please verify the file.', 'error');
    }
  }

  // Render current PDF page on canvas and position overlay
  async function renderCurrentPage() {
    if (!editorState.pdfDoc) return;

    const pageNum = editorState.currentPage;
    document.getElementById('pdf-current-page-num').textContent = pageNum;

    const page = await editorState.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: editorState.zoomScale });
    editorState.pageViewport = viewport;

    const defaultViewport = page.getViewport({ scale: 1.0 });
    editorState.originalPageWidthPt = defaultViewport.width;
    editorState.originalPageHeightPt = defaultViewport.height;

    const canvas = document.getElementById('pdf-render-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    // Adjust container and overlay dimensions
    const overlay = document.getElementById('pdf-overlay-layer');
    overlay.style.width = `${viewport.width}px`;
    overlay.style.height = `${viewport.height}px`;

    // Render interactive QR elements on this page
    renderOverlayQrElements();
  }

  // Zoom handling
  function changeZoom(delta) {
    const newZoom = Math.min(Math.max(editorState.zoomScale + delta, 0.6), 2.5);
    if (Math.abs(newZoom - editorState.zoomScale) < 0.01) return;
    editorState.zoomScale = parseFloat(newZoom.toFixed(2));
    document.getElementById('pdf-zoom-val').textContent = `${Math.round(editorState.zoomScale * 100)}%`;
    renderCurrentPage();
  }

  // Page navigation
  function changePage(direction) {
    const target = editorState.currentPage + direction;
    if (target < 1 || target > editorState.totalPages) return;
    editorState.currentPage = target;
    deselectQr();
    renderCurrentPage();
  }

  // Auto-detect QR code on current page using jsQR
  async function autoDetectQrOnCurrentPage(silent = false) {
    const canvas = document.getElementById('pdf-render-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Run jsQR
    if (window.jsQR) {
      const code = window.jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code) {
        // Calculate bounding box in canvas coordinates
        const loc = code.location;
        const minX = Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x);
        const maxX = Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x);
        const minY = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y);
        const maxY = Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y);

        const width = Math.max(maxX - minX, 40);
        const height = Math.max(maxY - minY, 40);

        // Convert canvas coordinates to percentage of current page for responsiveness
        const pageW = canvas.width;
        const pageH = canvas.height;

        const relX = (minX / pageW) * 100;
        const relY = (minY / pageH) * 100;
        const relW = (width / pageW) * 100;
        const relH = (height / pageH) * 100;

        // Check if already registered
        const existing = editorState.qrElements.find(
          (q) => q.page === editorState.currentPage && Math.abs(q.relX - relX) < 5 && Math.abs(q.relY - relY) < 5
        );

        if (!existing) {
          const newQr = {
            id: 'qr_' + Date.now(),
            page: editorState.currentPage,
            relX: relX,
            relY: relY,
            relW: relW,
            relH: relH,
            rotation: 0,
            content: code.data || 'https://example.com',
            dataUrl: null, // Will use re-generated or original
            isExisting: true,
            coverUnderneath: true
          };

          // Generate sharp preview dataUrl
          newQr.dataUrl = await window.QRCode.toDataURL(newQr.content, { width: 300, margin: 1 });
          editorState.qrElements.push(newQr);
          renderOverlayQrElements();
          selectQr(newQr.id);
          showToast(`QR Code Detected: "${code.data.substring(0, 32)}..."`, 'success');
          return;
        } else {
          selectQr(existing.id);
          if (!silent) showToast('QR Code already highlighted on this page.', 'info');
          return;
        }
      }
    }

    if (!silent) {
      showToast('No QR pattern automatically recognized. You can use "Select Area" or "+ Add QR".', 'info');
    }
  }

  // Fallback: Manual Area Selection on Scanned / Raster PDF
  let manualSelectActive = false;
  let manualStartPos = null;

  function toggleManualAreaSelection() {
    manualSelectActive = !manualSelectActive;
    const btn = document.getElementById('btn-manual-area-qr');
    const overlay = document.getElementById('pdf-overlay-layer');

    if (manualSelectActive) {
      btn.classList.add('btn-active');
      overlay.classList.add('crosshair-mode');
      showToast('Drag a rectangle over the QR code area to select & replace it.', 'info');
      enableAreaDragListener();
    } else {
      btn.classList.remove('btn-active');
      overlay.classList.remove('crosshair-mode');
      disableAreaDragListener();
    }
  }

  function enableAreaDragListener() {
    const overlay = document.getElementById('pdf-overlay-layer');
    const box = document.getElementById('manual-selection-box');

    overlay.onpointerdown = (e) => {
      if (!manualSelectActive || e.target.classList.contains('qr-element-box')) return;
      const rect = overlay.getBoundingClientRect();
      manualStartPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      box.style.left = `${manualStartPos.x}px`;
      box.style.top = `${manualStartPos.y}px`;
      box.style.width = '0px';
      box.style.height = '0px';
      box.classList.remove('hidden');

      const onPointerMove = (moveEvt) => {
        const curX = moveEvt.clientX - rect.left;
        const curY = moveEvt.clientY - rect.top;

        const left = Math.min(manualStartPos.x, curX);
        const top = Math.min(manualStartPos.y, curY);
        const width = Math.abs(curX - manualStartPos.x);
        const height = Math.abs(curY - manualStartPos.y);

        box.style.left = `${left}px`;
        box.style.top = `${top}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
      };

      const onPointerUp = async (upEvt) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);

        const curX = upEvt.clientX - rect.left;
        const curY = upEvt.clientY - rect.top;
        const left = Math.min(manualStartPos.x, curX);
        const top = Math.min(manualStartPos.y, curY);
        const width = Math.abs(curX - manualStartPos.x);
        const height = Math.abs(curY - manualStartPos.y);

        box.classList.add('hidden');
        toggleManualAreaSelection();

        if (width > 20 && height > 20) {
          // Attempt to scan that specific cropped area first
          const canvas = document.getElementById('pdf-render-canvas');
          const ctx = canvas.getContext('2d');
          const subData = ctx.getImageData(left, top, width, height);

          let decodedContent = 'https://example.com';
          if (window.jsQR) {
            const result = window.jsQR(subData.data, subData.width, subData.height);
            if (result && result.data) decodedContent = result.data;
          }

          const pageW = overlay.clientWidth;
          const pageH = overlay.clientHeight;

          const newQr = {
            id: 'qr_' + Date.now(),
            page: editorState.currentPage,
            relX: (left / pageW) * 100,
            relY: (top / pageH) * 100,
            relW: (width / pageW) * 100,
            relH: (height / pageH) * 100,
            rotation: 0,
            content: decodedContent,
            dataUrl: await window.QRCode.toDataURL(decodedContent, { width: 300, margin: 1 }),
            isExisting: true,
            coverUnderneath: true
          };

          editorState.qrElements.push(newQr);
          renderOverlayQrElements();
          selectQr(newQr.id);
          showToast('QR Area selected! You can now Replace, Edit, or Delete.', 'success');
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };
  }

  function disableAreaDragListener() {
    const overlay = document.getElementById('pdf-overlay-layer');
    overlay.onpointerdown = null;
    const box = document.getElementById('manual-selection-box');
    if (box) box.classList.add('hidden');
  }

  // Render all QR items on current page in the overlay
  function renderOverlayQrElements() {
    const overlay = document.getElementById('pdf-overlay-layer');
    overlay.innerHTML = '';

    const pageQrs = editorState.qrElements.filter((q) => q.page === editorState.currentPage);

    pageQrs.forEach((qr) => {
      const box = document.createElement('div');
      box.className = `qr-element-box ${qr.id === editorState.selectedQrId ? 'selected' : ''}`;
      box.id = `el_${qr.id}`;
      box.style.left = `${qr.relX}%`;
      box.style.top = `${qr.relY}%`;
      box.style.width = `${qr.relW}%`;
      box.style.height = `${qr.relH}%`;
      box.style.transform = `rotate(${qr.rotation}deg)`;

      // If user selected to cover original underneath, add white background
      if (qr.coverUnderneath) {
        box.classList.add('cover-original');
      }

      box.innerHTML = `
        <div class="qr-content-wrapper">
          <img src="${qr.dataUrl}" alt="QR" class="qr-preview-image">
        </div>
        <div class="qr-badge-type">${qr.isExisting ? 'Detected QR' : 'New QR'}</div>
        <!-- Resize handle -->
        <div class="qr-resize-handle" title="Drag to Resize"></div>
        <!-- Rotate badge -->
        <div class="qr-rotate-indicator" title="Tap to Rotate">↻</div>
      `;

      // Select on tap
      box.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (e.target.classList.contains('qr-resize-handle')) {
          initResize(e, qr);
        } else if (e.target.classList.contains('qr-rotate-indicator')) {
          rotateQr(qr.id);
        } else {
          selectQr(qr.id);
          initDrag(e, qr);
        }
      });

      overlay.appendChild(box);
    });

    updateToolbarPosition();
  }

  // Select QR item
  function selectQr(qrId) {
    editorState.selectedQrId = qrId;
    const qr = editorState.qrElements.find((q) => q.id === qrId);

    document.querySelectorAll('.qr-element-box').forEach((b) => b.classList.remove('selected'));
    const targetBox = document.getElementById(`el_${qrId}`);
    if (targetBox) targetBox.classList.add('selected');

    const toolbar = document.getElementById('qr-selected-toolbar');
    if (qr && toolbar) {
      toolbar.classList.remove('hidden');
      const title = document.getElementById('selected-qr-title');
      if (title) {
        const previewText = qr.content ? qr.content.replace(/^https?:\/\//i, '').substring(0, 22) : 'QR Code';
        title.textContent = `Selected: ${previewText}`;
      }
      updateToolbarPosition();
    }
  }

  function deselectQr() {
    editorState.selectedQrId = null;
    document.querySelectorAll('.qr-element-box').forEach((b) => b.classList.remove('selected'));
    const toolbar = document.getElementById('qr-selected-toolbar');
    if (toolbar) toolbar.classList.add('hidden');
  }

  function updateToolbarPosition() {
    const toolbar = document.getElementById('qr-selected-toolbar');
    if (!toolbar || !editorState.selectedQrId) return;
    // Toolbar is styled as compact floating bottom dock on mobile, or anchored to top
  }

  // Drag (Move) QR logic
  function initDrag(e, qr) {
    editorState.isDragging = true;
    const overlay = document.getElementById('pdf-overlay-layer');
    const startX = e.clientX;
    const startY = e.clientY;
    const initRelX = qr.relX;
    const initRelY = qr.relY;
    const pageW = overlay.clientWidth;
    const pageH = overlay.clientHeight;

    const onMove = (moveEvt) => {
      if (!editorState.isDragging) return;
      const dx = moveEvt.clientX - startX;
      const dy = moveEvt.clientY - startY;

      qr.relX = Math.max(0, Math.min(100 - qr.relW, initRelX + (dx / pageW) * 100));
      qr.relY = Math.max(0, Math.min(100 - qr.relH, initRelY + (dy / pageH) * 100));

      const box = document.getElementById(`el_${qr.id}`);
      if (box) {
        box.style.left = `${qr.relX}%`;
        box.style.top = `${qr.relY}%`;
      }
    };

    const onUp = () => {
      editorState.isDragging = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // Resize QR logic
  function initResize(e, qr) {
    editorState.isResizing = true;
    const overlay = document.getElementById('pdf-overlay-layer');
    const startX = e.clientX;
    const initRelW = qr.relW;
    const initRelH = qr.relH;
    const pageW = overlay.clientWidth;

    const onMove = (moveEvt) => {
      if (!editorState.isResizing) return;
      const dx = moveEvt.clientX - startX;
      const dRel = (dx / pageW) * 100;

      // Maintain aspect ratio for square QR code
      const newW = Math.max(5, Math.min(60, initRelW + dRel));
      qr.relW = newW;
      qr.relH = newW * (overlay.clientWidth / overlay.clientHeight);

      const box = document.getElementById(`el_${qr.id}`);
      if (box) {
        box.style.width = `${qr.relW}%`;
        box.style.height = `${qr.relH}%`;
      }
    };

    const onUp = () => {
      editorState.isResizing = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // Rotate QR logic
  function rotateSelectedQr() {
    if (!editorState.selectedQrId) return;
    rotateQr(editorState.selectedQrId);
  }

  function rotateQr(qrId) {
    const qr = editorState.qrElements.find((q) => q.id === qrId);
    if (!qr) return;
    qr.rotation = (qr.rotation + 90) % 360;
    const box = document.getElementById(`el_${qr.id}`);
    if (box) box.style.transform = `rotate(${qr.rotation}deg)`;
    showToast(`Rotated to ${qr.rotation}°`, 'info');
  }

  // Duplicate QR logic
  async function duplicateSelectedQr() {
    const qr = editorState.qrElements.find((q) => q.id === editorState.selectedQrId);
    if (!qr) return;

    const copy = {
      ...qr,
      id: 'qr_' + Date.now(),
      relX: Math.min(qr.relX + 5, 80),
      relY: Math.min(qr.relY + 5, 80),
      isExisting: false
    };

    editorState.qrElements.push(copy);
    renderOverlayQrElements();
    selectQr(copy.id);
    showToast('QR Code duplicated!', 'success');
  }

  // Delete QR logic
  function deleteSelectedQr() {
    const qr = editorState.qrElements.find((q) => q.id === editorState.selectedQrId);
    if (!qr) return;

    if (qr.isExisting) {
      const confirmDelete = confirm('Delete this QR Code? It will be cleanly erased/covered in the exported PDF.');
      if (!confirmDelete) return;
    }

    editorState.qrElements = editorState.qrElements.filter((q) => q.id !== qr.id);
    deselectQr();
    renderOverlayQrElements();
    showToast('QR Code removed from document.', 'info');
  }

  // Open modal to Add New QR
  function openAddNewQrDialog() {
    modalMode = 'add';
    document.getElementById('modal-qr-title').textContent = 'Add New QR Code to PDF';
    document.getElementById('input-qr-content').value = 'https://example.com';
    document.getElementById('check-cover-original').checked = false;
    openModal();
    updateLiveModalPreview();
  }

  // Open modal to Edit Selected QR
  function editSelectedQr() {
    const qr = editorState.qrElements.find((q) => q.id === editorState.selectedQrId);
    if (!qr) return;
    modalMode = 'edit';
    document.getElementById('modal-qr-title').textContent = 'Edit QR Content';
    document.getElementById('input-qr-content').value = qr.content || '';
    document.getElementById('check-cover-original').checked = qr.coverUnderneath !== false;
    openModal();
    updateLiveModalPreview();
  }

  // Open modal to Replace Selected QR
  function replaceSelectedQr() {
    const qr = editorState.qrElements.find((q) => q.id === editorState.selectedQrId);
    if (!qr) return;
    modalMode = 'replace';
    document.getElementById('modal-qr-title').textContent = 'Replace Existing QR Code';
    document.getElementById('input-qr-content').value = qr.content || 'https://';
    document.getElementById('check-cover-original').checked = true; // Ensure original is covered
    openModal();
    updateLiveModalPreview();
  }

  // Modal logic
  let modalMode = 'add'; // 'add' | 'edit' | 'replace'
  let customUploadedImageBlob = null;

  function initModalControls() {
    const modal = document.getElementById('modal-qr-editor');
    const closeBtn = document.getElementById('btn-close-qr-modal');
    const cancelBtn = document.getElementById('btn-cancel-qr-modal');
    const applyBtn = document.getElementById('btn-apply-qr-modal');

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    // Tabs inside modal
    document.querySelectorAll('.qr-tab-btn').forEach((tab) => {
      tab.onclick = () => {
        document.querySelectorAll('.qr-tab-btn').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');
        document.getElementById('tab-content-create').classList.toggle('hidden', target !== 'create');
        document.getElementById('tab-content-upload').classList.toggle('hidden', target !== 'upload');
      };
    });

    // Content change updates preview
    const contentInput = document.getElementById('input-qr-content');
    contentInput.oninput = () => updateLiveModalPreview();

    const typeSelect = document.getElementById('qr-data-type');
    typeSelect.onchange = (e) => {
      const type = e.target.value;
      const wifiFields = document.getElementById('wifi-config-fields');
      const textGroup = document.getElementById('group-qr-text');

      if (type === 'wifi') {
        wifiFields.classList.remove('hidden');
        textGroup.classList.add('hidden');
      } else {
        wifiFields.classList.add('hidden');
        textGroup.classList.remove('hidden');

        if (type === 'url') contentInput.placeholder = 'https://yourwebsite.com';
        else if (type === 'phone') contentInput.placeholder = 'tel:+1234567890';
        else if (type === 'email') contentInput.placeholder = 'mailto:user@domain.com';
        else contentInput.placeholder = 'Enter plain text content';
      }
      updateLiveModalPreview();
    };

    const wifiSsid = document.getElementById('wifi-ssid');
    const wifiPass = document.getElementById('wifi-password');
    wifiSsid.oninput = () => updateLiveModalPreview();
    wifiPass.oninput = () => updateLiveModalPreview();

    // Upload custom image
    const uploadInput = document.getElementById('input-upload-qr-file');
    const uploadBtn = document.getElementById('btn-pick-upload-qr');
    uploadBtn.onclick = () => uploadInput.click();

    uploadInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        customUploadedImageBlob = re.target.result;
        const img = document.getElementById('img-uploaded-preview');
        img.src = customUploadedImageBlob;
        document.getElementById('uploaded-qr-preview-box').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    };

    // Apply button
    applyBtn.onclick = async () => {
      await applyModalChanges();
      closeModal();
    };
  }

  function openModal() {
    document.getElementById('modal-qr-editor').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modal-qr-editor').classList.add('hidden');
    customUploadedImageBlob = null;
    document.getElementById('uploaded-qr-preview-box').classList.add('hidden');
  }

  async function updateLiveModalPreview() {
    const typeSelect = document.getElementById('qr-data-type').value;
    let text = document.getElementById('input-qr-content').value.trim();

    if (typeSelect === 'wifi') {
      const ssid = document.getElementById('wifi-ssid').value.trim();
      const pass = document.getElementById('wifi-password').value.trim();
      text = `WIFI:T:WPA;S:${ssid};P:${pass};;`;
    }

    if (!text) text = 'https://toolboxpro.app';

    const canvas = document.getElementById('modal-qr-preview-canvas');
    if (window.QRCode && canvas) {
      await window.QRCode.toCanvas(canvas, text, {
        width: 160,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
    }
  }

  async function applyModalChanges() {
    const isUploadTab = document.querySelector('.qr-tab-btn[data-tab="upload"]').classList.contains('active');
    let qrDataUrl = null;
    let qrContent = '';

    if (isUploadTab && customUploadedImageBlob) {
      qrDataUrl = customUploadedImageBlob;
      qrContent = 'Uploaded QR Image';
    } else {
      const typeSelect = document.getElementById('qr-data-type').value;
      if (typeSelect === 'wifi') {
        const ssid = document.getElementById('wifi-ssid').value.trim();
        const pass = document.getElementById('wifi-password').value.trim();
        qrContent = `WIFI:T:WPA;S:${ssid};P:${pass};;`;
      } else {
        qrContent = document.getElementById('input-qr-content').value.trim() || 'https://toolboxpro.app';
      }
      qrDataUrl = await window.QRCode.toDataURL(qrContent, { width: 300, margin: 1 });
    }

    const coverUnderneath = document.getElementById('check-cover-original').checked;

    if (modalMode === 'add') {
      // Create new QR in the center of the current page
      const overlay = document.getElementById('pdf-overlay-layer');
      const sizeW = 20; // 20% width
      const sizeH = sizeW * (overlay.clientWidth / overlay.clientHeight);

      const newQr = {
        id: 'qr_' + Date.now(),
        page: editorState.currentPage,
        relX: 40,
        relY: 40,
        relW: sizeW,
        relH: sizeH,
        rotation: 0,
        content: qrContent,
        dataUrl: qrDataUrl,
        isExisting: false,
        coverUnderneath: coverUnderneath
      };

      editorState.qrElements.push(newQr);
      renderOverlayQrElements();
      selectQr(newQr.id);
      showToast('New QR Code added! Drag to position.', 'success');

    } else if (modalMode === 'edit' || modalMode === 'replace') {
      const qr = editorState.qrElements.find((q) => q.id === editorState.selectedQrId);
      if (qr) {
        qr.content = qrContent;
        qr.dataUrl = qrDataUrl;
        qr.coverUnderneath = coverUnderneath;
        renderOverlayQrElements();
        selectQr(qr.id);
        showToast(modalMode === 'replace' ? 'QR Code replaced!' : 'QR Code updated!', 'success');
      }
    }
  }

  // EXPORT: Bake changes permanently into PDF using pdf-lib
  async function exportModifiedPdf() {
    if (!editorState.pdfBytes) return;

    try {
      showToast('Baking QR changes and generating PDF...', 'info');
      const { PDFDocument, rgb, degrees } = window.PDFLib;
      const doc = await PDFDocument.load(editorState.pdfBytes.slice(0));

      const pageCount = doc.getPageCount();

      for (let pIdx = 0; pIdx < pageCount; pIdx++) {
        const pageNum = pIdx + 1;
        const pageQrs = editorState.qrElements.filter((q) => q.page === pageNum);
        if (pageQrs.length === 0) continue;

        const pdfPage = doc.getPage(pIdx);
        const { width: pWidth, height: pHeight } = pdfPage.getSize();

        for (const qr of pageQrs) {
          // Convert relative coordinates (%) to PDF coordinate system (points, origin at bottom-left)
          const targetWidth = (qr.relW / 100) * pWidth;
          const targetHeight = (qr.relH / 100) * pHeight;
          const targetX = (qr.relX / 100) * pWidth;
          // In PDF coordinates, Y starts from bottom
          const targetY = pHeight - ((qr.relY / 100) * pHeight) - targetHeight;

          // STEP 1: Cover original QR if instructed
          if (qr.coverUnderneath) {
            // Draw clean opaque white patch covering the area with a slight padding margin to erase raster edges
            const pad = 2;
            pdfPage.drawRectangle({
              x: targetX - pad,
              y: targetY - pad,
              width: targetWidth + (pad * 2),
              height: targetHeight + (pad * 2),
              color: rgb(1, 1, 1),
              opacity: 1.0
            });
          }

          // STEP 2: Embed new or modified QR Code image
          let qrImage = null;
          if (qr.dataUrl.startsWith('data:image/png')) {
            qrImage = await doc.embedPng(qr.dataUrl);
          } else if (qr.dataUrl.startsWith('data:image/jpeg') || qr.dataUrl.startsWith('data:image/jpg')) {
            qrImage = await doc.embedJpg(qr.dataUrl);
          } else {
            // Convert to png
            const convertedPng = await convertDataUrlToPng(qr.dataUrl);
            qrImage = await doc.embedPng(convertedPng);
          }

          // Draw the new QR code onto the PDF page
          pdfPage.drawImage(qrImage, {
            x: targetX,
            y: targetY,
            width: targetWidth,
            height: targetHeight,
            rotate: degrees(qr.rotation || 0)
          });
        }
      }

      const modifiedPdfBytes = await doc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `edited-qr-document-${Date.now()}.pdf`);
      showToast('Export successful! Downloaded updated PDF.', 'success');

    } catch (err) {
      console.error('Export error:', err);
      showToast('Error exporting PDF: ' + err.message, 'error');
    }
  }

  // Helper to convert any image format to standard PNG
  function convertDataUrlToPng(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = img.width || 300;
        cvs.height = img.height || 300;
        const ctx = cvs.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(img, 0, 0);
        resolve(cvs.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
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

  // Expose module globally
  window.renderPdfEditor = renderPdfEditor;

})();
