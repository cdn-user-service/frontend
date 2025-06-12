// src/hooks/useElementResize.ts
import { useEffect } from 'react';

interface ElementResizeOptions {
  elementId: string;
  collapseHandler?: (isCollapse: boolean) => void;
}

export const useElementResize = ({ elementId, collapseHandler }: ElementResizeOptions) => {
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const isCollapse = width >= 992 && width <= 1366;

        if (collapseHandler) {
          collapseHandler(isCollapse);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementId, collapseHandler]);
};