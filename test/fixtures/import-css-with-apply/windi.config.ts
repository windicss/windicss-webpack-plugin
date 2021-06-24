import { defineConfig } from '@windicss/plugin-utils'

export default defineConfig({
  extract: {
    include: ['index.js', 'templates/*.vue'],
    exclude: ['node_modules_demo'],
  }
})

