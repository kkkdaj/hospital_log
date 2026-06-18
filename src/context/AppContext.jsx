import { createContext, useContext, useState } from 'react'

const STORAGE_KEYS = {
  profile: 'hospital_profile',
  records: 'hospital_records',
  family: 'hospital_family',
}

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() =>
    loadFromStorage(STORAGE_KEYS.profile, {
      bloodType: '',
      birthYear: '', birthMonth: '', birthDay: '',
      height: '',
      weight: '',
      conditions: [],
      allergies: [],
      currentMedications: [],
    })
  )

  const [records, setRecords] = useState(() =>
    loadFromStorage(STORAGE_KEYS.records, [])
  )

  const [family, setFamily] = useState(() =>
    loadFromStorage(STORAGE_KEYS.family, [])
  )

  function updateProfile(newProfile) {
    setProfile(newProfile)
    saveToStorage(STORAGE_KEYS.profile, newProfile)
  }

  function addRecord(record) {
    const newRecord = { ...record, id: Date.now().toString(), createdAt: new Date().toISOString() }
    const updated = [newRecord, ...records]
    setRecords(updated)
    saveToStorage(STORAGE_KEYS.records, updated)
  }

  function updateRecord(id, data) {
    const updated = records.map((r) => (r.id === id ? { ...r, ...data } : r))
    setRecords(updated)
    saveToStorage(STORAGE_KEYS.records, updated)
  }

  function deleteRecord(id) {
    const updated = records.filter((r) => r.id !== id)
    setRecords(updated)
    saveToStorage(STORAGE_KEYS.records, updated)
  }

  function addFamily(entry) {
    const newEntry = { ...entry, id: Date.now().toString() }
    const updated = [newEntry, ...family]
    setFamily(updated)
    saveToStorage(STORAGE_KEYS.family, updated)
  }

  function deleteFamily(id) {
    const updated = family.filter((f) => f.id !== id)
    setFamily(updated)
    saveToStorage(STORAGE_KEYS.family, updated)
  }

  return (
    <AppContext.Provider value={{
      profile, updateProfile,
      records, addRecord, updateRecord, deleteRecord,
      family, addFamily, deleteFamily,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
