import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { RootStackParamList } from "../index";
import { addGroup, deleteGroup, Group, loadGroups } from "../utils/storage";

type GroupListNav = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen = () => {
  const navigation = useNavigation<GroupListNav>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const fetchGroups = async () => {
    const stored = await loadGroups();
    setGroups(stored);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchGroups);
    return unsubscribe;
  }, [navigation]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await addGroup(newGroupName.trim());
    setNewGroupName(""); // ← 追加後にリセット
    setModalVisible(false);
    fetchGroups();
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteGroup(id);
    fetchGroups();
  };

  return (
    <View style={styles.container}>
      {/* 教訓ノートボタン */}
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: "#FBBF24" }]}
        onPress={() => navigation.navigate("MemoList")}
      >
        <View style={styles.menuContent}>
          <Ionicons name="book-outline" size={22} color="white" style={styles.icon} />
          <Text style={styles.menuButtonText}>教訓ノート</Text>
        </View>
      </TouchableOpacity>

      {/* 達成グラフボタン */}
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: "#38BDF8" }]}
        onPress={() => navigation.navigate("Stats")}
      >
        <View style={styles.menuContent}>
          <Ionicons name="bar-chart-outline" size={22} color="white" style={styles.icon} />
          <Text style={styles.menuButtonText}>達成グラフ</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.header}>マイリスト</Text>

      {/* グループ一覧 */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <TouchableOpacity
              style={styles.groupContent}
              onPress={() => navigation.navigate("TaskList", { id: item.id })}
            >
              <Text style={styles.groupText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteGroup(item.id)}>
              <Ionicons name="trash" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>まだリストがありません</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* グループ追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNewGroupName(""); // ← モーダルを開く前に入力内容をリセット
          setModalVisible(true);
        }}
      >
        <Text style={{ color: "#fff", fontSize: 36 }}>＋</Text>
      </TouchableOpacity>

      {/* モーダル */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>新しいリストを作成</Text>
            <TextInput
              placeholder="リスト名を入力..."
              value={newGroupName}
              onChangeText={setNewGroupName}
              style={styles.modalInput}
              autoFocus
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddGroup}>
              <Text style={styles.modalButtonText}>追加する</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNewGroupName(""); // ← キャンセル時もリセット
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7FF", padding: 16 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginVertical: 12,
  },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  groupContent: { flex: 1 },
  groupText: { fontSize: 18, color: "#1E3A8A" },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#3B82F6",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 30,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#1E3A8A", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    width: "100%",
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelText: { color: "#6B7280", fontSize: 16, marginTop: 4 },
  menuButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  menuButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
});
