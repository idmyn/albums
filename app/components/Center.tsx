import { CSSProperties, PropsWithChildren } from "react";

type CenterProps = {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

export const Center = ({
  width,
  height,
  children,
}: PropsWithChildren<CenterProps>) => {
  return (
    <div style={{ display: "grid", placeItems: "center", width, height }}>
      {children}
    </div>
  );
};
