import { useState, useCallback } from "react";

export const useSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const close = useCallback(() => setCollapsed(true), []);
  const open = useCallback(() => setCollapsed(false), []);

  return { collapsed, toggle, close, open };
};
