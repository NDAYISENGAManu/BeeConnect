import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env': {
        ...Object.fromEntries(Object.entries(env).map(([key, val]) => [key, JSON.stringify(val)])),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    },
    server: {
      port: Number(env.VITE_PORT || 3000),
      open: true,
    },
    base: mode === "staging" ? "/BeeConnect" : "/",
    build: {
      outDir: 'build',
      assetsDir: 'assets',
      sourcemap: false,
    },
  };
});
