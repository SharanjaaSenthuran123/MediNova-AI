import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    return res.status(409).json({ error: "Duplicate entry — already exists" });
  }

  const message =
    err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
