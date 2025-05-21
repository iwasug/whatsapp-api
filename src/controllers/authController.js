const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { pool } = require('../database')
const { jwtSecret, jwtExpiresIn } = require('../config')

/**
 * Generate a random numeric token of given length.
 */
const generateNumericToken = (length = 50) => {
  let token = ''
  for (let i = 0; i < length; i++) {
    token += crypto.randomInt(0, 10).toString()
  }

  return token
}

/**
 * Register a new user with name, username, password, and assign an API token.
 */
const register = async (req, res) => {
  const { name, username, password } = req.body
  if (!name || !username || !password) {
    return res.status(400).json({ success: false, error: 'Name, username and password are required' })
  }
  try {
    const hashed = await bcrypt.hash(password, 10)
    const apiToken = generateNumericToken(50)
    const result = await pool.query(
      'INSERT INTO users (name, username, password, token) VALUES ($1, $2, $3, $4) RETURNING id, name, username, token, created_at',
      [name, username, hashed, apiToken]
    )
    const user = result.rows[0]
    res.status(201).json({ success: true, user })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'Username already exists' })
    }
    console.error(err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * Authenticate user and issue a JWT token
 */
const login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' })
  }
  try {
    const result = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1',
      [username]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: jwtExpiresIn })
    res.json({ success: true, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

module.exports = {
  register,
  login
}
