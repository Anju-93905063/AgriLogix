import app from "../server/index";

export default async (req: any, res: any) => {
    try {
        // @ts-ignore - setupPromise is added in server/index.ts
        const setup = app.setupPromise;
        if (setup) await setup;
        return app(req, res);
    } catch (err) {
        console.error("Vercel handler error:", err);
        res.status(500).send("Internal Server Error");
    }
};
