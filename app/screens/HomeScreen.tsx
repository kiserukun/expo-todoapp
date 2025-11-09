import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import type { RootStackParamList } from "../index";
import {
  addGroup,
  deleteGroup,
  Group,
  loadGroups,
  updateGroupName,
} from "../utils/storage";

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

  // 💾 順番保存
  const saveOrder = async (newData: Group[]) => {
    setGroups(newData);
    await AsyncStorage.setItem("groups", JSON.stringify(newData));
  };

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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Group>) => (
    <Pressable
      style={[
        styles.groupCard,
        isActive && { backgroundColor: "#E2E8F0" },
      ]}
      onLongPress={drag}
      onPress={() => navigation.navigate("TaskList", { id: item.id })}
    >
      <Text style={styles.groupText}>{item.name}</Text>
      <View style={styles.iconRow}>
        {/* ✏️ 編集 */}
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

        {/* 🗑️ 削除 */}
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
  );

  return (
    <View style={styles.container}>
      {/* 教訓ノート＆グラフカード */}
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

      <DraggableFlatList
        data={groups}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => saveOrder(data)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>まだリストがありません</Text>
        }
        contentContainerStyle={{ paddingBottom: 220 }}
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

      {/* ✨ モーダル */}
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

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2563EB" }]}
                onPress={editGroupId ? handleEditGroup : handleAddGroup}
              >
                <Text style={styles.modalButtonText}>
                  {editGroupId ? "更新" : "追加"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#E5E7EB" }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewGroupName("");
                  setEditGroupId(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#374151" }]}>
                  キャンセル
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

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
  groupText: { fontSize: 16, color: "#1E293B", flex: 1 },
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
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
