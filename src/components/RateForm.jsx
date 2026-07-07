import { lifeRate, incomeDays, formatMoney } from '../lib/time'

// ฟอร์มตั้งค่า ใช้ร่วมกันทั้ง Onboarding และ Settings
export default function RateForm({ draft, setDraft }) {
  const rate = lifeRate(draft)
  const days = incomeDays(draft)

  function set(patch) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  return (
    <div className="rate-form">
      <div className="mode-toggle">
        <button
          className={draft.mode === 'monthly' ? 'active' : ''}
          onClick={() => set({ mode: 'monthly' })}
        >
          เงินเดือน
        </button>
        <button
          className={draft.mode === 'hourly' ? 'active' : ''}
          onClick={() => set({ mode: 'hourly' })}
        >
          ค่าแรง/ชม.
        </button>
      </div>

      {draft.mode === 'monthly' ? (
        <label className="field">
          <span>เงินเดือน (บาท)</span>
          <input
            type="text"
            inputMode="numeric"
            value={draft.monthlyIncome}
            onChange={(e) =>
              set({ monthlyIncome: Number(e.target.value.replace(/[^0-9]/g, '')) || 0 })
            }
          />
        </label>
      ) : (
        <div className="field-row">
          <label className="field">
            <span>ค่าแรง/ชม. (บาท)</span>
            <input
              type="text"
              inputMode="numeric"
              value={draft.hourlyRate}
              onChange={(e) =>
                set({ hourlyRate: Number(e.target.value.replace(/[^0-9]/g, '')) || 0 })
              }
            />
          </label>
          <label className="field">
            <span>ชม./วัน</span>
            <input
              type="text"
              inputMode="numeric"
              value={draft.workHoursPerDay}
              onChange={(e) =>
                set({ workHoursPerDay: Number(e.target.value.replace(/[^0-9]/g, '')) || 0 })
              }
            />
          </label>
        </div>
      )}

      <label className="field">
        <span>ค่ากินอยู่/เดือน (บาท) — ค่าใช้จ่ายที่ต้องมีเพื่อดำรงชีวิต</span>
        <input
          type="text"
          inputMode="numeric"
          value={draft.costOfLiving}
          onChange={(e) =>
            set({ costOfLiving: Number(e.target.value.replace(/[^0-9]/g, '')) || 0 })
          }
        />
      </label>

      <div className="rate-result">
        เงินเดือนซื้อชีวิตได้ ≈ <b>{days.toFixed(1)} วัน</b>
        <span className="rate-sub"> · {formatMoney(rate)} ฿ = ชีวิต 1 ชม.</span>
      </div>
    </div>
  )
}
