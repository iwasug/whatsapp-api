const { Pool } = require('pg')
const { dbHost, dbPort, dbUser, dbPassword, dbDatabase } = require('./config')

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase
})

/**
 * Initialize the database schema (create users table if not exists)
 */
const initDb = async () => {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users (
         id SERIAL PRIMARY KEY,
         username VARCHAR(50) UNIQUE NOT NULL,
         password VARCHAR(255) NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )`
    )
  } catch (err) {
    console.error('Error initializing database:', err)
    process.exit(1)
  }
}

module.exports = {
  pool,
  initDb
}