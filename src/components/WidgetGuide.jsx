import { useState } from 'react'

const THEME_HEX = {
  green: '#39ff6a',
  cyan: '#3ad6ff',
  amber: '#ffc24d',
  purple: '#b98cff',
  pink: '#ff6fae'
}

// สร้างสคริปต์ Scriptable: "Yปี Mเดือน Dวัน HH:MM:SS" ส่วนเวลาเดินสดทุกวินาที
// จัด layout เต็มกรอบวิดเจ็ต (spacer หัว-ท้ายจัดกึ่งกลางแนวตั้ง)
function buildScript(deadlineMs, accent) {
  return [
    '// TimeSpend — iPhone widget (Scriptable)',
    '// เวลาจะหมดที่ (แก้ได้เมื่อ copy ใหม่จากแอพ):',
    'const DEADLINE = new Date(' + deadlineMs + ')',
    'const ACCENT = "' + accent + '"',
    '',
    'const now = new Date()',
    'const rem = Math.max(0, Math.floor((DEADLINE.getTime() - now.getTime()) / 1000))',
    'const totalDays = Math.floor(rem / 86400)',
    'const years = Math.floor(totalDays / 365)',
    'const months = Math.floor((totalDays - years * 365) / 30)',
    'const days = totalDays - years * 365 - months * 30',
    'const dateStr = years + "\\u0E1B\\u0E35 " + months + "\\u0E40\\u0E14\\u0E37\\u0E2D\\u0E19 " + days + "\\u0E27\\u0E31\\u0E19"',
    '// จุดที่เลขวันจะลด (ห่างไม่ถึง 24 ชม.) เพื่อให้ตัวนับโชว์ ชม:นาที:วิ ของวันนี้',
    'const boundary = new Date(DEADLINE.getTime() - totalDays * 86400 * 1000)',
    '',
    'const w = new ListWidget()',
    'w.backgroundColor = new Color("#05080b")',
    'w.setPadding(14, 18, 14, 18)',
    '',
    'const brand = w.addText("\\u25F7 TIMESPEND")',
    'brand.font = Font.mediumSystemFont(12)',
    'brand.textColor = new Color(ACCENT)',
    '',
    'w.addSpacer()   // ดันเนื้อหาให้กึ่งกลาง (เต็มกรอบ)',
    '',
    'const dateT = w.addText(dateStr)',
    'dateT.font = Font.mediumSystemFont(21)',
    'dateT.textColor = new Color(ACCENT)',
    'dateT.shadowColor = new Color(ACCENT, 0.4)',
    'dateT.shadowRadius = 6',
    '',
    'w.addSpacer(2)',
    '',
    'const timer = w.addDate(boundary)',
    'timer.applyTimerStyle()          // ชม:นาที:วิ เดินสดทุกวินาที',
    'timer.font = Font.boldMonospacedSystemFont(48)',
    'timer.textColor = new Color(ACCENT)',
    'timer.shadowColor = new Color(ACCENT, 0.5)',
    'timer.shadowRadius = 10',
    '',
    'w.addSpacer(4)',
    '',
    'const sub = w.addText("\\u0E40\\u0E27\\u0E25\\u0E32\\u0E0A\\u0E35\\u0E27\\u0E34\\u0E15\\u0E04\\u0E07\\u0E40\\u0E2B\\u0E25\\u0E37\\u0E2D")',
    'sub.font = Font.systemFont(11)',
    'sub.textColor = new Color("#4a7a56")',
    '',
    'w.addSpacer()   // จัดกึ่งกลาง',
    '',
    'w.refreshAfterDate = boundary   // ให้ iOS รีเฟรชเลข ปี/เดือน/วัน เมื่อครบวัน',
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
