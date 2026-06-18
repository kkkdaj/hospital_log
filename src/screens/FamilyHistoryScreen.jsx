import { useState } from 'react'
import { useApp } from '../context/AppContext'

const RELATIONS = ['아버지', '어머니', '친할아버지', '친할머니', '외할아버지', '외할머니', '형제/자매', '기타']

const RELATION_EMOJI = {
  '아버지': '👨', '어머니': '👩',
  '친할아버지': '👴', '친할머니': '👵',
  '외할아버지': '👴', '외할머니': '👵',
  '형제/자매': '🧑', '기타': '👤',
}

export default function FamilyHistoryScreen() {
  const { family, addFamily, deleteFamily } = useApp()
  const [activeTab, setActiveTab] = useState('relation')
  const [view, setView] = useState('list')

  if (view === 'form') {
    return (
      <FamilyForm
        onBack={() => setView('list')}
        onSave={(data) => { addFamily(data); setView('list') }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex bg-white border-b border-gray-200">
        <TabBtn label="관계별" active={activeTab === 'relation'} onClick={() => setActiveTab('relation')} />
        <TabBtn label="질병별" active={activeTab === 'disease'} onClick={() => setActiveTab('disease')} />
      </div>

      <div className="flex-1 overflow-y-auto sp-list">
        {family.length === 0 ? (
          <EmptyState />
        ) : activeTab === 'relation' ? (
          <ByRelationView records={family} onDelete={deleteFamily} />
        ) : (
          <ByDiseaseView records={family} onDelete={deleteFamily} />
        )}
      </div>

      <button
        onClick={() => setView('form')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full text-2xl shadow-lg flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ paddingTop: '9px', paddingBottom: '9px' }}
      className={`flex-1 text-sm font-medium border-b-2 transition-colors
        ${active ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400'}`}
    >
      {label}
    </button>
  )
}

function ByRelationView({ records, onDelete }) {
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.relation]) acc[r.relation] = []
    acc[r.relation].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([relation, items]) => (
        <div key={relation} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-100" style={{ padding: '8px 20px' }}>
            <span className="text-xl">{RELATION_EMOJI[relation] ?? '👤'}</span>
            <span className="text-sm font-bold text-gray-700">{relation}</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <FamilyItem key={item.id} item={item} onDelete={onDelete} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ByDiseaseView({ records, onDelete }) {
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.disease]) acc[r.disease] = []
    acc[r.disease].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([disease, items]) => (
        <div key={disease} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-purple-50 border-b border-purple-100" style={{ padding: '8px 20px' }}>
            <span className="text-sm font-bold text-purple-700">{disease}</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <FamilyItem key={item.id} item={item} showRelation onDelete={onDelete} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function FamilyItem({ item, showRelation, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <li className="sp-item flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {showRelation && <span className="text-lg mt-0.5">{RELATION_EMOJI[item.relation] ?? '👤'}</span>}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {showRelation ? item.relation : item.disease}
            </p>
            {item.memo && <p className="text-xs text-gray-400 mt-0.5">{item.memo}</p>}
          </div>
        </div>
        <button onClick={() => setConfirmDelete(true)} className="text-gray-300 text-lg shrink-0 hover:text-red-400">✕</button>
      </li>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <p className="text-gray-800 font-semibold text-center mb-1">삭제할까요?</p>
            <p className="text-gray-400 text-sm text-center mb-5">삭제하면 복구할 수 없어요.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm">취소</button>
              <button onClick={() => onDelete(item.id)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium">삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FamilyForm({ onBack, onSave }) {
  const [form, setForm] = useState({ relation: '', disease: '', memo: '' })
  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  function handleSave() {
    if (!form.relation || !form.disease) return
    onSave(form)
  }

  return (
    <div className="sp">
      <button onClick={onBack} className="text-blue-500 text-sm mb-4 block">← 목록으로</button>
      <h2 className="text-lg font-bold text-gray-800 mb-4">가족력 추가</h2>
      <div className="space-y-3">
        <Field label="가족 관계 *">
          <select value={form.relation} onChange={(e) => update('relation', e.target.value)} className="input">
            <option value="">선택하세요</option>
            {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="질병명 *">
          <input type="text" placeholder="예: 고혈압" value={form.disease} onChange={(e) => update('disease', e.target.value)} className="input" />
        </Field>
        <Field label="메모">
          <textarea placeholder="진단 시기, 경과 등 추가 정보" value={form.memo} onChange={(e) => update('memo', e.target.value)} rows={3} className="input resize-none" />
        </Field>
      </div>
      <button onClick={handleSave}
        className={`w-full mt-6 py-3 rounded-xl font-medium text-sm text-white
          ${!form.relation || !form.disease ? 'bg-gray-300' : 'bg-blue-500'}`}>
        저장
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-4xl mb-3">👨‍👩‍👧</p>
      <p className="text-gray-500 font-medium">아직 가족력 기록이 없어요.</p>
      <p className="text-gray-400 text-sm mt-1">+ 버튼을 눌러 첫 기록을 추가해보세요.</p>
    </div>
  )
}
