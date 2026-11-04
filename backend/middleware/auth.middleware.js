import { jwtDecrypt } from 'jose';

const decodeAccessToken = async (token) => {
    const encryptionKey = Buffer.from(
        process.env.JWT_ENCRYPTION_KEY,
        'base64'
    );

    const { payload } = await jwtDecrypt(token, encryptionKey, {
        keyManagementAlgorithms: ['dir'],
        contentEncryptionAlgorithms: ['A256GCM'],
    });

    return payload;
};

export const authenticateToken = async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required. Please log in.',
        });
    }

    try {
        req.user = await decodeAccessToken(token);
        return next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired session. Please log in again.',
        });
    }
};

export const optionalAuth = async (req, _res, next) => {
    const token = req.cookies?.accessToken;

    if (token) {
        try {
            req.user = await decodeAccessToken(token);
        } catch {
            req.user = undefined;
        }
    }

    return next();
};
