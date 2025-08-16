/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    // Scan UI package source only; avoid built dist to prevent ENOENT on temp type files
    '../../packages/ui/src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};