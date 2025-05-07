const PDFDocument = require('pdfkit');
const User = require('../models/User');
const moment = require('moment');
moment.locale('es');

/**
 * Genera un recibo PDF para un préstamo
 * @param {Object} loan - Objeto de préstamo
 * @param {Object} equipment - Objeto de equipo
 * @param {Object} userId - ID del usuario
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
const generatePDF = async (loan, equipment, userId) => {
  // Obtener información del usuario
  const user = await User.findById(userId);
  
  // Crear un nuevo documento PDF
  const doc = new PDFDocument({ margin: 50 });
  let buffers = [];
  
  doc.on('data', buffer => buffers.push(buffer));
  
  // Encabezado
  doc.fontSize(16).text('UNIVERSIDAD CATÓLICA DE PEREIRA', { align: 'center' });
  doc.fontSize(14).text('LABORATORIO DE FÍSICA', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('RECIBO DE PRÉSTAMO', { align: 'center' });
  doc.moveDown();
  
  // Información del préstamo
  doc.fontSize(12).text(`Fecha de préstamo: ${moment(loan.loanDate).format('LL')}`, { align: 'left' });
  doc.text(`Fecha de devolución: ${moment(loan.dueDate).format('LL')}`, { align: 'left' });
  doc.text(`Código de préstamo: ${loan._id}`, { align: 'left' });
  doc.moveDown();
  
  // Información del equipo
  doc.fontSize(12).font('Helvetica-Bold').text('Información del Equipo', { underline: true });
  doc.font('Helvetica').text(`Nombre: ${equipment.name}`);
  doc.text(`Código: ${equipment.code}`);
  doc.text(`Categoría: ${equipment.category}`);
  doc.text(`Cantidad prestada: ${loan.quantity}`);
  doc.moveDown();
  
  // Información del usuario
  doc.fontSize(12).font('Helvetica-Bold').text('Información del Usuario', { underline: true });
  doc.font('Helvetica').text(`Nombre: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Documento: ${user.documentId}`);
  doc.moveDown();
  
  // Términos y condiciones
  doc.fontSize(10).text('Términos y Condiciones:', { underline: true });
  doc.text('1. El usuario se compromete a devolver el equipo en la fecha establecida.');
  doc.text('2. El usuario es responsable por daños o pérdidas del equipo.');
  doc.text('3. En caso de no devolver el equipo a tiempo, se aplicarán sanciones.');
  doc.moveDown(2);
  
  // Firmas
  doc.fontSize(10).text('___________________________', { align: 'left', width: 200 });
  doc.text('Firma Usuario', { align: 'left', width: 200 });
  
  doc.fontSize(10).text('___________________________', { align: 'right' });
  doc.text('Autorizado por', { align: 'right' });
  
  // Finalizar el documento
  doc.end();
  
  // Devolver una promesa que se resuelve con el buffer del PDF
  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

/**
 * Genera un informe PDF con múltiples préstamos
 * @param {Array} loans - Array de préstamos
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
const generateLoansReport = async (loans) => {
  // Crear un nuevo documento PDF
  const doc = new PDFDocument({ margin: 50 });
  let buffers = [];
  
  doc.on('data', buffer => buffers.push(buffer));
  
  // Encabezado
  doc.fontSize(16).text('UNIVERSIDAD CATÓLICA DE PEREIRA', { align: 'center' });
  doc.fontSize(14).text('LABORATORIO DE FÍSICA', { align: 'center' });
  doc
    .moveDown()
    .fontSize(14)
    .text('REPORTE DE PRÉSTAMOS', { align: 'center' });
  doc
    .moveDown()
    .fontSize(10)
    .text(`Fecha: ${moment().format('LL')}`, { align: 'right' });
  doc.moveDown();
  
  // Tabla de préstamos
  const tableTop = 180;
  const tableHeaders = ['Equipo', 'Usuario', 'Cantidad', 'Fecha préstamo', 'Fecha devolución', 'Estado'];
  const tableWidths = [120, 120, 50, 80, 80, 70];
  let currentY = tableTop;
  
  // Encabezados de tabla
  doc.font('Helvetica-Bold').fontSize(10);
  let currentX = 50;
  
  tableHeaders.forEach((header, i) => {
    doc.text(header, currentX, currentY, { width: tableWidths[i], align: 'left' });
    currentX += tableWidths[i];
  });
  
  // Línea debajo de encabezados
  currentY += 15;
  doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
  currentY += 10;
  
  // Filas de datos
  doc.font('Helvetica').fontSize(9);
  
  for (const loan of loans) {
    // Verificar si necesitamos una nueva página
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
      
      // Volver a dibujar encabezados en nueva página
      doc.font('Helvetica-Bold').fontSize(10);
      currentX = 50;
      tableHeaders.forEach((header, i) => {
        doc.text(header, currentX, currentY, { width: tableWidths[i], align: 'left' });
        currentX += tableWidths[i];
      });
      
      currentY += 15;
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;
      doc.font('Helvetica').fontSize(9);
    }
    
    // Datos de cada fila
    currentX = 50;
    
    // Equipo
    doc.text(loan.equipment.name, currentX, currentY, { width: tableWidths[0], align: 'left' });
    currentX += tableWidths[0];
    
    // Usuario
    doc.text(loan.user.name, currentX, currentY, { width: tableWidths[1], align: 'left' });
    currentX += tableWidths[1];
    
    // Cantidad
    doc.text(loan.quantity.toString(), currentX, currentY, { width: tableWidths[2], align: 'center' });
    currentX += tableWidths[2];
    
    // Fecha préstamo
    doc.text(moment(loan.loanDate).format('DD/MM/YYYY'), currentX, currentY, {
      width: tableWidths[3],
      align: 'center'
    });
    currentX += tableWidths[3];
    
    // Fecha devolución
    doc.text(moment(loan.dueDate).format('DD/MM/YYYY'), currentX, currentY, {
      width: tableWidths[4],
      align: 'center'
    });
    currentX += tableWidths[4];
    
    // Estado
    let estado = '';
    switch (loan.status) {
      case 'active':
        estado = 'Activo';
        break;
      case 'returned':
        estado = 'Devuelto';
        break;
      case 'overdue':
        estado = 'Vencido';
        break;
      default:
        estado = loan.status;
    }
    
    doc.text(estado, currentX, currentY, { width: tableWidths[5], align: 'center' });
    
    // Mover a la siguiente fila
    currentY += 20;
  }
  
  // Finalizar el documento
  doc.end();
  
  // Devolver una promesa que se resuelve con el buffer del PDF
  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

module.exports = {
  generatePDF,
  generateLoansReport
};