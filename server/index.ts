import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

const setupPromise = (async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    }
    res.status(status).json({ message });
  });

  // Serve static files manually ONLY in local production.
  // On Vercel, static files are served automatically via vercel.json + Output Directory.
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
  } else if (!process.env.VERCEL) {
    const { setupVite } = await import("./vite.ts");
    await setupVite(httpServer, app);
  }

  return app;
})();

(app as any).setupPromise = setupPromise;

// Start server if not running on Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupPromise.then(() => {
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "127.0.0.1",
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  }).catch(err => {
    console.error("Failed to start server:", err);
  });
}

export default app;
