import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import {
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Button,
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
import HomeIcon from '@mui/icons-material/Home'; // Nebo vaše ikona loga
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { createAppTheme } from './styles/theme'; // Předpokládám, že theme.js je v src/styles/

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
                '&:hover': { backgroundColor: 'transparent' },
                p: 0, // Minimal padding for the button itself
            }}
        >
            <HomeIcon sx={{ mr: 1, fontSize: inDrawer ? '2rem' : '1.75rem' }} />
            <Typography variant={inDrawer ? "h6" : "h5"} component="div" sx={{ flexGrow: 0, whiteSpace: 'nowrap' }}>
                {t('appTitleShort', 'Planner')}
            </Typography>
        </Button>
    );
};

function App() {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        const storedLang = localStorage.getItem('i18nextLng');
        return storedLang ? storedLang.split('-')[0] : 'cs';
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const prefersDarkModeSystem = useMediaQuery('(prefers-color-scheme: dark)');

    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode');
        setMode(savedMode || (prefersDarkModeSystem ? 'dark' : 'light'));
    }, [prefersDarkModeSystem]);

    useEffect(() => {
        const savedLang = localStorage.getItem('i18nextLng')?.split('-')[0];
        const targetLang = (savedLang && ['cs', 'en'].includes(savedLang)) ? savedLang : 'cs';
        setCurrentLanguage(targetLang);
        if (i18n.language !== targetLang) {
            i18n.changeLanguage(targetLang);
        }
    }, [i18n]);

    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };
    const toggleLanguage = () => {
        const newLanguage = currentLanguage === 'cs' ? 'en' : 'cs';
        setCurrentLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
    };

    const navItems = [
        { textKey: 'nav.editor', path: '/editor', icon: <EditIcon /> },
        { textKey: 'nav.faq', path: '/faq', icon: <HelpOutlineIcon /> },
    ];

    const drawerContent = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: {xs: '80vw', sm: 280} }} role="presentation">
            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <Logo inDrawer={true} />
            </Box>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.textKey} disablePadding>
                        <ListItemButton component={RouterLink} to={item.path} selected={location.pathname === item.path}>
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
                        <ListItemIcon>{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
                        <ListItemText primary={mode === 'dark' ? t('themeToggle.light', 'Světlý režim') : t('themeToggle.dark', 'Tmavý režim')} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%', // Změněno z minHeight na height, aby #root s display:flex fungoval lépe
            }}>
                <AppBar position="static">
                    <Toolbar>
                        {isMobile && (
                            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                            <Logo />
                        </Box>
                        {!isMobile && (
                            <Box>
                                {navItems.map((item) => (
                                    <Button key={item.textKey} color="inherit" component={RouterLink} to={item.path}
                                            sx={{ fontWeight: location.pathname === item.path ? 'bold' : 'normal', textDecoration: location.pathname === item.path ? 'underline' : 'none', textUnderlineOffset: '4px', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}>
                                        {t(item.textKey)}
                                    </Button>
                                ))}
                                <Button color="inherit" onClick={toggleLanguage} variant="outlined" size="small" sx={{ ml: 1, mr: 0.5, borderColor: 'rgba(255,255,255,0.7)', color: 'white' }}>
                                    {currentLanguage.toUpperCase()}
                                </Button>
                                <Tooltip title={mode === 'dark' ? t('themeToggle.lightTooltip', "Přepnout na světlý režim") : t('themeToggle.darkTooltip', "Přepnout na tmavý režim")}>
                                    <IconButton sx={{ ml: 0.5 }} onClick={toggleColorMode} color="inherit">
                                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>

                {isMobile && (
                    <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} PaperProps={{ sx: { width: {xs: '80vw', sm: 280} } }}>
                        {drawerContent}
                    </Drawer>
                )}

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1, // Klíčové: tento Box zabere všechen dostupný vertikální prostor
                        display: 'flex',
                        flexDirection: 'column', // Potomci se budou skládat vertikálně
                        width: '100%',
                        maxWidth: '100%'
                        // p: 0, // Odebrání paddingu, pokud není žádoucí globální padding
                    }}
                >
                    {/* EditorPage a ostatní routy by měly být navrženy tak, aby vyplnily tento prostor */}
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/editor" element={<EditorPage />} />
                    </Routes>
                </Box>
                {/* Patička odstraněna */}
            </Box>
        </ThemeProvider>
    );
}

export default App;
