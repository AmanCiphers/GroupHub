import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { EncryptJWT } from 'jose';
import { createSecretKey } from 'node:crypto';
import { randomBytes } from 'node:crypto';

const logAuthEvent = (message) => {
    console.log('========================================');
    console.log(` [Event] -> ${message}`);
    console.log('========================================');
};

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (name === undefined || email === undefined || password === undefined) {
        logAuthEvent('Registration failed: missing required fields.');
        return res.status(400).json({
            message: 'Name, email, and password are required.',
        });
    }

    if (
        typeof name != 'string' ||
        typeof email != 'string' ||
        typeof password != 'string'
    ) {
        logAuthEvent('Registration failed: invalid field types received.');
        return res.status(400).json({
            message: 'Name, email, and password must be strings',
        });
    }

    if (password.length < 8) {
        logAuthEvent('Registration failed: password too short.');
        return res.status(400).json({
            message: 'Password must be at least 8 characters long.',
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
        name.trim() === '' ||
        normalizedEmail.trim() === '' ||
        password.trim() === ''
    ) {
        logAuthEvent(
            'Registration failed: empty required fields after trimming.'
        );
        return res.status(400).json({
            message: 'Name, email, and password cannot be empty.',
        });
    }

    const existingUser = await User.findOne({
        email: normalizedEmail,
    });

    if (existingUser) {
        logAuthEvent(
            `Registration failed: email already registered -> ${normalizedEmail}`
        );
        return res.status(409).json({
            message: `email already registered`,
        });
    }

    //Hasing password
    logAuthEvent(`Hashing password for user: ${normalizedEmail}`);
    const hashedPassword = await bcrypt.hash(password, 12);

    //save the new user
    const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
    });
    logAuthEvent(`New user has been created : ${name}`);

    //SEND A RESPONSE WHEN USER IS REGISTERED

    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
        },
    });
};

export const login = async (req, res) => {

    const csrfToken = randomBytes(32).toString('hex');

    try {
        const { email, password } = req.body;

        if (email === undefined || password === undefined) {
            logAuthEvent('Login failed: missing required fields.');
            return res.status(400).json({
                message: 'email, and password are required.',
            });
        }

        if (typeof email != 'string' || typeof password != 'string') {
            logAuthEvent('Login failed: invalid field types received.');
            return res.status(400).json({
                message: 'email, and password must be strings',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail.trim() === '' || password.trim() === '') {
            logAuthEvent('Login failed: empty required fields after trimming.');
            return res.status(400).json({
                message: 'email, and password cannot be empty.',
            });
        }

        const user = await User.findOne({ email: normalizedEmail }).select(
            '+password'
        );

        if (!user) {
            logAuthEvent(
                `Login failed: invalid email or password for ${normalizedEmail}`
            );
            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logAuthEvent(
                `Login failed: invalid password for ${normalizedEmail}`
            );
            return res.status(401).json({
                message: `Invalid Email or Password`,
            });
        }

        const encryptionKey = Buffer.from(process.env.JWT_ENCRYPTION_KEY, 'base64');

        // const jwt_secret = process.env.JWT_SECRET;
        const jwt_expiration = process.env.JWT_EXPIRES_IN;
        const jwt_payload = {
            userId: user._id.toString(),
            csrfToken,
        };

        const accessToken = await new EncryptJWT(jwt_payload)
            .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
            .setIssuedAt()
            .setExpirationTime(jwt_expiration || '15m')
            .encrypt(encryptionKey);

        logAuthEvent(`Login successful for ${user.email}`);

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            csrfToken,
        });
    } catch (error) {
        logAuthEvent(`Login error: ${error.message}`);

        return res.status(500).json({
            message: `Internal server error`,
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select(
            'name email role'
        );

        if (!user) {
            return res.status(401).json({
                message: 'User no longer exists.',
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            csrfToken: req.user.csrfToken,
        });
    } catch (error) {
        logAuthEvent(`Get current user error: ${error.message}`);

        return res.status(500).json({
            message: 'Internal server error.',
        });
    }
};


export const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    });

    return res.status(200).json({
        message: 'Logged out successfully.',
    });
};
