import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import HomeScreen from "./screens/HomeScreen";
import MemoListPage from "./screens/MemoListPage";
import SplashScreen from "./screens/SplashScreen";
import StatsPage from "./screens/StatsPage"; // ← ✅ 追加
import TaskListPage from "./screens/TaskListPage";

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  TaskList: { id: string };
  MemoList: undefined;
  Stats: undefined; // ← ✅ 追加
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TaskList" component={TaskListPage} />
      <Stack.Screen name="MemoList" component={MemoListPage} />
      <Stack.Screen name="Stats" component={StatsPage} />
    </Stack.Navigator>
  );
};

export default App;
