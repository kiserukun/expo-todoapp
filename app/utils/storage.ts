import AsyncStorage from "@react-native-async-storage/async-storage";

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export type Group = {
  id: string;
  name: string;
  tasks: Task[];
};

const STORAGE_KEY = "groups";

export const loadGroups = async (): Promise<Group[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveGroups = async (groups: Group[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

export const addGroup = async (name: string) => {
  const groups = await loadGroups();
  const newGroup: Group = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    tasks: [],
  };
  const updated = [...groups, newGroup];
  await saveGroups(updated);
  return newGroup;
};

export const deleteGroup = async (id: string) => {
  const groups = await loadGroups();
  const updated = groups.filter((g) => g.id !== id);
  await saveGroups(updated);
};

export const updateGroupName = async (id: string, newName: string) => {
  const stored = await loadGroups();
  const updated = stored.map((g) => (g.id === id ? { ...g, name: newName } : g));
  await AsyncStorage.setItem("groups", JSON.stringify(updated));
};