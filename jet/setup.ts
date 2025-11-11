// jest/setup.ts
import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-draggable-flatlist", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (props: any) => {
      return React.createElement("View", {}, props.data.map((item: any, index: number) =>
        props.renderItem({ item, index, drag: () => {} })
      ));
    },
  };
});

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  return {
    GestureHandlerRootView: ({ children }: any) => children,
    Swipeable: ({ children }: any) => children,
    PanGestureHandler: ({ children }: any) => children,
    State: {},
    TouchableOpacity: ({ children, ...props }: any) => React.createElement("TouchableOpacity", props, children),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Ionicons: ({ name, size, color }: any) => React.createElement("Text", { style: { fontSize: size, color } }, name),
  };
});
