import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import {
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    IconButton,
    Tooltip,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home'; // Placeholder pro logo
import EditIcon from '@mui/icons-material/Edit'; // Ikona pro Editor
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Ikona pro FAQ
import LanguageIcon from '@mui/icons-material/Language'; // Ikona pro jazyk v draweru
import { useTranslation } from 'react-i18next';
import { createAppTheme } from './styles/theme';

import LandingPage from './features/landing/LandingPage.jsx';
import FAQPage from './features/faq/FAQPage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';

// Komponenta pro logo
const Logo = ({ inDrawer = false }) => {
    const { t } = useTranslation();
    return (
        <Button
            component={RouterLink}
            to="/"
            sx={{
                color: inDrawer ? 'text.primary' : 'inherit',
                textDecoration: 'none',
                '&:hover': { backgroundColor: 'transparent' }
            }}
        >
            <HomeIcon sx={{ mr: inDrawer ? 2 : 1, fontSize: inDrawer ? '2rem' : '1.75rem' }} />
            <Typography variant={inDrawer ? "h6" : "h5"} component="div" sx={{ flexGrow: inDrawer ? 0 : 1 }}>
                {t('appTitleShort', 'Planner')} {/* Přidejte 'appTitleShort' do JSON souborů nebo nechte fallback */}
            </Typography>
        </Button>
    );
};


function App() {
    const { t, i18n } = useTranslation();
    const location = useLocation(); // Pro zjištění aktivní cesty

    // Výchozí nastavení motivu a jazyka
    const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
    const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('i18nextLng')?.split('-')[0] || 'cs');
    const [mobileOpen, setMobileOpen] = useState(false);

    const prefersDarkModeSystem = useMediaQuery('(prefers-color-scheme: dark)');

    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            setMode(prefersDarkModeSystem ? 'dark' : 'light');
        }

        const savedLang = localStorage.getItem('i18nextLng')?.split('-')[0];
        if (savedLang && ['cs', 'en'].includes(savedLang)) {
            setCurrentLanguage(savedLang);
            i18n.changeLanguage(savedLang);
        } else {
            i18n.changeLanguage(currentLanguage);
        }
    }, [prefersDarkModeSystem, i18n, currentLanguage]);


    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // 'sm' je breakpoint pro mobilní zobrazení

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };

    const toggleLanguage = () => {
        const newLanguage = currentLanguage === 'cs' ? 'en' : 'cs';
        setCurrentLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
        localStorage.setItem('i18nextLng', newLanguage);
    };

    const navItems = [
        { textKey: 'nav.editor', path: '/editor', icon: <EditIcon /> },
        { textKey: 'nav.faq', path: '/faq', icon: <HelpOutlineIcon /> },
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: "100vw" }} role="presentation">
            <Box sx={{ my: 2 }}>
                <Logo inDrawer={true} />
            </Box>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.textKey} disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={t(item.textKey)} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleLanguage}>
                        <ListItemIcon><LanguageIcon /></ListItemIcon>
                        <ListItemText primary={`${t('languageToggle', 'Jazyk')}: ${currentLanguage.toUpperCase()}`} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleColorMode}>
                        <ListItemIcon>
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </ListItemIcon>
                        <ListItemText primary={mode === 'dark' ? t('themeToggle.light', 'Světlý režim') : t('themeToggle.dark', 'Tmavý režim')} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <Logo /> {/* Logo je nyní samostatná komponenta */}
                    </Box>

                    {!isMobile && (
                        <Box>
                            {navItems.map((item) => (
                                <Button
                                    key={item.textKey}
                                    color="inherit"
                                    component={RouterLink}
                                    to={item.path}
                                    sx={{
                                        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                                        textDecoration: location.pathname === item.path ? 'underline' : 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                        }
                                    }}
                                >
                                    {t(item.textKey)}
                                </Button>
                            ))}
                            <Button
                                color="inherit"
                                onClick={toggleLanguage}
                                variant="outlined"
                                size="small"
                                sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.7)', color: 'white' }}
                            >
                                {currentLanguage.toUpperCase()}
                            </Button>
                            <Tooltip title={mode === 'dark' ? t('themeToggle.lightTooltip', "Přepnout na světlý režim") : t('themeToggle.darkTooltip', "Přepnout na tmavý režim")}>
                                <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <nav> {/* Drawer pro mobilní zařízení */}
                {isMobile && (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Lepší výkon na mobilních zařízeních.
                        }}
                    >
                        {drawer}
                    </Drawer>
                )}
            </nav>

            <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/editor" element={<EditorPage />} />
                </Routes>
            </Container>

            <Box component="footer" sx={{ py: 3, px: 2, backgroundColor: theme.palette.background.paper }} >
                <Container maxWidth="sm">
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'© '}
                        {new Date().getFullYear()}
                        {' '}
                        {t('appTitleShort', 'Planner')}
                    </Typography>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default App;