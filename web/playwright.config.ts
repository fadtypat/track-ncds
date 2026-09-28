import { defineConfig, devices } from '@playwright/test'

// ทดสอบ E2E กับเว็บที่ deploy บน Firebase Hosting
// เปลี่ยนเป้าหมายได้ด้วย env เช่น E2E_BASE_URL=http://localhost:5173 npm run test:e2e
const baseURL = process.env.E2E_BASE_URL ?? 'https://track-ncds.web.app'

export default defineConfig({
  testDir: './e2e',
  // ใช้นามสกุล .e2e.ts เพื่อไม่ให้ Vitest (npm test) หยิบไฟล์เหล่านี้ไปรัน
  testMatch: '**/*.e2e.ts',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'th-TH',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
