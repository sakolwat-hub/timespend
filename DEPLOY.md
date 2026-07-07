# 🚀 Deploy TimeSpend

แอพเป็น static PWA (หน้าเดียว ไม่มี backend) — build แล้วได้โฟลเดอร์ `dist/` เอาไปวางที่ host ไหนก็ได้

```bash
npm run build        # สร้าง dist/ (รวม service worker + manifest + ไอคอน)
```

## ตัวเลือกที่ง่ายที่สุด

### 1. Netlify Drop (ไม่ต้องมีบัญชี Git) — เร็วสุด
1. `npm run build`
2. เปิด https://app.netlify.com/drop
3. ลากโฟลเดอร์ `dist/` ไปวาง → ได้ลิงก์ HTTPS ทันที (เปิดบนมือถือ + ติดตั้งเป็นแอพได้เลย)

### 2. Vercel
```bash
npm i -g vercel
vercel            # ครั้งแรกจะถามล็อกอิน แล้ว deploy อัตโนมัติ (มี vercel.json ให้แล้ว)
```

### 3. GitHub Pages
ต้องตั้ง base path เพราะ deploy ที่ `/<repo>/`:
```js
// vite.config.js
export default defineConfig({ base: '/timespend/', ... })
```
แล้ว push `dist/` ขึ้น branch `gh-pages` (หรือใช้ GitHub Action `actions/deploy-pages`)

## ⚠️ ต้องเป็น HTTPS
PWA (service worker + ติดตั้งลง home screen) ทำงานเฉพาะบน **HTTPS** — ทั้ง 3 ตัวเลือกด้านบนให้ HTTPS มาให้ฟรีอยู่แล้ว (localhost ก็ใช้ได้ตอน dev)

## ทดสอบ build ก่อน deploy
```bash
npm run build
npm run preview      # เปิด dist/ จริงในวง LAN → เปิดบนมือถือด้วย IP เครื่องได้
```
