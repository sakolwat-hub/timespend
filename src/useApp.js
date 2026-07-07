import { useEffect, useState } from 'react'
import { loadSettings, saveSettings } from './lib/settings'
import { loadGoals, saveGoals } from './lib/goals'
import {
  getAllTransactions,
  addTransaction,
  deleteTransaction,
  clearAllTransactions
} from './lib/db'
import { computeRate, moneyToSeconds } from './lib/time'

// hook หลักที่จัดการ settings + transactions + ยอดกระเป๋าเวลา
export function useApp() {
  const [settings, setSettings] = useState(loadSettings)
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState(loadGoals)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllTransactions()
      .then((txs) => setTransactions(txs))
      .finally(() => setLoading(false))
  }, [])

  // ใช้ธีมสีกับทั้งหน้า (รวม onboarding ที่อยู่นอก .app)
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme || 'green'
  }, [settings.theme])

  const rate = computeRate(settings)

  // ยอดกระเป๋าเวลา = Σ(เติม) − Σ(ใช้)  — ไม่ลดเอง ลดเฉพาะตอนใช้เงิน
  const balanceSeconds = transactions.reduce(
    (sum, t) => sum + (t.type === 'earn' ? t.timeSeconds : -t.timeSeconds),
    0
  )

  function updateSettings(patch) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  async function addEntry({ type, amount, category, note, essential }) {
    const tx = {
      id: crypto.randomUUID(),
      type, // 'spend' | 'earn'
      amount: Number(amount) || 0,
      timeSeconds: moneyToSeconds(Number(amount) || 0, rate),
      category: category || (type === 'earn' ? 'รายรับ' : 'อื่นๆ'),
      essential: type === 'spend' ? !!essential : true, // จำเป็น=true / ฟุ่มเฟือย=false
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
  }

  function addGoal({ name, price }) {
    const goal = {
      id: crypto.randomUUID(),
      name: name || 'เป้าหมาย',
      price: Number(price) || 0,
      createdAt: Date.now()
    }
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

  // นำเข้าข้อมูลสำรอง (แทนที่ของเดิมทั้งหมด)
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

  // เวลาที่ใช้ไปวันนี้ (วินาที) — สำหรับแถบ "วันนี้ใช้ไป..."
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todaySpentSeconds = transactions
    .filter((t) => t.type === 'spend' && t.timestamp >= startOfToday.getTime())
    .reduce((sum, t) => sum + t.timeSeconds, 0)

  return {
    loading,
    settings,
    transactions,
    goals,
    rate,
    balanceSeconds,
    todaySpentSeconds,
    updateSettings,
    addEntry,
    removeEntry,
    resetAll,
    addGoal,
    removeGoal,
    importData
  }
}
