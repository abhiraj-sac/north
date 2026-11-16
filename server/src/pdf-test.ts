import { PDFParse } from "pdf-parse";
import { readFile } from "node:fs/promises";

async function testPdfParsing() {
  const buffer = await readFile("./test-resume.pdf");

  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });

  try {
    const result = await parser.getText();

    console.log("Extracted PDF Text:");
    console.log(result.text);
  } finally {
    await parser.destroy();
  }
}

testPdfParsing().catch(console.error);