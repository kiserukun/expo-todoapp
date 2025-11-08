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
      {/* MemoList ページ */}
      <TouchableOpacity
        style={styles.memoButton}
        onPress={() => navigation.navigate("MemoList")}
      >
        <Text style={styles.memoButtonText}>過去の教訓を見る</Text>
      </TouchableOpacity>

      {/* 達成グラフボタン */}
      <TouchableOpacity
        style={[styles.memoButton, { backgroundColor: "#3B82F6" }]}
        onPress={() => navigation.navigate("Stats")}
      >
        <Text style={[styles.memoText, { color: "white" }]}>
          達成グラフを見る
        </Text>
      </TouchableOpacity>

      <Text style={styles.header}>グループ一覧</Text>

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
              <Ionicons name="trash" size={24} color="#878282ff" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>グループがありません 🌤️</Text>
        }
      />

      {/* グループ追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "#fff", fontSize: 36 }}>＋</Text>
      </TouchableOpacity>

      {/* モーダル */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>新しいグループ</Text>
            <TextInput
              placeholder="グループ名"
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
                setNewGroupName("");
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
  header: { fontSize: 24, fontWeight: "bold", marginVertical: 12 },
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
  deleteIcon: { fontSize: 22, color: "#F87171" }, // 少し抑えた赤
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
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 30, fontSize: 16 },

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

  memoButton: {
    backgroundColor: "#FACC15",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  memoButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  memoText: { fontSize: 16, fontWeight: "bold" },
});
