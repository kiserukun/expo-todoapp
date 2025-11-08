import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
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
import Toast from "react-native-toast-message";

type Memo = { id: number; text: string };

export default function MemoListPage() {
  const navigation = useNavigation();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("memos");
      if (saved) setMemos(JSON.parse(saved));
    })();
  }, []);

  const saveMemos = async (list: Memo[]) => {
    setMemos(list);
    await AsyncStorage.setItem("memos", JSON.stringify(list));
  };

  const handleAddMemo = async () => {
    if (!newMemo.trim()) return;
    const updated = [...memos, { id: Date.now(), text: newMemo.trim() }];
    await saveMemos(updated);
    setNewMemo("");
    setModalVisible(false);
  };

  const handleDeleteMemo = async (id: number) => {
    const updated = memos.filter((m) => m.id !== id);
    await saveMemos(updated);
    Toast.show({ type: "info", text1: "教訓を削除しました🗑️" });
  };

  return (
    <View style={styles.container}>
      {/* 💙 ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>過去の教訓</Text>
        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.subtitle}>
        過去の失敗や気づきをメモして{"\n"}定期的に振り返ろう
      </Text>

      {/* 🧠 メモリスト */}
      {memos.length === 0 ? (
        <Text style={styles.emptyText}>
          まだメモがありません。下の「＋」から追加できます。
        </Text>
      ) : (
        <FlatList
          data={memos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.memoCard}>
              <Text style={styles.memoText}>{item.text}</Text>
              <TouchableOpacity onPress={() => handleDeleteMemo(item.id)}>
                <Ionicons name="trash" size={24} color="#878282ff" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* ➕ 追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      {/* ✨ モーダル */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>新しい教訓</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="例：焦って確認を忘れた…次は落ち着こう"
              value={newMemo}
              onChangeText={setNewMemo}
              autoFocus
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddMemo}>
              <Text style={styles.modalButtonText}>追加する</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNewMemo("");
              }}
            >
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7FF", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#1E40AF" },
  subtitle: {
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    marginBottom: 16,
  },
  memoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memoText: { fontSize: 16, color: "#1F2937", flex: 1, marginRight: 12 },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 50, fontSize: 16 },

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
  addButtonText: { fontSize: 40, color: "#fff", marginTop: -3 },

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
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#1E3A8A", marginBottom: 10 },
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
  },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelText: { color: "#6B7280", marginTop: 12, fontSize: 16 },
});
