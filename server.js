require('dotenv').config()
const { initDb } = require('./src/database')
const app = require('./src/app')
const { baseWebhookURL } = require('./src/config')

// Initialize database and start server
initDb()
  .then(() => {
    // Check if BASE_WEBHOOK_URL environment variable is available
    if (!baseWebhookURL) {
      console.error('BASE_WEBHOOK_URL environment variable is not available. Exiting...')
      process.exit(1)
    }
    const port = process.env.PORT || 3000
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch(err => {
    console.error('Failed to initialize database:', err)
    process.exit(1)
  })
