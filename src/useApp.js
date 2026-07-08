import { useEffect, useState } from 'react'
import { loadSettings, saveSettings } from './lib/settings'
import { loadGoals, saveGoals } from './lib/goals'
import {
  getAllTransactions,
  addTransaction,
  deleteTransaction,
  clearAllTransactions
} from './lib/db'
import { lifeRate, moneyToSeconds, monthlyIncomeOf, startOfWeek } from './lib/time'

// hook หลัก: settings + transactions + กระเป๋าเวลา (ไหลลดเรียลไทม์)
export function useApp() {
  const [settings, setSettings] = useState(loadSettings)
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState(loadGoals)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  function updateSettings(patch) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  useEffect(() => {
    getAllTransactions()
      .then((txs) => setTransactions(txs))
      .finally(() => setLoading(false))
  }, [])

  // ใช้ธีมสีกับทั้งหน้า
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme || 'green'
  }, [settings.theme])

  // นาฬิกาเดินจริง (ไหลลดทุกวินาที)
  useEffect(() => {
    if (!settings.drainEnabled) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [settings.drainEnabled])

  const rate = lifeRate(settings) // บาท = ชีวิต 1 ชม.

  // ตั้งจุดอ้างอิงครั้งแรก (ผู้ใช้เดิมที่ยังไม่มี anchor) + ล้างข้อมูลทดสอบเก่า
  useEffect(() => {
    if (loading || !settings.onboarded || settings.clockStartMs) return
    const r = lifeRate(settings)
    const buffer = r > 0 ? moneyToSeconds(monthlyIncomeOf(settings), r) : 0
    clearAllTransactions().then(() => setTransactions([]))
    updateSettings({ clockStartMs: Date.now(), initialBufferSeconds: buffer })
  }, [loading, settings.onboarded, settings.clockStartMs])

  // ยอดจากธุรกรรม (เติม − ใช้)
  const txSeconds = transactions.reduce(
    (sum, t) => sum + (t.type === 'earn' ? t.timeSeconds : -t.timeSeconds),
    0
  )

  // เวลาที่ไหลไปตั้งแต่จุดอ้างอิง (เรียลไทม์)
  const drainSeconds =
    settings.drainEnabled && settings.clockStartMs
      ? Math.max(0, (now - settings.clockStartMs) / 1000)
      : 0

  // ยอดกระเป๋าเวลา = ตั้งต้น + ธุรกรรม − ที่ไหลไป
  const balanceSeconds = (settings.initialBufferSeconds || 0) + txSeconds - drainSeconds

  // เวลา (epoch ms) ที่กระเป๋าจะถึงศูนย์ — ค่าคงที่ ใช้ทำ widget นับถอยหลัง
  const zeroAtMs = settings.clockStartMs
    ? settings.clockStartMs + ((settings.initialBufferSeconds || 0) + txSeconds) * 1000
    : Date.now() + balanceSeconds * 1000

  async function addEntry({ type, amount, category, note, essential }) {
    const tx = {
      id: crypto.randomUUID(),
      type,
      amount: Number(amount) || 0,
      timeSeconds: moneyToSeconds(Number(amount) || 0, rate),
      category: category || (type === 'earn' ? 'รายรับ' : 'อื่นๆ'),
      essential: type === 'spend' ? !!essential : true,
      note: note || '',
      timestamp: Date.now()
    }
    await addTransaction(tx)
    setTransactions((prev) => [...prev, tx])
    return tx
  }

  async function removeEntry(id) {
    await deleteTransaction(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  async function resetAll() {
    await clearAllTransactions()
    setTransactions([])
    updateSettings({ clockStartMs: Date.now(), initialBufferSeconds: 0 })
  }

  // เปิด/ปิดโหมดไหล โดยคง "ยอดปัจจุบัน" ไว้ (re-anchor กันเลขกระโดด)
  function setDrainEnabled(enabled) {
    updateSettings({
      drainEnabled: enabled,
      clockStartMs: Date.now(),
      initialBufferSeconds: balanceSeconds - txSeconds
    })
    setNow(Date.now())
  }

  function addGoal({ name, price }) {
    const goal = { id: crypto.randomUUID(), name: name || 'เป้าหมาย', price: Number(price) || 0, createdAt: Date.now() }
    setGoals((prev) => {
      const next = [...prev, goal]
      saveGoals(next)
      return next
    })
  }

  function removeGoal(id) {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id)
      saveGoals(next)
      return next
    })
  }

  async function importData(data) {
    if (data.settings) updateSettings(data.settings)
    if (Array.isArray(data.goals)) {
      setGoals(data.goals)
      saveGoals(data.goals)
    }
    if (Array.isArray(data.transactions)) {
      await clearAllTransactions()
      for (const tx of data.transactions) await addTransaction(tx)
      setTransactions(data.transactions)
    }
  }

  // เวลาที่ใช้ (ฟุ่มเฟือย) ไปวันนี้
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todaySpentSeconds = transactions
    .filter((t) => t.type === 'spend' && t.timestamp >= startOfToday.getTime())
    .reduce((sum, t) => sum + t.timeSeconds, 0)

  // สถิติฟุ่มเฟือยสัปดาห์นี้ (สำหรับ widget)
  const weekStart = startOfWeek()
  const weekSpends = transactions.filter((t) => t.type === 'spend' && t.timestamp >= weekStart)
  const weekSpentSeconds = weekSpends.reduce((s, t) => s + t.timeSeconds, 0)
  const weekLuxurySeconds = weekSpends
    .filter((t) => t.essential === false)
    .reduce((s, t) => s + t.timeSeconds, 0)
  const luxuryPct = weekSpentSeconds > 0 ? Math.round((weekLuxurySeconds / weekSpentSeconds) * 100) : 0

  return {
    loading,
    settings,
    transactions,
    goals,
    rate,
    balanceSeconds,
    zeroAtMs,
    drainEnabled: !!settings.drainEnabled,
    todaySpentSeconds,
    luxuryPct,
    weekLuxurySeconds,
    updateSettings,
    setDrainEnabled,
    addEntry,
    removeEntry,
    resetAll,
    addGoal,
    removeGoal,
    importData
  }
}
