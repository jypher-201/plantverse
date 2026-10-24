function notFound(req, res, next) {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

// Must be registered LAST, after all routes. 4 args = Express treats this as an error handler.
function errorHandler(err, req, res, next) {
    console.error(err);

    // express.json() throws a SyntaxError when the request body isn't valid JSON
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({ error: "Malformed JSON in request body" });
    }

    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };