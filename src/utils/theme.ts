'use client';

import {
  DEFAULT_THEME,
  type MantineThemeColors,
  type MantineBreakpointsValues,
  createTheme,
  mergeMantineTheme,
} from '@mantine/core';

export const colors: MantineThemeColors = DEFAULT_THEME.colors;
export const breakpoints: MantineBreakpointsValues = DEFAULT_THEME.breakpoints;

const themeOverride = createTheme({
  defaultRadius: 'lg',
  colors: {
    violet: [
      '#f7ecff',
      '#e7d6fb',
      '#caaaf1',
      '#ac7ce8',
      '#9354e0',
      '#833bdb',
      '#7b2eda',
      '#6921c2',
      '#5d1cae',
      '#501599',
    ],
  },
  defaultGradient: {
    from: '#fba0a0',
    to: 'red',
    deg: 45,
  },
  components: {
    Button: {
      defaultProps: {
        size: 'lg',
        variant: 'gradient',
      },
    },
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
