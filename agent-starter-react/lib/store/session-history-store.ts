import { create } from 'zustand';
import { SessionHistory } from '../types/session-history';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

type SessionHistoryStore = {
  sessions: Map<string, SessionHistory>;
  maxSessions: number;

  create: (session: Omit<SessionHistory, 'id'>) => SessionHistory;
  getAll: () => SessionHistory[];
  getById: (id: string) => SessionHistory | undefined;
  delete: (id: string) => boolean;
  clear: () => void;
};

export const useSessionHistoryStore = create<SessionHistoryStore>((set, get) => ({
  sessions: new Map(),
  maxSessions: 10,

  create: (session: Omit<SessionHistory, 'id'>): SessionHistory => {
    const id = generateId();

    const sessionHistory: SessionHistory = {
      id,
      ...session,
    };

    set((state) => {
      const newSessions = new Map(state.sessions);
      newSessions.set(id, sessionHistory);

      if (newSessions.size > state.maxSessions) {
        const sortedSessions = Array.from(newSessions.entries()).sort(
          ([, a], [, b]) => b.endedAt.getTime() - a.endedAt.getTime()
        );

        const sessionsToKeep = new Map(sortedSessions.slice(0, state.maxSessions));

        return { sessions: sessionsToKeep };
      }

      return { sessions: newSessions };
    });

    return sessionHistory;
  },

  getAll: (): SessionHistory[] => {
    const { sessions } = get();
    return Array.from(sessions.values()).sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime());
  },

  getById: (id: string): SessionHistory | undefined => {
    const { sessions } = get();
    return sessions.get(id);
  },

  delete: (id: string): boolean => {
    const { sessions } = get();
    const exists = sessions.has(id);

    if (exists) {
      set(() => {
        const newSessions = new Map(sessions);
        newSessions.delete(id);
        return { sessions: newSessions };
      });
    }

    return exists;
  },

  clear: (): void => {
    set({ sessions: new Map() });
  },
}));
