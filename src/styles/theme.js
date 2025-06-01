import { createTheme } from '@mui/material/styles';

// light
// #12dade = accent barva
// #171c1c = text barva

// dark
// #23ebed = accent barva
// #e4e9e9 = text barva

// Příklad základního tématu, můžete rozšířit
const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Hodnoty pro světlý režim
                primary: {
                    main: '#25696a',
                },
                secondary: {
                    main: '#73e1e2',
                },
                background: {
                    default: '#f2f8f8',
                    paper: '#f2f8f8',
                },
            }
            : {
                // Hodnoty pro tmavý režim
                primary: {
                    main: '#97d9da',
                },
                secondary: {
                    main: '#1d8b8c',
                },
                background: {
                    default: '#080e0e',
                    paper: '#080e0e',
                },
            }),
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    // Zda místo
});


export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));