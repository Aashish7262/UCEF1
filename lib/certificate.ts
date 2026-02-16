import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export async function generateCertificate({
  studentName,
  eventTitle,
  role,
  date,
  certificateId,
}: {
  studentName: string;
  eventTitle: string;
  role: string;
  date: string;
  certificateId: string;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1000, 700]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 🎨 Background Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 960,
    height: 660,
    borderColor: rgb(0.2, 0.2, 0.8),
    borderWidth: 5,
  });

  // 🏆 Title
  page.drawText("CERTIFICATE OF PARTICIPATION", {
    x: 220,
    y: 600,
    size: 40,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.6),
  });

  // Subtitle
  page.drawText("This is proudly presented to", {
    x: 350,
    y: 540,
    size: 20,
    font: normalFont,
  });

  // Student Name (BIG)
  page.drawText(studentName.toUpperCase(), {
    x: 300,
    y: 480,
    size: 36,
    font: titleFont,
    color: rgb(0, 0, 0),
  });

  // Event Text
  page.drawText(`For successfully participating in`, {
    x: 330,
    y: 420,
    size: 20,
    font: normalFont,
  });

  page.drawText(eventTitle, {
    x: 320,
    y: 380,
    size: 28,
    font: titleFont,
    color: rgb(0.2, 0.2, 0.8),
  });

  // Role
  page.drawText(`Role: ${role}`, {
    x: 420,
    y: 320,
    size: 20,
    font: normalFont,
  });

  // Date
  page.drawText(`Date: ${date}`, {
    x: 420,
    y: 290,
    size: 18,
    font: normalFont,
  });

  // Certificate ID
  page.drawText(`Certificate ID: ${certificateId}`, {
    x: 350,
    y: 250,
    size: 14,
    font: normalFont,
  });

  // 🔥 QR CODE (Verification Link)

  // 🔥 QR CODE (Server-safe - NO fetch)
const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${certificateId}`;
const qrDataUrl = await QRCode.toDataURL(verifyUrl);

// Convert base64 → buffer (safe for server)
const base64Data = qrDataUrl.split(",")[1];
const qrBuffer = Buffer.from(base64Data, "base64");

const qrEmbed = await pdfDoc.embedPng(qrBuffer);


  page.drawImage(qrEmbed, {
    x: 50,
    y: 50,
    width: 150,
    height: 150,
  });

  // Verification text
  page.drawText("Scan to Verify Authenticity", {
    x: 40,
    y: 30,
    size: 12,
    font: normalFont,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

