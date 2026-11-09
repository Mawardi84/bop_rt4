/**
 * Helper utility for document printing and direct PDF generation across browsers,
 * iframe sandboxes (such as AI Studio embedded preview), and mobile devices.
 */
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Downloads a DOM element directly as an A4 PDF file using html2canvas-pro & jsPDF.
 * html2canvas-pro supports modern CSS color functions including oklab() and oklch().
 * This bypasses browser print dialog / iframe sandbox restrictions completely.
 */
export async function downloadElementAsPdf(
  elementOrSelector: HTMLElement | string | null,
  filename: string = 'Dokumen_BOP_RT.pdf'
): Promise<boolean> {
  try {
    let el: HTMLElement | null = null;
    if (typeof elementOrSelector === 'string') {
      el = document.querySelector(elementOrSelector);
    } else if (elementOrSelector) {
      el = elementOrSelector;
    } else {
      el = document.querySelector('.official-doc, .document-sheet, .print-document, main');
    }

    if (!el) {
      console.error('Target element for PDF download not found');
      return false;
    }

    // Check if target is landscape
    const isLandscape = el.classList.contains('landscape-doc') || !!el.querySelector('.landscape-doc');

    // Render canvas from target DOM element using html2canvas-pro with exact A4 pixel widths
    const canvas = await html2canvas(el, {
      scale: 2, // High DPI for clear text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: isLandscape ? 1120 : 794,
      onclone: (clonedDoc) => {
        // Inject clean print styles into cloned document
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          /* Hide interactive/toolbar elements in PDF */
          .print\\:hidden, button, .no-print {
            display: none !important;
          }
          
          /* Clean white background, no outer borders or giant screen paddings */
          .official-doc, .document-sheet, .print-document {
            background-color: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            padding: 16px 24px !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          
          /* Force solid standard colors to avoid any edge cases */
          .text-red-600 { color: #dc2626 !important; }
          .bg-red-600 { background-color: #dc2626 !important; }
          .border-red-600 { border-color: #dc2626 !important; }
          
          .text-slate-900 { color: #0f172a !important; }
          .text-slate-800 { color: #1e293b !important; }
          .text-slate-700 { color: #334155 !important; }
          .text-slate-600 { color: #475569 !important; }
          .text-slate-500 { color: #64748b !important; }
          
          .text-indigo-600 { color: #4f46e5 !important; }
          .text-indigo-700 { color: #4338ca !important; }
          .bg-indigo-50 { background-color: #eef2ff !important; }
          .bg-indigo-600 { background-color: #4f46e5 !important; }
          
          .text-emerald-600 { color: #059669 !important; }
          .text-emerald-700 { color: #047857 !important; }
          .bg-emerald-50 { background-color: #ecfdf5 !important; }
          .bg-emerald-600 { background-color: #059669 !important; }
          
          .bg-slate-100 { background-color: #f1f5f9 !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .border-slate-200 { border-color: #e2e8f0 !important; }
          .border-black { border-color: #000000 !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = isLandscape ? 297 : 210; // A4 dimensions
    const pdfHeight = isLandscape ? 210 : 297;
    let imgWidth = pdfWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Smart 1-page fit: If content height slightly exceeds 1 page (within 18%),
    // scale it cleanly so single-page documents don't spill a few lines onto page 2
    if (imgHeight > (pdfHeight - 10) && imgHeight <= pdfHeight * 1.18) {
      const scale = (pdfHeight - 12) / imgHeight;
      imgWidth = imgWidth * scale;
      imgHeight = imgHeight * scale;
      const xOffset = (pdfWidth - imgWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, 6, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Multi-page document handling (buffer of 10mm to prevent stray blank pages)
      while (heightLeft > 10) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF download:', err);
    return false;
  }
}

/**
 * Executes native window.print() with fallback iframe handling and automatic orientation detection
 */
export function executePrint(title?: string): void {
  const originalTitle = document.title;
  if (title) {
    document.title = title;
  }

  // Detect if visible printable document is landscape
  const targetEl = document.querySelector('.official-doc, .document-sheet, .print-document, main');
  const isLandscape = targetEl?.classList.contains('landscape-doc') || !!document.querySelector('.landscape-doc');

  const dynamicStyle = document.createElement('style');
  dynamicStyle.id = 'dynamic-print-page-style';
  dynamicStyle.innerHTML = `
    @page {
      size: A4 ${isLandscape ? 'landscape' : 'portrait'} !important;
      margin: 8mm 12mm !important;
    }
  `;
  document.head.appendChild(dynamicStyle);

  try {
    window.focus();
    window.print();
  } catch (err) {
    console.warn('Direct window.print encountered error, attempting popup fallback:', err);
    openCleanPrintWindow(undefined, title);
  } finally {
    if (dynamicStyle) {
      setTimeout(() => {
        dynamicStyle?.remove();
      }, 2000);
    }
    if (title) {
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
    }
  }
}

/**
 * Opens document in a clean popup print window to avoid iframe header/footer/sidebar clutter
 */
export function openCleanPrintWindow(elementOrSelector?: HTMLElement | string, title?: string): void {
  const el: HTMLElement | null = typeof elementOrSelector === 'string'
    ? document.querySelector(elementOrSelector)
    : (elementOrSelector || document.querySelector('.official-doc, .document-sheet, .print-document') || document.body);

  if (!el) {
    window.print();
    return;
  }

  try {
    const printWin = window.open('', '_blank');
    if (printWin) {
      const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((element) => element.outerHTML)
        .join('\n');

      const isLandscape = el.classList.contains('landscape-doc');
      const docHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title || 'Cetak Dokumen BOP RT'}</title>
            <meta charset="utf-8">
            ${styleSheets}
            <style>
              @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: 10mm; }
              body { font-family: 'Arial Narrow', Arial, sans-serif; background: #ffffff !important; color: #000000 !important; margin: 0; padding: 20px; }
              .official-doc { border: none !important; shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
              .print\\:hidden, button, .no-print { display: none !important; }
            </style>
          </head>
          <body onload="setTimeout(function(){ window.focus(); window.print(); }, 500);">
            <div class="official-doc ${isLandscape ? 'landscape-doc' : ''}">
              ${el.innerHTML}
            </div>
          </body>
        </html>
      `;
      printWin.document.open();
      printWin.document.write(docHtml);
      printWin.document.close();
    } else {
      window.print();
    }
  } catch (err) {
    console.error('Error opening print window:', err);
    window.print();
  }
}

/**
 * Checks if current execution environment is inside an iframe
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Open current preview in a clean new browser tab for 100% native printing
 */
export function openInNewTab(): void {
  try {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.error('Failed to open in new tab:', err);
  }
}
