import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {config as loadEnv} from 'dotenv'

loadEnv()

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
})
