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

type StatData = {
  date: string;
  value: number;
  label: string;
};

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
          .map(([date, value]) => {
            const num = Number.isFinite(+value!) ? +value! : 0;
            return { date, value: num, label: toShortLabel(date) };
          })
          .sort((a, b) => (a.date < b.date ? -1 : 1));

        // ✅ データが7日分になるよう補完
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
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>達成数グラフ</Text>
      </View>

      {/* グラフ */}
      {data.length === 0 ? (
        <Text style={styles.emptyText}>
          まだ達成データがありません。タスクを完了すると自動で記録されます 📊
        </Text>
      ) : (
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: labels,
              datasets: [{ data: values }],
            }}
            width={Dimensions.get("window").width - 40}
            height={250}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel=""          // ✅ 追加
            yAxisSuffix=""         // ✅ 追加
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(49, 130, 206, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: "#e3e3e3",
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}

// ✅ スタイル
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6EEFF",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#555",
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginTop: 30,
    fontSize: 15,
  },
});
