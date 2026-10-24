const bcrypt = require("bcrypt");
const {
    createUser,
    findUserByEmail,
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
} = require("../models/user.model");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../utils/token.util");

async function register(req, res, next) {
    try {
        const { email, password } = req.body;

        const existing = await findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(email, hashedPassword);

        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await saveRefreshToken(user.id, refreshToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken, user: { id: user.id, email: user.email } });
    } catch (err) {
        next(err);
    }
}

async function refresh(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ error: "Refresh token required" });
        }

        const stored = await findRefreshToken(token);
        if (!stored) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        const decoded = verifyRefreshToken(token);
        const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

        res.json({ accessToken });
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired refresh token" });
    }
}

async function logout(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            await deleteRefreshToken(token);
        }
        res.clearCookie("refreshToken");
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, refresh, logout };