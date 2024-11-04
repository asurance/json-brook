import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: 'npm-library',
  buildConfig: {
    input: ['src/index.ts', 'src/type.ts', 'src/internal.ts'],
  },
});
