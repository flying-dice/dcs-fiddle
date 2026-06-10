import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// Vite's dev server has no mime type for .lua, leaving Content-Type empty,
// which makes browsers fall back to a random GUID download filename.
const luaContentType = (): Plugin => ({
  name: 'lua-content-type',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.split('?')[0].endsWith('.lua')) {
        res.setHeader('Content-Type', 'text/x-lua')
      }
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte(), luaContentType()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
    },
  },
})
