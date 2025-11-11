let store = {};

const AsyncStorage = {
  setItem: jest.fn(async (key, value) => {
    store[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn(async (key) => store[key] || null),
  removeItem: jest.fn(async (key) => {
    delete store[key];
    return Promise.resolve();
  }),
  clear: jest.fn(async () => {
    store = {};
    return Promise.resolve();
  }),
};

export default AsyncStorage;
