const path = require('path');
// Load the bundled server code
const distPath = path.resolve(__dirname, '..', 'dist', 'index.cjs');
let app;

try {
    const bundle = require(distPath);
    // esbuild with format: cjs and export default results in module.exports.default
    app = bundle.default || bundle;
} catch (err) {
    console.error("Failed to load bundled server:", err);
    // Fallback to source if bundle is missing (should not happen in production)
}

module.exports = async (req, res) => {
    if (!app) {
        return res.status(500).send("Server bundle not loaded. Check build logs.");
    }

    // Wait for async setup (DB connection, routes, etc.)
    if (app.setupPromise) {
        await app.setupPromise;
    }

    return app(req, res);
};
