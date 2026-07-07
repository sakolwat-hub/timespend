import { useEffect, useRef } from 'react'
import { breakdown, formatDuration, startOfWeek } from '../lib/time'

export default function ShareCard({ app, onClose }) {
  const canvasRef = useRef(null)

  const weekStart = startOfWeek()
  const spends = app.transactions.filter((t) => t.type === 'spend')
  const weekSec = spends
    .filter((t) => t.timestamp >= weekStart)
    .reduce((s, t) => s + t.timeSeconds, 0)
  const luxSec = spends
    .filter((t) => t.timestamp >= weekStart && t.essential === false)
    .reduce((s, t) => s + t.timeSeconds, 0)
  const luxPct = weekSec > 0 ? Math.round((luxSec / weekSec) * 100) : 0
  const bal = breakdown(app.balanceSeconds)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const W = 1080
    const H = 1080

    // อ่านสีจากธีมปัจจุบัน เพื่อให้การ์ดตรงกับสีในแอพ
    const css = getComputedStyle(document.documentElement)
    const accent = css.getPropertyValue('--accent').trim() || '#39ff6a'
    const accentDim = css.getPropertyValue('--accent-dim').trim() || '#2f9a4c'
    const accentDeep = css.getPropertyValue('--accent-deep').trim() || '#1f5a30'

    ctx.fillStyle = '#05080b'
    ctx.fillRect(0, 0, W, H)

    // กรอบเรืองแสง
    ctx.strokeStyle = accentDeep
    ctx.lineWidth = 4
    ctx.strokeRect(60, 60, W - 120, H - 120)

    ctx.textAlign = 'center'

    ctx.fillStyle = accent
    ctx.font = '500 40px monospace'
    ctx.fillText('◷  TIMESPEND', W / 2, 190)

    ctx.fillStyle = '#7d8a82'
    ctx.font = '32px monospace'
    ctx.fillText('สัปดาห์นี้ ฉันจ่ายชีวิตไป', W / 2, 340)

    ctx.fillStyle = accent
    ctx.shadowColor = accent
    ctx.shadowBlur = 30
    ctx.font = '500 96px monospace'
    ctx.fillText(weekSec > 0 ? formatDuration(weekSec) : 'ยังไม่ใช้เลย', W / 2, 470)
    ctx.shadowBlur = 0

    // ฟุ่มเฟือย
    ctx.fillStyle = '#ffd23e'
    ctx.font = '500 44px monospace'
    ctx.fillText(`ฟุ่มเฟือย ${luxPct}%`, W / 2, 620)

    // เส้นคั่น
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(160, 720)
    ctx.lineTo(W - 160, 720)
    ctx.stroke()

    ctx.fillStyle = '#7d8a82'
    ctx.font = '30px monospace'
    ctx.fillText('เหลือในกระเป๋าเวลา', W / 2, 810)

    ctx.fillStyle = '#cfe9d6'
    ctx.font = '500 60px monospace'
    ctx.fillText(`${bal.d}d ${bal.h}h ${bal.m}m`, W / 2, 890)

    ctx.fillStyle = accentDim
    ctx.font = '30px monospace'
    ctx.fillText('เวลาคือเงิน — จ่ายทุกครั้งด้วยชีวิต', W / 2, 990)
  }, [weekSec, luxPct, bal.d, bal.h, bal.m, app.settings.theme])

  function share() {
    const c = canvasRef.current
    c.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'timespend-summary.png', { type: 'image/png' })
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'TimeSpend' })
          return
        }
      } catch {
        /* ผู้ใช้ยกเลิก share — ตกไปดาวน์โหลดแทน */
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'timespend-summary.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">การ์ดสรุป</h2>
        <canvas ref={canvasRef} width={1080} height={1080} className="share-canvas" />
        <button className="btn btn-earn btn-block" onClick={share}>
          ⤴ แชร์ / บันทึกรูป
        </button>
        <button className="btn-text" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  )
}
