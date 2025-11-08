import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";

type Memo = {
  id: number;
  text: string;
};

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
    Toast.show({
      type: "success",
      text1: "教訓を追加しました📝",
    });
  };

  const handleDeleteMemo = async (id: number) => {
    const updated = memos.filter((m) => m.id !== id);
    await saveMemos(updated);
    Toast.show({
      type: "info",
      text1: "教訓を削除しました",
    });
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home" as never)}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>過去の教訓</Text>
      </View>

      <Text style={styles.subtitle}>
        過去の失敗や気づきをメモして、{"\n"}定期的に振り返ろう ✨
      </Text>

      {/* メモリスト */}
      {memos.length === 0 ? (
        <Text style={styles.emptyText}>
          まだメモがありません。下の「＋」から追加できます。
        </Text>
      ) : (
        <FlatList
          data={memos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.memoBox}>
              <Text style={styles.memoText}>{item.text}</Text>
              <TouchableOpacity onPress={() => handleDeleteMemo(item.id)}>
                <Text style={styles.deleteText}>削除</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* フッター「＋」ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      {/* モーダル */}
      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>新しいメモ</Text>
          <TextInput
            style={styles.input}
            placeholder="例：焦って確認を忘れた…次は落ち着こう"
            value={newMemo}
            onChangeText={setNewMemo}
            onSubmitEditing={handleAddMemo}
          />
          <TouchableOpacity style={styles.modalButton} onPress={handleAddMemo}>
            <Text style={styles.modalButtonText}>追加</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: "#666",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#B45309",
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    marginBottom: 10,
  },
  memoBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  memoText: {
    flex: 1,
    color: "#333",
  },
  deleteText: {
    color: "red",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: Dimensions.get("window").width / 2 - 30,
    backgroundColor: "#FACC15",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  addButtonText: {
    fontSize: 30,
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 50,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#FACC15",
    borderRadius: 8,
    padding: 10,
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
