import React from 'react';

import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import lightTheme from 'styles/theme';

const ThemeProvider = ({ children }) => (
  <StyledEngineProvider injectFirst>
    <MuiThemeProvider theme={lightTheme}>{children}</MuiThemeProvider>
  </StyledEngineProvider>
);

export default ThemeProvider;
