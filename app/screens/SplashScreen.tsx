import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function SplashScreen() {
  const navigation = useNavigation();
  const [lesson, setLesson] = useState("...");
  const [navigated, setNavigated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("memos");
        const memos = saved ? JSON.parse(saved) : [];
        const randomMemo =
          memos && memos.length > 0
            ? memos[Math.floor(Math.random() * memos.length)]
            : { text: "焦らず、まずは深呼吸。小さく整えることから始めよう。" };

        setLesson(typeof randomMemo === "string" ? randomMemo : randomMemo.text);
      } catch (e) {
        console.log("Failed to load memos:", e);
      }
    })();
  }, []);

  const handleNavigate = () => {
    if (navigated) return;
    setNavigated(true);
    navigation.navigate("Home" as never);
  };

  return (
    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleNavigate}>
      {/* 🌤 グラデーション背景 */}
      <LinearGradient
        colors={["#BFDBFE", "#DBEAFE", "#EFF6FF"]}
        style={styles.container}
      >
        <Animatable.View animation="fadeIn" duration={1200} style={styles.innerContainer}>
          <Text style={styles.title}>今日のひとこと</Text>

          <Animatable.Text
            animation="fadeInUp"
            delay={400}
            duration={1200}
            style={styles.lessonText}
          >
            「{lesson}」
          </Animatable.Text>

          <Animatable.Text
            animation="pulse"
            iterationCount="infinite"
            easing="ease-in-out"
            delay={1000}
            style={styles.tapText}
          >
            画面をタップしてはじめる
          </Animatable.Text>
        </Animatable.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    height,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 24,
  },
  lessonText: {
    color: "#1E40AF",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  tapText: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 40,
  },
});
