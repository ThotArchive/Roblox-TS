import { useState, useEffect } from "react";

const useTheme = (): "dark" | "light" => {
  const [darktheme, setDarkTheme] = useState(document.body.classList.contains("dark-theme"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkTheme(document.body.classList.contains("dark-theme"));
    });
    observer.observe(document.body, { attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
    };
  }, []);

  return darktheme ? "dark" : "light";
};

export default useTheme;
