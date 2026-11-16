
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { renderResumeLatex } from "./resume-latex.service.js";

const execFileAsync = promisify(execFile);

const XELATEX_PATH = process.env.XELATEX_PATH || "xelatex";

export async function generateResumePdf(
  content: Record<string, unknown>
): Promise<Buffer> {
  const tempDir = await mkdtemp(
    path.join(tmpdir(), "north-resume-")
  );

  const texPath = path.join(tempDir, "resume.tex");
  const pdfPath = path.join(tempDir, "resume.pdf");

  try {
    // 1. Convert resume JSON into LaTeX
    const latex = renderResumeLatex(content);

    // 2. Write temporary LaTeX file
    await writeFile(texPath, latex, "utf8");

    // 3. Compile LaTeX into PDF
    await execFileAsync(
      XELATEX_PATH,
      [
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-no-shell-escape",
        "-file-line-error",
        "resume.tex",
      ],
      {
        cwd: tempDir,
        timeout: 60_000,
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
      }
    );

    // 4. Read generated PDF
    const pdfBuffer = await readFile(pdfPath);

    return pdfBuffer;
  } catch (error) {
    if (error && typeof error === "object" && "stderr" in error) {
      console.error(
        "[Resume PDF] XeLaTeX stderr:",
        error.stderr
      );
    }

    if (error && typeof error === "object" && "stdout" in error) {
      console.error(
        "[Resume PDF] XeLaTeX stdout:",
        error.stdout
      );
    }

    console.error(
      "[Resume PDF] Full compilation error:",
      error
    );

    throw new Error("RESUME_PDF_GENERATION_FAILED");
  } finally {
    // 5. Always clean up temporary files
    await rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
}
