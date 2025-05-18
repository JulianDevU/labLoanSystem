import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para generar PDF de préstamo
export const generarPDFPrestamo = (prestamo, usuario, equipo, laboratorio) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear directorio de PDFs si no existe
      const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Crear nombre de archivo
      const fileName = `prestamo-${prestamo._id}-${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      // Crear documento PDF
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      // Pipe el PDF a un archivo
      doc.pipe(stream);

      // Agregar contenido al PDF
      doc.fontSize(25).text('Comprobante de Préstamo', {
        align: 'center'
      });

      doc.moveDown();
      doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, {
        align: 'right'
      });

      doc.moveDown();
      doc.fontSize(16).text('Información del Préstamo');
      doc.moveDown();
      doc.fontSize(12).text(`ID del Préstamo: ${prestamo._id}`);
      doc.fontSize(12).text(`Fecha de Préstamo: ${prestamo.fecha_prestamo.toLocaleDateString()}`);
      doc.fontSize(12).text(`Fecha de Devolución: ${prestamo.fecha_devolucion.toLocaleDateString()}`);
      doc.fontSize(12).text(`Estado: ${prestamo.estado}`);

      doc.moveDown();
      doc.fontSize(16).text('Información del Usuario');
      doc.moveDown();
      doc.fontSize(12).text(`Nombre: ${usuario.nombre}`);
      doc.fontSize(12).text(`Correo: ${usuario.correo}`);
      doc.fontSize(12).text(`Tipo: ${usuario.tipo}`);

      doc.moveDown();
      doc.fontSize(16).text('Información del Equipo');
      doc.moveDown();
      doc.fontSize(12).text(`Nombre: ${equipo.nombre}`);
      doc.fontSize(12).text(`Descripción: ${equipo.descripcion}`);
      doc.fontSize(12).text(`Categoría: ${equipo.categoria}`);

      doc.moveDown();
      doc.fontSize(16).text('Información del Laboratorio');
      doc.moveDown();
      doc.fontSize(12).text(`Nombre: ${laboratorio.nombre}`);
      doc.fontSize(12).text(`Descripción: ${laboratorio.descripcion}`);

      doc.moveDown();
      doc.fontSize(12).text('Este documento es un comprobante oficial del préstamo de equipo.', {
        align: 'center'
      });

      doc.moveDown();
      doc.fontSize(12).text('Firmas:', {
        align: 'left'
      });
      doc.moveDown();
      doc.fontSize(12).text('____________________                    ____________________');
      doc.fontSize(12).text('       Usuario                                Responsable');

      // Finalizar PDF
      doc.end();

      // Cuando el stream termine, resolver la promesa
      stream.on('finish', () => {
        resolve({
          filePath,
          fileName
        });
      });

      // Si hay un error, rechazar la promesa
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Función para generar reporte de préstamos
export const generarReportePrestamos = (prestamos) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear directorio de PDFs si no existe
      const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Crear nombre de archivo
      const fileName = `reporte-prestamos-${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      // Crear documento PDF
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      // Pipe el PDF a un archivo
      doc.pipe(stream);

      // Agregar contenido al PDF
      doc.fontSize(25).text('Reporte de Préstamos', {
        align: 'center'
      });

      doc.moveDown();
      doc.fontSize(12).text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, {
        align: 'right'
      });

      doc.moveDown();
      doc.fontSize(16).text(`Total de Préstamos: ${prestamos.length}`);

      doc.moveDown();
      doc.fontSize(14).text('Listado de Préstamos:');
      doc.moveDown();

      // Agregar cada préstamo al reporte
      prestamos.forEach((prestamo, index) => {
        doc.fontSize(12).text(`${index + 1}. ID: ${prestamo._id}`);
        doc.fontSize(10).text(`   Usuario: ${prestamo.usuario_id.nombre}`);
        doc.fontSize(10).text(`   Equipo: ${prestamo.equipo_id.nombre}`);
        doc.fontSize(10).text(`   Fecha Préstamo: ${prestamo.fecha_prestamo.toLocaleDateString()}`);
        doc.fontSize(10).text(`   Fecha Devolución: ${prestamo.fecha_devolucion.toLocaleDateString()}`);
        doc.fontSize(10).text(`   Estado: ${prestamo.estado}`);
        doc.moveDown();
      });

      // Finalizar PDF
      doc.end();

      // Cuando el stream termine, resolver la promesa
      stream.on('finish', () => {
        resolve({
          filePath,
          fileName
        });
      });

      // Si hay un error, rechazar la promesa
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default { generarPDFPrestamo, generarReportePrestamos };