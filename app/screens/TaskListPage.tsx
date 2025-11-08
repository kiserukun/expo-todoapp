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
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
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

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    if (!group) return;

    const newGroups = groups.map((g) =>
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
    await updateGroupData(newGroups);

    setNewTask("");
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
          Toast.show({ type: "info", text1: "タスクを削除しました🗑️" });
        },
      },
    ]);
  };

  if (!group)
    return <Text style={{ textAlign: "center", marginTop: 40 }}>グループが見つかりません。</Text>;

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          item.completed && styles.taskCompleted,
          isActive && { backgroundColor: "#BFDBFE" },
        ]}
        onPress={() => handleToggle(item.id)}
        onLongPress={drag} // 長押しでドラッグ開始
      >
        <View style={styles.taskRow}>
          <Ionicons
            name={item.completed ? "checkmark-circle" : "ellipse-outline"}
            size={30}
            color={item.completed ? "#34D399" : "#93C5FD"}
            style={{ marginRight: 12 }}
          />
          <Text style={[styles.taskText, item.completed && styles.taskTextDone]}>
            {item.text}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteTask(item.id)}
            style={{ marginLeft: "auto" }}
          >
            <Ionicons name="trash" size={24} color="#878282ff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.counterLabel}>今日の達成</Text>
        <Text style={styles.counterValue}>
          {group.tasks.filter((t) => t.completed).length} / {group.tasks.length}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={group.tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => {
            const newGroups = groups.map((g) => (g.id === id ? { ...g, tasks: data } : g));
            updateGroupData(newGroups);
          }}
          contentContainerStyle={{ paddingBottom: 120 }} // 👈 スクロール余白
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNewTask("");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          setNewTask("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>新しいタスク</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="やることを入力..."
              value={newTask}
              onChangeText={setNewTask}
              autoFocus
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddTask}>
              <Text style={styles.modalButtonText}>追加する</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNewTask("");
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

// --- styles はそのまま利用 ---


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7FF", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: "700", color: "#1E40AF" },

  progressCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  counterLabel: { fontSize: 16, color: "#3B82F6" },
  counterValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginTop: 6,
  },

  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  taskCompleted: { backgroundColor: "#DCFCE7" },
  taskRow: { flexDirection: "row", alignItems: "center" },
  taskText: { fontSize: 18, color: "#1F2937", flexShrink: 1 },
  taskTextDone: { textDecorationLine: "line-through", color: "#6B7280" },

  deleteAction: {
    backgroundColor: "#F87171",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginBottom: 10,
    borderRadius: 14,
  },

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
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 30, fontSize: 16 },
});
