import React from 'react';

import { ThemeProvider as MuiThemeProvider } from '@material-ui/core';
import lightTheme from 'styles/theme';

const ThemeProvider = ({ children }) => (
  <MuiThemeProvider theme={lightTheme}>{children}</MuiThemeProvider>
);

export default ThemeProvider;
