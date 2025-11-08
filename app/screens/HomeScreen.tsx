import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { RootStackParamList } from "../index";
import { addGroup, deleteGroup, Group, loadGroups, updateGroupName } from "../utils/storage";

type GroupListNav = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen = () => {
  const navigation = useNavigation<GroupListNav>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchGroups = async () => {
    const stored = await loadGroups();
    setGroups(stored);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchGroups);
    return unsubscribe;
  }, [navigation]);

  // 🟦 追加
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await addGroup(newGroupName.trim());
    setNewGroupName("");
    setModalVisible(false);
    fetchGroups();
  };

  // 🟨 編集
  const handleEditGroup = async () => {
    if (!newGroupName.trim() || !editGroupId) return;
    await updateGroupName(editGroupId, newGroupName.trim());
    setEditGroupId(null);
    setNewGroupName("");
    setModalVisible(false);
    fetchGroups();
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteGroup(id);
    fetchGroups();
  };

  return (
    <View style={styles.container}>
      {/* 教訓ノート＆達成グラフカード */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate("MemoList")}
        >
          <Ionicons name="book-outline" size={20} color="#2563EB" />
          <Text style={styles.cardText}>教訓ノート</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate("Stats")}
        >
          <Ionicons name="bar-chart-outline" size={20} color="#2563EB" />
          <Text style={styles.cardText}>達成グラフ</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>マイリスト</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.groupCard,
              pressed && { backgroundColor: "#E2E8F0" },
            ]}
            onPress={() => navigation.navigate("TaskList", { id: item.id })}
          >
            <Text style={styles.groupText}>{item.name}</Text>

            <View style={styles.iconRow}>
              {/* ✏️ 編集ボタン */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setEditGroupId(item.id);
                  setNewGroupName(item.name);
                  setModalVisible(true);
                }}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="create-outline" size={22} color="#64748B" />
              </TouchableOpacity>

              {/* 🗑️ 削除ボタン */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteGroup(item.id);
                }}
              >
                <Ionicons name="trash-outline" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>まだリストがありません</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* ➕ 追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNewGroupName("");
          setEditGroupId(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* モーダル（追加・編集兼用） */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editGroupId ? "リスト名を編集" : "新しいリストを作成"}
            </Text>

            <TextInput
              placeholder="リスト名を入力..."
              value={newGroupName}
              onChangeText={setNewGroupName}
              style={styles.modalInput}
              autoFocus
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={editGroupId ? handleEditGroup : handleAddGroup}
            >
              <Text style={styles.modalButtonText}>
                {editGroupId ? "更新する" : "追加する"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNewGroupName("");
                setEditGroupId(null);
              }}
            >
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

// 🧩 storage.ts に以下の関数を追加
// export const updateGroupName = async (id: string, newName: string) => {
//   const stored = await loadGroups();
//   const updated = stored.map((g) => (g.id === id ? { ...g, name: newName } : g));
//   await AsyncStorage.setItem("groups", JSON.stringify(updated));
// };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingTop: 16 },
  header: { fontSize: 20, fontWeight: "600", color: "#1E293B", marginVertical: 16 },
  menuContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  cardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardText: { fontSize: 15, fontWeight: "600", color: "#2563EB", marginLeft: 6 },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  groupText: { fontSize: 16, color: "#1E293B" },
  iconRow: { flexDirection: "row", alignItems: "center" },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2563EB",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 30, fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1E293B", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    width: "100%",
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButton: { backgroundColor: "#2563EB", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginBottom: 6 },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelText: { color: "#64748B", fontSize: 15, marginTop: 4 },
});
