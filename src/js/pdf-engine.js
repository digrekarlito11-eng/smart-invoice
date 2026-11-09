/**
 * Smart Invoice — Moteur d'exportation PDF
 * Utilise html2pdf.js pour une conversion instantanée et fidèle côté client.
 */

export function generateInvoicePDF(elementId = 'invoice-preview-container', filename = 'Facture.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Élément de facture introuvable pour la génération PDF');
    return;
  }

  // Si html2pdf est disponible (chargé via CDN)
  if (typeof window.html2pdf !== 'undefined') {
    const opt = {
      margin:       [8, 8, 8, 8], // mm
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    return window.html2pdf().set(opt).from(element).save();
  }

  // Fallback universel : impression native du navigateur
  window.print();
}
