// Shared in-memory key-value store to simulate localStorage but reset on page refresh.
const memoryStore: Record<string, any> = {};

export const mockStorage = {
  getItem: (key: string): string | null => {
    const val = memoryStore[key];
    if (val === undefined) return null;
    return typeof val === 'string' ? val : JSON.stringify(val);
  },
  setItem: (key: string, value: string): void => {
    try {
      memoryStore[key] = JSON.parse(value);
    } catch {
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    delete memoryStore[key];
  },
  clear: (): void => {
    Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
  }
};
