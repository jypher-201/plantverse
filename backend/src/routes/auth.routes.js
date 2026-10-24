const express = require("express");
const router = express.Router();
const { register, login, refresh, logout } = require("../controllers/auth.controller");
const { registerRules, loginRules, validate } = require("../validations/auth.validation");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
router.post("/register", registerRules, validate, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive an access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token + user
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginRules, validate, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Exchange a refresh token cookie for a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token
 *       401:
 *         description: Refresh token required
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and invalidate the refresh token
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Logged out
 */
router.post("/logout", logout);

module.exports = router;