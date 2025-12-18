/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                bg: '#050505',
                card: '#0a0a0c',
                border: '#1f1f22',
                primary: '#6366f1', // AI Purple
                processing: '#3b82f6', // Processing Blue
                success: '#10b981', // Success Green
                warning: '#f59e0b', // Warning Yellow
                textMain: '#e4e4e7',
                textSub: '#71717a',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glow-purple': '0 0 20px rgba(99, 102, 241, 0.15)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15)',
                'glow-green': '0 0 20px rgba(16, 185, 129, 0.15)',
            }
        },
    },
    plugins: [],
}
