export const runtime = "nodejs";

import { PDFDocument, rgb, StandardFonts, PDFName, PDFString } from "pdf-lib";

/* ===============================
   HELPERS
================================ */

const normalizeArray = (v: any): string[] =>
  Array.isArray(v)
    ? v
    : typeof v === "string"
    ? v.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

/**
 * Custom helper to add clickable links to a pdf-lib page
 */
const addLink = (page: any, url: string, x: number, y: number, width: number, height: number) => {
  const { context } = page.doc;
  const linkAnnotation = context.register(
    context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x, y, x + width, y + height], // Bottom-left x, y to top-right x, y
      Border: [0, 0, 0],
      A: {
        Type: 'Action',
        S: 'URI',
        URI: PDFString.of(url),
      },
    }),
  );

  const annots = page.node.get(PDFName.of('Annots')) || context.obj([]);
  annots.push(linkAnnotation);
  page.node.set(PDFName.of('Annots'), annots);
};

/* ===============================
   API HANDLER
================================ */

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const skills = normalizeArray(data.skills);
    const achievements = normalizeArray(data.achievements);
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const certificates = Array.isArray(data.certificates) ? data.certificates : [];

    /* ===============================
       CREATE PDF
    ============================== */

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4

    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const accent = rgb(0.1, 0.3, 0.6);
    let y = height - 50;

    /* ===============================
       PAGE HELPERS
    ============================== */

    const newPage = () => {
      page = pdfDoc.addPage([595, 842]);
      y = height - 50;
    };

    const ensureSpace = (space = 40) => {
      if (y - space < 40) newPage();
    };

    const drawLineOfText = (
      value: string,
      size = 11,
      isBold = false,
      color = rgb(0, 0, 0),
      x = 50
    ) => {
      ensureSpace(size + 10);
      page.drawText(value, {
        x,
        y,
        size,
        font: isBold ? bold : font,
        color,
      });
      y -= size + 6;
    };

    const section = (title: string) => {
      ensureSpace(50);
      page.drawText(title.toUpperCase(), {
        x: 50,
        y,
        size: 12,
        font: bold,
        color: accent,
      });
      y -= 4;

      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 1,
        color: accent,
      });
      y -= 16;
    };

    /* ===============================
       HEADER
    ============================== */

    page.drawText(data.name || "Your Name", {
      x: 50,
      y,
      size: 26,
      font: bold,
      color: accent,
    });
    y -= 30;

    drawLineOfText(data.title || "Your Role", 14, false, rgb(0.4, 0.4, 0.4));

    /* ===============================
       CONTACT INFORMATION
    ============================== */

    section("Contact Information");

    if (data.phone) drawLineOfText(`Phone: ${data.phone}`);
    if (data.email) drawLineOfText(`Email: ${data.email}`);
    if (data.location) drawLineOfText(`Location: ${data.location}`);

    // LinkedIn Link Fix
    if (data.linkedin) {
      const label = `LinkedIn: ${data.linkedin}`;
      page.drawText(label, { x: 50, y, size: 11, font, color: accent });
      addLink(page, data.linkedin, 50, y, label.length * 6, 11);
      y -= 16;
    }

    // LeetCode Link Fix
    if (data.leetcode) {
      const label = `LeetCode: ${data.leetcode}`;
      page.drawText(label, { x: 50, y, size: 11, font, color: accent });
      addLink(page, data.leetcode, 50, y, label.length * 6, 11);
      y -= 16;
    }

    // GitHub Link Fix
    if (data.github) {
      const label = `GitHub: ${data.github}`;
      page.drawText(label, { x: 50, y, size: 11, font, color: accent });
      addLink(page, data.github, 50, y, label.length * 6, 11);
      y -= 20;
    }

    /* ===============================
       SKILLS & CERTIFICATIONS
    ============================== */

    if (skills.length) {
      section("Skills");
      drawLineOfText(skills.join(" • "));
    }

    if (certificates.length) {
      section("Certifications");
      certificates.forEach((c: any) => {
        let line = c.name;
        if (c.issuer) line += ` – ${c.issuer}`;
        if (c.year) line += ` (${c.year})`;
        drawLineOfText("• " + line);
      });
    }

    /* ===============================
       PROJECTS
    ============================== */

    if (projects.length) {
      section("Projects");
      projects.forEach((p: any) => {
        ensureSpace(80);
        if (p.title) drawLineOfText(p.title, 12, true);
        if (p.description) {
          p.description.split("\n").filter(Boolean).forEach((d: string) =>
            drawLineOfText("• " + d.replace(/^[-•]/, ""))
          );
        }
        if (p.url) {
          page.drawText(p.url, { x: 60, y, size: 10, font, color: accent });
          addLink(page, p.url, 60, y, p.url.length * 5, 10);
          y -= 16;
        }
        y -= 6;
      });
    }

    /* ===============================
       EXPERIENCE & ACHIEVEMENTS
    ============================== */

    if (experience.length) {
      section("Experience");
      experience.forEach((e: any) => {
        ensureSpace(90);
        drawLineOfText(`${e.role} | ${e.company}`, 12, true);
        if (e.duration) drawLineOfText(`${e.duration} Years of Experience`, 10, false, rgb(0.5, 0.5, 0.5));
        if (e.description) {
          e.description.split("\n").filter(Boolean).forEach((d: string) =>
            drawLineOfText("• " + d.replace(/^[-•]/, ""), 10)
          );
        }
        y -= 6;
      });
    }

    if (achievements.length) {
      section("Achievements");
      achievements.forEach((a) => drawLineOfText("• " + a));
    }

    /* ===============================
       FOOTER & SEND
    ============================== */

    page.drawText("Resume generated using Resume Builder", {
      x: width / 2 - 120,
      y: 20,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();

    // Wrapping Uint8Array in Buffer.from fixes the Response type error
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=Resume.pdf",
      },
    });

  } catch (err) {
    console.error("PDF ERROR:", err);
    return new Response("PDF generation failed", { status: 500 });
  }
}