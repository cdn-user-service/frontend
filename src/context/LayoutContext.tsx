// src/context/LayoutContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// 类型定义
export type DeviceType = 'pc' | 'pad' | 'mobile';
export type LayoutMode = 'ttb' | 'ltr'; // top-to-bottom 或 left-to-right
export type ThemeMode = 'light' | 'dark';

export interface LayoutTheme {
  layoutMode: LayoutMode;
  themeMode: ThemeMode;
}

export interface LayoutState {
  layoutTheme: LayoutTheme;
  device: DeviceType;
  isPhone: boolean;
  isMobileAsideShow: boolean;
  sidebarCollapsed: boolean;
}

// Action 类型
export type LayoutAction =
  | { type: 'CHANGE_LAYOUT_THEME'; payload: Partial<LayoutTheme> }
  | { type: 'CHANGE_DEVICE'; payload: DeviceType }
  | { type: 'CHANGE_IS_PHONE'; payload: boolean }
  | { type: 'TOGGLE_MOBILE_ASIDE'; payload?: boolean }
  | { type: 'TOGGLE_SIDEBAR_COLLAPSE'; payload?: boolean };

// 初始状态
const initialState: LayoutState = {
  layoutTheme: {
    layoutMode: 'ltr',
    themeMode: 'light',
  },
  device: 'pc',
  isPhone: false,
  isMobileAsideShow: false,
  sidebarCollapsed: false,
};

// Reducer
const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'CHANGE_LAYOUT_THEME':
      return {
        ...state,
        layoutTheme: { ...state.layoutTheme, ...action.payload },
      };
    case 'CHANGE_DEVICE':
      return { ...state, device: action.payload };
    case 'CHANGE_IS_PHONE':
      return { ...state, isPhone: action.payload };
    case 'TOGGLE_MOBILE_ASIDE':
      return {
        ...state,
        isMobileAsideShow: action.payload ?? !state.isMobileAsideShow,
      };
    case 'TOGGLE_SIDEBAR_COLLAPSE':
      return {
        ...state,
        sidebarCollapsed: action.payload ?? !state.sidebarCollapsed,
      };
    default:
      return state;
  }
};

// Context
interface LayoutContextType {
  state: LayoutState;
  dispatch: React.Dispatch<LayoutAction>;
  // 便捷方法
  changeLayoutTheme: (theme: Partial<LayoutTheme>) => void;
  changeDevice: (device: DeviceType) => void;
  changeIsPhone: (isPhone: boolean) => void;
  toggleMobileAside: (show?: boolean) => void;
  toggleSidebarCollapse: (collapsed?: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Provider
interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  const changeLayoutTheme = (theme: Partial<LayoutTheme>) => {
    dispatch({ type: 'CHANGE_LAYOUT_THEME', payload: theme });
  };

  const changeDevice = (device: DeviceType) => {
    dispatch({ type: 'CHANGE_DEVICE', payload: device });
  };

  const changeIsPhone = (isPhone: boolean) => {
    dispatch({ type: 'CHANGE_IS_PHONE', payload: isPhone });
  };

  const toggleMobileAside = (show?: boolean) => {
    dispatch({ type: 'TOGGLE_MOBILE_ASIDE', payload: show });
  };

  const toggleSidebarCollapse = (collapsed?: boolean) => {
    dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSE', payload: collapsed });
  };

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let device: DeviceType = 'pc';
      let isPhone = false;
      let shouldCollapse = false;

      // if (width <= 768) {
      //   isPhone = true;
      //   device = 'mobile';
      // } else if (width > 768 && width < 992) {
      //   device = 'pad';
      // } else if (width >= 992 && width <= 1366) {
      //   shouldCollapse = true;
      // }

      changeDevice(device);
      changeIsPhone(isPhone);
      toggleSidebarCollapse(shouldCollapse);
    };

    // 初始化
    handleResize();

    // 防抖处理
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mode = state.layoutTheme.themeMode;

    if (mode === 'dark') {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    }
  }, [state.layoutTheme.themeMode]);

  const value: LayoutContextType = {
    state,
    dispatch,
    changeLayoutTheme,
    changeDevice,
    changeIsPhone,
    toggleMobileAside,
    toggleSidebarCollapse,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// Hook
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};