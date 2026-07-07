// แปลงเงิน <-> เวลา และจัดรูปแบบการแสดงผล

const HOURS_PER_WEEK_TO_MONTH = 52 / 12 // สัปดาห์ต่อเดือนโดยเฉลี่ย

// ชั่วโมงจริงใน 1 เดือน (โดยเฉลี่ย) — ใช้ให้ "เวลาไหล" ตรงกับเวลาจริง
export const REAL_HOURS_PER_MONTH = (365.25 * 24) / 12 // ≈ 730.5

// รายได้ต่อเดือน (บาท) — โหมดเงินเดือนใช้ตรงๆ, โหมดค่าแรงคำนวณจากชั่วโมงทำงาน
export function monthlyIncomeOf(settings) {
  if (!settings) return 0
  if (settings.mode === 'hourly') {
    const hoursPerMonth =
      (settings.workDaysPerWeek || 5) * HOURS_PER_WEEK_TO_MONTH * (settings.workHoursPerDay || 8)
    return (settings.hourlyRate || 0) * hoursPerMonth
  }
  return settings.monthlyIncome || 0
}

// อัตราแลกชีวิต: เงินกี่บาท = ชีวิต 1 ชั่วโมง
// อิง "ค่ากินอยู่" เพื่อให้การใช้ชีวิตเผาเวลาจริง 1:1 (เงินเดือน>ค่ากินอยู่ = มีส่วนเกินสะสม)
export function lifeRate(settings) {
  if (!settings) return 0
  const col = settings.costOfLiving || monthlyIncomeOf(settings) || 0
  if (col <= 0) return 0
  return col / REAL_HOURS_PER_MONTH
}

// เงินเดือนซื้อเวลาได้กี่วัน (สำหรับแสดงผลตอนตั้งค่า)
export function incomeDays(settings) {
  const r = lifeRate(settings)
  if (r <= 0) return 0
  return moneyToSeconds(monthlyIncomeOf(settings), r) / 86400
}

// ราคาสินค้า (บาท) -> เวลา (วินาที) ตามอัตราแลก
export function moneyToSeconds(amount, rate) {
  if (!rate || rate <= 0 || !amount) return 0
  return (amount / rate) * 3600
}

// แตกวินาที -> วัน/ชม./นาที/วินาที
export function breakdown(totalSeconds) {
  const neg = totalSeconds < 0
  let t = Math.max(0, Math.floor(Math.abs(totalSeconds)))
  const d = Math.floor(t / 86400)
  t -= d * 86400
  const h = Math.floor(t / 3600)
  t -= h * 3600
  const m = Math.floor(t / 60)
  const s = t - m * 60
  return { d, h, m, s, neg }
}

// ข้อความสั้น เช่น "1 วัน 6 ชม." — ใช้ในสรุปและ preview
export function formatDuration(totalSeconds) {
  const { d, h, m, neg } = breakdown(totalSeconds)
  const parts = []
  if (d) parts.push(`${d} วัน`)
  if (h) parts.push(`${h} ชม.`)
  if (m) parts.push(`${m} นาที`)
  if (parts.length === 0) return neg ? 'ไม่ถึงนาที' : 'ไม่ถึงนาที'
  return (neg ? '−' : '') + parts.join(' ')
}

export function formatMoney(amount) {
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Math.round(amount || 0))
}

// ต้นสัปดาห์ (จันทร์ 00:00) เป็น timestamp
export function startOfWeek(now = new Date()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  const day = (d.getDay() + 6) % 7 // จันทร์=0 ... อาทิตย์=6
  d.setDate(d.getDate() - day)
  return d.getTime()
}

// ต้นเดือน (วันที่ 1 00:00) เป็น timestamp
export function startOfMonth(now = new Date()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(1)
  return d.getTime()
}

const DOW = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

// เทียบเป็น "วันทำงาน" เช่น "1.5 วันทำงาน" (ตามชม.ทำงานต่อวันของผู้ใช้)
export function formatWorkdays(totalSeconds, hoursPerDay = 8) {
  const perDay = (hoursPerDay || 8) * 3600
  const days = totalSeconds / perDay
  if (days < 1) {
    const hrs = totalSeconds / 3600
    return `${hrs.toFixed(1)} ชม.ทำงาน`
  }
  return `${days.toFixed(1)} วันทำงาน`
}

// เวลาแบบสั้น เช่น "จ. 6 ก.ค. 14:30"
export function formatWhen(ts) {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${hh}:${mm}`
}
