import jwt from 'jsonwebtoken';
import { jwtDecrypt } from 'jose';

export const authenticateToken = async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required. Please log in.',
        });
    }

    try {
        const encryptionKey = Buffer.from(
            process.env.JWT_ENCRYPTION_KEY,
            'base64'
        );

        const { payload } = await jwtDecrypt(token, encryptionKey, {
            keyManagementAlgorithms: ['dir'],
            contentEncryptionAlgorithms: ['A256GCM'],
        });

        req.user = payload;

        return next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired session. Please log in again.',
        });
    }
};


