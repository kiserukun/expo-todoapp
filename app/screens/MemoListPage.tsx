import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import Toast from "react-native-toast-message";

type Memo = { id: string; text: string };

export default function MemoListPage() {
  const navigation = useNavigation();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
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
      updated = memos.map((m) =>
        m.id === editId ? { ...m, text: newMemo.trim() } : m
      );
    } else {
      // 追加
      updated = [...memos, { id: Date.now().toString(), text: newMemo.trim() }];
    }

    await saveMemos(updated);
    setNewMemo("");
    setEditId(null);
    setModalVisible(false);
  };

  const handleDeleteMemo = async (id: string) => {
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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Memo>) => (
    <TouchableOpacity
      style={[
        styles.memoCard,
        isActive && { backgroundColor: "#E0F2FE" },
      ]}
      onLongPress={drag} // ✅ 長押しで並び替え
      delayLongPress={150}
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
          <Ionicons name="create-outline" size={22} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteMemo(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ExpoLinearGradient colors={["#E0F2FE", "#FFFFFF"]} style={styles.container}>
      {/* 💙 ヘッダー */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.title}>教訓ノート</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.subtitle}>
        過去の失敗や気づきを記録して{"\n"}未来の自分に活かそう
      </Text>

      {/* 🧠 メモリスト */}
      {memos.length === 0 ? (
        <Text style={styles.emptyText}>
          まだ教訓がありません。{"\n"}右下の「＋」から追加できます。
        </Text>
      ) : (
        <DraggableFlatList
          data={memos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => saveMemos(data)} // ✅ 並び替え保存
          contentContainerStyle={{ paddingBottom: 220 }}
        />
      )}

      {/* ➕ 追加ボタン */}
      <ExpoLinearGradient colors={["#60A5FA", "#3B82F6"]} style={styles.addButton}>
        <TouchableOpacity
          onPress={() => {
            setEditId(null);
            setNewMemo("");
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={34} color="#fff" />
        </TouchableOpacity>
      </ExpoLinearGradient>

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
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#3B82F6" }]}
                onPress={handleAddOrEditMemo}
              >
                <Text style={styles.modalButtonText}>
                  {editId ? "更新" : "追加"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#E2E8F0" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#475569" }]}>
                  キャンセル
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </ExpoLinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  headerCard: {
    backgroundColor: "#FFFFFFCC",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1E3A8A" },
  subtitle: {
    textAlign: "center",
    color: "#475569",
    fontSize: 15,
    marginBottom: 18,
    lineHeight: 22,
  },
  memoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
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
    borderRadius: 30,
    width: 65,
    height: 65,
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
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1E293B", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    width: "100%",
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
