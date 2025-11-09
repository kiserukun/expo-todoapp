// ✅ TaskListPage.tsx（完全版）
// 長押しで並び替え、タスク完了で即時グラフ反映、日付変わりで自動リセット対応

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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

type Task = { id: string; text: string; completed: boolean };
type Group = { id: string; name: string; tasks: Task[] };
type RouteParams = { TaskListPage: { id: string } };

const STORAGE_KEY = "groups";
const STATS_KEY = "stats";
const DATE_KEY = "lastOpenedDate";

export default function TaskListPage() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "TaskListPage">>();
  const { id } = route.params;

  const [groups, setGroups] = useState<Group[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🟦 初回ロード & 日付確認
  useEffect(() => {
    const init = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const lastOpened = await AsyncStorage.getItem(DATE_KEY);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let parsed: Group[] = stored ? JSON.parse(stored) : [];

      // ✅ 日付が変わっていたら、全タスクのチェックをリセット
      if (lastOpened !== today) {
        parsed = parsed.map((g) => ({
          ...g,
          tasks: g.tasks.map((t) => ({ ...t, completed: false })),
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        await AsyncStorage.setItem(DATE_KEY, today);
      }

      setGroups(parsed);
      setGroup(parsed.find((g) => g.id === id) || null);
    };
    init();
  }, [id]);

  // 🟩 保存処理
  const updateGroupData = async (newGroups: Group[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups));
    setGroups(newGroups);
    setGroup(newGroups.find((g) => g.id === id) || null);
  };

  // 🟨 チェック切り替え＋即時グラフ反映
  const handleToggle = async (taskId: string) => {
    if (!group) return;

    const updatedGroups = groups.map((g) =>
      g.id === id
        ? {
          ...g,
          tasks: g.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        }
        : g
    );

    await updateGroupData(updatedGroups);

    // ✅ グラフ用データ更新（完了→ON時のみカウント）
    const toggledTask = group.tasks.find((t) => t.id === taskId);
    if (toggledTask && !toggledTask.completed) {
      const today = new Date().toISOString().slice(0, 10);
      const statsRaw = await AsyncStorage.getItem(STATS_KEY);
      const stats = statsRaw ? JSON.parse(statsRaw) : {};
      stats[today] = (stats[today] || 0) + 1;
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  };

  // 🟧 タスク追加・編集
  const handleAddOrEditTask = async () => {
    if (!newTask.trim() || !group) return;

    let newGroups: Group[];
    if (editTaskId) {
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

  // 🟥 削除
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

  // 🟪 並び替え（長押し）
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        item.completed && styles.taskCompleted,
        isActive && { backgroundColor: "#E0F2FF" },
      ]}
      onPress={() => handleToggle(item.id)}
      onLongPress={drag}
      delayLongPress={150}
    >
      <View style={styles.taskRow}>
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={26}
          color={item.completed ? "#3B82F6" : "#94A3B8"}
          style={{ marginRight: 10 }}
        />
        <Text
          style={[styles.taskText, item.completed && styles.taskTextDone]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
        <View style={{ flexDirection: "row", marginLeft: "auto" }}>
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

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteTask(item.id);
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!group)
    return <Text style={{ textAlign: "center", marginTop: 40 }}>リストが見つかりません。</Text>;

  const completed = group.tasks.filter((t) => t.completed).length;
  const total = group.tasks.length;
  const ratio = total > 0 ? completed / total : 0;

  return (
    <ExpoLinearGradient colors={["#E0F2FE", "#FFFFFF"]} style={styles.container}>
      {/* 💙 ヘッダー */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 📈 進捗カード */}
      <View style={styles.progressCard}>
        <Text style={styles.counterLabel}>今日の達成</Text>
        <Text style={styles.counterValue}>
          {completed} / {total}
        </Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${ratio * 100}%` }]} />
        </View>
      </View>

      {/* ✅ 並び替え対応タスクリスト */}
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
        contentContainerStyle={{ paddingBottom: 300 }}
      />

      {/* ➕ FAB */}
      <ExpoLinearGradient colors={["#60A5FA", "#3B82F6"]} style={styles.addButton}>
        <TouchableOpacity
          onPress={() => {
            setEditTaskId(null);
            setNewTask("");
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={34} color="#fff" />
        </TouchableOpacity>
      </ExpoLinearGradient>

      {/* 📝 モーダル */}
      <Modal visible={modalVisible} animationType="fade" transparent>
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
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#3B82F6" }]}
                onPress={handleAddOrEditTask}
              >
                <Text style={styles.modalButtonText}>
                  {editTaskId ? "更新" : "追加"}
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
  headerTitle: { color: "#1E3A8A", fontSize: 20, fontWeight: "700" },
  progressCard: {
    backgroundColor: "#FFFFFFEE",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  counterLabel: { fontSize: 16, color: "#3B82F6", fontWeight: "600" },
  counterValue: { fontSize: 28, fontWeight: "700", color: "#1E3A8A", marginVertical: 4 },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#3B82F6", borderRadius: 4 },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  taskCompleted: { backgroundColor: "#EFF6FF" },
  taskRow: { flexDirection: "row", alignItems: "center" },
  taskText: { fontSize: 17, color: "#1E293B", flexShrink: 1 },
  taskTextDone: { textDecorationLine: "line-through", color: "#94A3B8" },
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
