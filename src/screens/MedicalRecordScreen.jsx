import { useState } from 'react'
import { useApp } from '../context/AppContext'

const DEPARTMENTS = ['내과', '외과', '정형외과', '이비인후과', '피부과', '안과', '산부인과', '소아과', '기타']

export default function MedicalRecordScreen() {
  const { records, addRecord, updateRecord, deleteRecord } = useApp()
  const [view, setView] = useState('list')           // 'list' | 'form' | 'detail' | 'edit'
  const [activeTab, setActiveTab] = useState('timeline')
  const [sortDesc, setSortDesc] = useState(true)     // true: 최신순, false: 오래된순
  const [selectedRecord, setSelectedRecord] = useState(null)

  if (view === 'form') {
    return (
      <RecordForm
        onBack={() => setView('list')}
        onSave={(data) => { addRecord(data); setView('list') }}
      />
    )
  }

  if (view === 'edit' && selectedRecord) {
    return (
      <RecordForm
        initial={selectedRecord}
        onBack={() => setView('detail')}
        onSave={(data) => { updateRecord(selectedRecord.id, data); setView('list') }}
      />
    )
  }

  if (view === 'detail' && selectedRecord) {
    const current = records.find((r) => r.id === selectedRecord.id) ?? selectedRecord
    return (
      <RecordDetail
        record={current}
        onBack={() => setView('list')}
        onEdit={() => setView('edit')}
        onDelete={() => { deleteRecord(current.id); setView('list') }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex bg-white border-b border-gray-200">
        <TabBtn label="날짜순" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
        <TabBtn label="진료과별" active={activeTab === 'department'} onClick={() => setActiveTab('department')} />
      </div>

      <div className="flex-1 overflow-y-auto sp-list">
        {records.length === 0 ? (
          <EmptyState message="아직 진료 기록이 없어요." sub="+ 버튼을 눌러 첫 기록을 추가해보세요." />
        ) : activeTab === 'timeline' ? (
          <>
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setSortDesc((v) => !v)}
                className="text-xs text-gray-500 font-medium bg-white rounded-full" style={{ padding: '5px 10px', border: '1.5px solid #3b82f6' }}
              >
                {sortDesc ? '↓ 최신순' : '↑ 오래된순'}
              </button>
            </div>
            <TimelineView records={records} sortDesc={sortDesc} onSelect={(r) => { setSelectedRecord(r); setView('detail') }} />
          </>
        ) : (
          <DepartmentView records={records} onSelect={(r) => { setSelectedRecord(r); setView('detail') }} />
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

function TimelineView({ records, sortDesc, onSelect }) {
  const sorted = [...records].sort((a, b) =>
    sortDesc ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  )
  return <div className="space-y-3">{sorted.map((r) => <RecordCard key={r.id} record={r} onSelect={onSelect} />)}</div>
}

function DepartmentView({ records, onSelect }) {
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.department]) acc[r.department] = []
    acc[r.department].push(r)
    return acc
  }, {})
  const entries = Object.entries(grouped)
  return (
    <div>
      {entries.map(([dept, recs], i) => (
        <div key={dept}>
          {i !== 0 && <hr style={{ borderColor: '#e5e7eb', borderTopWidth: '3px', margin: '16px 0' }} />}
          <h3 className="text-base font-semibold text-gray-600 mb-2">{dept}</h3>
          <div className="space-y-2">{recs.map((r) => <RecordCard key={r.id} record={r} onSelect={onSelect} />)}</div>
        </div>
      ))}
    </div>
  )
}

function RecordCard({ record, onSelect }) {
  return (
    <button
      onClick={() => onSelect(record)}
      className="w-full bg-white rounded-2xl sp-card border border-gray-100 shadow-sm text-left"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">{record.date}</p>
          <p className="font-semibold text-gray-800 text-sm">{record.diagnosis}</p>
          <p className="text-xs text-gray-500 mt-1">{record.hospitalName}</p>
        </div>
        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium shrink-0">
          {record.department}
        </span>
      </div>
      {record.prescription.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {record.prescription.map((p, i) => (
            <span key={i} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">💊 {p}</span>
          ))}
        </div>
      )}
    </button>
  )
}

