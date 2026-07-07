import { useState } from 'react'
import { useApp } from './useApp'
import ClockScreen from './components/ClockScreen'
import AmountSheet from './components/AmountSheet'
import Settings from './components/Settings'
import Onboarding from './components/Onboarding'
import History from './components/History'
import Goals from './components/Goals'
import ShareCard from './components/ShareCard'

export default function App() {
  const app = useApp()
  const [sheet, setSheet] = useState(null) // 'spend' | 'earn' | null
  const [showSettings, setShowSettings] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [view, setView] = useState('clock') // 'clock' | 'history' | 'goals'

  if (app.loading) {
    return <div className="screen center muted">กำลังโหลด…</div>
  }

  if (!app.settings.onboarded) {
    return <Onboarding app={app} />
  }

  return (
    <div className="app">
      {view === 'history' && (
        <History
          app={app}
          onClose={() => setView('clock')}
          onShare={() => setShowShare(true)}
        />
      )}
      {view === 'goals' && <Goals app={app} onClose={() => setView('clock')} />}
      {view === 'clock' && (
        <ClockScreen
          app={app}
          onSpend={() => setSheet('spend')}
          onEarn={() => setSheet('earn')}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHistory={() => setView('history')}
          onOpenGoals={() => setView('goals')}
        />
      )}

      {sheet && (
        <AmountSheet type={sheet} app={app} onClose={() => setSheet(null)} />
      )}

      {showSettings && (
        <Settings app={app} onClose={() => setShowSettings(false)} />
      )}

      {showShare && <ShareCard app={app} onClose={() => setShowShare(false)} />}
    </div>
  )
}
