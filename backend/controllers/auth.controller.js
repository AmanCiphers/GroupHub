import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import User from '../models/User.model.js';
import { EncryptJWT } from 'jose';
import { randomBytes } from 'node:crypto';
import { resumeDirectory } from '../middleware/upload.middleware.js';
import { COMMITMENT, EXPERIENCE_LEVEL } from '../utils/enums.js';

const logAuthEvent = (message) => {
    console.log('========================================');
    console.log(` [Event] -> ${message}`);
    console.log('========================================');
};

const toPublicUser = (user) => ({
    id: user._id,
    name: user.name,
    username: user.username || null,
    email: user.email,
    role: user.role,
    headline: user.headline || '',
    bio: user.bio || '',
    location: user.location || '',
    skills: user.skills || [],
    links: {
        github: user.links?.github || '',
        website: user.links?.website || '',
        linkedin: user.links?.linkedin || '',
    },
    availability: user.availability || null,
    experienceLevel: user.experienceLevel || null,
    resume: user.resume?.filename
        ? {
              originalName: user.resume.originalName,
              size: user.resume.size,
              uploadedAt: user.resume.uploadedAt,
          }
        : null,
    createdAt: user.createdAt,
});

const normalizeSkills = (skills) => {
    if (!Array.isArray(skills)) return null;
    const seen = new Set();
    const output = [];
    for (const raw of skills) {
        if (typeof raw !== 'string') continue;
        const skill = raw.trim().slice(0, 50);
        const key = skill.toLowerCase();
        if (!skill || seen.has(key) || output.length >= 30) continue;
        seen.add(key);
        output.push(skill);
    }
    return output;
};

const normalizeUrl = (value, label) => {
    if (typeof value !== 'string') {
        throw new Error(`${label} must be a string.`);
    }
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.length > 200) {
        throw new Error(`${label} cannot exceed 200 characters.`);
    }
    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    let parsed;
    try {
        parsed = new URL(withProtocol);
    } catch {
        throw new Error(`${label} must be a valid URL.`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(`${label} must use http or https.`);
    }
    return parsed.toString();
};

