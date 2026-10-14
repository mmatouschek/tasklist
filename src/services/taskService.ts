import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Task, Priority } from '../types/task';

const TASKS_PATH = 'tasks';

export function getDefaultDueDateTime(): string {
  const d = new Date();
  d.setHours(18, 0, 0, 0); // 6:00 PM today by default
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function subscribeToTasks(
  userId: string,
  onTasks: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    onTasks([]);
    return () => {};
  }

  const q = query(collection(db, TASKS_PATH), where('userId', '==', userId));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tasks.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title || '',
          description: data.description || '',
          priority: (data.priority as Priority) || 'medium',
          category: data.category || 'General',
          tags: Array.isArray(data.tags) ? data.tags : [],
          dueDate: data.dueDate || getDefaultDueDateTime(),
          reminderMinutesBefore: typeof data.reminderMinutesBefore === 'number' ? data.reminderMinutesBefore : 15,
          completed: !!data.completed,
          completedAt: data.completedAt || null,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      onTasks(tasks);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      }
      handleFirestoreError(error, OperationType.GET, TASKS_PATH);
    }
  );

  return unsubscribe;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  category: string;
  tags?: string[];
  dueDate: string; // Required
  reminderMinutesBefore?: number;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<string> {
  const trimmedTitle = input.title.trim().slice(0, 200);
  if (!trimmedTitle) {
    throw new Error('Task title cannot be empty.');
  }

  const taskDocRef = doc(collection(db, TASKS_PATH));
  const now = new Date().toISOString();

  const sanitizedTags = (input.tags || [])
    .map((t) => t.trim().replace(/^#/, ''))
    .filter(Boolean)
    .slice(0, 10);

  const finalDueDate = input.dueDate?.trim() || getDefaultDueDateTime();

  const newTask: Task = {
    id: taskDocRef.id,
    userId,
    title: trimmedTitle,
    description: (input.description || '').slice(0, 2000),
    priority: input.priority || 'medium',
    category: (input.category || 'General').trim().slice(0, 50),
    tags: sanitizedTags,
    dueDate: finalDueDate,
    reminderMinutesBefore: input.reminderMinutesBefore ?? 15,
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(taskDocRef, newTask);
    return taskDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${TASKS_PATH}/${taskDocRef.id}`);
  }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const taskDocRef = doc(db, TASKS_PATH, taskId);
  const now = new Date().toISOString();

  const safeUpdates: Record<string, unknown> = {
    ...updates,
    updatedAt: now,
  };

  if (updates.title) {
    safeUpdates.title = updates.title.trim().slice(0, 200);
  }
  if (updates.description !== undefined) {
    safeUpdates.description = updates.description.slice(0, 2000);
  }
  if (updates.category) {
    safeUpdates.category = updates.category.trim().slice(0, 50);
  }
  if (updates.tags) {
    safeUpdates.tags = updates.tags
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)
      .slice(0, 10);
  }
  if (updates.dueDate) {
    safeUpdates.dueDate = updates.dueDate;
  }

  try {
    await updateDoc(taskDocRef, safeUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TASKS_PATH}/${taskId}`);
  }
}

export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const taskDocRef = doc(db, TASKS_PATH, taskId);
  const now = new Date().toISOString();

  try {
    await updateDoc(taskDocRef, {
      completed,
      completedAt: completed ? now : null,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TASKS_PATH}/${taskId}`);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const taskDocRef = doc(db, TASKS_PATH, taskId);
  try {
    await deleteDoc(taskDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TASKS_PATH}/${taskId}`);
  }
}

export async function bulkDeleteCompleted(taskIds: string[]): Promise<void> {
  const deletePromises = taskIds.map((id) => deleteTask(id));
  await Promise.all(deletePromises);
}
