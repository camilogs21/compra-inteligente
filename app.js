// ============================
// Estado da aplicação
// ============================
let lista = [];
let codeReader = null;
let scanActive = false;

// ============================
// Utilitários
// ============================
function fmt(n) {
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}

function setStatus(msg, type) {
  const el = document.getElementById('scan-status');
  el.className = 'scan-status ' + type;
  el.textContent = msg;
}

// ============================
// Adicionar item
// ============================
function addItem() {
  const prod  = document.getElementById('inp-produto').value.trim();
  const merc  = document.getElementById('inp-mercado').value.trim();
  const preco = parseFloat(document.getElementById('inp-preco').value);
  const qtd   = parseFloat(document.getElementById('inp-qtd').value);

  const ids = ['inp-produto', 'inp-mercado', 'inp-preco', 'inp-qtd'];
  const ok  = [prod, merc, !isNaN(preco) && preco > 0, !isNaN(qtd) && qtd > 0];

  ids.forEach((id, i) => {
    document.getElementById(id).classList.toggle('error', !ok[i]);
  });

  if (!prod || !merc || !ok[2] || !ok[3]) return;

  ids.forEach(id => {
    document.getElementById(id).classList.remove('error');
    document.getElementById(id).value = '';
  });

  lista.push({ prod, merc, preco, qtd, unit: preco / qtd });
  render();
}

// Permite adicionar com Enter
document.addEventListener('DOMContentLoaded', () => {
  ['inp-produto', 'inp-mercado', 'inp-preco', 'inp-qtd'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') addItem();
    });
  });
});

// ============================
// Renderização principal
// ============================
function render() {
  const products = [...new Set(lista.map(i => i.prod))];
  const cc = document.getElementById('compare-content');
  const es = document.getElementById('empty-state');

  if (!products.length) {
    es.style.display = 'block';
    cc.innerHTML = '';
    document.getElementById('savings-section').classList.add('hidden');
    document.getElementById('final-card').classList.add('hidden');
    return;
  }

  es.style.display = 'none';

  let economia = 0;
  let html = '';

  products.forEach(prod => {
    const items = lista.filter(i => i.prod === prod);
    const minUnit = Math.min(...items.map(i => i.unit));
    const hasMultiple = items.length > 1;

    const sorted = [...items].sort((a, b) => a.unit - b.unit);

    html += `<div class="product-group">`;
    html += `<div class="group-header">
      ${prod}
      ${hasMultiple ? `<span class="group-tag">${items.length} mercados</span>` : ''}
    </div>`;

    sorted.forEach(item => {
      const isBest = Math.abs(item.unit - minUnit) < 0.001;
      if (!isBest) economia += (item.unit - minUnit) * item.qtd;

      const diff = fmt((item.unit - minUnit) * item.qtd);

      html += `
        <div class="compare-row ${isBest ? 'best' : 'worst'}">
          <div class="row-left">
            <span class="row-mercado">${item.merc}</span>
            <span class="row-detail">Qtd: ${item.qtd} &nbsp;·&nbsp; R$/un: ${item.unit.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="row-right">
            <span class="row-preco ${isBest ? 'best-price' : ''}">${fmt(item.preco)}</span>
            ${isBest
              ? `<span class="badge-best">Menor preço</span>`
              : `<span class="badge-worst">+${diff}</span>`
            }
          </div>
        </div>`;
    });

    html += `</div>`;
  });

  cc.innerHTML = html;

  const savingsSection = document.getElementById('savings-section');
  if (economia > 0) {
    savingsSection.classList.remove('hidden');
    document.getElementById('savings-val').textContent = fmt(economia);
  } else {
    savingsSection.classList.add('hidden');
  }

  renderFinal(products);
}

// ============================
// Lista final
// ============================
function renderFinal(products) {
  let total = 0;
  let html = '';

  products.forEach(prod => {
    const items = lista.filter(i => i.prod === prod);
    const best = items.reduce((a, b) => (a.unit < b.unit ? a : b));
    total += best.preco;

    html += `
      <div class="final-item">
        <div class="fi-info">
          <span class="fi-name">${best.prod}</span>
          <span class="fi-store">${best.merc} &nbsp;·&nbsp; qtd ${best.qtd}</span>
        </div>
        <span class="fi-price">${fmt(best.preco)}</span>
      </div>`;
  });

  html += `
    <div class="total-row">
      <span class="total-label">Total estimado</span>
      <span class="total-value">${fmt(total)}</span>
    </div>`;

  document.getElementById('final-content').innerHTML = html;
  document.getElementById('final-card').classList.remove('hidden');
}

// ============================
// Limpar tudo
// ============================
function clearAll() {
  lista = [];
  render();
}

