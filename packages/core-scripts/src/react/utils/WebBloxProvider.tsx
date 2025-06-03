import { ReactNode, JSX } from "react";
import { createCache, CacheProvider, UIThemeProvider } from "@rbx/ui";
import useTheme from "../hooks/useTheme";

const cache = createCache();

const WebBloxProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const theme = useTheme();
  return (
    <CacheProvider cache={cache}>
      <UIThemeProvider theme={theme} cssBaselineMode="disabled">
        {children}
      </UIThemeProvider>
    </CacheProvider>
  );
};

export default WebBloxProvider;
