import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
  const [editId, setEditId] = useState<number | null>(null);
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

  const handleAddOrEditMemo = async () => {
    if (!newMemo.trim()) return;
    let updated: Memo[];

    if (editId !== null) {
      // 編集
      updated = memos.map((m) => (m.id === editId ? { ...m, text: newMemo.trim() } : m));

    } else {
      // 追加
      updated = [...memos, { id: Date.now(), text: newMemo.trim() }];

    }

    await saveMemos(updated);
    setNewMemo("");
    setEditId(null);
    setModalVisible(false);
  };

  const handleDeleteMemo = async (id: number) => {
    Alert.alert("削除確認", "この教訓を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          const updated = memos.filter((m) => m.id !== id);
          await saveMemos(updated);

        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 💙 ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>教訓ノート</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.subtitle}>
        過去の失敗や気づきを記録して{"\n"}定期的に振り返ろう
      </Text>

      {/* 🧠 メモリスト */}
      {memos.length === 0 ? (
        <Text style={styles.emptyText}>
          まだ教訓がありません。{"\n"}右下の「＋」から追加できます。
        </Text>
      ) : (
        <FlatList
          data={memos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memoCard}
              onPress={() => {
                setEditId(item.id);
                setNewMemo(item.text);
                setModalVisible(true);
              }}
            >
              <Text style={styles.memoText}>{item.text}</Text>
              <View style={styles.iconRow}>
                <TouchableOpacity
                  onPress={() => {
                    setEditId(item.id);
                    setNewMemo(item.text);
                    setModalVisible(true);
                  }}
                  style={{ marginRight: 10 }}
                >

                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteMemo(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* ➕ 追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditId(null);
          setNewMemo("");
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* ✨ モーダル（追加・編集共通） */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setNewMemo("");
          setEditId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editId ? "教訓を編集" : "新しい教訓を追加"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="例：焦って確認を忘れた…次は落ち着こう"
              value={newMemo}
              onChangeText={setNewMemo}
              autoFocus
              multiline
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddOrEditMemo}>
              <Text style={styles.modalButtonText}>
                {editId ? "更新する" : "追加する"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNewMemo("");
                setEditId(null);
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  memoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memoText: {
    fontSize: 16,
    color: "#1E293B",
    flex: 1,
    marginRight: 12,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 50,
    fontSize: 15,
    lineHeight: 22,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    width: "100%",
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
    minHeight: 8,
    textAlignVertical: "top",
  },
  modalButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelText: { color: "#64748B", marginTop: 12, fontSize: 15 },
});
