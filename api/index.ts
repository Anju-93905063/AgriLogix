import app from "../server/index";

export default async (req: any, res: any) => {
    // Wait for the app to be fully set up (routes registered, etc.)
    try {
        const setup = (app as any).setupPromise;
        if (setup) await setup;
        return app(req, res);
    } catch (err) {
        console.error("Vercel handler error:", err);
        res.status(500).send("Internal Server Error");
    }
};
