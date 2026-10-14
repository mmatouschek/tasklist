import { Task } from '../types/task';

// Audio chime using Web Audio API synthesis (no external assets required, works instantly)
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Nice friendly double chime
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.2); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.4); // D6
    gain2.gain.setValueAtTime(0.25, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.debug('Web Audio Chime blocked or unavailable:', err);
  }
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return getNotificationPermissionStatus();
  }
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        badge: '/favicon.ico',
        icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return true;
    } catch (err) {
      console.warn('Native notification failed, falling back:', err);
    }
  }
  return false;
}

// Track sent notification keys in memory & localStorage to prevent spamming
const NOTIFIED_KEY = 'taskpulse_notified_deadlines';

function getNotifiedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function recordNotificationSent(key: string) {
  try {
    const set = getNotifiedSet();
    set.add(key);
    // Keep set bounded to last 100 entries
    const arr = Array.from(set).slice(-100);
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export interface UpcomingDeadlineAlert {
  task: Task;
  minutesRemaining: number;
  formattedTimeRemaining: string;
}

/**
 * Checks all tasks against their due dates and reminder window.
 * Returns any alerts that just triggered.
 */
export function checkUpcomingDeadlines(
  tasks: Task[],
  onTriggerAlert?: (alert: UpcomingDeadlineAlert) => void
): UpcomingDeadlineAlert[] {
  const alerts: UpcomingDeadlineAlert[] = [];
  const notified = getNotifiedSet();
  const now = Date.now();

  for (const task of tasks) {
    if (task.completed || !task.dueDate) continue;

    const dueTime = new Date(task.dueDate).getTime();
    if (isNaN(dueTime)) continue;

    const diffMinutes = Math.round((dueTime - now) / 60000);
    const reminderLead = task.reminderMinutesBefore ?? 15;

    // Trigger when within lead time window (e.g. <= reminderLead and >= -30 mins past due)
    if (diffMinutes <= reminderLead && diffMinutes >= -30) {
      const notificationId = `${task.id}_${task.dueDate}_${reminderLead}`;

      if (!notified.has(notificationId)) {
        recordNotificationSent(notificationId);

        let timeLabel = '';
        if (diffMinutes > 0) {
          timeLabel = `due in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
        } else if (diffMinutes === 0) {
          timeLabel = 'due right now!';
        } else {
          timeLabel = `overdue by ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) === 1 ? '' : 's'}`;
        }

        const alertItem: UpcomingDeadlineAlert = {
          task,
          minutesRemaining: diffMinutes,
          formattedTimeRemaining: timeLabel,
        };

        alerts.push(alertItem);

        // Send system notification
        sendLocalNotification(`Task Deadline Alert: ${task.title}`, {
          body: `Priority: ${task.priority.toUpperCase()} • ${timeLabel}`,
          tag: `task-deadline-${task.id}`,
        });

        // Play subtle audio alert
        playNotificationChime();

        if (onTriggerAlert) {
          onTriggerAlert(alertItem);
        }
      }
    }
  }

  return alerts;
}
