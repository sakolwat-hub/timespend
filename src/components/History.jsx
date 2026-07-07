import {
  formatDuration,
  formatMoney,
  formatWhen,
  formatWorkdays,
  startOfWeek,
  startOfMonth
} from '../lib/time'

export default function History({ app, onClose, onShare }) {
  const { transactions } = app
  const spends = transactions.filter((t) => t.type === 'spend')
  const hoursPerDay = app.settings.workHoursPerDay || 8

  const now = Date.now()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekStart = startOfWeek()
  const monthStart = startOfMonth()

  const sumSince = (ts, filter = () => true) =>
    spends
      .filter((t) => t.timestamp >= ts && filter(t))
      .reduce((s, t) => s + t.timeSeconds, 0)

  const todaySec = sumSince(todayStart.getTime())
  const weekSec = sumSince(weekStart)
  const monthSec = sumSince(monthStart)
  const weekLuxurySec = sumSince(weekStart, (t) => t.essential === false)
  const luxuryPct = weekSec > 0 ? Math.round((weekLuxurySec / weekSec) * 100) : 0

  // หมวดที่ใช้เวลามากสุดในเดือนนี้ (สำหรับเทียบเป็นวันทำงาน)
  const monthByCat = {}
  spends
    .filter((t) => t.timestamp >= monthStart)
    .forEach((t) => {
      monthByCat[t.category] = (monthByCat[t.category] || 0) + t.timeSeconds
    })
  const topMonthCat = Object.entries(monthByCat).sort((a, b) => b[1] - a[1])[0]

  // แยกตามหมวดในสัปดาห์นี้ (มากไปน้อย)
  const byCat = {}
  spends
    .filter((t) => t.timestamp >= weekStart)
    .forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + t.timeSeconds
    })
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const catMax = catRows.length ? catRows[0][1] : 1

  const timeline = [...transactions].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="screen history-screen">
      <header className="topbar">
        <button className="icon-btn back" aria-label="กลับ" onClick={onClose}>
          ‹ กลับ
        </button>
        <span className="brand">ประวัติ</span>
        <button className="icon-btn" aria-label="แชร์สรุป" onClick={onShare}>
          ⤴
        </button>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">วันนี้</div>
          <div className="stat-val">{todaySec > 0 ? formatDuration(todaySec) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">สัปดาห์นี้</div>
          <div className="stat-val hot">{weekSec > 0 ? formatDuration(weekSec) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">เดือนนี้</div>
          <div className="stat-val">{monthSec > 0 ? formatDuration(monthSec) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ฟุ่มเฟือย (สัปดาห์นี้)</div>
          <div className="stat-val lux">
            {weekLuxurySec > 0 ? formatDuration(weekLuxurySec) : '—'}
          </div>
        </div>
      </div>

      {weekSec > 0 && (
        <p className="insight">
          {luxuryPct > 0 ? (
            <>
              ฟุ่มเฟือยคิดเป็น <b>{luxuryPct}%</b> ของเวลาที่ใช้สัปดาห์นี้ —
              {luxuryPct >= 50 ? ' ลองตั้งเป้าลดสักนิดไหม? 🌱' : ' อยู่ในเกณฑ์ดีมาก 👍'}
            </>
          ) : (
            <>สัปดาห์นี้ใช้ไปกับของจำเป็นล้วนๆ เก่งมาก 👏</>
          )}
        </p>
      )}

      {topMonthCat && (
        <div className="compare-card">
          <div className="compare-icon">☕</div>
          <div>
            <div className="compare-main">
              {topMonthCat[0]}เดือนนี้ = <b>{formatWorkdays(topMonthCat[1], hoursPerDay)}</b>
            </div>
            <div className="compare-sub muted">
              เดือนนี้ใช้ชีวิตไปทั้งหมด {formatWorkdays(monthSec, hoursPerDay)}
            </div>
          </div>
        </div>
      )}

      {catRows.length > 0 && (
        <div className="cat-breakdown">
          <p className="section-h">ใช้เวลาไปกับอะไร (สัปดาห์นี้)</p>
          {catRows.map(([cat, sec]) => (
            <div className="cat-row" key={cat}>
              <div className="cat-head">
                <span>{cat}</span>
                <span className="cat-time">{formatDuration(sec)}</span>
              </div>
              <div className="cat-bar-bg">
                <div className="cat-bar" style={{ width: `${(sec / catMax) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="timeline">
        <p className="section-h">รายการทั้งหมด</p>
        {timeline.length === 0 ? (
          <p className="empty">ยังไม่มีรายการ</p>
        ) : (
          timeline.map((t) => (
            <div className="tl-row" key={t.id}>
              <div className="tl-left">
                <span className={`recent-tag ${t.type}`}>
                  {t.type === 'earn' ? '+' : '−'}
                </span>
                <div>
                  <div className="tl-cat">
                    {t.category}
                    {t.type === 'spend' && t.essential === false && (
                      <span className="lux-badge">ฟุ่มเฟือย</span>
                    )}
                  </div>
                  <div className="tl-when">
                    {formatWhen(t.timestamp)} · {formatMoney(t.amount)} ฿
                  </div>
                </div>
              </div>
              <div className="tl-right">
                <span className={`tl-time ${t.type}`}>
                  {t.type === 'earn' ? '+' : '−'}
                  {formatDuration(t.timeSeconds)}
                </span>
                <button
                  className="tl-del"
                  aria-label="ลบ"
                  onClick={() => app.removeEntry(t.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