function RecordDetail({ record, onBack, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="sp">
      <button onClick={onBack} className="text-blue-500 text-sm mb-4 block">← 목록으로</button>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full font-medium">{record.department}</span>
          <span className="text-sm text-gray-400">{record.date}</span>
        </div>
        <DetailRow label="병원" value={record.hospitalName} />
        <DetailRow label="병명 / 증상" value={record.diagnosis} />
        {record.prescription.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">처방약</p>
            <ul className="space-y-1">
              {record.prescription.map((p, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />{p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {record.memo && (
          <div>
            <p className="text-xs text-gray-400 mb-1">메모</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{record.memo}</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={onEdit} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">
            수정
          </button>
          <button onClick={() => setConfirmDelete(true)} className="flex-1 border border-red-200 text-red-400 py-2.5 rounded-xl text-sm font-medium">
            삭제
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <p className="text-gray-800 font-semibold text-center mb-1">기록을 삭제할까요?</p>
            <p className="text-gray-400 text-sm text-center mb-5">삭제하면 복구할 수 없어요.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm">취소</button>
              <button onClick={onDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  )
}

function RecordForm({ initial, onBack, onSave }) {
  const [form, setForm] = useState({
    date: initial?.date ?? new Date().toISOString().split('T')[0],
    hospitalName: initial?.hospitalName ?? '',
    department: initial?.department ?? '',
    diagnosis: initial?.diagnosis ?? '',
    prescription: initial?.prescription?.join(', ') ?? '',
    memo: initial?.memo ?? '',
  })

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  function handleSave() {
    if (!form.hospitalName || !form.department || !form.diagnosis) return
    onSave({
      date: form.date,
      hospitalName: form.hospitalName,
      department: form.department,
      diagnosis: form.diagnosis,
      prescription: form.prescription.split(',').map((s) => s.trim()).filter(Boolean),
      memo: form.memo,
    })
  }

  return (
    <div className="sp">
      <button onClick={onBack} className="text-blue-500 text-sm mb-4 block">← 목록으로</button>
      <h2 className="text-lg font-bold text-gray-800 mb-4">{initial ? '진료 기록 수정' : '진료 기록 추가'}</h2>
      <div className="space-y-3">
        <Field label="방문 날짜">
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="input" />
        </Field>
        <Field label="병원명 *">
          <input type="text" placeholder="예: 서울대학교병원" value={form.hospitalName} onChange={(e) => update('hospitalName', e.target.value)} className="input" />
        </Field>
        <Field label="진료과 *">
          <select value={form.department} onChange={(e) => update('department', e.target.value)} className="input">
            <option value="">선택하세요</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="병명 / 증상 *">
          <input type="text" placeholder="예: 급성 위염" value={form.diagnosis} onChange={(e) => update('diagnosis', e.target.value)} className="input" />
        </Field>
        <Field label="처방약 (쉼표로 구분)">
          <input type="text" placeholder="예: 아목시실린 500mg, 이부프로펜 400mg" value={form.prescription} onChange={(e) => update('prescription', e.target.value)} className="input" />
        </Field>
        <Field label="메모">
          <textarea placeholder="추가로 기억할 내용" value={form.memo} onChange={(e) => update('memo', e.target.value)} rows={3} className="input resize-none" />
        </Field>
      </div>
      <button onClick={handleSave}
        className={`w-full mt-6 py-3 rounded-xl font-medium text-sm text-white
          ${!form.hospitalName || !form.department || !form.diagnosis ? 'bg-gray-300' : 'bg-blue-500'}`}>
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

function EmptyState({ message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-4xl mb-3">🏥</p>
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-1">{sub}</p>
    </div>
  )
}
