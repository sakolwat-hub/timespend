import { useState, useEffect } from 'react'
import { moneyToSeconds, formatDuration } from '../lib/time'

const SPEND_CATEGORIES = ['กาแฟ', 'ข้าว', 'ช้อปปิ้ง', 'เดินทาง', 'บันเทิง', 'อื่นๆ']
const EARN_CATEGORIES = ['เงินเดือน', 'งานเสริม', 'โบนัส', 'อื่นๆ']
const ESSENTIAL_DEFAULTS = new Set(['ข้าว', 'เดินทาง'])

const CONFIRM_DELAY = 3 // วินาทีหน่วงก่อนยืนยันซื้อ

export default function AmountSheet({ type, app, onClose }) {
  const isSpend = type === 'spend'
  const defaults = isSpend ? SPEND_CATEGORIES : EARN_CATEGORIES
  const customs = (app.customCategories && app.customCategories[type]) || []
  // แสดงหมวดเริ่มต้น + หมวดที่เพิ่มเอง (แทรกก่อน "อื่นๆ")
  const base = defaults.filter((c) => c !== 'อื่นๆ')
  const chips = [...base, ...customs.filter((c) => !defaults.includes(c)), 'อื่นๆ']
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(defaults[0])
  const [essential, setEssential] = useState(ESSENTIAL_DEFAULTS.has(defaults[0]))
  const [phase, setPhase] = useState('input') // 'input' | 'confirm'
  const [countdown, setCountdown] = useState(CONFIRM_DELAY)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const [customInput, setCustomInput] = useState('')

  function confirmCustom() {
    const n = customInput.trim()
    if (!n) return
    app.addCustomCategory(type, n)
    setCategory(n)
    if (isSpend) setEssential(false)
    setCustomInput('')
    setAdding(false)
  }

  const numAmount = Number(amount) || 0
  const previewSeconds = moneyToSeconds(numAmount, app.rate)

  // นับถอยหลังในหน้า "แน่ใจนะ?"
  useEffect(() => {
    if (phase !== 'confirm' || countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  function pickCategory(c) {
    setCategory(c)
    if (isSpend) setEssential(ESSENTIAL_DEFAULTS.has(c))
  }

  function goConfirm() {
    if (numAmount <= 0) return
    if (!isSpend) return save() // เติมเวลา — ไม่ต้องหน่วง
    setCountdown(CONFIRM_DELAY)
    setPhase('confirm')
    if (navigator.vibrate) navigator.vibrate(10)
  }

  async function save() {
    if (numAmount <= 0 || saving) return
    setSaving(true)
    await app.addEntry({ type, amount: numAmount, category, essential })
    if (navigator.vibrate) navigator.vibrate(isSpend ? 30 : [15, 40, 15])
    onClose()
  }

  // ---------- หน้า "แน่ใจนะ?" (เฉพาะการใช้เงิน) ----------
  if (phase === 'confirm') {
    const ready = countdown <= 0
    return (
      <div className="sheet-backdrop" onClick={onClose}>
        <div className="sheet confirm-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle" />
          <p className="confirm-q">แน่ใจนะ?</p>
          <p className="confirm-cost">
            {category} {numAmount > 0 ? `${numAmount} ฿` : ''}
          </p>
          <div className="confirm-time">= {formatDuration(previewSeconds)}</div>
          <p className="confirm-sub">ของชีวิตที่คุณต้องทำงานเพื่อมัน</p>

          <button
            className={`btn btn-confirm spend ${ready ? '' : 'waiting'}`}
            disabled={!ready || saving}
            onClick={save}
          >
            {ready ? 'แน่ใจแล้ว · จ่ายเลย' : `รอสักครู่… ${countdown}`}
          </button>
          <button className="btn-text good" onClick={onClose}>
            ✓ ขอคิดก่อน (เก็บเวลาไว้)
          </button>
        </div>
      </div>
    )
  }

  // ---------- หน้ากรอกจำนวนเงิน ----------
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">{isSpend ? 'ใช้เงิน' : 'เติมเวลา'}</h2>

        <div className="amount-row">
          <input
            className="amount-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            autoFocus
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          />
          <span className="amount-cur">฿</span>
        </div>

        <p className={`preview ${isSpend ? 'spend' : 'earn'}`}>
          {numAmount > 0 ? (
            <>
              = {isSpend ? 'เสีย' : 'เติม'} <b>{formatDuration(previewSeconds)}</b>{' '}
              {isSpend ? 'ของชีวิต' : 'เข้ากระเป๋า'}
            </>
          ) : (
            <span className="muted">กรอกจำนวนเงินเพื่อดูเวลา</span>
          )}
        </p>

        <div className="chips">
          {chips.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => pickCategory(c)}
              onDoubleClick={() => customs.includes(c) && app.removeCustomCategory(type, c)}
            >
              {c}
            </button>
          ))}
          <button className="chip chip-add" onClick={() => setAdding((a) => !a)}>
            ＋ เพิ่มเอง
          </button>
        </div>

        {adding && (
          <div className="custom-cat-row">
            <input
              className="custom-cat-input"
              type="text"
              placeholder="พิมพ์ชื่อหมวดใหม่…"
              value={customInput}
              autoFocus
              maxLength={20}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmCustom()}
            />
            <button className="btn btn-earn" onClick={confirmCustom}>
              เพิ่ม
            </button>
          </div>
        )}

        {isSpend && (
          <div className="ess-toggle">
            <button
              className={essential ? 'active' : ''}
              onClick={() => setEssential(true)}
            >
              จำเป็น
            </button>
            <button
              className={!essential ? 'active lux' : ''}
              onClick={() => setEssential(false)}
            >
              ฟุ่มเฟือย
            </button>
          </div>
        )}

        <button
          className={`btn btn-confirm ${isSpend ? 'spend' : 'earn'}`}
          disabled={numAmount <= 0 || saving}
          onClick={goConfirm}
        >
          {isSpend ? 'ยืนยันการจ่าย' : 'เติมเวลา'}
        </button>
        <button className="btn-text" onClick={onClose}>
          ยกเลิก
        </button>
      </div>
    </div>
  )
}
