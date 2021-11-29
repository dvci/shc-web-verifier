import React from 'react';

import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import lightTheme from 'styles/theme';

const ThemeProvider = ({ children }) => (
  <MuiThemeProvider theme={lightTheme}>{children}</MuiThemeProvider>
);

export default ThemeProvider;
