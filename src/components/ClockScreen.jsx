import { useEffect, useRef, useState } from 'react'
import { breakdown, formatDuration, formatMoney } from '../lib/time'

// เลือกสีนาฬิกาตามยอดคงเหลือ (เขียว -> เหลือง -> แดง)
function stateColor(balanceSeconds) {
  if (balanceSeconds <= 0) return 'red'
  if (balanceSeconds < 86400) return 'yellow' // เหลือ < 1 วัน
  return 'green'
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function ClockScreen({ app, onSpend, onEarn, onOpenSettings, onOpenHistory, onOpenGoals }) {
  const { d, h, m, s, neg } = breakdown(app.balanceSeconds)
  const color = stateColor(app.balanceSeconds)
  const recent = [...app.transactions].reverse().slice(0, 4)

  // อนิเมชั่นเวลาไหลเข้า/ออก เมื่อมีรายการใหม่
  const [flow, setFlow] = useState(null)
  const prevId = useRef(undefined)
  useEffect(() => {
    const newest = app.transactions[app.transactions.length - 1]
    const newestId = newest ? newest.id : null
    if (prevId.current !== undefined && newest && newestId !== prevId.current) {
      setFlow({ type: newest.type, seconds: newest.timeSeconds, key: newestId })
      const t = setTimeout(() => setFlow(null), 1400)
      prevId.current = newestId
      return () => clearTimeout(t)
    }
    prevId.current = newestId
  }, [app.transactions])

  return (
    <div className="screen clock-screen">
      <header className="topbar">
        <span className="brand">
          <span className="brand-dot" /> TIMESPEND
        </span>
        <div className="topbar-right">
          <span className="rate-chip">≈ {formatMoney(app.rate)} ฿/ชม.</span>
          <button className="icon-btn" aria-label="เป้าหมาย" onClick={onOpenGoals}>
            ◎
          </button>
          <button className="icon-btn" aria-label="ประวัติ" onClick={onOpenHistory}>
            ▤
          </button>
          <button className="icon-btn" aria-label="ตั้งค่า" onClick={onOpenSettings}>
            ⚙
          </button>
        </div>
      </header>

      <div className="clock-main">
        <p className="clock-label">
          {neg ? 'หมดเวลา — เติมด่วน!' : 'กระเป๋าเวลาคงเหลือ'}
          {app.drainEnabled && !neg && <span className="drain-dot" title="ไหลอยู่">●</span>}
        </p>

        <div className="clock-wrap">
          <div className={`clock ${color} ${flow ? 'pulse' : ''}`}>
            {neg && <span className="clock-neg">−</span>}
            <span className="clock-num">{d}</span>
            <span className="clock-unit">d</span>
            <span className="clock-num">{pad(h)}</span>
            <span className="clock-unit">h</span>
            <span className="clock-num">{pad(m)}</span>
            <span className="clock-unit">m</span>
            <span className="clock-num">{pad(s)}</span>
            <span className="clock-unit">s</span>
          </div>
          {flow && (
            <div className={`flow ${flow.type}`} key={flow.key}>
              {flow.type === 'earn' ? '+' : '−'}
              {formatDuration(flow.seconds)}
            </div>
          )}
        </div>

        <p className="today">
          <span className="today-icon">▾</span> วันนี้ใช้ไป{' '}
          <b>{app.todaySpentSeconds > 0 ? formatDuration(app.todaySpentSeconds) : '—'}</b>
        </p>
      </div>

      <div className="actions">
        <button className="btn btn-spend" onClick={onSpend}>
          − ใช้เงิน
        </button>
        <button className="btn btn-earn" onClick={onEarn}>
          + เติมเวลา
        </button>
      </div>

      <div className="recent">
        {recent.length === 0 ? (
          <p className="empty">ยังไม่มีรายการ — แตะ “เติมเวลา” เพื่อเริ่มต้น</p>
        ) : (
          recent.map((t) => (
            <div className="recent-row" key={t.id}>
              <div className="recent-left">
                <span className={`recent-tag ${t.type}`}>
                  {t.type === 'earn' ? '+' : '−'}
                </span>
                <div>
                  <div className="recent-cat">{t.category}</div>
                  <div className="recent-money">{formatMoney(t.amount)} ฿</div>
                </div>
              </div>
              <div className={`recent-time ${t.type}`}>
                {t.type === 'earn' ? '+' : '−'}
                {formatDuration(t.timeSeconds)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
