import app from "../server/index.js";

export default async (req: any, res: any) => {
    try {
        // Wait for server setup to complete (Routes, DB init)
        const setup = (app as any).setupPromise;
        if (setup) {
            await setup;
        }

        return app(req, res);
    } catch (err: any) {
        console.error("Vercel Backend Error:", err.message);
        res.status(500).json({
            error: "Backend Execution Failed",
            message: err.message
        });
    }
};
