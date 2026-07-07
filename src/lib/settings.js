// ตั้งค่าผู้ใช้ เก็บใน localStorage (คีย์-ค่า ง่ายๆ)

const KEY = 'timespend.settings'

export const defaultSettings = {
  onboarded: false,
  mode: 'monthly', // 'monthly' | 'hourly'
  hourlyRate: 150, // บาท/ชม.
  monthlyIncome: 30000, // บาท/เดือน
  costOfLiving: 20000, // ค่ากินอยู่/เดือน (ตัวกำหนดอัตราไหลของเวลา)
  workDaysPerWeek: 5,
  workHoursPerDay: 8,
  currency: 'THB',
  theme: 'green', // green | cyan | amber | purple | pink
  drainEnabled: true, // นาฬิกาไหลลดเรียลไทม์
  clockStartMs: null, // จุดอ้างอิงเวลาเริ่มไหล
  initialBufferSeconds: null // เวลาตั้งต้นในกระเป๋า
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s))
}
