import { useState } from 'react'

const THEME_HEX = {
  green: '#39ff6a',
  cyan: '#3ad6ff',
  amber: '#ffc24d',
  purple: '#b98cff',
  pink: '#ff6fae'
}

// สร้างสคริปต์ Scriptable ที่นับถอยหลังสดทุกวินาที (WidgetKit timer style)
function buildScript(deadlineMs, accent) {
  return [
    '// TimeSpend — iPhone widget (Scriptable)',
    '// เวลาจะหมดที่ (แก้ได้เมื่อ copy ใหม่จากแอพ):',
    'const DEADLINE = new Date(' + deadlineMs + ')',
    'const ACCENT = "' + accent + '"',
    '',
    'const w = new ListWidget()',
    'w.backgroundColor = new Color("#05080b")',
    'w.setPadding(16, 18, 16, 18)',
    '',
    'const brand = w.addText("\\u25F7 TIMESPEND")',
    'brand.font = Font.mediumSystemFont(11)',
    'brand.textColor = new Color(ACCENT)',
    'w.addSpacer(6)',
    '',
    'const timer = w.addDate(DEADLINE)',
    'timer.applyTimerStyle()          // นับถอยหลังสดทุกวินาที',
    'timer.font = Font.boldMonospacedSystemFont(30)',
    'timer.textColor = new Color(ACCENT)',
    'timer.shadowColor = new Color(ACCENT, 0.5)',
    'timer.shadowRadius = 8',
    '',
    'w.addSpacer(4)',
    'const sub = w.addText("\\u0E40\\u0E27\\u0E25\\u0E32\\u0E0A\\u0E35\\u0E27\\u0E34\\u0E15\\u0E04\\u0E07\\u0E40\\u0E2B\\u0E25\\u0E37\\u0E2D")',
    'sub.font = Font.systemFont(9)',
    'sub.textColor = new Color("#4a7a56")',
    '',
    'if (config.runsInWidget) { Script.setWidget(w) } else { w.presentMedium() }',
    'Script.complete()'
  ].join('\n')
}

export default function WidgetGuide({ app, onClose }) {
  const [copied, setCopied] = useState(false)
  const accent = THEME_HEX[app.settings.theme] || THEME_HEX.green
  const script = buildScript(Math.round(app.zeroAtMs), accent)

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
        <h2 className="sheet-title">Widget บน iPhone ⏳</h2>
        <p className="widget-intro">
          นับถอยหลัง <b>สดทุกวินาที</b> บนหน้าโฮม/ล็อกสกรีน โดยไม่ต้องเปิดแอพ (ผ่านแอพ Scriptable ฟรี)
        </p>

        <ol className="widget-steps">
          <li>ติดตั้งแอพ <b>Scriptable</b> จาก App Store (ฟรี)</li>
          <li>กดปุ่มด้านล่าง <b>คัดลอกสคริปต์</b></li>
          <li>เปิด Scriptable → กด <b>+</b> → วางสคริปต์ → ตั้งชื่อ TimeSpend</li>
          <li>หน้าโฮม/ล็อกสกรีน → กดค้าง → <b>+</b> → เลือก Scriptable → เลือกสคริปต์ TimeSpend</li>
          <li>เวลาจะเดินถอยหลังสดๆ ⏳ — เมื่อใช้จ่าย/เงินเดือนออก กลับมาคัดลอกใหม่แล้ววางทับ</li>
        </ol>

        <textarea className="widget-code" readOnly value={script} rows={6} />

        <button className="btn btn-earn btn-block" onClick={copy}>
          {copied ? '✓ คัดลอกแล้ว!' : '⧉ คัดลอกสคริปต์'}
        </button>
        <p className="widget-note">
          หมายเหตุ: widget บน<b>หน้าโฮม</b>จะเป็นสีธีมเต็ม ส่วน<b>ล็อกสกรีน</b> iOS จะทำเป็นสีขาว/โปร่ง (ยังเดินสดเหมือนกัน)
        </p>
        <button className="btn-text" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  )
}
