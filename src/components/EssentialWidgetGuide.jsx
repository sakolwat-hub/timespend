import { useState } from 'react'
import { formatDuration } from '../lib/time'
import { buildRingScript } from '../lib/ringWidget'

export default function EssentialWidgetGuide({ app, onClose }) {
  const [copied, setCopied] = useState(false)
  const essLabel = app.weekEssentialSeconds > 0 ? formatDuration(app.weekEssentialSeconds) : '—'
  const script = buildRingScript(app.essentialPct, essLabel, 'essential')

  function copy() {
    navigator.clipboard?.writeText(script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">Widget จำเป็น 🟢</h2>
        <p className="widget-intro">
          วงแหวน <b>% จำเป็นสัปดาห์นี้</b> ({app.essentialPct}% · {essLabel}) — ยิ่งมากยิ่งดี
          (เขียว ≥60% · เหลือง 30-60% · แดง &lt;30%) · widget สี่เหลี่ยมเล็ก
        </p>

        <ol className="widget-steps">
          <li>ใช้แอพ <b>Scriptable</b> เดิม</li>
          <li>กดปุ่มด้านล่าง <b>คัดลอกสคริปต์</b></li>
          <li>Scriptable → กด <b>+</b> → วางสคริปต์ → ตั้งชื่อ TimeSpend จำเป็น</li>
          <li>หน้าโฮม → กดค้าง → <b>+</b> → Scriptable → ขนาด <b>เล็ก (small)</b> → เลือกสคริปต์นี้</li>
          <li>อยากอัปเดต % → กลับมาคัดลอกใหม่แล้ววางทับ</li>
        </ol>

        <textarea className="widget-code" readOnly value={script} rows={6} />

        <button className="btn btn-earn btn-block" onClick={copy}>
          {copied ? '✓ คัดลอกแล้ว!' : '⧉ คัดลอกสคริปต์'}
        </button>
        <button className="btn-text" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  )
}
