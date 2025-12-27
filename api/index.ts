import app from "../server/index";

export default async (req: any, res: any) => {
    try {
        // Wait for server setup to complete (Routes, DB init)
        // @ts-ignore
        if (app.setupPromise) {
            await app.setupPromise;
        }

        // Handle the request
        return app(req, res);
    } catch (err: any) {
        console.error("Vercel Backend Error:", err);

        // In production, we usually hide details, but we need them for debugging right now
        res.status(500).json({
            error: "Backend Execution Failed",
            message: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        });
    }
};
