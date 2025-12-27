import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const root = process.cwd();

  // Vercel path for public assets inside the build output
  const possiblePaths = [
    path.resolve(root, "dist", "public"),
    path.resolve(root, "public"),
    path.resolve(root, "..", "dist", "public"), // fallback for combined builds
  ];

  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    console.warn("Static files not found manually, falling back to process.cwd()/dist/public");
    distPath = path.resolve(root, "dist", "public");
  }

  // Serve static assets with correct MIME types
  app.use(express.static(distPath, {
    index: false,
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

  // SPA handler: Serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    // For Vercel, if static files were not found by express.static above,
    // this will attempt to send index.html directly
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.status(200).sendFile(indexPath);
    } else {
      res.status(404).send("Application front-end (index.html) not found in deployment. Path: " + indexPath);
    }
  });
}
