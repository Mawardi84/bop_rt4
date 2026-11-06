/**
 * Helper utility for document printing and direct PDF generation across browsers,
 * iframe sandboxes (such as AI Studio embedded preview), and mobile devices.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Downloads a DOM element directly as an A4 PDF file using html2canvas & jsPDF.
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

    // Render canvas from target DOM element
    const canvas = await html2canvas(el, {
      scale: 2, // High DPI for clear text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
      onclone: (clonedDoc) => {
        // html2canvas doesn't support oklch() colors used by Tailwind CSS v4.
        // We inject a style override into the cloned document to force standard colors
        // for the elements being captured.
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          /* Force standard colors to avoid html2canvas oklch parsing errors */
          .official-doc, .document-sheet, .print-document, .official-doc * {
            color: #000000 !important;
            border-color: #000000 !important;
            /* Allow backgrounds but ensure they are not using oklch if possible */
          }
          .official-doc, .document-sheet, .print-document {
            background-color: #ffffff !important;
          }
          /* Ensure red accents still work if they were using red-600 oklch */
          .text-red-600 { color: #dc2626 !important; }
          .bg-red-600 { background-color: #dc2626 !important; }
          .border-red-600 { border-color: #dc2626 !important; }
          
          /* Common Tailwind colors used in the app */
          .text-slate-900 { color: #0f172a !important; }
          .text-slate-700 { color: #334155 !important; }
          .text-slate-600 { color: #475569 !important; }
          .text-slate-500 { color: #64748b !important; }
          .bg-slate-100 { background-color: #f1f5f9 !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Multi-page document handling
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
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
 * Executes native window.print() with fallback iframe handling
 */
export function executePrint(title?: string): void {
  const originalTitle = document.title;
  if (title) {
    document.title = title;
  }

  try {
    window.focus();
    window.print();
  } catch (err) {
    console.warn('Direct window.print encountered error, attempting popup fallback:', err);
    openCleanPrintWindow(undefined, title);
  } finally {
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

      const docHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title || 'Cetak Dokumen BOP RT'}</title>
            <meta charset="utf-8">
            ${styleSheets}
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { font-family: 'Arial Narrow', Arial, sans-serif; background: #ffffff !important; color: #000000 !important; margin: 0; padding: 20px; }
              .official-doc { border: none !important; shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
              .print\\:hidden, button, .no-print { display: none !important; }
            </style>
          </head>
          <body onload="setTimeout(function(){ window.focus(); window.print(); }, 500);">
            <div class="official-doc">
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
