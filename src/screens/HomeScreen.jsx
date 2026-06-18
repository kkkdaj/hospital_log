import { useState } from 'react'
import { useApp } from '../context/AppContext'

const YEARS  = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i))
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

export default function HomeScreen() {
  const { profile, updateProfile, records, family } = useApp()
  const [showEdit, setShowEdit] = useState(false)

  const isEmpty =
    !profile.bloodType &&
    !profile.birthYear &&
    !profile.height &&
    !profile.weight &&
    profile.conditions.length === 0 &&
    profile.allergies.length === 0 &&
    profile.currentMedications.length === 0

  const birthDate = profile.birthYear && profile.birthMonth && profile.birthDay
    ? `${profile.birthYear}년 ${profile.birthMonth}월 ${profile.birthDay}일`
    : null

  const age = (() => {
    if (!profile.birthYear || !profile.birthMonth || !profile.birthDay) return null
    const today = new Date()
    const birth = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay)
    let a = today.getFullYear() - birth.getFullYear()
    const notYetBirthday =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    if (notYetBirthday) a--
    return a
  })()

  return (
    <div className="sp space-y-3">

      <p className="text-base font-semibold text-gray-500">나의 기록 현황</p>

      <div className="rounded-2xl text-white text-center" style={{ padding: '20px 24px', backgroundColor: '#3b82f6' }}>
        <div className="flex gap-4 justify-center">
          <SummaryItem count={records.length} label="진료 기록" />
          <div className="w-px bg-white/30" />
          <SummaryItem count={family.length} label="가족력" />
        </div>
      </div>

      <hr style={{ borderColor: '#e5e7eb', borderTopWidth: '3px', margin: '4px 0' }} />

      <div className="flex items-center justify-between px-1">
        <p className="text-base font-semibold text-gray-500">나의 건강 정보</p>
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1 text-xs text-blue-500 font-semibold bg-blue-50 px-3 py-1.5 rounded-full"
        >
          ✏️ 편집
        </button>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-gray-500 font-medium text-sm">건강 정보를 입력해보세요</p>
          <p className="text-gray-400 text-xs mt-1">병원 방문 시 빠르게 확인할 수 있어요</p>
          <button
            onClick={() => setShowEdit(true)}
            className="mt-4 bg-blue-500 text-white text-sm px-5 py-2 rounded-full font-medium"
          >
            지금 입력하기
          </button>
        </div>
      ) : (
        <>
          <ProfileCard icon="🩸" title="혈액형" color="bg-red-50 border-red-100" iconBg="bg-red-100">
            {profile.bloodType
              ? <p className="text-lg font-bold text-red-500">{profile.bloodType}</p>
              : <p className="text-sm text-gray-400">미입력</p>}
          </ProfileCard>

          <ProfileCard icon="🎂" title="생년월일" color="bg-pink-50 border-pink-100" iconBg="bg-pink-100">
            {birthDate ? (
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold text-pink-600">{birthDate}</p>
                <p className="text-sm text-pink-400">만 {age}세</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">미입력</p>
            )}
          </ProfileCard>

          <ProfileCard icon="📏" title="키 / 몸무게" color="bg-green-50 border-green-100" iconBg="bg-green-100">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">키</p>
                {profile.height
                  ? <p className="text-lg font-bold text-green-600">{profile.height}<span className="text-sm font-normal ml-0.5">cm</span></p>
                  : <p className="text-sm text-gray-400">미입력</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">몸무게</p>
                {profile.weight
                  ? <p className="text-lg font-bold text-green-600">{profile.weight}<span className="text-sm font-normal ml-0.5">kg</span></p>
                  : <p className="text-sm text-gray-400">미입력</p>}
              </div>
            </div>
          </ProfileCard>

          <ProfileCard icon="🏥" title="기저질환" color="bg-orange-50 border-orange-100" iconBg="bg-orange-100">
            <TagList items={profile.conditions} color="bg-orange-100 text-orange-700" empty="없음" />
          </ProfileCard>

          <ProfileCard icon="⚠️" title="알레르기" color="bg-yellow-50 border-yellow-100" iconBg="bg-yellow-100">
            <TagList items={profile.allergies} color="bg-yellow-100 text-yellow-700" empty="없음" />
          </ProfileCard>

          <ProfileCard icon="💊" title="복용 중인 약" color="bg-blue-50 border-blue-100" iconBg="bg-blue-100">
            {profile.currentMedications.length === 0 ? (
              <p className="text-sm text-gray-400">없음</p>
            ) : (
              <ul className="space-y-1.5">
                {profile.currentMedications.map((item, i) => (
                  <li key={i} className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </ProfileCard>
        </>
      )}

      {showEdit && (
        <EditModal
          profile={profile}
          onSave={(updated) => { updateProfile(updated); setShowEdit(false) }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}

function SummaryItem({ count, label }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold leading-none">{count}</p>
      <p className="text-xs opacity-75 mt-0.5">{label}</p>
    </div>
  )
}

function ProfileCard({ icon, title, color, iconBg, children }) {
  return (
    <div className={`rounded-2xl border sp-card ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${iconBg}`}>{icon}</span>
        <span className="text-sm font-semibold text-gray-600">{title}</span>
      </div>
      {children}
    </div>
  )
}

function TagList({ items, color, empty }) {
  if (items.length === 0) return <p className="text-sm text-gray-400">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{item}</span>
      ))}
    </div>
  )
}

function EditModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    bloodType:          profile.bloodType ?? '',
    birthYear:          profile.birthYear ?? '',
    birthMonth:         profile.birthMonth ?? '',
    birthDay:           profile.birthDay ?? '',
    height:             profile.height ?? '',
    weight:             profile.weight ?? '',
    conditions:         profile.conditions.join(', '),
    allergies:          profile.allergies.join(', '),
    currentMedications: profile.currentMedications.join(', '),
  })

  function toArray(str) {
    return str.split(',').map((s) => s.trim()).filter(Boolean)
  }

  function handleSave() {
    onSave({
      bloodType:          form.bloodType,
      birthYear:          form.birthYear,
      birthMonth:         form.birthMonth,
      birthDay:           form.birthDay,
      height:             form.height,
      weight:             form.weight,
      conditions:         toArray(form.conditions),
      allergies:          toArray(form.allergies),
      currentMedications: toArray(form.currentMedications),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-t-3xl px-6 pt-6 pb-8 space-y-4 overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-800">건강 정보 편집</h3>
          <button onClick={onClose} className="text-gray-400 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100">✕</button>
        </div>

        <Field label="혈액형">
          <select value={form.bloodType} onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value }))} className="input">
            <option value="">선택하세요</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="생년월일">
          <div className="flex gap-2">
            <select value={form.birthYear} onChange={(e) => setForm((p) => ({ ...p, birthYear: e.target.value }))} className="input">
              <option value="">년도</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select value={form.birthMonth} onChange={(e) => setForm((p) => ({ ...p, birthMonth: e.target.value }))} className="input">
              <option value="">월</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select value={form.birthDay} onChange={(e) => setForm((p) => ({ ...p, birthDay: e.target.value }))} className="input">
              <option value="">일</option>
              {DAYS.map((d) => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>
        </Field>

        <div className="flex gap-3">
          <Field label="키 (cm)">
            <input type="number" placeholder="예: 170" value={form.height}
              onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))} className="input" />
          </Field>
          <Field label="몸무게 (kg)">
            <input type="number" placeholder="예: 65" value={form.weight}
              onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} className="input" />
          </Field>
        </div>

        <Field label="기저질환 (쉼표로 구분)">
          <input type="text" placeholder="예: 고혈압, 당뇨" value={form.conditions}
            onChange={(e) => setForm((p) => ({ ...p, conditions: e.target.value }))} className="input" />
        </Field>
        <Field label="알레르기 (쉼표로 구분)">
          <input type="text" placeholder="예: 페니실린, 땅콩" value={form.allergies}
            onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} className="input" />
        </Field>
        <Field label="복용 중인 약 (쉼표로 구분)">
          <input type="text" placeholder="예: 아스피린 100mg" value={form.currentMedications}
            onChange={(e) => setForm((p) => ({ ...p, currentMedications: e.target.value }))} className="input" />
        </Field>

        <button onClick={handleSave} className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm">
          저장하기
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