// ============================
// Download PDF
// ============================
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 18;
  let y = 22;

  // Header
  doc.setFillColor(29, 158, 117);
  doc.roundedRect(margin, y - 6, W - margin * 2, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Compra Inteligente', W / 2, y + 5, { align: 'center' });
  y += 22;

  // Data
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const now = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  doc.text('Gerado em ' + now, W / 2, y, { align: 'center' });
  y += 10;

  // Seção comparações
  const products = [...new Set(lista.map(i => i.prod))];

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Comparação de preços', margin, y);
  y += 2;
  doc.setDrawColor(29, 158, 117);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 7;

  products.forEach(prod => {
    const items = lista.filter(i => i.prod === prod);
    const minUnit = Math.min(...items.map(i => i.unit));
    const sorted = [...items].sort((a, b) => a.unit - b.unit);

    if (y > 260) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(prod, margin, y);
    y += 5;

    sorted.forEach(item => {
      const isBest = Math.abs(item.unit - minUnit) < 0.001;
      if (y > 268) { doc.addPage(); y = 20; }

      if (isBest) {
        doc.setFillColor(225, 245, 238);
        doc.roundedRect(margin, y - 4, W - margin * 2, 10, 2, 2, 'F');
        doc.setDrawColor(93, 202, 165);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y - 4, W - margin * 2, 10, 2, 2, 'S');
      }

      doc.setFont('helvetica', isBest ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(isBest ? 15 : 100, isBest ? 110 : 100, isBest ? 86 : 100);
      doc.text(item.merc, margin + 3, y + 2);
      doc.text('Qtd: ' + item.qtd + '  |  R$/un: ' + item.unit.toFixed(2), margin + 50, y + 2);

      const priceStr = 'R$ ' + item.preco.toFixed(2).replace('.', ',');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isBest ? 15 : 80, isBest ? 110 : 80, isBest ? 86 : 80);
      doc.text(priceStr, W - margin - 26, y + 2);

      if (isBest) {
        doc.setFillColor(29, 158, 117);
        doc.roundedRect(W - margin - 24, y - 2.5, 20, 6, 1.5, 1.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('MELHOR', W - margin - 14, y + 1.5, { align: 'center' });
      }

      y += 10;
    });
    y += 3;
  });

  // Seção lista final
  if (y > 230) { doc.addPage(); y = 20; }
  y += 2;
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Lista final — menores preços', margin, y);
  y += 2;
  doc.setDrawColor(29, 158, 117);
  doc.line(margin, y, W - margin, y);
  y += 8;

  let total = 0;
  products.forEach(prod => {
    const items = lista.filter(i => i.prod === prod);
    const best = items.reduce((a, b) => (a.unit < b.unit ? a : b));
    total += best.preco;

    if (y > 268) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(best.prod, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(best.merc + '  ·  qtd ' + best.qtd, margin, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 110, 86);
    doc.text('R$ ' + best.preco.toFixed(2).replace('.', ','), W - margin, y + 2, { align: 'right' });

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 9, W - margin, y + 9);
    y += 14;
  });

  // Total final
  if (y > 265) { doc.addPage(); y = 20; }
  doc.setFillColor(29, 158, 117);
  doc.roundedRect(margin, y, W - margin * 2, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total estimado', margin + 5, y + 9);
  doc.setFontSize(13);
  doc.text('R$ ' + total.toFixed(2).replace('.', ','), W - margin - 5, y + 9, { align: 'right' });

  doc.save('lista-compras.pdf');
}

// ============================
// Scanner / Câmera
// ============================
async function lookupBarcode(code) {
  setStatus('Buscando produto na base...', 'loading');
  try {
    const res = await fetch('https://world.openfoodfacts.org/api/v0/product/' + code + '.json');
    const data = await res.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const name = p.product_name_pt || p.product_name || p.generic_name_pt || p.generic_name || '';
      const brand = p.brands || '';
      const qty = p.quantity || '';

      if (name) {
        let full = name;
        if (brand && !name.toLowerCase().includes(brand.toLowerCase())) full = brand + ' ' + name;
        if (qty) full += ' ' + qty;
        full = full.trim();

        document.getElementById('inp-produto').value = full;
        setStatus('Encontrado: ' + full, 'success');
        setTimeout(closeScanner, 1800);
        return;
      }
    }

    document.getElementById('inp-produto').value = code;
    setStatus('Não encontrado. Código: ' + code + '. Edite o nome.', 'warn');
    setTimeout(closeScanner, 2200);
  } catch (e) {
    document.getElementById('inp-produto').value = code;
    setStatus('Sem conexão. Código: ' + code + '. Edite o nome.', 'warn');
    setTimeout(closeScanner, 2200);
  }
}

async function openScanner() {
  document.getElementById('scanner-modal').classList.add('open');
  document.getElementById('scan-status').className = 'scan-status';
  document.getElementById('scan-tip').textContent = 'Aponte a câmera para o código de barras';

  if (typeof ZXing === 'undefined') {
    setStatus('Biblioteca não carregou. Tente recarregar a página.', 'error');
    return;
  }

  try {
    codeReader = new ZXing.BrowserMultiFormatReader();
    scanActive = true;

    await codeReader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      document.getElementById('scanner-video'),
      async (result, err) => {
        if (result && scanActive) {
          scanActive = false;
          stopCamera();
          await lookupBarcode(result.getText());
        }
      }
    );
  } catch (e) {
    setStatus('Câmera não disponível ou permissão negada.', 'error');
  }
}

function stopCamera() {
  if (codeReader) {
    try { codeReader.reset(); } catch (e) {}
    codeReader = null;
  }
  const video = document.getElementById('scanner-video');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
  scanActive = false;
}

function closeScanner() {
  stopCamera();
  document.getElementById('scanner-modal').classList.remove('open');
}
