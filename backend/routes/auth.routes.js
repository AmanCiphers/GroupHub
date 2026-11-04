import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
    uploadUserResume,
    deleteUserResume,
    downloadUserResume,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { verifyCsrfToken } from '../middleware/csrf.middleware.js';
import { uploadResume } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, verifyCsrfToken, logout);
router.get('/getMe', authenticateToken, getMe);
router.patch('/profile', authenticateToken, verifyCsrfToken, updateProfile);
router.patch('/password', authenticateToken, verifyCsrfToken, changePassword);
router.post(
    '/resume',
    authenticateToken,
    verifyCsrfToken,
    uploadResume,
    uploadUserResume
);
router.delete(
    '/resume',
    authenticateToken,
    verifyCsrfToken,
    deleteUserResume
);
router.get('/resume', authenticateToken, downloadUserResume);

router.get('/profile', authenticateToken, (req, res) => {
    return res.status(200).json({
        message: 'Authenticated successfully',
        userId: req.user.userId,
    });
});

export default router;
