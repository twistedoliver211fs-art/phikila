import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "phikila-offline";
const DB_VERSION = 1;

export interface OfflineAttendance {
  id: string;
  school_id: string;
  class_id: string;
  date: string;
  student_id: string;
  status: "present" | "absent" | "late" | "excused";
  recorded_by: string;
  synced: boolean;
  created_at: string;
}

export interface OfflineMark {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  score: number;
  recorded_by: string;
  synced: boolean;
  created_at: string;
}

export interface SyncQueueItem {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  created_at: string;
  retries: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Attendance store
        if (!db.objectStoreNames.contains("attendance")) {
          const attendanceStore = db.createObjectStore("attendance", { keyPath: "id" });
          attendanceStore.createIndex("by-school", "school_id");
          attendanceStore.createIndex("by-synced", "synced");
          attendanceStore.createIndex("by-date", "date");
        }

        // Marks store
        if (!db.objectStoreNames.contains("marks")) {
          const marksStore = db.createObjectStore("marks", { keyPath: "id" });
          marksStore.createIndex("by-school", "school_id");
          marksStore.createIndex("by-synced", "synced");
          marksStore.createIndex("by-exam", "exam_id");
        }

        // Timetable cache
        if (!db.objectStoreNames.contains("timetable")) {
          db.createObjectStore("timetable", { keyPath: "id" });
        }

        // Student cache
        if (!db.objectStoreNames.contains("students")) {
          const studentsStore = db.createObjectStore("students", { keyPath: "id" });
          studentsStore.createIndex("by-school", "school_id");
        }

        // Sync queue
        if (!db.objectStoreNames.contains("sync-queue")) {
          const syncStore = db.createObjectStore("sync-queue", { keyPath: "id" });
          syncStore.createIndex("by-created", "created_at");
        }
      },
    });
  }
  return dbPromise;
}

// Attendance operations
export async function saveAttendance(record: OfflineAttendance) {
  const db = await getDB();
  await db.put("attendance", record);
  await addToSyncQueue("attendance", "insert", record as unknown as Record<string, unknown>);
}

export async function getUnsyncedAttendance() {
  const db = await getDB();
  return db.getAllFromIndex("attendance", "by-synced", IDBKeyRange.only(0));
}

export async function markAttendanceSynced(ids: string[]) {
  const db = await getDB();
  const tx = db.transaction("attendance", "readwrite");
  for (const id of ids) {
    const record = await tx.store.get(id);
    if (record) {
      record.synced = 1;
      await tx.store.put(record);
    }
  }
  await tx.done;
}

// Marks operations
export async function saveMark(record: OfflineMark) {
  const db = await getDB();
  await db.put("marks", record);
  await addToSyncQueue("marks", "insert", record as unknown as Record<string, unknown>);
}

export async function getUnsyncedMarks() {
  const db = await getDB();
  return db.getAllFromIndex("marks", "by-synced", IDBKeyRange.only(0));
}

export async function markMarksSynced(ids: string[]) {
  const db = await getDB();
  const tx = db.transaction("marks", "readwrite");
  for (const id of ids) {
    const record = await tx.store.get(id);
    if (record) {
      record.synced = 1;
      await tx.store.put(record);
    }
  }
  await tx.done;
}

// Timetable cache
export async function cacheTimetable(data: Record<string, unknown>[]) {
  const db = await getDB();
  const tx = db.transaction("timetable", "readwrite");
  await tx.store.clear();
  for (const item of data) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getCachedTimetable() {
  const db = await getDB();
  return db.getAll("timetable");
}

// Student cache
export async function cacheStudents(data: Record<string, unknown>[]) {
  const db = await getDB();
  const tx = db.transaction("students", "readwrite");
  await tx.store.clear();
  for (const item of data) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getCachedStudents() {
  const db = await getDB();
  return db.getAll("students");
}

// Sync queue
async function addToSyncQueue(table: string, operation: "insert" | "update" | "delete", data: Record<string, unknown>) {
  const db = await getDB();
  await db.put("sync-queue", {
    id: `${table}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    table,
    operation,
    data,
    created_at: new Date().toISOString(),
    retries: 0,
  });
}

export async function getSyncQueue() {
  const db = await getDB();
  return db.getAll("sync-queue");
}

export async function removeSyncQueueItem(id: string) {
  const db = await getDB();
  await db.delete("sync-queue", id);
}

export async function clearSyncQueue() {
  const db = await getDB();
  await db.clear("sync-queue");
}

export async function getSyncQueueCount() {
  const db = await getDB();
  return db.count("sync-queue");
}
