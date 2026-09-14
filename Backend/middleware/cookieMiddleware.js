// Minimal cookie parsing middleware.
// The project intentionally avoids adding cookie-parser as a dependency, so we
// parse the Cookie header ourselves and expose the result on req.cookies.

export const cookieParser = (req, res, next) => {
    req.cookies = {};

    const header = req.headers.cookie;
    if (header) {
        header.split(";").forEach((pair) => {
            const index = pair.indexOf("=");
            if (index === -1) return;

            const key = pair.slice(0, index).trim();
            if (!key) return;

            const value = pair.slice(index + 1).trim();
            try {
                req.cookies[key] = decodeURIComponent(value);
            } catch {
                req.cookies[key] = value;
            }
        });
    }

    next();
};

export default cookieParser;