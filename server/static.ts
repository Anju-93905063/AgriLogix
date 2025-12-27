import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  let distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    // Try parent directory (useful for Vercel if running from api/ folder)
    distPath = path.resolve(__dirname, "..", "dist", "public");
  }

  if (!fs.existsSync(distPath)) {
    // Try current directory dist (if __dirname is project root)
    distPath = path.resolve(process.cwd(), "dist", "public");
  }

  if (!fs.existsSync(distPath)) {
    console.warn(`Static directory not found at ${distPath}. This might be expected during build or if only API is needed.`);
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
