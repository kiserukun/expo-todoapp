// --- AsyncStorage をここで完全にモック化 ---
jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};

  return {
    setItem: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    getItem: jest.fn(async (key) => {
      return store[key] || null;
    }),
    removeItem: jest.fn(async (key) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
  };
});

// --- 実際の関数をインポート ---
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addGroup,
  deleteGroup,
  loadGroups,
  updateGroupName,
} from "../app/utils/storage";

describe("storage utils", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  // ✅ 1. 新しいグループが追加・取得できる
  test("addGroup creates and loads a new group", async () => {
    const newGroup = await addGroup("テストグループ");
    const allGroups = await loadGroups();

    expect(newGroup.name).toBe("テストグループ");
    expect(allGroups).toHaveLength(1);
    expect(allGroups[0].name).toBe("テストグループ");
  });

  // ✅ 2. 複数グループを追加できる
  test("can add multiple groups", async () => {
    await addGroup("A");
    await addGroup("B");
    await addGroup("C");

    const groups = await loadGroups();
    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.name)).toEqual(["A", "B", "C"]);
  });

  // ✅ 3. グループを削除できる
  test("deleteGroup removes a specific group", async () => {
    const g1 = await addGroup("A");
    const g2 = await addGroup("B");

    await deleteGroup(g1.id);
    const remaining = await loadGroups();

    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe("B");
  });

  // ✅ 4. 削除時に存在しないIDを指定しても壊れない
  test("deleteGroup with non-existing ID does nothing", async () => {
    await addGroup("A");
    await addGroup("B");

    await deleteGroup("nonexistent-id");

    const groups = await loadGroups();
    expect(groups).toHaveLength(2);
  });

  // ✅ 5. グループ名を更新できる
  test("updateGroupName updates a group's name", async () => {
    const g1 = await addGroup("OldName");

    await updateGroupName(g1.id, "NewName");

    const all = await loadGroups();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("NewName");
  });

  // ✅ 6. updateGroupName で存在しないIDは無視される
  test("updateGroupName ignores non-existing ID", async () => {
    const g1 = await addGroup("A");

    await updateGroupName("fake-id", "B");

    const all = await loadGroups();
    expect(all[0].name).toBe("A");
  });

  // ✅ 7. データが保存後も正しく読み込める
  test("data persists between load and save calls", async () => {
    const g1 = await addGroup("PersistTest");

    // 保存後に再読み込みしてもデータが残っていること
    const firstLoad = await loadGroups();
    const secondLoad = await loadGroups();

    expect(firstLoad).toEqual(secondLoad);
    expect(firstLoad[0].name).toBe("PersistTest");
  });
});
// --- AsyncStorage をここで完全にモック化 ---
jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};

  return {
    setItem: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    getItem: jest.fn(async (key) => {
      return store[key] || null;
    }),
    removeItem: jest.fn(async (key) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
  };
});

// --- 実際の関数をインポート ---

describe("storage utils", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  // ✅ 1. 新しいグループが追加・取得できる
  test("addGroup creates and loads a new group", async () => {
    const newGroup = await addGroup("テストグループ");
    const allGroups = await loadGroups();

    expect(newGroup.name).toBe("テストグループ");
    expect(allGroups).toHaveLength(1);
    expect(allGroups[0].name).toBe("テストグループ");
  });

  // ✅ 2. 複数グループを追加できる
  test("can add multiple groups", async () => {
    await addGroup("A");
    await addGroup("B");
    await addGroup("C");

    const groups = await loadGroups();
    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.name)).toEqual(["A", "B", "C"]);
  });

  // ✅ 3. グループを削除できる
  test("deleteGroup removes a specific group", async () => {
    const g1 = await addGroup("A");
    const g2 = await addGroup("B");

    await deleteGroup(g1.id);
    const remaining = await loadGroups();

    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe("B");
  });

  // ✅ 4. 削除時に存在しないIDを指定しても壊れない
  test("deleteGroup with non-existing ID does nothing", async () => {
    await addGroup("A");
    await addGroup("B");

    await deleteGroup("nonexistent-id");

    const groups = await loadGroups();
    expect(groups).toHaveLength(2);
  });

  // ✅ 5. グループ名を更新できる
  test("updateGroupName updates a group's name", async () => {
    const g1 = await addGroup("OldName");

    await updateGroupName(g1.id, "NewName");

    const all = await loadGroups();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("NewName");
  });

  // ✅ 6. updateGroupName で存在しないIDは無視される
  test("updateGroupName ignores non-existing ID", async () => {
    const g1 = await addGroup("A");

    await updateGroupName("fake-id", "B");

    const all = await loadGroups();
    expect(all[0].name).toBe("A");
  });

  // ✅ 7. データが保存後も正しく読み込める
  test("data persists between load and save calls", async () => {
    const g1 = await addGroup("PersistTest");

    // 保存後に再読み込みしてもデータが残っていること
    const firstLoad = await loadGroups();
    const secondLoad = await loadGroups();

    expect(firstLoad).toEqual(secondLoad);
    expect(firstLoad[0].name).toBe("PersistTest");
  });
});
