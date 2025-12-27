import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In Vercel, process.cwd() is the most reliable way to find the project root
  const root = process.cwd();

  const possiblePaths = [
    path.resolve(root, "dist", "public"),
    path.resolve(root, "public"),
    path.resolve(root, "..", "dist", "public"),
  ];

  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    console.warn("Could not find static files. Looked in:", possiblePaths);
    // As a last resort, just use 'public' relative to current file
    distPath = path.resolve(process.cwd(), "dist", "public");
  }

  console.log(`Serving static files from: ${distPath}`);

  // Serve static assets first
  app.use(express.static(distPath, {
    index: false,
    fallthrough: true // Let it fall through to the SPA handler
  }));

  // SPA handler: All non-API requests serve index.html
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }

    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Front-end index.html not found.");
    }
  });
}
