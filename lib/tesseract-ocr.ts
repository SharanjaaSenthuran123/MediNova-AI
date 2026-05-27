import { mapTesseractStatus, type OCRProgressState } from "@/features/prescription-reader/ocr.helpers";
import { preprocessImageForOcr } from "@/lib/image-preprocess";

const TESSERACT_VERSION = "7.0.0";

/** CDN paths — Next.js/webpack cannot resolve bundled Tesseract workers reliably. */
const WORKER_OPTIONS = {
  workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@${TESSERACT_VERSION}/dist/worker.min.js`,
  corePath: `https://cdn.jsdelivr.net/npm/tesseract.js-core@${TESSERACT_VERSION}`,
};

type TesseractWorker = Awaited<
  ReturnType<(typeof import("tesseract.js"))["createWorker"]>
>;

let workerPromise: Promise<TesseractWorker> | null = null;
let progressHandler: ((state: OCRProgressState) => void) | null = null;

async function getWorker(): Promise<TesseractWorker> {
  if (typeof window === "undefined") {
    throw new Error("OCR is only available in the browser.");
  }

  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker, PSM } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        ...WORKER_OPTIONS,
        logger: (message) => {
          if (typeof message.progress !== "number" || !progressHandler) return;
          progressHandler(mapTesseractStatus(message.status, message.progress));
        },
      });
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
      });
      return worker;
    })();
  }

  return workerPromise;
}

/** Run browser OCR on a prescription image. Loads the worker once and reuses it. */
export async function recognizePrescriptionImage(
  file: File | Blob,
  onProgress?: (state: OCRProgressState) => void
): Promise<string> {
  progressHandler = onProgress ?? null;

  try {
    const worker = await getWorker();
    const prepared = await preprocessImageForOcr(file);
    const result = await worker.recognize(prepared);
    return result.data.text;
  } finally {
    progressHandler = null;
  }
}

export async function terminateOcrWorker(): Promise<void> {
  if (!workerPromise) return;
  try {
    const worker = await workerPromise;
    await worker.terminate();
  } catch {
    /* worker may already be gone */
  } finally {
    workerPromise = null;
    progressHandler = null;
  }
}
