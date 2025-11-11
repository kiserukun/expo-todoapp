import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../app/screens/HomeScreen";

// AsyncStorage のモック

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve("[]")),
}));

describe("HomeScreen", () => {
  it("renders correctly", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("マイリスト")).toBeTruthy();
    expect(getByText("教訓ノート")).toBeTruthy();
    expect(getByText("達成グラフ")).toBeTruthy();
  });

  it("opens modal when add button pressed", () => {
    const { getByTestId, getByText } = render(<HomeScreen />);
    const addButton = getByText("+") || getByText("add");
    fireEvent.press(addButton);
    expect(getByText("新しいリストを作成")).toBeTruthy();
  });
});
