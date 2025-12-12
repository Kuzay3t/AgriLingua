import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin: remove sourceMappingURL comments from lucide-react files to avoid ENOENT on missing .map files
function stripLucideSourceMaps() {
  return {
    name: 'strip-lucide-sourcemaps',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!id.includes('node_modules') || !id.includes('lucide-react')) return null;
      // remove //# sourceMappingURL=... and /*# sourceMappingURL=... */ occurrences
      const cleaned = code
        .replace(/\/\/# sourceMappingURL=.*$/gm, '')
        .replace(/\/\*# sourceMappingURL=.*\*\//gm, '');
      return { code: cleaned, map: null };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    stripLucideSourceMaps(),
  ],
  // optional: quieter logging during dev to avoid many warnings
  logLevel: 'info',
});
