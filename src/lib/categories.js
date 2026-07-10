// หมวดหมู่ที่ผู้ใช้เพิ่มเอง เก็บใน localStorage (แยกตามประเภท spend/earn)

const KEY = 'timespend.categories'

export function loadCategories() {
  try {
    const raw = localStorage.getItem(KEY)
    const c = raw ? JSON.parse(raw) : null
    return { spend: c?.spend || [], earn: c?.earn || [] }
  } catch {
    return { spend: [], earn: [] }
  }
}

export function saveCategories(c) {
  localStorage.setItem(KEY, JSON.stringify(c))
}
