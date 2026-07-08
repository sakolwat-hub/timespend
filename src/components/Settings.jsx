import { useRef, useState } from 'react'
import RateForm from './RateForm'
import WidgetGuide from './WidgetGuide'
import LuxuryWidgetGuide from './LuxuryWidgetGuide'

const THEMES = [
  { id: 'green', color: '#39ff6a' },
  { id: 'cyan', color: '#3ad6ff' },
  { id: 'amber', color: '#ffc24d' },
  { id: 'purple', color: '#b98cff' },
  { id: 'pink', color: '#ff6fae' }
]

export default function Settings({ app, onClose }) {
  const [draft, setDraft] = useState(app.settings)
  const [showWidget, setShowWidget] = useState(false)
  const [showLuxWidget, setShowLuxWidget] = useState(false)
  const fileRef = useRef(null)

  // ปิดโดยไม่บันทึก — คืนธีมกลับเป็นค่าที่บันทึกไว้
  function cancelClose() {
    document.documentElement.dataset.theme = app.settings.theme || 'green'
    onClose()
  }

  async function importFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!confirm('นำเข้าข้อมูลนี้จะแทนที่ของเดิมทั้งหมด — ยืนยันไหม?')) return
      await app.importData(data)
      alert('นำเข้าข้อมูลสำเร็จ')
      onClose()
    } catch {
      alert('ไฟล์ไม่ถูกต้อง — ต้องเป็นไฟล์สำรองจาก TimeSpend')
    }
  }

  function save() {
    app.updateSettings(draft)
    onClose()
  }

  // ส่งออกข้อมูลเป็นไฟล์ JSON (กันข้อมูลหายบน iOS PWA)
  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      settings: app.settings,
      transactions: app.transactions
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timespend-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function resetData() {
    if (confirm('ลบรายการทั้งหมด? การกระทำนี้ย้อนกลับไม่ได้')) {
      app.resetAll()
      onClose()
    }
  }

  if (showWidget) {
    return <WidgetGuide app={app} onClose={() => setShowWidget(false)} />
  }
  if (showLuxWidget) {
    return <LuxuryWidgetGuide app={app} onClose={() => setShowLuxWidget(false)} />
  }

  return (
    <div className="sheet-backdrop" onClick={cancelClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">ตั้งค่า</h2>

        <RateForm draft={draft} setDraft={setDraft} />

        <div className="ess-toggle" style={{ marginBottom: 16 }}>
          <button
            className={app.drainEnabled ? 'active' : ''}
            onClick={() => app.setDrainEnabled(true)}
          >
            เวลาไหลเรียลไทม์
          </button>
          <button
            className={!app.drainEnabled ? 'active' : ''}
            onClick={() => app.setDrainEnabled(false)}
          >
            นาฬิกานิ่ง
          </button>
        </div>

        <div className="theme-picker">
          <span className="theme-label">ธีมสี</span>
          <div className="theme-swatches">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`swatch ${draft.theme === t.id ? 'active' : ''}`}
                style={{ '--sw': t.color }}
                aria-label={t.id}
                onClick={() => {
                  setDraft((d) => ({ ...d, theme: t.id }))
                  document.documentElement.dataset.theme = t.id // preview ทันที
                }}
              />
            ))}
          </div>
        </div>

        <button className="btn btn-earn btn-block" onClick={save}>
          บันทึก
        </button>

        <div className="settings-tools">
          <button className="btn-text" onClick={() => setShowWidget(true)}>
            📱 สร้าง Widget iPhone (นับถอยหลังสด)
          </button>
          <button className="btn-text" onClick={() => setShowLuxWidget(true)}>
            🟡 สร้าง Widget ฟุ่มเฟือย (วงแหวน %)
          </button>
          <button className="btn-text" onClick={exportData}>
            ⭳ ส่งออกข้อมูล (สำรอง)
          </button>
          <button className="btn-text" onClick={() => fileRef.current?.click()}>
            ⭱ นำเข้าข้อมูล (กู้คืน)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={importFile}
          />
          <button className="btn-text danger" onClick={resetData}>
            ลบรายการทั้งหมด
          </button>
        </div>

        <button className="btn-text" onClick={cancelClose}>
          ปิด
        </button>
      </div>
    </div>
  )
}
