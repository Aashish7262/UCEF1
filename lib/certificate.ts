import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateCertificate({
  studentName,
  eventTitle,
  role,
  date,
}: {
  studentName: string;
  eventTitle: string;
  role: string;
  date: string;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]);

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText("Certificate of Participation", {
    x: 180,
    y: 500,
    size: 30,
    font,
    color: rgb(0.2, 0.2, 0.8),
  });

  page.drawText(`This is to certify that`, {
    x: 280,
    y: 440,
    size: 18,
  });

  page.drawText(studentName, {
    x: 300,
    y: 400,
    size: 26,
    font,
  });

  page.drawText(`has successfully participated in`, {
    x: 240,
    y: 350,
    size: 18,
  });

  page.drawText(eventTitle, {
    x: 260,
    y: 310,
    size: 24,
    font,
  });

  page.drawText(`Role: ${role}`, {
    x: 330,
    y: 260,
    size: 18,
  });

  page.drawText(`Date: ${date}`, {
    x: 330,
    y: 220,
    size: 16,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
