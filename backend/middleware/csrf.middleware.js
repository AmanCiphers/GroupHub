export const verifyCsrfToken = (req, res, next) => {
    
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    const csrfToken = req.get('X-CSRF-Token');
    const sessionCsrfToken = req.user?.csrfToken;

    if (!csrfToken || !sessionCsrfToken) {
        return res.status(403).json({
            message: 'CSRF token missing.',
        });
    }

    if (csrfToken !== sessionCsrfToken) {
        return res.status(403).json({
            message: 'Invalid CSRF token.',
        });
    }

    return next();
};
