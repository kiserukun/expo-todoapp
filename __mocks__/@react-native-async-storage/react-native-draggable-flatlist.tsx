import React from "react";
export default (props: any) => {
  return <>{props.data?.map((item: any, index: number) => props.renderItem({ item, index, drag: () => { } }))}</>;
};
