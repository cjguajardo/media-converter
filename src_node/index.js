import express from 'express'
import router from './router.js'
import { init } from './utils/db.js'

origins = process.env.ALLOWED_ORIGINS?.split(',') ?? '*'

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", origins)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})
// After all other middleware and routes
app.use((err, req, res, next) => {
  console.error(err.stack) // Log error stack to console
  res.status(500).send('Something broke!') // Send a generic error message to the client
})
app.use(router)

app.listen(3001, () => {
  console.log('Server is running on port 3001')
  init().then(async () => {
    console.log('Database initialized')
  })
})
