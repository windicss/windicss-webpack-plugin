import { defineConfig } from '@windicss/plugin-utils'

export default defineConfig({
  extract: {
    include: ['templates/**/*.{vue,html,jsx,tsx}', 'stylesheets/**/*.{less,sass,scss,css}', ],
  }
})
