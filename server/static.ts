import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const root = process.cwd();

  // Try to find where the dist/public folder actually is in Vercel
  const possiblePaths = [
    path.resolve(root, "dist", "public"),
    path.resolve(root, "public"),
    path.resolve(root, "client", "dist"),
    path.resolve(__dirname, "..", "dist", "public"),
  ];

  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    // If not found, log and continue. The app will likely fail to serve frontend.
    console.error("CRITICAL: Frontend build not found! Checked:", possiblePaths);
    return;
  }

  console.log(`FOUND STATIC FILES AT: ${distPath}`);

  // 1. Serve static files with Express. 
  // We use a custom middleware to ensure correct MIME types which prevents the "download" issue.
  app.use(express.static(distPath, {
    index: false,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.json': 'application/json'
      };
      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
      }
    }
  }));

  // 2. SPA Fallback: All other non-API routes serve index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.sendFile(indexPath);
    } else {
      res.status(404).send("UI index.html not found. Please check deployment logs.");
    }
  });
}
