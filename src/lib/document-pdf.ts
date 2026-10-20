type Company = { name: string; document: string; phone: string; address: string; email: string; logoUrl: string };

// Imported on demand in the browser; private image URLs never become public document links.
export async function createDocumentPdf(title: string, body: string, company: Company) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 16, width = 178, bottom = 277;
  let y = margin;
  function room(height: number) {
    if (y + height > bottom) { pdf.addPage(); y = margin; }
  }
  function text(value: string, size = 10, bold = false) {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(value.replace(/\s+/g, ' ').trim(), width);
    const lineHeight = size * 0.45;
    for (const line of lines) { room(lineHeight); pdf.text(line, margin, y + lineHeight); y += lineHeight; }
    y += 3;
  }
  async function image(src: string, maxWidth: number, maxHeight: number, x = margin) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('A foto demorou para carregar. Tente novamente.')), 15000);
      img.onload = () => { window.clearTimeout(timeout); resolve(); };
      img.onerror = () => { window.clearTimeout(timeout); reject(new Error('Não foi possível carregar uma imagem do documento. Reabra e tente novamente.')); };
      img.src = src;
    });
    const scale = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    const canvas = document.createElement('canvas');
    const factor = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * factor));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * factor));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar as fotos do PDF.');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    room(h + 5);
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, h);
    y += h + 5;
  }
  if (company.logoUrl) await image(company.logoUrl, 40, 18);
  text(company.name || 'Sua empresa', 16, true);
  text([company.document, company.phone].filter(Boolean).join(' • '), 9);
  text(company.address || company.email, 9);
  const content = new DOMParser().parseFromString(body, 'text/html');
  for (const node of Array.from(content.body.children)) {
    if (node.classList.contains('photos')) {
      const images = Array.from(node.querySelectorAll('img'));
      for (let i = 0; i < images.length; i += 3) {
        room(38);
        const startY = y;
        let endY = y;
        for (let j = i; j < Math.min(i + 3, images.length); j++) {
          const photo = images[j];
          if (!photo) continue;
          y = startY;
          await image(photo.src, 54, 30, margin + (j - i) * 60);
          endY = Math.max(endY, y);
        }
        y = endY;
      }
    } else {
      const value = Array.from(node.childNodes).map(child => child instanceof HTMLElement ? child.innerText || child.textContent || '' : child.textContent || '').join(' ');
      text(value, node.tagName === 'H1' ? 16 : node.tagName === 'H2' ? 11 : 10, /^H[12]$/.test(node.tagName) || node.classList.contains('total'));
    }
  }
  room(28); y += 18;
  pdf.line(margin, y, margin + 75, y); pdf.line(margin + 100, y, margin + width, y);
  pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
  pdf.text('Responsável técnico', margin, y + 5); pdf.text('Cliente', margin + 100, y + 5);
  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page); pdf.setFontSize(8); pdf.text(`${title} • ${page}/${pdf.getNumberOfPages()}`, margin, 289);
  }
  return new File([pdf.output('blob')], `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`, { type: 'application/pdf' });
}