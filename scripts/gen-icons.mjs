// สร้างไอคอน PNG จาก SVG — รันด้วย: npm run icons
// ใช้ sharp (devDependency) เรนเดอร์ SVG เป็น PNG หลายขนาด
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

// ไอคอนปกติ (คลิกเต็มพื้นที่) — ใช้ไฟล์ icon.svg ที่มีอยู่
const baseSvg = readFileSync(join(pub, 'icon.svg'))

// ไอคอน maskable — เว้น safe zone รอบนอก (นาฬิกาเล็กลงอยู่กลาง ~60%)
const maskableSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#050a06"/>
  <circle cx="256" cy="256" r="112" fill="none" stroke="#39ff6a" stroke-width="16"/>
  <line x1="256" y1="256" x2="256" y2="181" stroke="#39ff6a" stroke-width="16" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="312" y2="283" stroke="#39ff6a" stroke-width="16" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="12" fill="#39ff6a"/>
</svg>`)

const jobs = [
  { svg: baseSvg, size: 192, out: 'pwa-192.png' },
  { svg: baseSvg, size: 512, out: 'pwa-512.png' },
  { svg: baseSvg, size: 180, out: 'apple-touch-icon.png' },
  { svg: maskableSvg, size: 512, out: 'pwa-maskable-512.png' }
]

for (const j of jobs) {
  await sharp(j.svg, { density: 384 })
    .resize(j.size, j.size)
    .png()
    .toFile(join(pub, j.out))
  console.log(`✓ ${j.out} (${j.size}px)`)
}
console.log('เสร็จ — สร้างไอคอน PNG ครบแล้ว')
