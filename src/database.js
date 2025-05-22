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
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users (
         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
         name VARCHAR(100) NOT NULL,
         username VARCHAR(50) UNIQUE NOT NULL,
         password VARCHAR(255) NOT NULL,
         token VARCHAR(50),
         webhook_url VARCHAR(255),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )`
    )
    await pool.query(
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(255)'
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
