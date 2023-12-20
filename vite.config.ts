import { defineConfig } from 'vite'
import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react-swc'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import dts from 'vite-plugin-dts'
import path from 'path'
import * as packageJson from './package.json'

export default defineConfig({
  plugins: [
    react(),
    eslintPlugin(),
    libInjectCss(),
    dts({
      include: ['src/component'],
      copyDtsFiles: true,
      tsconfigPath: 'tsconfig.build.json',
      exclude: ['__tests__'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve('src', 'component', 'ReactFacetedSearch.tsx'),
      name: 'ReactFacetedSearch',
      formats: ['es', 'cjs'],
      fileName: (format) => `ReactFacetedSearch.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
