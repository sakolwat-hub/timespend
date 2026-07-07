// ตั้งค่าผู้ใช้ เก็บใน localStorage (คีย์-ค่า ง่ายๆ)

const KEY = 'timespend.settings'

export const defaultSettings = {
  onboarded: false,
  mode: 'monthly', // 'monthly' | 'hourly'
  hourlyRate: 150, // บาท/ชม.
  monthlyIncome: 30000, // บาท/เดือน
  workDaysPerWeek: 5,
  workHoursPerDay: 8,
  currency: 'THB',
  theme: 'green' // green | cyan | amber | purple | pink
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
