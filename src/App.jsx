import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import HomeScreen from './screens/HomeScreen'
import MedicalRecordScreen from './screens/MedicalRecordScreen'
import FamilyHistoryScreen from './screens/FamilyHistoryScreen'

const TABS = [
  { id: 'home',    label: '홈',     icon: '🏠', title: '내 건강 프로필' },
  { id: 'records', label: '진료기록', icon: '🏥', title: '진료 기록' },
  { id: 'family',  label: '가족력',  icon: '👨‍👩‍👧', title: '가족력' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const currentTab = TABS.find((t) => t.id === activeTab)

  return (
    <AppProvider>
      <div className="flex justify-center min-h-screen bg-slate-300">
        <div className="relative w-full max-w-sm min-h-screen bg-gray-50 flex flex-col shadow-2xl">

          {/* 헤더 */}
          <header className="bg-white border-b border-gray-100 flex items-center justify-between" style={{ paddingTop: '15px', paddingBottom: '12px', paddingLeft: '24px', paddingRight: '20px' }}>
            <div>
              <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-0.5">My Hospital Log</p>
              <h1 className="text-lg font-bold text-gray-800">{currentTab.title}</h1>
            </div>
            <span className="text-2xl">{currentTab.icon}</span>
          </header>

          {/* 콘텐츠 영역 */}
          <main className="flex-1 overflow-y-auto pb-20">
            {activeTab === 'home'    && <HomeScreen />}
            {activeTab === 'records' && <MedicalRecordScreen />}
            {activeTab === 'family'  && <FamilyHistoryScreen />}
          </main>

          {/* 하단 탭 네비게이션 */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-all
                  ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <span className={`text-xl transition-transform ${activeTab === tab.id ? 'scale-110' : 'scale-100'}`}>
                  {tab.icon}
                </span>
                <span className={activeTab === tab.id ? 'font-semibold' : ''}>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}
              </button>
            ))}
          </nav>

        </div>
      </div>
    </AppProvider>
  )
}
