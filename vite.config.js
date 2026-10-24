import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps asset paths relative so the same build works on
// Vercel/Netlify, GitHub Pages sub-paths, and inside Capacitor apps.
export default defineConfig({ plugins: [react()], base: './' })
