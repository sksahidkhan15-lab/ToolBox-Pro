// ========================================================
// ToolBox Pro - Calculators, QR, Utility, Money Module
// QR Tools (Scanner, Generator, History)
// Calculators (Basic, GST, %, Age, Discount, EMI, BMI)
// Utility (Unit Converter, Password, Text Counter, RNG)
// Money (Expense Tracker)
// ========================================================

(function () {
  let activeMediaStream = null;

  function renderCalcOrUtilityTool(toolId, container) {
    switch (toolId) {
      // QR Tools
      case 'qr-scanner':
        renderQrScanner(container);
        break;
      case 'qr-generator':
        renderQrGenerator(container);
        break;
      case 'qr-history':
        renderQrHistory(container);
        break;

      // Calculators
      case 'calculator':
        renderCalculator(container);
        break;
      case 'gst-calculator':
        renderGstCalculator(container);
        break;
      case 'percentage-calculator':
        renderPercentageCalculator(container);
        break;
      case 'age-calculator':
        renderAgeCalculator(container);
        break;
      case 'discount-calculator':
        renderDiscountCalculator(container);
        break;
      case 'emi-calculator':
        renderEmiCalculator(container);
        break;
      case 'bmi-calculator':
        renderBmiCalculator(container);
        break;

      // Utilities
      case 'unit-converter':
        renderUnitConverter(container);
        break;
      case 'password-generator':
        renderPasswordGenerator(container);
        break;
      case 'text-counter':
        renderTextCounter(container);
        break;
      case 'random-number':
        renderRandomNumber(container);
        break;

      // Money
      case 'expense-tracker':
        renderExpenseTracker(container);
        break;
    }
  }

  // 10. QR SCANNER
  function renderQrScanner(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="qr-scanner-box">
          <video id="qr-video-stream" playsinline autoplay muted></video>
          <div class="qr-scan-target-frame">
            <div class="qr-laser-line"></div>
          </div>
        </div>

        <div style="display:flex; gap:8px; justify-content:center;">
          <button class="btn btn-primary btn-sm" id="btn-start-camera">Start Camera</button>
          <button class="btn btn-secondary btn-sm" id="btn-stop-camera">Stop Camera</button>
          <button class="btn btn-ghost btn-sm" id="btn-scan-image-file">Scan from Photo</button>
          <input type="file" id="qr-image-input" accept="image/*" class="hidden">
        </div>

        <div id="qr-result-box" class="form-card hidden">
          <label class="form-label">Detected QR Code Result:</label>
          <div id="qr-result-text" class="text-preview-box"></div>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="btn btn-primary btn-sm" id="btn-copy-qr">Copy</button>
            <button class="btn btn-secondary btn-sm hidden" id="btn-open-qr-url">Open Link</button>
            <button class="btn btn-ghost btn-sm" id="btn-share-qr">Share</button>
          </div>
        </div>
      </div>
    `;

    const video = document.getElementById('qr-video-stream');
    const startBtn = document.getElementById('btn-start-camera');
    const stopBtn = document.getElementById('btn-stop-camera');
    const imgScanBtn = document.getElementById('btn-scan-image-file');
    const imgInput = document.getElementById('qr-image-input');
    const resultBox = document.getElementById('qr-result-box');
    const resultText = document.getElementById('qr-result-text');
    const copyBtn = document.getElementById('btn-copy-qr');
    const openUrlBtn = document.getElementById('btn-open-qr-url');
    const shareBtn = document.getElementById('btn-share-qr');

    let isScanning = false;

    startBtn.onclick = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        activeMediaStream = stream;
        video.srcObject = stream;
        isScanning = true;
        requestAnimationFrame(tickScan);
        showToast('Camera active', 'info');
      } catch (err) {
        showToast('Camera access denied or unavailable: ' + err.message, 'error');
      }
    };

    stopBtn.onclick = () => stopQrCamera();

    function stopQrCamera() {
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((t) => t.stop());
        activeMediaStream = null;
      }
      isScanning = false;
    }
    window.stopQrCamera = stopQrCamera;

    function tickScan() {
      if (!isScanning || !video) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA && window.jsQR) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleDetectedQr(code.data);
          stopQrCamera();
          return;
        }
      }
      requestAnimationFrame(tickScan);
    }

    imgScanBtn.onclick = () => imgInput.click();
    imgInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = window.jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleDetectedQr(code.data);
          } else {
            showToast('No QR code detected in this photo.', 'error');
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    function handleDetectedQr(data) {
      resultBox.classList.remove('hidden');
      resultText.textContent = data;
      saveQrToHistory('scan', data);

      if (data.startsWith('http://') || data.startsWith('https://')) {
        openUrlBtn.classList.remove('hidden');
        openUrlBtn.onclick = () => window.open(data, '_blank');
      } else {
        openUrlBtn.classList.add('hidden');
      }

      copyBtn.onclick = () => {
        navigator.clipboard.writeText(data);
        showToast('Copied to clipboard!', 'success');
      };

      shareBtn.onclick = () => {
        if (navigator.share) {
          navigator.share({ title: 'Scanned QR Code', text: data });
        } else {
          showToast('Copied text: ' + data, 'info');
        }
      };

      showToast('QR Code Scanned!', 'success');
    }
  }

  // 11. QR GENERATOR
  function renderQrGenerator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">QR Type</label>
            <select id="qr-type-select" class="form-select">
              <option value="text">Text</option>
              <option value="url">Website URL</option>
              <option value="wifi">Wi-Fi Network</option>
              <option value="phone">Phone Number</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div id="qr-input-fields">
            <div class="form-group" id="group-text">
              <label class="form-label">Content</label>
              <textarea id="qr-content-text" class="form-textarea" rows="3" placeholder="Enter text or URL here...">https://toolboxpro.app</textarea>
            </div>
          </div>

          <button class="btn btn-primary btn-block" id="btn-generate-qr">
            Generate QR Code
          </button>
        </div>

        <div id="qr-output-card" class="form-card" style="text-align:center;">
          <div style="display:flex; justify-content:center; padding:10px;">
            <canvas id="qr-output-canvas" style="border-radius:10px; box-shadow:var(--shadow-sm);"></canvas>
          </div>
          <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
            <button class="btn btn-primary btn-sm" id="btn-download-qr-png">Download PNG</button>
            <button class="btn btn-secondary btn-sm" id="btn-copy-qr-text">Copy Content</button>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById('qr-output-canvas');
    const genBtn = document.getElementById('btn-generate-qr');
    const textInput = document.getElementById('qr-content-text');

    function makeQR() {
      const val = textInput.value.trim() || 'ToolBox Pro';
      if (window.QRCode && window.QRCode.toCanvas) {
        try {
          window.QRCode.toCanvas(canvas, val, { width: 220, margin: 2 }, (err) => {
            if (err) drawQrFallback(canvas, val);
          });
        } catch (e) {
          drawQrFallback(canvas, val);
        }
      } else {
        drawQrFallback(canvas, val);
      }
      saveQrToHistory('generate', val);
    }

    function drawQrFallback(cvs, txt) {
      cvs.width = 220;
      cvs.height = 220;
      const ctx = cvs.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 220, 220);
      ctx.fillStyle = '#0f172a';
      const size = 21;
      const cellSize = Math.floor(200 / size);
      const offset = 10;

      // Draw standard finder patterns
      function drawFinder(fx, fy) {
        ctx.fillRect(offset + fx * cellSize, offset + fy * cellSize, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offset + (fx + 1) * cellSize, offset + (fy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(offset + (fx + 2) * cellSize, offset + (fy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      }
      drawFinder(0, 0);
      drawFinder(14, 0);
      drawFinder(0, 14);

      // Deterministic data dots based on string
      let hash = 0;
      for (let i = 0; i < txt.length; i++) hash = ((hash << 5) - hash) + txt.charCodeAt(i);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
          if (((hash ^ (r * 13 + c * 37)) & 1) === 1) {
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    genBtn.onclick = makeQR;
    makeQR();

    document.getElementById('btn-download-qr-png').onclick = () => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.png';
        a.click();
        URL.revokeObjectURL(url);
        showToast('QR code saved!', 'success');
      });
    };

    document.getElementById('btn-copy-qr-text').onclick = () => {
      navigator.clipboard.writeText(textInput.value);
      showToast('Copied content!', 'success');
    };
  }

  // 12. QR HISTORY
  function renderQrHistory(container) {
    const list = JSON.parse(localStorage.getItem('tb_qr_history') || '[]');
    container.innerHTML = `
      <div class="tool-pane">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="field-hint">Stored locally on your device</span>
          <button class="btn btn-ghost btn-sm" id="btn-clear-qr-hist">Clear History</button>
        </div>

        <div id="qr-hist-container" style="display:flex; flex-direction:column; gap:8px;"></div>
      </div>
    `;

    const histContainer = document.getElementById('qr-hist-container');
    if (list.length === 0) {
      histContainer.innerHTML = `<div class="stat-summary-card" style="text-align:center;">No QR history recorded yet.</div>`;
    } else {
      list.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'expense-item';
        card.innerHTML = `
          <div class="expense-item-left">
            <span class="expense-cat-icon">${item.type === 'scan' ? '📷' : '📱'}</span>
            <div>
              <div class="expense-title" style="word-break:break-all;">${item.content}</div>
              <div class="expense-date">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
          </div>
          <button class="icon-btn btn-sm" style="color:#ef4444;" onclick="window.deleteQrHistItem(${index})">🗑️</button>
        `;
        histContainer.appendChild(card);
      });
    }

    document.getElementById('btn-clear-qr-hist').onclick = () => {
      localStorage.removeItem('tb_qr_history');
      renderQrHistory(container);
      showToast('QR History cleared', 'info');
    };

    window.deleteQrHistItem = (idx) => {
      const cur = JSON.parse(localStorage.getItem('tb_qr_history') || '[]');
      cur.splice(idx, 1);
      localStorage.setItem('tb_qr_history', JSON.stringify(cur));
      renderQrHistory(container);
    };
  }

  function saveQrToHistory(type, content) {
    const cur = JSON.parse(localStorage.getItem('tb_qr_history') || '[]');
    cur.unshift({ type, content, timestamp: Date.now() });
    if (cur.length > 50) cur.pop();
    localStorage.setItem('tb_qr_history', JSON.stringify(cur));
  }

  // 13. CALCULATOR
  function renderCalculator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="calc-wrapper">
          <div class="calc-screen">
            <div class="calc-expression" id="calc-expr"></div>
            <div class="calc-result" id="calc-disp">0</div>
          </div>
          <div class="calc-grid">
            <button class="calc-btn action-btn" data-k="C">C</button>
            <button class="calc-btn op-btn" data-k="(">(</button>
            <button class="calc-btn op-btn" data-k=")">)</button>
            <button class="calc-btn op-btn" data-k="/">÷</button>

            <button class="calc-btn" data-k="7">7</button>
            <button class="calc-btn" data-k="8">8</button>
            <button class="calc-btn" data-k="9">9</button>
            <button class="calc-btn op-btn" data-k="*">×</button>

            <button class="calc-btn" data-k="4">4</button>
            <button class="calc-btn" data-k="5">5</button>
            <button class="calc-btn" data-k="6">6</button>
            <button class="calc-btn op-btn" data-k="-">−</button>

            <button class="calc-btn" data-k="1">1</button>
            <button class="calc-btn" data-k="2">2</button>
            <button class="calc-btn" data-k="3">3</button>
            <button class="calc-btn op-btn" data-k="+">+</button>

            <button class="calc-btn" data-k="0">0</button>
            <button class="calc-btn" data-k=".">.</button>
            <button class="calc-btn equal-btn" data-k="=">=</button>
          </div>
        </div>
      </div>
    `;

    let expr = '';
    const exprEl = document.getElementById('calc-expr');
    const dispEl = document.getElementById('calc-disp');

    container.querySelectorAll('.calc-btn').forEach((btn) => {
      btn.onclick = () => {
        const k = btn.getAttribute('data-k');
        if (k === 'C') {
          expr = '';
          dispEl.textContent = '0';
          exprEl.textContent = '';
        } else if (k === '=') {
          try {
            const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
            const res = Function(`'use strict'; return (${sanitized})`)();
            exprEl.textContent = expr + ' =';
            dispEl.textContent = res;
            expr = String(res);
          } catch (e) {
            dispEl.textContent = 'Error';
          }
        } else {
          if (expr === '0' && !isNaN(k)) expr = '';
          expr += k;
          dispEl.textContent = expr;
        }
      };
    });
  }

  // 14. GST CALCULATOR
  function renderGstCalculator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">Initial Amount (₹ / $)</label>
            <input type="number" id="gst-amount" class="form-input" value="1000" min="0">
          </div>

          <div class="form-group">
            <label class="form-label">GST Rate</label>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="btn btn-ghost btn-sm" data-rate="5">5%</button>
              <button class="btn btn-ghost btn-sm" data-rate="12">12%</button>
              <button class="btn btn-ghost btn-sm active" data-rate="18">18%</button>
              <button class="btn btn-ghost btn-sm" data-rate="28">28%</button>
            </div>
            <input type="number" id="gst-custom-rate" class="form-input" value="18" min="0" style="margin-top:6px;">
          </div>

          <div class="segmented-control">
            <button class="segment-btn active" id="gst-mode-add">Add GST (+)</button>
            <button class="segment-btn" id="gst-mode-remove">Remove GST (-)</button>
          </div>
        </div>

        <div class="stat-summary-card">
          <div class="stat-row">
            <span>Base / Net Amount:</span>
            <strong id="gst-res-base">₹ 1,000.00</strong>
          </div>
          <div class="stat-row">
            <span>Total GST Tax:</span>
            <strong id="gst-res-tax" style="color:#ea580c;">₹ 180.00</strong>
          </div>
          <div class="stat-row">
            <span>CGST / SGST (50% each):</span>
            <span id="gst-res-split">₹ 90.00 / ₹ 90.00</span>
          </div>
          <hr style="border:none; border-top:1px solid #cbd5e1; margin:6px 0;">
          <div class="stat-row">
            <span>Final Total:</span>
            <strong id="gst-res-final" class="stat-val-big">₹ 1,180.00</strong>
          </div>
        </div>
      </div>
    `;

    let mode = 'add';
    const amountInp = document.getElementById('gst-amount');
    const rateInp = document.getElementById('gst-custom-rate');
    const addBtn = document.getElementById('gst-mode-add');
    const remBtn = document.getElementById('gst-mode-remove');

    function calcGst() {
      const amt = parseFloat(amountInp.value) || 0;
      const rate = parseFloat(rateInp.value) || 0;

      let base = amt;
      let tax = 0;
      let final = amt;

      if (mode === 'add') {
        tax = (amt * rate) / 100;
        final = amt + tax;
        base = amt;
      } else {
        base = (amt * 100) / (100 + rate);
        tax = amt - base;
        final = amt;
      }

      document.getElementById('gst-res-base').textContent = `₹ ${base.toFixed(2)}`;
      document.getElementById('gst-res-tax').textContent = `₹ ${tax.toFixed(2)}`;
      document.getElementById('gst-res-split').textContent = `₹ ${(tax / 2).toFixed(2)} / ₹ ${(tax / 2).toFixed(2)}`;
      document.getElementById('gst-res-final').textContent = `₹ ${final.toFixed(2)}`;
    }

    amountInp.oninput = calcGst;
    rateInp.oninput = calcGst;

    container.querySelectorAll('[data-rate]').forEach((b) => {
      b.onclick = () => {
        rateInp.value = b.getAttribute('data-rate');
        calcGst();
      };
    });

    addBtn.onclick = () => {
      mode = 'add';
      addBtn.classList.add('active');
      remBtn.classList.remove('active');
      calcGst();
    };

    remBtn.onclick = () => {
      mode = 'remove';
      remBtn.classList.add('active');
      addBtn.classList.remove('active');
      calcGst();
    };

    calcGst();
  }

  // 15. PERCENTAGE CALCULATOR
  function renderPercentageCalculator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-row">
            <div class="form-col">
              <label class="form-label">What is (%)</label>
              <input type="number" id="pct-p" class="form-input" value="15">
            </div>
            <div class="form-col">
              <label class="form-label">of (Number)</label>
              <input type="number" id="pct-total" class="form-input" value="250">
            </div>
          </div>
          <div class="stat-summary-card">
            <span>Result:</span>
            <strong id="pct-res-1" class="stat-val-big">37.5</strong>
          </div>
        </div>

        <div class="form-card" style="margin-top:12px;">
          <label class="form-label">Percentage Increase / Decrease</label>
          <div class="form-row">
            <div class="form-col">
              <label class="form-label">From</label>
              <input type="number" id="pct-from" class="form-input" value="100">
            </div>
            <div class="form-col">
              <label class="form-label">To</label>
              <input type="number" id="pct-to" class="form-input" value="125">
            </div>
          </div>
          <div class="stat-summary-card">
            <span>Change:</span>
            <strong id="pct-res-2" class="stat-val-big">+25.00%</strong>
          </div>
        </div>
      </div>
    `;

    const pIn = document.getElementById('pct-p');
    const totIn = document.getElementById('pct-total');
    const fIn = document.getElementById('pct-from');
    const tIn = document.getElementById('pct-to');

    function calcPcts() {
      const p = parseFloat(pIn.value) || 0;
      const tot = parseFloat(totIn.value) || 0;
      document.getElementById('pct-res-1').textContent = ((p / 100) * tot).toFixed(2);

      const f = parseFloat(fIn.value) || 0;
      const t = parseFloat(tIn.value) || 0;
      if (f !== 0) {
        const change = ((t - f) / f) * 100;
        const sign = change >= 0 ? '+' : '';
        document.getElementById('pct-res-2').textContent = `${sign}${change.toFixed(2)}%`;
      }
    }

    [pIn, totIn, fIn, tIn].forEach((el) => (el.oninput = calcPcts));
    calcPcts();
  }

  // 16. AGE CALCULATOR
  function renderAgeCalculator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">Date of Birth</label>
            <input type="date" id="age-dob-input" class="form-input" value="2000-01-01">
          </div>
        </div>

        <div class="stat-summary-card">
          <div class="stat-row">
            <span>Exact Age:</span>
            <strong id="age-years-val" class="stat-val-big">26 Years</strong>
          </div>
          <div class="stat-row">
            <span>Months & Days:</span>
            <strong id="age-md-val">9 Months, 6 Days</strong>
          </div>
          <div class="stat-row">
            <span>Next Birthday In:</span>
            <strong id="age-next-bday" style="color:#0284c7;">85 Days</strong>
          </div>
        </div>
      </div>
    `;

    const dobInput = document.getElementById('age-dob-input');
    function calcAge() {
      const dob = new Date(dobInput.value);
      const now = new Date();
      if (isNaN(dob.getTime())) return;

      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      let days = now.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      document.getElementById('age-years-val').textContent = `${years} Years`;
      document.getElementById('age-md-val').textContent = `${months} Months, ${days} Days`;

      const nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
      const diffDays = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
      document.getElementById('age-next-bday').textContent = `${diffDays} Days`;
    }

    dobInput.onchange = calcAge;
    calcAge();
  }

  // 17. DISCOUNT CALCULATOR
  function renderDiscountCalculator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">Original Price</label>
            <input type="number" id="disc-orig" class="form-input" value="1200" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Discount Percentage (%)</label>
            <input type="number" id="disc-pct" class="form-input" value="25" min="0" max="100">
          </div>
        </div>

        <div class="stat-summary-card">
          <div class="stat-row">
            <span>You Save:</span>
            <strong id="disc-save" style="color:#16a34a; font-size:1.3rem;">₹ 300.00</strong>
          </div>
          <div class="stat-row">
            <span>Final Price:</span>
            <strong id="disc-final" class="stat-val-big">₹ 900.00</strong>
          </div>
        </div>
      </div>
    `;

    const origIn = document.getElementById('disc-orig');
    const pctIn = document.getElementById('disc-pct');

    function calcDisc() {
      const orig = parseFloat(origIn.value) || 0;
      const pct = parseFloat(pctIn.value) || 0;
      const savings = (orig * pct) / 100;
      const finalP = orig - savings;

      document.getElementById('disc-save').textContent = `₹ ${savings.toFixed(2)}`;
      document.getElementById('disc-final').textContent = `₹ ${finalP.toFixed(2)}`;
    }

    origIn.oninput = calcDisc;
    pctIn.oninput = calcDisc;
    calcDisc();
  }

  // 18. EMI CALCULATOR
  function renderEmiCalculator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">Loan Amount</label>
            <input type="number" id="emi-principal" class="form-input" value="500000">
          </div>
          <div class="form-row">
            <div class="form-col">
              <label class="form-label">Interest Rate (% p.a.)</label>
              <input type="number" id="emi-rate" class="form-input" value="8.5" step="0.1">
            </div>
            <div class="form-col">
              <label class="form-label">Tenure (Months)</label>
              <input type="number" id="emi-tenure" class="form-input" value="36">
            </div>
          </div>
        </div>

        <div class="stat-summary-card">
          <div class="stat-row">
            <span>Monthly EMI:</span>
            <strong id="emi-res-monthly" class="stat-val-big" style="color:#0284c7;">₹ 15,780</strong>
          </div>
          <div class="stat-row">
            <span>Total Interest:</span>
            <strong id="emi-res-interest" style="color:#ea580c;">₹ 68,080</strong>
          </div>
          <div class="stat-row">
            <span>Total Payment:</span>
            <strong id="emi-res-total">₹ 568,080</strong>
          </div>
        </div>
      </div>
    `;

    const pIn = document.getElementById('emi-principal');
    const rIn = document.getElementById('emi-rate');
    const tIn = document.getElementById('emi-tenure');

    function calcEmi() {
      const p = parseFloat(pIn.value) || 0;
      const r = (parseFloat(rIn.value) || 0) / (12 * 100);
      const n = parseFloat(tIn.value) || 0;

      if (p <= 0 || r <= 0 || n <= 0) return;

      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      const interest = total - p;

      document.getElementById('emi-res-monthly').textContent = `₹ ${Math.round(emi).toLocaleString()}`;
      document.getElementById('emi-res-interest').textContent = `₹ ${Math.round(interest).toLocaleString()}`;
      document.getElementById('emi-res-total').textContent = `₹ ${Math.round(total).toLocaleString()}`;
    }

    pIn.oninput = calcEmi;
    rIn.oninput = calcEmi;
    tIn.oninput = calcEmi;
    calcEmi();
  }

  // 19. BMI CALCULATOR
  function renderBmiCalculator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-row">
            <div class="form-col">
              <label class="form-label">Height (cm)</label>
              <input type="number" id="bmi-h" class="form-input" value="172">
            </div>
            <div class="form-col">
              <label class="form-label">Weight (kg)</label>
              <input type="number" id="bmi-w" class="form-input" value="68">
            </div>
          </div>
        </div>

        <div class="stat-summary-card" style="text-align:center;">
          <span class="field-hint">Your BMI Score</span>
          <strong id="bmi-score" class="stat-val-big">23.0</strong>
          <span id="bmi-category" style="font-weight:700; color:#16a34a;">Normal Weight</span>

          <div class="bmi-gauge-wrap">
            <div class="bmi-bar">
              <div class="bmi-indicator-pin" id="bmi-pin" style="left:40%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const hIn = document.getElementById('bmi-h');
    const wIn = document.getElementById('bmi-w');

    function calcBmi() {
      const h = (parseFloat(hIn.value) || 0) / 100;
      const w = parseFloat(wIn.value) || 0;
      if (h <= 0 || w <= 0) return;

      const bmi = w / (h * h);
      document.getElementById('bmi-score').textContent = bmi.toFixed(1);

      let cat = 'Normal Weight';
      let color = '#16a34a';
      let pos = 45;

      if (bmi < 18.5) {
        cat = 'Underweight';
        color = '#38bdf8';
        pos = 15;
      } else if (bmi < 25) {
        cat = 'Normal Weight';
        color = '#16a34a';
        pos = 45;
      } else if (bmi < 30) {
        cat = 'Overweight';
        color = '#eab308';
        pos = 75;
      } else {
        cat = 'Obese';
        color = '#ef4444';
        pos = 92;
      }

      const catEl = document.getElementById('bmi-category');
      catEl.textContent = cat;
      catEl.style.color = color;
      document.getElementById('bmi-pin').style.left = `${pos}%`;
    }

    hIn.oninput = calcBmi;
    wIn.oninput = calcBmi;
    calcBmi();
  }

  // 20. UNIT CONVERTER
  function renderUnitConverter(container) {
    const unitsData = {
      length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Inch: 0.0254,
        Foot: 0.3048,
        Mile: 1609.34
      },
      weight: {
        Kilogram: 1,
        Gram: 0.001,
        Pound: 0.453592,
        Ounce: 0.0283495
      },
      speed: {
        'km/h': 1,
        'm/s': 3.6,
        'mph': 1.60934
      }
    };

    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="unit-cat-select" class="form-select">
              <option value="length">Length</option>
              <option value="weight">Weight</option>
              <option value="speed">Speed</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-col">
              <label class="form-label">From</label>
              <select id="unit-from-select" class="form-select"></select>
              <input type="number" id="unit-from-val" class="form-input" value="1" style="margin-top:6px;">
            </div>
            <div class="form-col">
              <label class="form-label">To</label>
              <select id="unit-to-select" class="form-select"></select>
              <input type="number" id="unit-to-val" class="form-input" value="0" readonly style="margin-top:6px;">
            </div>
          </div>
        </div>
      </div>
    `;

    const catSel = document.getElementById('unit-cat-select');
    const fromSel = document.getElementById('unit-from-select');
    const toSel = document.getElementById('unit-to-select');
    const fromVal = document.getElementById('unit-from-val');
    const toVal = document.getElementById('unit-to-val');

    function populateUnits() {
      const cat = catSel.value;
      const keys = Object.keys(unitsData[cat]);
      fromSel.innerHTML = '';
      toSel.innerHTML = '';
      keys.forEach((k) => {
        fromSel.add(new Option(k, k));
        toSel.add(new Option(k, k));
      });
      if (keys.length > 1) toSel.selectedIndex = 1;
      calcUnits();
    }

    function calcUnits() {
      const cat = catSel.value;
      const fRate = unitsData[cat][fromSel.value];
      const tRate = unitsData[cat][toSel.value];
      const val = parseFloat(fromVal.value) || 0;
      const inBase = val * fRate;
      toVal.value = (inBase / tRate).toFixed(4);
    }

    catSel.onchange = populateUnits;
    fromSel.onchange = calcUnits;
    toSel.onchange = calcUnits;
    fromVal.oninput = calcUnits;
    populateUnits();
  }

  // 21. PASSWORD GENERATOR
  function renderPasswordGenerator(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="stat-summary-card" style="text-align:center;">
            <div id="pwd-display" style="font-family:monospace; font-size:1.3rem; font-weight:700; word-break:break-all;">-</div>
            <span id="pwd-strength" style="font-size:0.78rem; font-weight:700; color:#16a34a; margin-top:4px;">Strong</span>
          </div>

          <div class="form-group" style="margin-top:10px;">
            <label class="form-label">Length: <span id="pwd-len-text">16</span></label>
            <input type="range" id="pwd-len-slider" min="6" max="48" value="16" style="width:100%;">
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <label><input type="checkbox" id="pwd-inc-upper" checked> Uppercase (A-Z)</label>
            <label><input type="checkbox" id="pwd-inc-lower" checked> Lowercase (a-z)</label>
            <label><input type="checkbox" id="pwd-inc-num" checked> Numbers (0-9)</label>
            <label><input type="checkbox" id="pwd-inc-sym" checked> Symbols (!@#$%^&*)</label>
          </div>

          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="btn btn-primary btn-block" id="btn-gen-pwd">Regenerate</button>
            <button class="btn btn-secondary" id="btn-copy-pwd">Copy</button>
          </div>
        </div>
      </div>
    `;

    const lenSlider = document.getElementById('pwd-len-slider');
    const lenText = document.getElementById('pwd-len-text');

    function generatePwd() {
      const len = parseInt(lenSlider.value);
      lenText.textContent = len;
      let chars = '';
      if (document.getElementById('pwd-inc-upper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (document.getElementById('pwd-inc-lower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (document.getElementById('pwd-inc-num').checked) chars += '0123456789';
      if (document.getElementById('pwd-inc-sym').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

      let out = '';
      for (let i = 0; i < len; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      document.getElementById('pwd-display').textContent = out;
    }

    lenSlider.oninput = generatePwd;
    document.querySelectorAll('#pwd-inc-upper, #pwd-inc-lower, #pwd-inc-num, #pwd-inc-sym').forEach((cb) => {
      cb.onchange = generatePwd;
    });

    document.getElementById('btn-gen-pwd').onclick = generatePwd;
    document.getElementById('btn-copy-pwd').onclick = () => {
      navigator.clipboard.writeText(document.getElementById('pwd-display').textContent);
      showToast('Password copied!', 'success');
    };

    generatePwd();
  }

  // 22. TEXT COUNTER
  function renderTextCounter(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <textarea id="tc-input" class="form-textarea" rows="6" placeholder="Type or paste your text here..."></textarea>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
          <div class="stat-summary-card" style="text-align:center;">
            <span>Words</span>
            <strong id="tc-words" class="stat-val-big">0</strong>
          </div>
          <div class="stat-summary-card" style="text-align:center;">
            <span>Characters</span>
            <strong id="tc-chars" class="stat-val-big">0</strong>
          </div>
          <div class="stat-summary-card" style="text-align:center;">
            <span>Sentences</span>
            <strong id="tc-sentences" class="stat-val-big">0</strong>
          </div>
          <div class="stat-summary-card" style="text-align:center;">
            <span>Reading Time</span>
            <strong id="tc-read-time" class="stat-val-big">0m</strong>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById('tc-input');
    input.oninput = () => {
      const text = input.value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
      const readMin = Math.ceil(words / 200);

      document.getElementById('tc-chars').textContent = chars;
      document.getElementById('tc-words').textContent = words;
      document.getElementById('tc-sentences').textContent = sentences;
      document.getElementById('tc-read-time').textContent = `${readMin}m`;
    };
  }

  // 23. RANDOM NUMBER GENERATOR
  function renderRandomNumber(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-row">
            <div class="form-col">
              <label class="form-label">Minimum</label>
              <input type="number" id="rng-min" class="form-input" value="1">
            </div>
            <div class="form-col">
              <label class="form-label">Maximum</label>
              <input type="number" id="rng-max" class="form-input" value="100">
            </div>
          </div>
          <button class="btn btn-primary btn-block" id="btn-roll-rng" style="margin-top:10px;">
            Roll Random Number 🎲
          </button>
        </div>

        <div class="stat-summary-card" style="text-align:center; padding:30px;">
          <strong id="rng-res" style="font-size:3.5rem; color:#0284c7;">42</strong>
        </div>
      </div>
    `;

    document.getElementById('btn-roll-rng').onclick = () => {
      const min = parseInt(document.getElementById('rng-min').value) || 0;
      const max = parseInt(document.getElementById('rng-max').value) || 100;
      const res = Math.floor(Math.random() * (max - min + 1)) + min;
      document.getElementById('rng-res').textContent = res;
    };
  }

  // 24. EXPENSE TRACKER
  function renderExpenseTracker(container) {
    container.innerHTML = `
      <div class="tool-pane">
        <div class="form-card">
          <div class="form-row">
            <div class="form-col">
              <label class="form-label">Amount (₹ / $)</label>
              <input type="number" id="exp-amount" class="form-input" placeholder="e.g. 250">
            </div>
            <div class="form-col">
              <label class="form-label">Category</label>
              <select id="exp-category" class="form-select">
                <option value="Food">🍔 Food</option>
                <option value="Travel">🚗 Travel</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills">💡 Bills</option>
                <option value="Health">💊 Health</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Note / Description</label>
            <input type="text" id="exp-note" class="form-input" placeholder="Lunch with team">
          </div>
          <button class="btn btn-primary btn-block" id="btn-add-expense">Add Expense</button>
        </div>

        <div class="stat-summary-card">
          <div class="stat-row">
            <span>Total Recorded Spent:</span>
            <strong id="exp-total-val" class="stat-val-big" style="color:#dc2626;">₹ 0.00</strong>
          </div>
        </div>

        <div id="exp-list" style="display:flex; flex-direction:column; gap:8px;"></div>
      </div>
    `;

    function loadExpenses() {
      const expenses = JSON.parse(localStorage.getItem('tb_expenses') || '[]');
      const listEl = document.getElementById('exp-list');
      listEl.innerHTML = '';
      let total = 0;

      expenses.forEach((item, idx) => {
        total += item.amount;
        const row = document.createElement('div');
        row.className = 'expense-item';
        row.innerHTML = `
          <div class="expense-item-left">
            <span class="expense-cat-icon">💳</span>
            <div>
              <div class="expense-title">${item.category}: ${item.note || 'Expense'}</div>
              <div class="expense-date">${new Date(item.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="expense-amount">-₹${item.amount.toFixed(2)}</span>
            <button class="icon-btn btn-sm" style="color:#ef4444;" onclick="window.deleteExpense(${idx})">🗑️</button>
          </div>
        `;
        listEl.appendChild(row);
      });

      document.getElementById('exp-total-val').textContent = `₹ ${total.toFixed(2)}`;
    }

    document.getElementById('btn-add-expense').onclick = () => {
      const amt = parseFloat(document.getElementById('exp-amount').value);
      if (!amt || amt <= 0) {
        showToast('Please enter an amount', 'error');
        return;
      }
      const cat = document.getElementById('exp-category').value;
      const note = document.getElementById('exp-note').value;

      const expenses = JSON.parse(localStorage.getItem('tb_expenses') || '[]');
      expenses.unshift({ amount: amt, category: cat, note, date: Date.now() });
      localStorage.setItem('tb_expenses', JSON.stringify(expenses));

      document.getElementById('exp-amount').value = '';
      document.getElementById('exp-note').value = '';
      loadExpenses();
      showToast('Expense added!', 'success');
    };

    window.deleteExpense = (idx) => {
      const expenses = JSON.parse(localStorage.getItem('tb_expenses') || '[]');
      expenses.splice(idx, 1);
      localStorage.setItem('tb_expenses', JSON.stringify(expenses));
      loadExpenses();
    };

    loadExpenses();
  }

  window.renderCalcOrUtilityTool = renderCalcOrUtilityTool;
})();
