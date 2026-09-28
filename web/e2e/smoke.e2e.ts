import { expect, test } from '@playwright/test'

// Smoke test: เปิดเว็บได้และแสดงหน้าเข้าสู่ระบบ (ไม่ login และไม่ใช้ข้อมูลผู้ป่วย)
test('เปิดเว็บแล้วเห็นฟอร์มเข้าสู่ระบบ', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('NCDs History & Risk')
  await expect(page.getByLabel('อีเมล')).toBeVisible()
  await expect(page.getByLabel('รหัสผ่าน')).toBeVisible()
})
