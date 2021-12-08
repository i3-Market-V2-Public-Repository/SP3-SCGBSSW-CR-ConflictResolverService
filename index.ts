'use strict'
import express from 'express'
import session from 'express-session'
import passportPromise from './passport'
import http from 'http'
import morgan from 'morgan'
import routesPromise from './routes'
import config from './config'
import crypto from 'crypto'

const main = async function (): Promise<void> {
  const app = express()
  const passport = await passportPromise()

  app.use(session({
    secret: crypto.randomBytes(32).toString('base64'),
    resave: false,
    saveUninitialized: false
  }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(morgan('dev'))
  app.use(passport.initialize())
  // app.use(passport.session())

  // Load routes
  app.use('/', await routesPromise())

  /**
   * Listen on .env SERVER_PORT or 3000/tcp, on all network interfaces.
   */
  const server = http.createServer(app)
  const { port, addr } = config.server
  server.listen(port, addr)

  /**
   * Event listener for HTTP server "listening" event.
   */
  server.on('listening', function (): void {
    console.log(`Listening on http://localhost:${config.server.port}`)
    console.log(`Listening on public ${config.server.publicUri}`)
  })
}

main().catch(err => { throw new Error(err) })
