import app from "../server/index.ts";

export default async (req: any, res: any) => {
    try {
        const setup = (app as any).setupPromise;
        if (setup) await setup;
        return app(req, res);
    } catch (err) {
        console.error("Vercel handler error:", err);
        res.status(500).send("Internal Server Error");
    }
};
