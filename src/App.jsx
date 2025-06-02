// src/App.jsx
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
    Divider,
    Container
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { createAppTheme } from './styles/theme';

import LandingPage from './features/landing/LandingPage.jsx';
import FAQPage from './features/faq/FAQPage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';

import WebLogo from './assets/web-logo.svg';

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
                p: 0,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Box
                component="img"
                src={WebLogo}
                alt={t('appTitleShort', 'Planner Logo')}
                sx={{
                    height: inDrawer ? 32 : 40,
                    width: 'auto',
                    mr: 1,
                    filter: (theme) => (theme.palette.mode === 'dark' && !inDrawer ? 'invert(1) brightness(2)' : 'none'),
                }}
            />
            {!inDrawer && (
                <Typography variant="h5" component="div" sx={{ flexGrow: 0, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
                    {t('appTitleShort', 'Planner')}
                </Typography>
            )}
            {inDrawer && (
                <Typography variant="h6" component="div" sx={{ flexGrow: 0, whiteSpace: 'nowrap' }}>
                    {t('appTitleShort', 'Planner')}
                </Typography>
            )}
        </Button>
    );
};

function App() {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        const prefersDarkModeSystem = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedMode || (prefersDarkModeSystem ? 'dark' : 'light');
    });

    const [currentLanguage, setCurrentLanguage] = useState(() => {
        const storedLang = localStorage.getItem('i18nextLng');
        return storedLang ? storedLang.split('-')[0] : 'cs';
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (!localStorage.getItem('themeMode')) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const savedLang = localStorage.getItem('i18nextLng')?.split('-')[0];
        const targetLang = (savedLang && ['cs', 'en'].includes(savedLang)) ? savedLang : 'cs';
        setCurrentLanguage(targetLang);
        if (i18n.language !== targetLang) {
            i18n.changeLanguage(targetLang);
        }
    }, [i18n]);

    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const isMobileOrSmaller = useMediaQuery(theme.breakpoints.down('sm'));

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
                            <ListItemIcon sx={{minWidth: 'auto', mr: 2}}>{item.icon}</ListItemIcon>
                            <ListItemText primary={t(item.textKey)} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleLanguage}>
                        <ListItemIcon sx={{minWidth: 'auto', mr: 2}}><LanguageIcon /></ListItemIcon>
                        <ListItemText primary={`${t('languageToggle')}: ${currentLanguage.toUpperCase()}`} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleColorMode}>
                        <ListItemIcon sx={{minWidth: 'auto', mr: 2}}>{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
                        <ListItemText primary={mode === 'dark' ? t('themeToggle.light') : t('themeToggle.dark')} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <AppBar position="static">
                    <Container maxWidth="xl" disableGutters>
                        <Toolbar>
                            {isMobileOrSmaller && (
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    sx={{ mr: 1 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                <Logo />
                            </Box>

                            {!isMobileOrSmaller && (
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
                                                textUnderlineOffset: '4px',
                                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                                                mr: 1
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
                                        startIcon={<LanguageIcon />}
                                        sx={{
                                            ml: 1,
                                            mr: 0.5,
                                            borderColor: 'rgba(255,255,255,0.7)',
                                            color: 'white',
                                            '& .MuiButton-startIcon': { mr: 0.5 }
                                        }}
                                    >
                                        {currentLanguage.toUpperCase()}
                                    </Button>
                                    <Tooltip title={mode === 'dark' ? t('themeToggle.lightTooltip') : t('themeToggle.darkTooltip')}>
                                        <IconButton sx={{ ml: 0.5 }} onClick={toggleColorMode} color="inherit">
                                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Toolbar>
                    </Container>
                </AppBar>

                <Drawer
                    variant="temporary"
                    open={mobileOpen && isMobileOrSmaller}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    slotProps={{ sx: { width: { xs: '80vw', sm: 280 } } }}
                >
                    {drawerContent}
                </Drawer>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        // ODSTRANĚNO: overflow: 'hidden',
                        // PŘIDÁNO/UPRAVENO:
                        overflowY: location.pathname === '/editor' ? 'hidden' : 'auto', // Skrolování pro ostatní stránky, pro editor skryté
                        height: location.pathname === '/editor' ? 'calc(100vh - 64px)' : 'auto' // 64px je typická výška AppBaru, přizpůsobit pokud je jiná
                        // Pro ostatní stránky 'auto' aby se přizpůsobila obsahu
                    }}
                >
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/editor" element={<EditorPage />} />
                    </Routes>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;