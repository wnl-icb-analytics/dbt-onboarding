import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";

type CertificatePdfOptions = {
  courseSlug: string;
  courseTitle: string;
  hours: string;
  lessonTitles: string[];
  learnerName: string;
  date: string;
};

const INK = rgb(31 / 255, 36 / 255, 48 / 255);
const INK_SOFT = rgb(75 / 255, 82 / 255, 99 / 255);
const INK_FAINT = rgb(138 / 255, 144 / 255, 160 / 255);
const FLAME = rgb(255 / 255, 105 / 255, 74 / 255);
const PAPER = rgb(251 / 255, 250 / 255, 248 / 255);
const LINE = rgb(230 / 255, 226 / 255, 218 / 255);

const FONT_URLS = {
  regular: "/fonts/InstrumentSans-Regular.ttf",
  bold: "/fonts/Archivo-Bold.ttf",
  mono: "/fonts/JetBrainsMono-Regular.ttf",
} as const;

async function loadFont(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load certificate font: ${url}`);
  return response.arrayBuffer();
}

function pdfText(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fittedSize(font: PDFFont, text: string, preferred: number, maxWidth: number) {
  let size = preferred;
  while (size > 20 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

function filenamePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function downloadCertificatePdf({
  courseSlug,
  courseTitle,
  hours,
  lessonTitles,
  learnerName,
  date,
}: CertificatePdfOptions) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${courseTitle} certificate - ${learnerName}`);
  pdf.setAuthor("WNL Analytics");
  pdf.setSubject("Course completion certificate");

  const page = pdf.addPage([841.89, 595.28]);
  const [regularBytes, boldBytes, monoBytes] = await Promise.all([
    loadFont(FONT_URLS.regular),
    loadFont(FONT_URLS.bold),
    loadFont(FONT_URLS.mono),
  ]);
  const [regular, bold, mono] = await Promise.all([
    pdf.embedFont(regularBytes, { subset: true }),
    pdf.embedFont(boldBytes, { subset: true }),
    pdf.embedFont(monoBytes, { subset: true }),
  ]);

  page.drawRectangle({ x: 0, y: 0, width: 841.89, height: 595.28, color: PAPER });
  page.drawRectangle({
    x: 51,
    y: 33,
    width: 750,
    height: 511,
    color: FLAME,
    opacity: 0.2,
  });
  page.drawRectangle({
    x: 41,
    y: 43,
    width: 750,
    height: 511,
    color: rgb(1, 1, 1),
    borderColor: INK,
    borderWidth: 2.5,
  });

  page.drawCircle({ x: 735, y: 90, size: 118, color: FLAME, opacity: 0.045 });
  page.drawCircle({ x: 790, y: 52, size: 70, color: FLAME, opacity: 0.055 });
  page.drawCircle({ x: 703, y: 42, size: 42, color: rgb(1, 1, 1) });

  const left = 104;
  page.drawText("CERTIFICATE  OF  COMPLETION", {
    x: left,
    y: 493,
    size: 11,
    font: bold,
    color: FLAME,
  });
  page.drawText("This certifies that", {
    x: left,
    y: 440,
    size: 13,
    font: regular,
    color: INK_SOFT,
  });

  const safeName = pdfText(learnerName) || "Course learner";
  page.drawText(safeName, {
    x: left,
    y: 389,
    size: fittedSize(bold, safeName, 40, 610),
    font: bold,
    color: INK,
  });
  page.drawText("has completed the course", {
    x: left,
    y: 345,
    size: 13,
    font: regular,
    color: INK_SOFT,
  });
  page.drawText(pdfText(courseTitle), {
    x: left,
    y: 311,
    size: 24,
    font: bold,
    color: INK,
  });
  page.drawText(`${lessonTitles.length} lessons  ·  ${pdfText(hours)}`, {
    x: left,
    y: 289,
    size: 10,
    font: mono,
    color: INK_FAINT,
  });

  const columns = [left, 405];
  lessonTitles.forEach((title, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = columns[column];
    const y = 249 - row * 24;
    page.drawCircle({ x: x + 4, y: y + 4, size: 4, color: FLAME });
    page.drawText(pdfText(title), {
      x: x + 15,
      y,
      size: 10,
      font: mono,
      color: INK_SOFT,
    });
  });

  page.drawLine({
    start: { x: left, y: 118 },
    end: { x: 728, y: 118 },
    thickness: 1,
    color: LINE,
  });
  page.drawText("WNL handbook", {
    x: left,
    y: 89,
    size: 12,
    font: bold,
    color: INK,
  });
  page.drawText("WNL Analytics", {
    x: left,
    y: 71,
    size: 8.5,
    font: mono,
    color: INK_FAINT,
  });

  const safeDate = pdfText(date);
  page.drawText(safeDate, {
    x: 728 - mono.widthOfTextAtSize(safeDate, 10),
    y: 79,
    size: 10,
    font: mono,
    color: INK_SOFT,
  });

  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const learner = filenamePart(learnerName);
  link.href = url;
  link.download = `${filenamePart(courseSlug)}-${learner || "learner"}-certificate.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
