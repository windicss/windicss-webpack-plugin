/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig, AliasOptions } from 'vite'

const r = (p: string) => resolve(__dirname, p)

export const alias: AliasOptions = {
    'windicss-webpack-plugin': r('./src/'),
}

export default defineConfig({
    test: {
        testTimeout: 1200000,
        include: ['test/**.test.ts']
    },
    resolve: {
        alias,
    },
})
