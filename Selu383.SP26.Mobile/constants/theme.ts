import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1d1715',
    background: '#faf6f1',
    tint: '#65a30d',
    icon: '#8b7355',
    tabIconDefault: '#8b7355',
    tabIconSelected: '#65a30d',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1d1715',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  // brand + palette
  brandGreen: '#65a30d',
  brandGreenDark: '#558c0a',
  darkCard: '#2a2018',
  error: '#d4183d',
  success: '#27AE60',
  warning: '#F39C12',
  // warm palette (matches web)
  cream: '#faf6f1',
  sand: '#f0e8dd',
  warmTan: '#e5d5c3',
  caramel: '#c4a882',
  mocha: '#8b7355',
  espresso: '#5c4a32',
  darkBrew: '#1d1715',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
