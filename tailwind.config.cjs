/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // ER Finance Brand Identity
                background: "#0A0A0B", // Base (updated to match brand)
                surface: {
                    DEFAULT: "#18181B",    // Elevated surface (zinc-900)
                    hover: "#1F1F23",      // Hover state
                    active: "#27272A",     // Active/Pressed (zinc-800)
                    highlight: "rgba(255, 255, 255, 0.05)" // Border/Divider
                },
                brand: {
                    primary: "#4F46E5",    // Midnight Indigo (indigo-600)
                    hover: "#4338CA",      // Indigo-700
                    subtle: "rgba(79, 70, 229, 0.1)",
                    // Legacy support
                    DEFAULT: "#4F46E5",
                },
                accent: {
                    success: "#10B981",    // Emerald-500
                    warning: "#F59E0B",    // Amber-500
                    danger: "#F43F5E",     // Rose-500
                    neutral: "#64748B",    // Slate-500
                },
                content: {
                    primary: "#FFFFFF",    // White
                    secondary: "#D1D5DB",  // Gray-300
                    tertiary: "#9CA3AF",   // Gray-400
                    muted: "#6B7280",      // Gray-500
                },
                // Legacy risk colors (mapped to new accent system)
                risk: {
                    high: "#F43F5E",       // danger
                    mid: "#F59E0B",        // warning
                    low: "#10B981",        // success
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
            },
            boxShadow: {
                'surface-sm': "0 1px 2px rgba(0,0,0,0.2)",
                'surface-md': "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.1)",
                'surface-lg': "0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.2)",
            },
            backgroundImage: {
                'gradient-fade': 'linear-gradient(to bottom, rgba(15, 17, 21, 0), #0F1115)',
            }
        },
    },
    plugins: [],
};
