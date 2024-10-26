import { defineConfig, moduleTools } from '@modern-js/module-tools';
import { modulePluginDoc } from '@modern-js/plugin-rspress';

export default defineConfig({
  plugins: [moduleTools(), modulePluginDoc()],
  buildPreset: 'npm-library',
  buildConfig: {
    input: ['src/index.ts', 'src/type.ts', 'src/internal.ts'],
  },
});
