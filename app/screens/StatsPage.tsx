import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

// ✅ ナビゲーション型定義
type RootStackParamList = {
  Home: undefined;
  Stats: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Stats">;

// ✅ 日付フォーマット関数
const toShortLabel = (iso: string): string => {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return iso;
  }
};

// ✅ 日付加算関数
const addDays = (baseDate: string | Date, n: number): string => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

type StatData = { date: string; value: number; label: string };

export default function StatsPage() {
  const navigation = useNavigation<NavigationProp>();
  const [data, setData] = useState<StatData[]>([]);

  // ✅ データ読み込み
  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const raw = await AsyncStorage.getItem("stats");
        let parsed: Record<string, any> = {};
        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch {
          parsed = {};
        }

        let arr = Object.entries(parsed)
          .map(([date, value]) => ({
            date,
            value: Number.isFinite(+value!) ? +value! : 0,
            label: toShortLabel(date),
          }))
          .sort((a, b) => (a.date < b.date ? -1 : 1));

        // ✅ データ補完
        if (arr.length > 0) {
          const lastDate = arr[arr.length - 1].date;
          while (arr.length < 7) {
            const nextDate = addDays(lastDate, arr.length - (arr.length - 1));
            arr.push({ date: nextDate, value: 0, label: toShortLabel(nextDate) });
          }
        } else {
          const today = new Date().toISOString().slice(0, 10);
          arr = Array.from({ length: 7 }, (_, i) => {
            const date = addDays(today, i);
            return { date, value: 0, label: toShortLabel(date) };
          });
        }

        setData(arr);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const values = data.map((d) => d.value);
  const labels = data.map((d) => d.label);

  return (
    <ScrollView style={styles.container}>
      {/* 💙 ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={30} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>今週のがんばり</Text>
        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.subtitle}>小さな積み重ねが、あなたの力になる</Text>

      {/* 📊 グラフカード */}
      <View style={styles.chartCard}>
        {data.length === 0 ? (
          <Text style={styles.emptyText}>
            まだ達成データがありません。タスクを完了すると自動で記録されます
          </Text>
        ) : (
          <BarChart
            data={{
              labels,
              datasets: [{ data: values }],
            }}
            width={Dimensions.get("window").width - 60}
            height={260}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#E0ECFF",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: "#E2E8F0",
              },
              style: { borderRadius: 16 },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        )}
      </View>

      {/* 📅 解説カード */}
      <View style={styles.tipsCard}>
        <Ionicons name="sparkles" size={22} color="#3B82F6" />
        <Text style={styles.tipsText}>
          日々少しずつでも続けることが大事。{"\n"}グラフが伸びていくのを楽しもう
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7FF", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconButton: { padding: 4 },
  title: { fontSize: 26, fontWeight: "700", color: "#1E40AF" },
  subtitle: {
    textAlign: "center",
    color: "#475569",
    fontSize: 15,
    marginBottom: 18,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  tipsCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  tipsText: {
    marginLeft: 10,
    color: "#1E3A8A",
    fontSize: 15,
    flexShrink: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 15,
    padding: 20,
  },
});
