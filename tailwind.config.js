/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Qoder professional grayscale palette
        'qoder-dark-bg-primary': 'var(--qoder-dark-bg-primary)',
        'qoder-dark-bg-secondary': 'var(--qoder-dark-bg-secondary)',
        'qoder-dark-bg-tertiary': 'var(--qoder-dark-bg-tertiary)',
        'qoder-dark-bg-quaternary': 'var(--qoder-dark-bg-quaternary)',
        'qoder-dark-bg-form': 'var(--qoder-dark-bg-form)',
        'qoder-dark-bg-hover': 'var(--qoder-dark-bg-hover)',
        'qoder-dark-border-primary': 'var(--qoder-dark-border-primary)',
        'qoder-dark-border-secondary': 'var(--qoder-dark-border-secondary)',
        'qoder-dark-text-primary': 'var(--qoder-dark-text-primary)',
        'qoder-dark-text-secondary': 'var(--qoder-dark-text-secondary)',
        'qoder-dark-text-muted': 'var(--qoder-dark-text-muted)',
        'qoder-dark-button-primary': 'var(--qoder-dark-button-primary)',
        'qoder-dark-button-primary-text': 'var(--qoder-dark-button-primary-text)',
        'qoder-dark-button-secondary': 'var(--qoder-dark-button-secondary)',
        'qoder-dark-button-secondary-text': 'var(--qoder-dark-button-secondary-text)',
        'qoder-dark-button-hover': 'var(--qoder-dark-button-hover)',
        'qoder-dark-button-secondary-hover': 'var(--qoder-dark-button-secondary-hover)',
        'qoder-dark-input-bg': 'var(--qoder-dark-input-bg)',
        'qoder-dark-input-border': 'var(--qoder-dark-input-border)',
        'qoder-dark-input-focus': 'var(--qoder-dark-input-focus)',
        // Mantener colores de acento existentes
        'qoder-accent-primary': 'var(--qoder-accent-primary)',
        'qoder-accent-secondary': 'var(--qoder-accent-secondary)',
        'qoder-accent-success': 'var(--qoder-accent-success)',
        'qoder-accent-warning': 'var(--qoder-accent-warning)',
        'qoder-accent-danger': 'var(--qoder-accent-danger)',
        'qoder-accent-info': 'var(--qoder-accent-info)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'code-flow': 'code-flow 3s ease-in-out infinite',
      },
      fontFamily: {
        'old-english': ['var(--font-old-english)'],
      },
    },
  },
  plugins: [],
}