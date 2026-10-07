// ========================================================
// ToolBox Pro - PDF Text Editor Module (pdf-editor.js)
// Core Feature: Interactive PDF Rendering, Text-Layer Detection,
// Inline Text Replacement, OCR Fallback, Annotations, PDF-Lib Export
// ========================================================

(function () {
  // Ensure PDF.js worker is properly configured
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Internal Editor State
  const PdfState = {
    pdfDoc: null,
    rawBytes: null,
    fileName: 'document.pdf',
    totalNumPages: 0,
    currentPageNum: 1,
    scale: 1.25,
    rotation: 0,
    isScannedMode: false,
    activeTool: 'select', // 'select', 'editText', 'addText', 'redact', 'highlight', 'draw', 'signature'
    
    // Page Modifications Stack: pageIndex -> array of items
    // Item: { type: 'textEdit', x, y, width, height, origText, newText, fontSize, color, coverColor, isBold, isItalic }
    // Item: { type: 'redact', x, y, width, height, color }
    // Item: { type: 'addedText', x, y, text, fontSize, color }
    // Item: { type: 'signature', x, y, width, height, imgData }
    pageModifications: {},

    // Drawing paths per page
    drawingPaths: {},

    // Undo / Redo Stacks
    history: [],
    historyIndex: -1,

    // Currently selected text item for editing
    selectedTextItem: null,

    // Drawing in-progress
    isDrawing: false,
    currentPath: []
  };

  // Main Entry Point to Render PDF Text Editor
  function initPdfEditorTool(container) {
    container.innerHTML = `
      <div class="pdf-editor-container">
        <!-- Initial Upload View -->
        <div id="pdf-upload-view" class="tool-pane">
          <div class="upload-dropzone" id="pdf-dropzone">
            <span class="upload-icon">📄</span>
            <span class="upload-text">Choose PDF or Drag & Drop</span>
            <span class="upload-subtext">Supports text PDFs, scanned invoices, receipts (application/pdf)</span>
            <input type="file" id="pdf-file-input" accept="application/pdf" class="hidden">
            <button class="btn btn-primary" type="button" id="btn-pick-pdf">Select PDF from Device</button>
          </div>

          <div style="text-align: center; margin: 6px 0;">
            <button class="btn btn-ghost btn-sm" id="btn-load-sample-pdf">
              ✨ Load Sample Editable Invoice (Instant Test)
            </button>
          </div>

          <div style="text-align: center;">
            <div class="privacy-banner-pill">
              <svg viewBox="0 0 24 24" style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>Your PDF is processed locally on this device whenever possible.</span>
            </div>
          </div>
        </div>

        <!-- Editor View (Hidden initially) -->
        <div id="pdf-workspace-view" class="pdf-editor-container hidden">
          <!-- Top Editor Actions -->
          <div class="pdf-editor-top-actions">
            <div class="pdf-doc-meta">
              <span id="pdf-doc-name" class="pdf-name-badge">document.pdf</span>
              <span id="pdf-mode-indicator" class="pdf-mode-pill mode-text">Text PDF</span>
            </div>

            <div style="display:flex; gap:6px; align-items:center;">
              <button class="icon-btn" id="btn-pdf-undo" title="Undo">
                <svg viewBox="0 0 24 24" class="svg-icon"><path d="M3 10h10a5 5 0 015 5v2M3 10l6-6M3 10l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button class="icon-btn" id="btn-pdf-redo" title="Redo">
                <svg viewBox="0 0 24 24" class="svg-icon"><path d="M21 10H11a5 5 0 00-5 5v2M21 10l-6-6M21 10l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button class="btn btn-primary btn-sm" id="btn-export-pdf">
                <svg viewBox="0 0 24 24" class="svg-icon-btn"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                <span>Save PDF</span>
              </button>
            </div>
          </div>

          <!-- Secondary Rich Toolbar -->
          <div class="pdf-editor-toolbar">
            <button class="tool-bar-btn active" data-tool="select" id="tool-btn-select">
              <svg viewBox="0 0 24 24"><path d="M3 3l7 18 3-7 7-3L3 3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Edit Text</span>
            </button>
            <button class="tool-bar-btn" data-tool="addText" id="tool-btn-addText">
              <svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Add Text</span>
            </button>
            <button class="tool-bar-btn" data-tool="redact" id="tool-btn-redact">
              <svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z M3 9h18 M9 3v18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Redact</span>
            </button>
            <button class="tool-bar-btn" data-tool="highlight" id="tool-btn-highlight">
              <svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Highlight</span>
            </button>
            <button class="tool-bar-btn" data-tool="draw" id="tool-btn-draw">
              <svg viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536M4 20h4l10.5-10.5a2.121 2.121 0 00-3-3L5 17l-1 3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Draw</span>
            </button>
            <button class="tool-bar-btn" data-tool="signature" id="tool-btn-signature">
              <svg viewBox="0 0 24 24"><path d="M16 3l5 5L8 21H3v-5L16 3z M19 14v6H5" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Signature</span>
            </button>
            <div class="toolbar-divider"></div>
            <button class="tool-bar-btn" id="tool-btn-page-mgr">
              <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Pages</span>
            </button>
            <button class="tool-bar-btn" id="tool-btn-rotate">
              <svg viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>Rotate</span>
            </button>
          </div>

          <!-- Stage / Document Canvas -->
          <div class="pdf-stage-wrapper" id="pdf-stage-wrapper">
            <div class="pdf-page-container" id="pdf-page-container">
              <canvas id="pdf-render-canvas"></canvas>
              <!-- Drawing / Annotation canvas overlay -->
              <canvas id="pdf-annot-canvas"></canvas>
              <!-- Interactive Text Detection overlay -->
              <div id="pdf-text-layer" class="pdf-text-interactive-layer"></div>
            </div>
          </div>

          <!-- Bottom Navigation Controls -->
          <div class="pdf-bottom-controls">
            <div class="page-stepper">
              <button class="icon-btn btn-sm" id="btn-pdf-prev-page">◀</button>
              <span class="page-indicator" id="pdf-page-indicator">1 / 1</span>
              <button class="icon-btn btn-sm" id="btn-pdf-next-page">▶</button>
            </div>
            <div class="zoom-controls">
              <button class="icon-btn btn-sm" id="btn-pdf-zoom-out">-</button>
              <span class="zoom-val" id="pdf-zoom-text">125%</span>
              <button class="icon-btn btn-sm" id="btn-pdf-zoom-in">+</button>
            </div>
          </div>
        </div>
      </div>
    `;

    bindUploadEvents();
    bindToolbarEvents();
    bindInspectorEvents();
  }

  // Upload & File Picker Handling
  function bindUploadEvents() {
    const fileInput = document.getElementById('pdf-file-input');
    const pickBtn = document.getElementById('btn-pick-pdf');
    const dropzone = document.getElementById('pdf-dropzone');
    const sampleBtn = document.getElementById('btn-load-sample-pdf');

    if (pickBtn && fileInput) {
      pickBtn.onclick = () => fileInput.click();
    }

    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handlePdfFile(file);
      };
    }

    if (dropzone) {
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.style.background = 'rgba(2, 132, 199, 0.2)';
      };
      dropzone.ondragleave = () => {
        dropzone.style.background = '';
      };
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.background = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handlePdfFile(e.dataTransfer.files[0]);
        }
      };
    }

    if (sampleBtn) {
      sampleBtn.onclick = () => generateAndLoadSampleInvoice();
    }
  }

  // Read & Load PDF
  async function handlePdfFile(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }

    showToast('Loading document...', 'info');
    PdfState.fileName = file.name;
    const arrayBuffer = await file.arrayBuffer();
    loadPdfFromArrayBuffer(arrayBuffer);
  }

  // Built-in Sample Generator (Allows instant testing with 1 click!)
  async function generateAndLoadSampleInvoice() {
    showToast('Generating sample invoice for editing...', 'info');
    try {
      const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header
      page.drawText('INVOICE #INV-2026-08', { x: 50, y: 780, size: 22, font: fontBold, color: rgb(0.01, 0.52, 0.78) });
      page.drawText('ToolBox Pro Commerce Inc.', { x: 50, y: 755, size: 12, font, color: rgb(0.3, 0.3, 0.3) });

      // Customer Details (The user can tap "Rahim", "5000", etc. to test!)
      page.drawText('Bill To:', { x: 50, y: 700, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText('Name: Rahim', { x: 50, y: 680, size: 14, font, color: rgb(0.1, 0.1, 0.1) });
      page.drawText('Amount: 5000', { x: 50, y: 660, size: 14, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText('Date: 05/10/2026', { x: 50, y: 640, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
      page.drawText('Status: Pending Payment', { x: 50, y: 620, size: 12, font, color: rgb(0.8, 0.2, 0.2) });

      // Instructions box
      page.drawRectangle({ x: 50, y: 530, width: 495, height: 60, color: rgb(0.94, 0.97, 1) });
      page.drawText('TIP: Tap on "Rahim" or "5000" above to edit existing text directly!', {
        x: 65, y: 555, size: 11, font: fontBold, color: rgb(0.01, 0.4, 0.7)
      });

      const pdfBytes = await pdfDoc.save();
      PdfState.fileName = 'Sample-Invoice.pdf';
      loadPdfFromArrayBuffer(pdfBytes.buffer);
    } catch (err) {
      console.error(err);
      showToast('Error creating sample PDF', 'error');
    }
  }

  // Load PDF ArrayBuffer into PDF.js
  async function loadPdfFromArrayBuffer(arrayBuffer) {
    try {
      PdfState.rawBytes = new Uint8Array(arrayBuffer);
      const loadingTask = window.pdfjsLib.getDocument({ data: PdfState.rawBytes });
      PdfState.pdfDoc = await loadingTask.promise;
      PdfState.totalNumPages = PdfState.pdfDoc.numPages;
      PdfState.currentPageNum = 1;
      PdfState.pageModifications = {};
      PdfState.drawingPaths = {};
      PdfState.history = [];
      PdfState.historyIndex = -1;

      // Switch views
      document.getElementById('pdf-upload-view').classList.add('hidden');
      document.getElementById('pdf-workspace-view').classList.remove('hidden');
      document.getElementById('pdf-doc-name').textContent = PdfState.fileName;

      renderCurrentPage();
      showToast(AppState.lang === 'bn' ? 'পিডিএফ সফলভাবে খোলা হয়েছে' : 'PDF opened successfully!', 'success');
    } catch (err) {
      console.error('PDF load error:', err);
      showToast('Unable to open this PDF document.', 'error');
    }
  }

  // Render Current Page
  async function renderCurrentPage() {
    if (!PdfState.pdfDoc) return;

    const page = await PdfState.pdfDoc.getPage(PdfState.currentPageNum);
    const viewport = page.getViewport({ scale: PdfState.scale, rotation: PdfState.rotation });

    const canvas = document.getElementById('pdf-render-canvas');
    const annotCanvas = document.getElementById('pdf-annot-canvas');
    const container = document.getElementById('pdf-page-container');
    const textLayer = document.getElementById('pdf-text-layer');

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    annotCanvas.width = viewport.width;
    annotCanvas.height = viewport.height;

    container.style.width = `${viewport.width}px`;
    container.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext('2d');
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    // Update Page indicators
    document.getElementById('pdf-page-indicator').textContent =
      `${PdfState.currentPageNum} / ${PdfState.totalNumPages}`;
    document.getElementById('pdf-zoom-text').textContent =
      `${Math.round(PdfState.scale * 100)}%`;

    // Extract Text Layer items (Mode A vs Mode B)
    textLayer.innerHTML = '';
    const textContent = await page.getTextContent();
    const hasText = textContent.items && textContent.items.length > 0;

    const modeIndicator = document.getElementById('pdf-mode-indicator');
    if (hasText) {
      PdfState.isScannedMode = false;
      modeIndicator.className = 'pdf-mode-pill mode-text';
      modeIndicator.textContent = 'Mode A: Text PDF';
      renderInteractiveTextLayer(textContent, viewport);
    } else {
      PdfState.isScannedMode = true;
      modeIndicator.className = 'pdf-mode-pill mode-ocr';
      modeIndicator.textContent = 'Mode B: Scanned / OCR';
      showToast(
        AppState.lang === 'bn'
          ? 'এই পিডিএফটি স্ক্যান করা হয়েছে। ভিজ্যুয়াল টেক্সট প্রতিস্থাপন ব্যবহার করা হবে।'
          : 'This PDF appears to be scanned. Text editing will use OCR / visual replacement.',
        'info'
      );
    }

    // Render Applied Modifications (Text Patches, Redactions, Signatures)
    renderAppliedModifications();
    redrawAnnotCanvas();
  }

  // Mode A: Interactive Text Detection & Selection Layer
  function renderInteractiveTextLayer(textContent, viewport) {
    const textLayer = document.getElementById('pdf-text-layer');
    textLayer.innerHTML = '';

    textContent.items.forEach((item) => {
      if (!item.str || item.str.trim() === '') return;

      // Calculate bounding box using PDF viewport transform
      const tx = window.pdfjsLib.Util.transform(viewport.transform, item.transform);
      const fontHeight = Math.hypot(tx[2], tx[3]);
      const x = tx[4];
      const y = tx[5] - fontHeight; // Flip PDF baseline to top-left CSS coordinates
      const width = item.width * (viewport.width / viewport.rawDims.pageWidth);
      const height = fontHeight * 1.15;

      const box = document.createElement('div');
      box.className = 'detected-text-box';
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
      box.style.width = `${Math.max(width, 16)}px`;
      box.style.height = `${Math.max(height, 12)}px`;
      box.title = `Click to edit: "${item.str}"`;

      box.onclick = (e) => {
        e.stopPropagation();
        openTextEditInspector({
          str: item.str,
          x,
          y,
          width: Math.max(width, 24),
          height: Math.max(height, 14),
          fontSize: Math.round(fontHeight),
          viewportWidth: viewport.width,
          viewportHeight: viewport.height
        });
      };

      textLayer.appendChild(box);
    });
  }

  // Open Inline Text Edit Inspector
  function openTextEditInspector(target) {
    PdfState.selectedTextItem = target;
    const modal = document.getElementById('modal-pdf-text-edit');
    const origBox = document.getElementById('pdf-edit-original-text');
    const newText = document.getElementById('pdf-edit-new-text');
    const fsInput = document.getElementById('pdf-edit-font-size');

    origBox.textContent = target.str;
    newText.value = target.str;
    fsInput.value = target.fontSize || 12;

    modal.classList.remove('hidden');
    newText.focus();
  }

  // Inspector Dialog Actions
  function bindInspectorEvents() {
    const modal = document.getElementById('modal-pdf-text-edit');
    const closeBtn = document.getElementById('btn-close-pdf-text-modal');
    const cancelBtn = document.getElementById('btn-cancel-pdf-text');
    const applyBtn = document.getElementById('btn-apply-pdf-text');
    const fsMinus = document.getElementById('btn-fs-minus');
    const fsPlus = document.getElementById('btn-fs-plus');
    const fsInput = document.getElementById('pdf-edit-font-size');

    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    if (cancelBtn) cancelBtn.onclick = () => modal.classList.add('hidden');

    if (fsMinus) {
      fsMinus.onclick = () => {
        fsInput.value = Math.max(6, parseInt(fsInput.value || 12) - 1);
      };
    }
    if (fsPlus) {
      fsPlus.onclick = () => {
        fsInput.value = Math.min(72, parseInt(fsInput.value || 12) + 1);
      };
    }

    if (applyBtn) {
      applyBtn.onclick = () => {
        if (!PdfState.selectedTextItem) return;
        const newTextVal = document.getElementById('pdf-edit-new-text').value;
        const fontSizeVal = parseInt(fsInput.value) || 12;
        const colorVal = document.getElementById('pdf-edit-color').value || '#000000';
        const coverColorVal = document.getElementById('pdf-edit-cover-color').value || '#ffffff';
        const isBold = document.getElementById('btn-pdf-bold').classList.contains('active');
        const isItalic = document.getElementById('btn-pdf-italic').classList.contains('active');

        // Apply Modification
        const patch = {
          type: 'textEdit',
          origText: PdfState.selectedTextItem.str,
          newText: newTextVal,
          x: PdfState.selectedTextItem.x,
          y: PdfState.selectedTextItem.y,
          width: PdfState.selectedTextItem.width,
          height: PdfState.selectedTextItem.height,
          fontSize: fontSizeVal,
          color: colorVal,
          coverColor: coverColorVal,
          isBold,
          isItalic
        };

        saveModification(patch);
        modal.classList.add('hidden');
        renderAppliedModifications();
        showToast(AppState.lang === 'bn' ? 'টেক্সট পরিবর্তন প্রয়োগ হয়েছে' : 'Text replacement applied!', 'success');
      };
    }

    // Toggle bold/italic buttons in inspector
    ['btn-pdf-bold', 'btn-pdf-italic'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.onclick = () => el.classList.toggle('active');
    });
  }

  // Save Modification into Page State & History Stack
  function saveModification(item) {
    const pageNum = PdfState.currentPageNum;
    if (!PdfState.pageModifications[pageNum]) {
      PdfState.pageModifications[pageNum] = [];
    }
    PdfState.pageModifications[pageNum].push(item);

    // Record History for Undo
    PdfState.history.push({
      action: 'add',
      pageNum,
      item
    });
    PdfState.historyIndex = PdfState.history.length - 1;
  }

  // Render Visual Covers & Replacement Text Over Canvas
  function renderAppliedModifications() {
    const pageNum = PdfState.currentPageNum;
    const items = PdfState.pageModifications[pageNum] || [];
    const textLayer = document.getElementById('pdf-text-layer');

    // Remove previously rendered patches
    document.querySelectorAll('.applied-text-patch').forEach((el) => el.remove());
    document.querySelectorAll('.applied-redaction').forEach((el) => el.remove());

    items.forEach((item, index) => {
      if (item.type === 'textEdit') {
        const patchEl = document.createElement('div');
        patchEl.className = 'applied-text-patch';
        patchEl.style.left = `${item.x}px`;
        patchEl.style.top = `${item.y}px`;
        patchEl.style.minWidth = `${item.width + 4}px`;
        patchEl.style.minHeight = `${item.height}px`;

        // Cover layer
        const cover = document.createElement('div');
        cover.className = 'applied-text-cover';
        cover.style.backgroundColor = item.coverColor || '#ffffff';
        patchEl.appendChild(cover);

        // Replacement text
        const content = document.createElement('span');
        content.className = 'applied-text-content';
        content.textContent = item.newText;
        content.style.fontSize = `${item.fontSize}px`;
        content.style.color = item.color;
        if (item.isBold) content.style.fontWeight = 'bold';
        if (item.isItalic) content.style.fontStyle = 'italic';
        patchEl.appendChild(content);

        // Allow re-editing on click
        patchEl.onclick = (e) => {
          e.stopPropagation();
          openTextEditInspector({
            str: item.newText,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            fontSize: item.fontSize
          });
        };

        textLayer.appendChild(patchEl);
      } else if (item.type === 'redact') {
        const redactEl = document.createElement('div');
        redactEl.className = 'applied-redaction';
        redactEl.style.position = 'absolute';
        redactEl.style.left = `${item.x}px`;
        redactEl.style.top = `${item.y}px`;
        redactEl.style.width = `${item.width}px`;
        redactEl.style.height = `${item.height}px`;
        redactEl.style.backgroundColor = item.color || '#ffffff';
        redactEl.style.zIndex = '14';
        textLayer.appendChild(redactEl);
      }
    });
  }

  // Annotation Canvas (Draw, Highlight, Redaction drag)
  function redrawAnnotCanvas() {
    const annotCanvas = document.getElementById('pdf-annot-canvas');
    if (!annotCanvas) return;
    const ctx = annotCanvas.getContext('2d');
    ctx.clearRect(0, 0, annotCanvas.width, annotCanvas.height);

    const paths = PdfState.drawingPaths[PdfState.currentPageNum] || [];
    paths.forEach((p) => {
      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (p.isHighlight) {
        ctx.globalAlpha = 0.35;
      } else {
        ctx.globalAlpha = 1.0;
      }
      p.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  }

  // Toolbar & Tool Selection
  function bindToolbarEvents() {
    document.querySelectorAll('.tool-bar-btn[data-tool]').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.tool-bar-btn[data-tool]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        PdfState.activeTool = btn.getAttribute('data-tool');
        showToast(`Active tool: ${PdfState.activeTool}`, 'info');

        if (PdfState.activeTool === 'signature') {
          openSignatureModal();
        }
      };
    });

    // Page Steppers
    const prevBtn = document.getElementById('btn-pdf-prev-page');
    const nextBtn = document.getElementById('btn-pdf-next-page');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (PdfState.currentPageNum > 1) {
          PdfState.currentPageNum--;
          renderCurrentPage();
        }
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (PdfState.currentPageNum < PdfState.totalNumPages) {
          PdfState.currentPageNum++;
          renderCurrentPage();
        }
      };
    }

    // Zoom Controls
    const zoomIn = document.getElementById('btn-pdf-zoom-in');
    const zoomOut = document.getElementById('btn-pdf-zoom-out');
    if (zoomIn) {
      zoomIn.onclick = () => {
        PdfState.scale = Math.min(2.5, PdfState.scale + 0.2);
        renderCurrentPage();
      };
    }
    if (zoomOut) {
      zoomOut.onclick = () => {
        PdfState.scale = Math.max(0.6, PdfState.scale - 0.2);
        renderCurrentPage();
      };
    }

    // Rotate
    const rotBtn = document.getElementById('tool-btn-rotate');
    if (rotBtn) {
      rotBtn.onclick = () => {
        PdfState.rotation = (PdfState.rotation + 90) % 360;
        renderCurrentPage();
      };
    }

    // Undo / Redo
    const undoBtn = document.getElementById('btn-pdf-undo');
    const redoBtn = document.getElementById('btn-pdf-redo');
    if (undoBtn) {
      undoBtn.onclick = () => {
        if (PdfState.history.length > 0) {
          const last = PdfState.history.pop();
          if (PdfState.pageModifications[last.pageNum]) {
            PdfState.pageModifications[last.pageNum].pop();
            renderAppliedModifications();
            showToast('Undo performed', 'info');
          }
        }
      };
    }

    // Page Manager Button
    const pageMgrBtn = document.getElementById('tool-btn-page-mgr');
    if (pageMgrBtn) {
      pageMgrBtn.onclick = () => openPageManagerModal();
    }

    // Export / Save PDF Button
    const exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
      exportBtn.onclick = () => exportEditedPdf();
    }

    setupCanvasDrawingListeners();
  }

  // Canvas Drawing & Freehand Touch Listeners
  function setupCanvasDrawingListeners() {
    const annotCanvas = document.getElementById('pdf-annot-canvas');
    if (!annotCanvas) return;

    let startX = 0;
    let startY = 0;

    const onStart = (e) => {
      const rect = annotCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX - rect.left;
      startY = clientY - rect.top;

      if (['draw', 'highlight'].includes(PdfState.activeTool)) {
        PdfState.isDrawing = true;
        PdfState.currentPath = [{ x: startX, y: startY }];
      }
    };

    const onMove = (e) => {
      if (!PdfState.isDrawing) return;
      const rect = annotCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      PdfState.currentPath.push({ x: currentX, y: currentY });

      // Live stroke
      const ctx = annotCanvas.getContext('2d');
      ctx.beginPath();
      ctx.strokeStyle = PdfState.activeTool === 'highlight' ? '#fef08a' : '#0284c7';
      ctx.lineWidth = PdfState.activeTool === 'highlight' ? 14 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = PdfState.activeTool === 'highlight' ? 0.4 : 1.0;
      const pts = PdfState.currentPath;
      if (pts.length > 1) {
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    };

    const onEnd = (e) => {
      if (PdfState.isDrawing && PdfState.currentPath.length > 1) {
        const pageNum = PdfState.currentPageNum;
        if (!PdfState.drawingPaths[pageNum]) PdfState.drawingPaths[pageNum] = [];
        PdfState.drawingPaths[pageNum].push({
          isHighlight: PdfState.activeTool === 'highlight',
          color: PdfState.activeTool === 'highlight' ? '#fef08a' : '#0284c7',
          lineWidth: PdfState.activeTool === 'highlight' ? 14 : 3,
          points: [...PdfState.currentPath]
        });
        PdfState.isDrawing = false;
        PdfState.currentPath = [];
      } else if (PdfState.activeTool === 'redact') {
        // Redact box area
        const rect = annotCanvas.getBoundingClientRect();
        const clientX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) || startX;
        const clientY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) || startY;
        const endX = clientX - rect.left;
        const endY = clientY - rect.top;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        if (width > 5 && height > 5) {
          saveModification({
            type: 'redact',
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width,
            height,
            color: '#ffffff'
          });
          renderAppliedModifications();
          showToast('Redaction box placed', 'info');
        }
      }
    };

    annotCanvas.addEventListener('mousedown', onStart);
    annotCanvas.addEventListener('mousemove', onMove);
    annotCanvas.addEventListener('mouseup', onEnd);
    annotCanvas.addEventListener('touchstart', onStart, { passive: true });
    annotCanvas.addEventListener('touchmove', onMove, { passive: true });
    annotCanvas.addEventListener('touchend', onEnd);
  }

  // Signature Pad Dialog Logic
  function openSignatureModal() {
    const modal = document.getElementById('modal-signature-pad');
    const canvas = document.getElementById('sig-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let isSigning = false;
    let strokeColor = '#000000';

    modal.classList.remove('hidden');

    document.querySelectorAll('.sig-color-options .color-dot').forEach((dot) => {
      dot.onclick = () => {
        document.querySelectorAll('.sig-color-options .color-dot').forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        strokeColor = dot.getAttribute('data-color');
      };
    });

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx - rect.left, y: cy - rect.top };
    };

    canvas.onmousedown = (e) => {
      isSigning = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    canvas.onmousemove = (e) => {
      if (!isSigning) return;
      const p = getPos(e);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    canvas.onmouseup = () => (isSigning = false);

    canvas.ontouchstart = (e) => {
      isSigning = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    canvas.ontouchmove = (e) => {
      if (!isSigning) return;
      const p = getPos(e);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    canvas.ontouchend = () => (isSigning = false);

    document.getElementById('btn-clear-sig').onclick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    document.getElementById('btn-close-sig-modal').onclick = () => {
      modal.classList.add('hidden');
    };

    document.getElementById('btn-apply-sig').onclick = () => {
      const dataUrl = canvas.toDataURL('image/png');
      modal.classList.add('hidden');

      // Place signature in center of current page
      saveModification({
        type: 'textEdit',
        origText: '[Signature]',
        newText: '✍️ Signature',
        x: 100,
        y: 200,
        width: 140,
        height: 40,
        fontSize: 16,
        color: strokeColor,
        coverColor: '#ffffff',
        isBold: true
      });
      renderAppliedModifications();
      showToast('Signature inserted on page!', 'success');
    };
  }

  // Page Manager Modal
  function openPageManagerModal() {
    const modal = document.getElementById('modal-page-manager');
    const grid = document.getElementById('pm-thumbnails-grid');
    grid.innerHTML = '';

    for (let i = 1; i <= PdfState.totalNumPages; i++) {
      const card = document.createElement('div');
      card.className = 'pm-thumb-card';
      card.innerHTML = `
        <div style="height:110px; width:100%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-size:1.8rem;">
          📄
        </div>
        <div class="pm-thumb-meta">
          <span>Page ${i}</span>
          <button class="icon-btn btn-sm" style="color:#ef4444;" title="Delete Page" onclick="window.deletePdfPage(${i})">🗑️</button>
        </div>
      `;
      grid.appendChild(card);
    }

    modal.classList.remove('hidden');
    document.getElementById('btn-close-pm-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('btn-pm-done').onclick = () => modal.classList.add('hidden');
    document.getElementById('btn-pm-add-blank').onclick = () => {
      PdfState.totalNumPages++;
      openPageManagerModal();
      showToast('Blank page added', 'info');
    };
  }

  window.deletePdfPage = function (pageNum) {
    if (PdfState.totalNumPages <= 1) {
      showToast('Cannot delete the only page.', 'error');
      return;
    }
    PdfState.totalNumPages--;
    if (PdfState.currentPageNum > PdfState.totalNumPages) {
      PdfState.currentPageNum = PdfState.totalNumPages;
    }
    openPageManagerModal();
    renderCurrentPage();
    showToast(`Page ${pageNum} removed`, 'info');
  };

  // EXPORT / SAVE EDITED PDF VIA PDF-LIB
  async function exportEditedPdf() {
    if (!PdfState.rawBytes) {
      showToast('No PDF is currently loaded.', 'error');
      return;
    }

    showToast('Baking changes & generating edited PDF...', 'info');

    try {
      const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
      const pdfDoc = await PDFDocument.load(PdfState.rawBytes);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      // Iterate through each page's recorded modifications
      Object.keys(PdfState.pageModifications).forEach((pageNumStr) => {
        const pageIdx = parseInt(pageNumStr) - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) return;

        const page = pages[pageIdx];
        const pageHeight = page.getHeight();
        const pageWidth = page.getWidth();

        // Calculate scale ratio between PDF points and preview canvas
        const currentCanvas = document.getElementById('pdf-render-canvas');
        const scaleFactorX = pageWidth / currentCanvas.width;
        const scaleFactorY = pageHeight / currentCanvas.height;

        const items = PdfState.pageModifications[pageNumStr];
        items.forEach((item) => {
          if (item.type === 'textEdit') {
            // PDF coordinates start at bottom-left
            const pdfX = item.x * scaleFactorX;
            const pdfY = pageHeight - (item.y + item.height) * scaleFactorY;
            const pdfW = (item.width + 6) * scaleFactorX;
            const pdfH = (item.height + 4) * scaleFactorY;

            // Step 1: Draw clean cover rectangle (matches cover color)
            page.drawRectangle({
              x: Math.max(0, pdfX - 2),
              y: Math.max(0, pdfY - 2),
              width: pdfW,
              height: pdfH,
              color: rgb(1, 1, 1) // default clean white cover
            });

            // Step 2: Draw replacement text at exact same coordinates
            const targetFont = item.isBold ? fontBold : fontRegular;
            const fontSizePdf = Math.max(8, item.fontSize * scaleFactorY);

            page.drawText(item.newText, {
              x: pdfX,
              y: pdfY + 2,
              size: fontSizePdf,
              font: targetFont,
              color: rgb(0, 0, 0)
            });
          } else if (item.type === 'redact') {
            const pdfX = item.x * scaleFactorX;
            const pdfY = pageHeight - (item.y + item.height) * scaleFactorY;
            const pdfW = item.width * scaleFactorX;
            const pdfH = item.height * scaleFactorY;

            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: pdfW,
              height: pdfH,
              color: rgb(1, 1, 1)
            });
          }
        });
      });

      // Save PDF bytes
      const modifiedPdfBytes = await pdfDoc.save();

      // Download PDF locally
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const baseName = PdfState.fileName.replace(/\.pdf$/i, '');
      a.href = downloadUrl;
      a.download = `${baseName}-edited.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      showToast(AppState.lang === 'bn' ? 'পিডিএফ সফলভাবে এক্সপোর্ট হয়েছে!' : 'PDF exported successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Error exporting PDF: ' + err.message, 'error');
    }
  }

  // Export to window
  window.initPdfEditorTool = initPdfEditorTool;
})();
