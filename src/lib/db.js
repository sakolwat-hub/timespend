// เก็บรายการธุรกรรมใน IndexedDB (offline-first ไม่มี server)
import { openDB } from 'idb'

const DB_NAME = 'timespend'
const STORE = 'transactions'

function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp')
      }
    }
  })
}

export async function getAllTransactions() {
  const db = await getDB()
  return db.getAllFromIndex(STORE, 'timestamp')
}

export async function addTransaction(tx) {
  const db = await getDB()
  await db.put(STORE, tx)
}

export async function deleteTransaction(id) {
  const db = await getDB()
  await db.delete(STORE, id)
}

export async function clearAllTransactions() {
  const db = await getDB()
  await db.clear(STORE)
}
