import { useState } from 'react'
import { computeRate } from '../lib/time'
import RateForm from './RateForm'

export default function Onboarding({ app }) {
  const [draft, setDraft] = useState(app.settings)
  const canStart = computeRate(draft) > 0

  function start() {
    app.updateSettings({ ...draft, onboarded: true })
  }

  return (
    <div className="screen onboarding">
      <div className="onboard-hero">
        <div className="onboard-icon">◷</div>
        <h1>TimeSpend</h1>
        <p className="muted">
          ทุกครั้งที่ใช้เงิน คือการจ่ายด้วย <b>เวลาชีวิต</b>
          <br />
          ตั้งค่าอัตราแลกของคุณก่อนเริ่ม
        </p>
      </div>

      <RateForm draft={draft} setDraft={setDraft} />

      <button className="btn btn-earn btn-block" disabled={!canStart} onClick={start}>
        เริ่มต้นใช้งาน
      </button>
      <p className="onboard-note muted">
        ข้อมูลทั้งหมดเก็บในเครื่องคุณ 100% — ไม่มีเซิร์ฟเวอร์ ไม่ต้องล็อกอิน
      </p>
    </div>
  )
}
