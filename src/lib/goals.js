// เป้าหมายออม เก็บใน localStorage (รายการเล็กๆ)

const KEY = 'timespend.goals'

export function loadGoals() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGoals(goals) {
  localStorage.setItem(KEY, JSON.stringify(goals))
}
