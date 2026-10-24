const pool = require("../config/db");

async function createUser(email, hashedPassword) {
    const result = await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at",
        [email, hashedPassword]
    );
    return result.rows[0];
}

async function findUserByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
}

async function saveRefreshToken(userId, token) {
    await pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)", [
        userId,
        token,
    ]);
}

async function findRefreshToken(token) {
    const result = await pool.query("SELECT * FROM refresh_tokens WHERE token = $1", [token]);
    return result.rows[0];
}

async function deleteRefreshToken(token) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
}

module.exports = {
    createUser,
    findUserByEmail,
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
};