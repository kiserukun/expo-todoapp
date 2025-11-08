declare module "react-native-svg-charts" {
  import { ScaleBand } from "d3-scale";
  import * as React from "react";
  import { ViewStyle } from "react-native";

  export interface ChartProps<T> {
    data: T[];
    style?: ViewStyle;
    svg?: any;
    contentInset?: { top?: number; bottom?: number; left?: number; right?: number };
    yAccessor?: (item: { item: T; index: number }) => number;
    gridMin?: number;
    gridMax?: number;
    spacingInner?: number;
    spacingOuter?: number;
    animate?: boolean;
  }

  export class Grid extends React.Component<any> {}
  export class BarChart<T = number> extends React.Component<ChartProps<T>> {}
  export class XAxis extends React.Component<{
    data: any[];
    formatLabel?: (value: any, index: number) => string;
    contentInset?: { left?: number; right?: number };
    svg?: any;
    scale?: ScaleBand<any>;
    style?: ViewStyle;
  }> {}
  export class YAxis extends React.Component<{
    data: any[];
    contentInset?: { top?: number; bottom?: number };
    svg?: any;
    numberOfTicks?: number;
    formatLabel?: (value: any) => string;
    style?: ViewStyle;
  }> {}
}