const removeStoredFile = (filename) => {
    if (!filename) return;
    const filePath = path.join(resumeDirectory, path.basename(filename));
    fs.promises.unlink(filePath).catch(() => {});
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
        user: toPublicUser(newUser),
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
            user: toPublicUser(user),
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
            'name username email role headline bio location skills links availability experienceLevel resume createdAt'
        );

        if (!user) {
            return res.status(401).json({
                message: 'User no longer exists.',
            });
        }

        return res.status(200).json({
            user: toPublicUser(user),
            csrfToken: req.user.csrfToken,
        });
    } catch (error) {
        logAuthEvent(`Get current user error: ${error.message}`);

        return res.status(500).json({
            message: 'Internal server error.',
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const {
            name,
            username,
            headline,
            bio,
            location,
            skills,
            links,
            availability,
            experienceLevel,
        } = req.body || {};

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists.' });
        }

        if (username !== undefined) {
            if (username === null || username === '') {
                user.username = undefined;
            } else {
                if (typeof username !== 'string') {
                    return res.status(400).json({ message: 'Username must be a string.' });
                }
                const trimmedUsername = username.trim().toLowerCase();
                if (!/^[a-z0-9_-]+$/.test(trimmedUsername)) {
                    return res.status(400).json({
                        message: 'Username can only contain lowercase letters, numbers, underscores, and hyphens.',
                    });
                }
                if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
                    return res.status(400).json({
                        message: 'Username must be between 3 and 30 characters.',
                    });
                }
                const existing = await User.findOne({ username: trimmedUsername });
                if (existing && existing._id.toString() !== user._id.toString()) {
                    return res.status(409).json({
                        message: 'Username is already taken.',
                    });
                }
                user.username = trimmedUsername;
            }
        }

        if (name !== undefined) {
            if (typeof name !== 'string') {
                return res.status(400).json({ message: 'Name must be a string.' });
            }
            const trimmedName = name.trim();
            if (!trimmedName || trimmedName.length > 80) {
                return res.status(400).json({
                    message: 'Name must be between 1 and 80 characters.',
                });
            }
            user.name = trimmedName;
        }

        if (headline !== undefined) {
            if (typeof headline !== 'string') {
                return res.status(400).json({ message: 'Headline must be a string.' });
            }
            const trimmedHeadline = headline.trim();
            if (trimmedHeadline.length > 120) {
                return res.status(400).json({
                    message: 'Headline cannot exceed 120 characters.',
                });
            }
            user.headline = trimmedHeadline;
        }

        if (bio !== undefined) {
            if (typeof bio !== 'string') {
                return res.status(400).json({ message: 'Bio must be a string.' });
            }
            const trimmedBio = bio.trim();
            if (trimmedBio.length > 1000) {
                return res.status(400).json({
                    message: 'Bio cannot exceed 1000 characters.',
                });
            }
            user.bio = trimmedBio;
        }

        if (location !== undefined) {
            if (typeof location !== 'string') {
                return res.status(400).json({ message: 'Location must be a string.' });
            }
            const trimmedLocation = location.trim();
            if (trimmedLocation.length > 80) {
                return res.status(400).json({
                    message: 'Location cannot exceed 80 characters.',
                });
            }
            user.location = trimmedLocation;
        }

        if (skills !== undefined) {
            const normalizedSkills = normalizeSkills(skills);
            if (normalizedSkills === null) {
                return res.status(400).json({
                    message: 'Skills must be an array of strings.',
                });
            }
            user.skills = normalizedSkills;
        }

        if (links !== undefined) {
            if (!links || typeof links !== 'object' || Array.isArray(links)) {
                return res.status(400).json({
                    message: 'Links must be an object.',
                });
            }

            const nextLinks = {
                github: user.links?.github || '',
                website: user.links?.website || '',
                linkedin: user.links?.linkedin || '',
            };

            try {
                for (const key of ['github', 'website', 'linkedin']) {
                    if (links[key] !== undefined) {
                        nextLinks[key] = normalizeUrl(links[key], `links.${key}`);
                    }
                }
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }

            user.links = nextLinks;
        }

        if (availability !== undefined) {
            if (availability === null || availability === '') {
                user.availability = undefined;
            } else if (!COMMITMENT.includes(availability)) {
                return res.status(400).json({
                    message: `availability must be one of: ${COMMITMENT.join(', ')}.`,
                });
            } else {
                user.availability = availability;
            }
        }

        if (experienceLevel !== undefined) {
            if (experienceLevel === null || experienceLevel === '') {
                user.experienceLevel = undefined;
            } else if (!EXPERIENCE_LEVEL.includes(experienceLevel)) {
                return res.status(400).json({
                    message: `experienceLevel must be one of: ${EXPERIENCE_LEVEL.join(', ')}.`,
                });
            } else {
                user.experienceLevel = experienceLevel;
            }
        }

        await user.save();

        logAuthEvent(`Profile updated for ${user.email}`);

        return res.status(200).json({
            message: 'Profile updated.',
            user: toPublicUser(user),
        });
    } catch (error) {
        logAuthEvent(`Update profile error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};

        if (
            typeof currentPassword !== 'string' ||
            typeof newPassword !== 'string'
        ) {
            return res.status(400).json({
                message: 'Current password and new password are required.',
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'New password must be at least 8 characters long.',
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: 'New password must be different from the current password.',
            });
        }

        const user = await User.findById(req.user.userId).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists.' });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({
                message: 'Current password is incorrect.',
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        logAuthEvent(`Password changed for ${user.email}`);

        return res.status(200).json({
            message: 'Password updated successfully.',
        });
    } catch (error) {
        logAuthEvent(`Change password error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const uploadUserResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Choose a resume to upload.' });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            removeStoredFile(req.file.filename);
            return res.status(401).json({ message: 'User no longer exists.' });
        }

        const previousFilename = user.resume?.filename;

        user.resume = {
            filename: req.file.filename,
            originalName:
                path.basename(req.file.originalname).slice(0, 200) || 'resume',
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date(),
        };

        await user.save();

        if (previousFilename && previousFilename !== req.file.filename) {
            removeStoredFile(previousFilename);
        }

        logAuthEvent(`Resume uploaded for ${user.email}`);

        return res.status(200).json({
            message: 'Resume uploaded.',
            user: toPublicUser(user),
        });
    } catch (error) {
        removeStoredFile(req.file.filename);
        logAuthEvent(`Upload resume error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const deleteUserResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists.' });
        }

        const filename = user.resume?.filename;
        user.resume = undefined;
        await user.save();

        if (filename) {
            removeStoredFile(filename);
        }

        logAuthEvent(`Resume removed for ${user.email}`);

        return res.status(200).json({
            message: 'Resume removed.',
            user: toPublicUser(user),
        });
    } catch (error) {
        logAuthEvent(`Delete resume error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const downloadUserResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user?.resume?.filename) {
            return res.status(404).json({ message: 'No resume uploaded.' });
        }

        const filePath = path.join(
            resumeDirectory,
            path.basename(user.resume.filename),
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Resume file is missing.' });
        }

        return res.download(
            filePath,
            path.basename(user.resume.originalName || 'resume'),
        );
    } catch (error) {
        logAuthEvent(`Download resume error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error.' });
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
