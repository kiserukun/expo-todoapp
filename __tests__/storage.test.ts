import { addGroup, deleteGroup, loadGroups } from "../app/utils/storage";

describe("storage utils", () => {
  beforeEach(async () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    await AsyncStorage.clear();
  });

  test("addGroup creates and loads a new group", async () => {
    const newGroup = await addGroup("テストグループ");
    const allGroups = await loadGroups();

    expect(newGroup.name).toBe("テストグループ");
    expect(allGroups).toHaveLength(1);
    expect(allGroups[0].name).toBe("テストグループ");
  });

  test("deleteGroup removes a group", async () => {
    const g1 = await addGroup("A");
    const g2 = await addGroup("B");

    await deleteGroup(g1.id);
    const remaining = await loadGroups();

    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe("B");
  });
});
