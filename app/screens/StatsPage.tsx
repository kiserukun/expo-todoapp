// StatsPage.tsx - ADHD向けに視認性を強化したグラフ画面

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 40;
const STORAGE_KEY = "stats";

export default function StatsPage() {
  const [stats, setStats] = useState<{ [date: string]: number }>({});
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStats = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setStats(stored ? JSON.parse(stored) : {});
    };
    if (isFocused) fetchStats();
  }, [isFocused]);

  // 日付整形
  const sortedKeys = Object.keys(stats).sort();

  // 今日から過去7日分の日付を生成
  const today = new Date();
  const recentKeys = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // 6日前から今日まで
    return d.toISOString().slice(0, 10); // yyyy-mm-dd 形式
  });

  // 曜日ラベル生成
  const getDayOfWeek = (dateStr: string) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const labels = recentKeys.map((d) => getDayOfWeek(d));
  const data = recentKeys.map((k) => stats[k] || 0); // ← データがない日は0

  return (
    <ExpoLinearGradient colors={["#E0F2FE", "#FFFFFF"]} style={styles.container}>
      {/* 💙 ヘッダー */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>達成グラフ</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 🌿 視認性を高めた棒グラフ */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>最近のあなたの積み上げ</Text>

        {recentKeys.length > 0 ? (
          <BarChart
            data={{
              labels,
              datasets: [{ data }],
            }}
            width={screenWidth}
            height={230}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=""
            withInnerLines={true} // ← 補助線ありで比較しやすく
            withHorizontalLabels={true} // ← y軸ラベルを表示
            segments={4} // ← y軸目盛りを4段階に
            chartConfig={{
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              barPercentage: 0.55,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`, // ← 濃い青系
              labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
              propsForLabels: {
                fontSize: 13,
                fontWeight: "600",
              },
              propsForBackgroundLines: {
                strokeDasharray: "", // 実線でスッキリ
                strokeWidth: 0.5,
                stroke: "#CBD5E1", // 薄いグレー
              },
            }}
            style={styles.chartStyle}
          />
        ) : (
          <Text style={styles.emptyText}>
            まだ達成データがありません{"\n"}今日の「できた」を記録してみよう。
          </Text>
        )}
      </View>

      <Text style={styles.encourageText}>
        完璧じゃなくていい。少しずつで大丈夫。
      </Text>
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
  chartCard: {
    backgroundColor: "#FFFFFFEE",
    borderRadius: 18,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 12,
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 15,
    marginTop: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  encourageText: {
    marginTop: 28,
    textAlign: "center",
    color: "#1E3A8A",
    fontSize: 15,
    fontStyle: "italic",
    opacity: 0.8,
  },
});