module.exports = {
  expo: {
    name: "MyTodoApp",
    slug: "my-todo-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF",
    },
    ios: {
      bundleIdentifier: "com.homes.mytodoapp", // ← 自分のIDに変更
      supportsTablet: false,
    },
    web: {
      favicon: "./assets/icon.png",
    },
  },
};
