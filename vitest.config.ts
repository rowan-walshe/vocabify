import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: ['packages/*'],
    coverage: {
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportOnFailure: true,
    },
  },
});
