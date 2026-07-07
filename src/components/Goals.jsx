import { useState } from 'react'
import { moneyToSeconds, formatDuration, formatMoney } from '../lib/time'

export default function Goals({ app, onClose }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const numPrice = Number(price) || 0

  function add() {
    if (!name.trim() || numPrice <= 0) return
    app.addGoal({ name: name.trim(), price: numPrice })
    setName('')
    setPrice('')
  }

  return (
    <div className="screen goals-screen">
      <header className="topbar">
        <button className="icon-btn back" aria-label="กลับ" onClick={onClose}>
          ‹ กลับ
        </button>
        <span className="brand">เป้าหมาย</span>
        <span style={{ width: 44 }} />
      </header>

      <div className="goal-add">
        <input
          className="goal-name"
          type="text"
          placeholder="อยากได้อะไร? เช่น หูฟัง"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="goal-add-row">
          <input
            className="goal-price"
            type="text"
            inputMode="numeric"
            placeholder="ราคา (บาท)"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          />
          <button className="btn btn-earn" disabled={!name.trim() || numPrice <= 0} onClick={add}>
            + เพิ่ม
          </button>
        </div>
        {numPrice > 0 && (
          <p className="goal-preview muted">
            = ต้องออม <b>{formatDuration(moneyToSeconds(numPrice, app.rate))}</b> ของเวลาทำงาน
          </p>
        )}
      </div>

      <div className="goal-list">
        {app.goals.length === 0 ? (
          <p className="empty">ยังไม่มีเป้าหมาย — ตั้งเป้าออมเป็น “เวลา” ดูสิ</p>
        ) : (
          app.goals.map((g) => {
            const cost = moneyToSeconds(g.price, app.rate)
            const pct = cost > 0 ? Math.min(100, Math.max(0, (app.balanceSeconds / cost) * 100)) : 0
            const done = app.balanceSeconds >= cost && cost > 0
            return (
              <div className="goal-card" key={g.id}>
                <div className="goal-head">
                  <div>
                    <div className="goal-title">{g.name}</div>
                    <div className="goal-sub">
                      {formatMoney(g.price)} ฿ · {formatDuration(cost)}
                    </div>
                  </div>
                  <button
                    className="tl-del"
                    aria-label="ลบ"
                    onClick={() => app.removeGoal(g.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="goal-bar-bg">
                  <div
                    className={`goal-bar ${done ? 'done' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className={`goal-status ${done ? 'done' : ''}`}>
                  {done ? '✓ มีเวลาพอแล้ว!' : `${Math.round(pct)}% ของเวลาที่มีในกระเป๋า`}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
