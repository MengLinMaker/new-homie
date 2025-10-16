import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

export default defineConfig({
    plugins: [
        tanstackRouter({ autoCodeSplitting: true }),
        react(),
        tailwindcss(),
        VitePWA({ registerType: 'autoUpdate' }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
})
