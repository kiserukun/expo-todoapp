import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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

type Task = { id: string; text: string; completed: boolean };
type Group = { id: string; name: string; tasks: Task[] };
type RouteParams = { TaskListPage: { id: string } };

const STORAGE_KEY = "groups";

export default function TaskListPage() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "TaskListPage">>();
  const { id } = route.params;

  const [groups, setGroups] = useState<Group[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: Group[] = JSON.parse(data);
        setGroups(parsed);
        setGroup(parsed.find((g) => g.id === id) || null);
      }
    })();
  }, [id]);

  const updateGroupData = async (newGroups: Group[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups));
    setGroups(newGroups);
    setGroup(newGroups.find((g) => g.id === id) || null);
  };

  const handleToggle = async (taskId: string) => {
    if (!group) return;
    const newGroups = groups.map((g) =>
      g.id === id
        ? {
          ...g,
          tasks: g.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        }
        : g
    );
    await updateGroupData(newGroups);
  };

  const handleAddOrEditTask = async () => {
    if (!newTask.trim() || !group) return;

    let newGroups: Group[];

    if (editTaskId) {
      // 編集モード
      newGroups = groups.map((g) =>
        g.id === id
          ? {
            ...g,
            tasks: g.tasks.map((t) =>
              t.id === editTaskId ? { ...t, text: newTask.trim() } : t
            ),
          }
          : g
      );
    } else {
      // 新規追加
      newGroups = groups.map((g) =>
        g.id === id
          ? {
            ...g,
            tasks: [
              ...g.tasks,
              { id: Date.now().toString(), text: newTask.trim(), completed: false },
            ],
          }
          : g
      );
    }

    await updateGroupData(newGroups);
    setNewTask("");
    setEditTaskId(null);
    setModalVisible(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!group) return;
    Alert.alert("削除確認", "このタスクを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          const newGroups = groups.map((g) =>
            g.id === id ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) } : g
          );
          await updateGroupData(newGroups);
        },
      },
    ]);
  };

  if (!group)
    return <Text style={{ textAlign: "center", marginTop: 40 }}>リストが見つかりません。</Text>;

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        item.completed && styles.taskCompleted,
        isActive && { backgroundColor: "#DBEAFE" },
      ]}
      onPress={() => handleToggle(item.id)}
      onLongPress={drag}
    >
      <View style={styles.taskRow}>
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={26}
          color={item.completed ? "#22C55E" : "#60A5FA"}
          style={{ marginRight: 10 }}
        />
        <Text
          style={[styles.taskText, item.completed && styles.taskTextDone]}
          onLongPress={() => {
            setEditTaskId(item.id);
            setNewTask(item.text);
            setModalVisible(true);
          }}
        >
          {item.text}
        </Text>
        <View style={{ flexDirection: "row", marginLeft: "auto" }}>
          {/* ✏️ 編集ボタン */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setEditTaskId(item.id);
              setNewTask(item.text);
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
              handleDeleteTask(item.id);
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const completed = group.tasks.filter((t) => t.completed).length;
  const total = group.tasks.length;
  const ratio = total > 0 ? completed / total : 0;

  return (
    <View style={styles.container}>
      {/* 🔹 ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 💙 進捗カード */}
      <View style={[styles.progressCard, { backgroundColor: `rgba(37,99,235,${0.1 + ratio * 0.3})` }]}>
        <Text style={styles.counterLabel}>今日の達成</Text>
        <Text style={styles.counterValue}>
          {completed} / {total}
        </Text>
      </View>

      {/* 🧾 タスクリスト */}
      <DraggableFlatList
        data={group.tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          const newGroups = groups.map((g) =>
            g.id === id ? { ...g, tasks: data } : g
          );
          updateGroupData(newGroups);
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* ➕ 追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditTaskId(null);
          setNewTask("");
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* 📝 モーダル（追加・編集兼用） */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          setNewTask("");
          setEditTaskId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editTaskId ? "タスクを編集" : "新しいタスクを追加"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="やることを入力..."
              value={newTask}
              onChangeText={setNewTask}
              autoFocus
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddOrEditTask}>
              <Text style={styles.modalButtonText}>
                {editTaskId ? "更新する" : "追加する"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNewTask("");
                setEditTaskId(null);
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
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  progressCard: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  counterLabel: { fontSize: 16, color: "#2563EB", fontWeight: "500" },
  counterValue: { fontSize: 28, fontWeight: "700", color: "#1E40AF", marginTop: 4 },
  taskCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  taskCompleted: { backgroundColor: "#DCFCE7" },
  taskRow: { flexDirection: "row", alignItems: "center" },
  taskText: { fontSize: 16, color: "#1E293B", flexShrink: 1 },
  taskTextDone: { textDecorationLine: "line-through", color: "#94A3B8" },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 22, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1E293B", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    width: "100%",
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
  },
  modalButton: { backgroundColor: "#2563EB", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelText: { color: "#64748B", marginTop: 12, fontSize: 15 },
});
