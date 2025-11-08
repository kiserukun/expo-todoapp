import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";
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
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handleNavigate}>
      <Animatable.View
        animation="fadeIn"
        duration={1200}
        style={styles.innerContainer}
      >
        <Text style={styles.title}>今日の教訓 🧠</Text>

        <Animatable.Text
          animation="fadeInUp"
          delay={500}
          duration={1000}
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
    </TouchableOpacity>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F59E0B", // orange系
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(255,255,255,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 20,
  },
  lessonText: {
    color: "white",
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 28,
  },
  tapText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 40,
  },
});
