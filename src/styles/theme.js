import { createTheme } from '@mui/material/styles';

// https://material-ui.com/customization/palette/#adding-new-colors
const colors = {
  white: '#fff',
  blueGreen: '#2da39d',
  blueGreenDark: '#227c78',
  grayMedium: '#c2c2c2',
  grayLight: '#eeeeee',
  grayDark: '#323841',
  blueGreenLight: '#f2f9f8',
  redLight: '#ffe6ee',
};

const paletteBase = {
  primary: {
    main: colors.grayDark,
  },
  secondary: {
    main: colors.blueGreen,
  },
  background: {
    default: colors.white,
  },
  common: colors,
};

const lightTheme = createTheme({
  palette: { ...paletteBase },
  typography: {
    h2: {
      fontFamily: ['Roboto', 'sans-serif'].join(','),
    },
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: '1px',
        height: '56px',
      },
      label: {
        textTransform: 'none',
        fontSize: '24px',
        fontWeight: 'bold',
      },
      contained: {
        color: paletteBase.common.white,
        backgroundColor: paletteBase.common.blueGreen,
        '&$disabled': {
          color: '#9d9d9d',
          backgroundColor: paletteBase.common.grayMedium,
        },
        '&:hover': {
          backgroundColor: paletteBase.common.blueGreenDark,
        }
      },
    },
    MuiInputBase: {
      root: {
        borderRadius: '1px',
        backgroundColor: paletteBase.common.grayLight,
      },
    },
    MuiFilledInput: {
      root: {
        borderRadius: '1px',
        borderTopLeftRadius: '1px',
        borderTopRightRadius: '1px',
        backgroundColor: paletteBase.common.grayLight,
      },
      input: {
        padding: '18px 12px 17px',
      },
    },
    MuiInput: {
      formControl: {
        'label + &': {
          marginTop: '0',
        },
      },
    },
    MuiInputLabel: {
      root: {
        textTransform: 'none',
        fontWeight: 'bold',
        marginBottom: '3px',
      },
      formControl: {
        position: 'relative',
        transform: 'none',
      },
      filled: {
        '&$shrink': {
          transform: 'none',
        },
      },
      shrink: {
        transform: 'none',
      }
    },
    MuiTextField: {
      root: {
        marginBottom: '20px',
      },
    },
  },
});

export default lightTheme;
