// Lucide passes `color`, `style`, `strokeWidth`; align SvgProps with runtime for strict TS + React 19.
declare module 'react-native-svg' {
  interface SvgProps {
    color?: string;
    style?: unknown;
    strokeWidth?: number | string;
  }
}
