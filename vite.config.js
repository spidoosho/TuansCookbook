import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves api/*.js during `npm run dev` with the same handlers Vercel runs,
// so local development doesn't need `vercel dev`.
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        process.env[key] ??= value
      }

      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.replace(/^\/+|\/+$/g, '')
        if (!/^[a-z]+$/.test(name)) return next()

        let handler
        try {
          handler = (await server.ssrLoadModule(`/api/${name}.js`)).default
        } catch {
          return next()
        }

        req.query = Object.fromEntries(url.searchParams)
        req.body = await readJson(req)
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }

        try {
          await handler(req, res)
        } catch (err) {
          server.config.logger.error(err.stack)
          if (!res.headersSent) res.status(500).json({ error: 'Internal error' })
        }
      })
    },
  }
}

async function readJson(req) {
  if (!req.headers['content-type']?.includes('application/json')) return undefined
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return undefined
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devApi()],
})
