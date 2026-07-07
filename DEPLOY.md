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

### 3. GitHub Pages (อัตโนมัติด้วย GitHub Actions) ✅ ตั้งค่าไว้ให้แล้ว
มี workflow `.github/workflows/deploy.yml` — push ขึ้น `main` แล้ว build + deploy ให้เอง
(base path ตั้งอัตโนมัติจากชื่อ repo ผ่าน `BASE_PATH` ไม่ต้องแก้อะไร)

ขั้นตอน:
1. สร้าง repo ใหม่บน https://github.com/new (ยังไม่ต้องใส่ README/.gitignore)
2. เชื่อม remote แล้ว push:
   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. ที่ repo → **Settings → Pages → Build and deployment → Source = "GitHub Actions"**
4. รอ Action รันเสร็จ (แท็บ Actions) → เปิดได้ที่ `https://<username>.github.io/<repo>/`

> ครั้งต่อไปแค่ `git push` → deploy ใหม่อัตโนมัติ

## ⚠️ ต้องเป็น HTTPS
PWA (service worker + ติดตั้งลง home screen) ทำงานเฉพาะบน **HTTPS** — ทั้ง 3 ตัวเลือกด้านบนให้ HTTPS มาให้ฟรีอยู่แล้ว (localhost ก็ใช้ได้ตอน dev)

## ทดสอบ build ก่อน deploy
```bash
npm run build
npm run preview      # เปิด dist/ จริงในวง LAN → เปิดบนมือถือด้วย IP เครื่องได้
```
