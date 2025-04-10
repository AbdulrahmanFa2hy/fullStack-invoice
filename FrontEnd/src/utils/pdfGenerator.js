import html2pdf from 'html2pdf.js';

export const generatePDF = async (element, fileName = 'invoice.pdf') => {
  const opt = {
    margin: [10, 10, 15, 10],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollY: 0,
      windowWidth: 1024,
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
      enableLinks: true,
      pagebreak: { 
        mode: ['css', 'legacy'],
        avoid: ['tr', '.item-row', '.no-break', '.summary-section']
      }
    }
  };

  try {
    await html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .save();
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 