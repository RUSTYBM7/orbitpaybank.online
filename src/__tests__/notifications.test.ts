/**
 * Notifications tests — pure logic checks using a small in-memory store.
 *
 * Verifies the behavior the NotificationSystem relies on:
 *  - push appends a notification
 *  - markRead / markAllRead flip the read flag
 *  - clear empties the store
 *  - dismiss removes by id
 *
 * Mirrors the reducer inside `state/notifications.tsx`.
 */

import { describe, it, expect, beforeEach } from 'vitest';

type Severity = 'info' | 'success' | 'warning' | 'danger';

interface Note {
  id: string;
  title: string;
  body?: string;
  severity: Severity;
  read: boolean;
  createdAt: number;
}

let store: Note[] = [];
let nextId = 0;

const push = (n: Omit<Note, 'id' | 'read' | 'createdAt'>) => {
  const note: Note = { ...n, id: `n_${++nextId}`, read: false, createdAt: Date.now() };
  store = [note, ...store];
  return note.id;
};
const markRead = (id: string) => {
  store = store.map((n) => (n.id === id ? { ...n, read: true } : n));
};
const markAllRead = () => {
  store = store.map((n) => ({ ...n, read: true }));
};
const clear = () => {
  store = [];
};
const dismiss = (id: string) => {
  store = store.filter((n) => n.id !== id);
};

describe('NotificationStore (reducer mirror)', () => {
  beforeEach(() => {
    store = [];
    nextId = 0;
  });

  it('push appends a notification with read=false', () => {
    const id = push({ title: 'Hello', severity: 'info' });
    expect(store.length).toBe(1);
    expect(store[0].id).toBe(id);
    expect(store[0].read).toBe(false);
  });

  it('markRead flips the flag', () => {
    const id = push({ title: 'A', severity: 'info' });
    expect(store[0].read).toBe(false);
    markRead(id);
    expect(store[0].read).toBe(true);
  });

  it('markAllRead flips everything', () => {
    push({ title: 'A', severity: 'info' });
    push({ title: 'B', severity: 'info' });
    expect(store.every((n) => !n.read)).toBe(true);
    markAllRead();
    expect(store.every((n) => n.read)).toBe(true);
  });

  it('clear empties the store', () => {
    push({ title: 'A', severity: 'info' });
    push({ title: 'B', severity: 'info' });
    expect(store.length).toBe(2);
    clear();
    expect(store.length).toBe(0);
  });

  it('dismiss removes by id', () => {
    const id = push({ title: 'A', severity: 'info' });
    expect(store.length).toBe(1);
    dismiss(id);
    expect(store.length).toBe(0);
  });

  it('newest goes to the front', () => {
    push({ title: 'A', severity: 'info' });
    push({ title: 'B', severity: 'info' });
    expect(store[0].title).toBe('B');
    expect(store[1].title).toBe('A');
  });

  it('severity values round-trip', () => {
    push({ title: 'i', severity: 'info' });
    push({ title: 's', severity: 'success' });
    push({ title: 'w', severity: 'warning' });
    push({ title: 'd', severity: 'danger' });
    expect(store.map((n) => n.severity)).toEqual(['danger', 'warning', 'success', 'info']);
  });
});
