import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { verifyCsrfToken } from '../middleware/csrf.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, verifyCsrfToken, logout);
router.get('/getMe', authenticateToken, getMe);

router.get('/profile', authenticateToken, (req, res) => {
    return res.status(200).json({
        message: 'Authenticated successfully',
        userId: req.user.userId,
    });
});

export default router;
