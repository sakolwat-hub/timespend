import { useState } from 'react'
import { formatDuration } from '../lib/time'

// สร้างสคริปต์ Scriptable (small square): วงแหวน % ฟุ่มเฟือย + เวลา สีตามระดับ
function buildLuxScript(pct, luxLabel) {
  return [
    '// TimeSpend — Luxury widget (Scriptable, small square)',
    '// อัปเดตค่าเมื่อ copy ใหม่จากแอพ:',
    'const PCT = ' + pct,
    'const LUX_LABEL = "' + luxLabel + '"',
    '',
    '// สีตามระดับ: <40 เขียว, 40-70 เหลือง, >70 แดง',
    'let COLOR, TRACK',
    'if (PCT < 40) { COLOR = "#39ff6a"; TRACK = "#1e2a20" }',
    'else if (PCT <= 70) { COLOR = "#ffd23e"; TRACK = "#2a2410" }',
    'else { COLOR = "#ff5252"; TRACK = "#2a1414" }',
    '',
    '// วาดวงแหวนเป็นรูปภาพ',
    'const S = 180, cx = 90, cy = 90, r = 64, lw = 18',
    'const ctx = new DrawContext()',
    'ctx.size = new Size(S, S)',
    'ctx.opaque = false',
    'ctx.respectScreenScale = true',
    'ctx.setLineWidth(lw)',
    'ctx.setStrokeColor(new Color(TRACK))',
    'ctx.strokeEllipse(new Rect(cx - r, cy - r, r * 2, r * 2))',
    'const a0 = -Math.PI / 2, a1 = a0 + 2 * Math.PI * (Math.max(0, Math.min(100, PCT)) / 100)',
    'const p = new Path()',
    'p.move(new Point(cx + r * Math.cos(a0), cy + r * Math.sin(a0)))',
    'for (let i = 1; i <= 100; i++) { const a = a0 + (a1 - a0) * i / 100; p.addLine(new Point(cx + r * Math.cos(a), cy + r * Math.sin(a))) }',
    'ctx.addPath(p)',
    'ctx.setStrokeColor(new Color(COLOR))',
    'ctx.strokePath()',
    'ctx.setTextAlignedCenter()',
    'ctx.setTextColor(new Color(COLOR))',
    'ctx.setFont(Font.boldSystemFont(40))',
    'ctx.drawTextInRect(PCT + "%", new Rect(0, cy - 26, S, 52))',
    'const ringImg = ctx.getImage()',
    '',
    'const w = new ListWidget()',
    'w.backgroundColor = new Color("#05080b")',
    'w.setPadding(12, 12, 12, 12)',
    '',
    'const top = w.addText("\\u25F7 \\u0E1F\\u0E38\\u0E48\\u0E21\\u0E40\\u0E1F\\u0E37\\u0E2D\\u0E22")',
    'top.font = Font.mediumSystemFont(11)',
    'top.textColor = new Color(COLOR)',
    '',
    'w.addSpacer()',
    'const iRow = w.addStack(); iRow.addSpacer()',
    'const wimg = iRow.addImage(ringImg); wimg.imageSize = new Size(90, 90)',
    'iRow.addSpacer()',
    'w.addSpacer(6)',
    '',
    'const tRow = w.addStack(); tRow.addSpacer()',
    'const tt = tRow.addText(LUX_LABEL)',
    'tt.font = Font.boldSystemFont(15); tt.textColor = new Color(COLOR)',
    'tt.centerAlignText(); tRow.addSpacer()',
    '',
    'const sRow = w.addStack(); sRow.addSpacer()',
    'const ss = sRow.addText("\\u0E02\\u0E2D\\u0E07\\u0E40\\u0E27\\u0E25\\u0E32\\u0E17\\u0E35\\u0E48\\u0E43\\u0E0A\\u0E49\\u0E2A\\u0E31\\u0E1B\\u0E14\\u0E32\\u0E2B\\u0E4C\\u0E19\\u0E35\\u0E49")',
    'ss.font = Font.systemFont(9); ss.textColor = new Color("#5a6b60")',
    'ss.centerAlignText(); sRow.addSpacer()',
    'w.addSpacer()',
    '',
    'if (config.runsInWidget) { Script.setWidget(w) } else { w.presentSmall() }',
    'Script.complete()'
  ].join('\n')
}

export default function LuxuryWidgetGuide({ app, onClose }) {
  const [copied, setCopied] = useState(false)
  const luxLabel = app.weekLuxurySeconds > 0 ? formatDuration(app.weekLuxurySeconds) : '—'
  const script = buildLuxScript(app.luxuryPct, luxLabel)

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
        <h2 className="sheet-title">Widget ฟุ่มเฟือย 🟡</h2>
        <p className="widget-intro">
          วงแหวน <b>% ฟุ่มเฟือยสัปดาห์นี้</b> ({app.luxuryPct}% · {luxLabel}) เปลี่ยนสีตามระดับ —
          เขียว(ดี)/เหลือง/แดง(เยอะไป) · widget สี่เหลี่ยมเล็ก
        </p>

        <ol className="widget-steps">
          <li>ใช้แอพ <b>Scriptable</b> เดิม (ที่ติดตั้งไว้แล้ว)</li>
          <li>กดปุ่มด้านล่าง <b>คัดลอกสคริปต์</b></li>
          <li>Scriptable → กด <b>+</b> → วางสคริปต์ → ตั้งชื่อ TimeSpend ฟุ่มเฟือย</li>
          <li>หน้าโฮม → กดค้าง → <b>+</b> → Scriptable → เลือกขนาด <b>เล็ก (small)</b> → เลือกสคริปต์นี้</li>
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
