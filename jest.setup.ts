import "@testing-library/jest-native/extend-expect";

// AsyncStorage をモック
jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};

  return {
    setItem: async (key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    },
    getItem: async (key: string) => {
      return Promise.resolve(store[key] || null);
    },
    removeItem: async (key: string) => {
      delete store[key];
      return Promise.resolve();
    },
    clear: async () => {
      store = {};
      return Promise.resolve();
    },
  };
});
