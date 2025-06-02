import React, { useState } from 'react';
import {
    Box,
    useMediaQuery,
    SwipeableDrawer,
    Tabs,
    Tab,
    IconButton,
    Typography,
    styled,
    useTheme
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu'; // Pro mobilní FAB
import { useTranslation } from 'react-i18next';

// Placeholder importy - nahraďte skutečnými cestami
import CourseBar from './CourseBar'; // Předpoklad: src/features/editor/CourseBar.jsx
import ScheduleBox from './ScheduleBox'; // Předpoklad: src/features/editor/ScheduleBox.jsx
import PropertiesBar from './PropertiesBar'; // Předpoklad: src/features/editor/PropertiesBar.jsx

// Šířky sidebarů - můžete upravit
const LEFT_SIDEBAR_WIDTH_DESKTOP = '280px'; // Pevná šířka pro lepší kontrolu
const RIGHT_SIDEBAR_WIDTH_DESKTOP = '320px';// Pevná šířka pro PropertiesBar

// Kořenový element pro EditorPage
const EditorPageRoot = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // Klíčové: vyplní výšku danou rodičem (z App.jsx)
    width: '100%',
    overflow: 'hideen', // Zabrání scrollu samotné EditorPage
});

// Layout pro desktop (tři sloupce)
const EditorLayoutDesktop = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexGrow: 1, // Klíčové: vyplní vertikální prostor v EditorPageRoot
    overflow: 'hidden', // Zabrání scrollu tohoto layoutu, vnitřní části budou scrollovat
    gap: theme.spacing(1.5), // Mezera mezi panely
    padding: theme.spacing(1.5), // Malý padding kolem celého třísloupcového layoutu
    backgroundColor: theme.palette.background.default, // Pozadí pro oblast editoru
}));

// Obalovač pro postranní panely
const SidebarWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'customWidth'
})(({ theme, customWidth }) => ({
    width: customWidth,
    minWidth: customWidth, // Zajistí, že se nesmrskne pod danou šířku
    height: '100%', // Klíčové: vyplní výšku EditorLayoutDesktop
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Samotný wrapper neskroluje
    backgroundColor: theme.palette.background.paper, // Pozadí pro sidebar, pokud PropertiesBar nemá vlastní
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

// Obalovač pro hlavní obsah (rozvrh)
const MainContentWrapper = styled(Box)(({ theme }) => ({
    flexGrow: 1, // Zabere zbývající šířku
    height: '100%', // Klíčové: vyplní výšku EditorLayoutDesktop
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Samotný wrapper neskroluje
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

const MobileDrawerToggleButton = styled(IconButton)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.speedDial,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.shadows[6],
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

function EditorPage() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Změna breakpointu na 'lg' pro dřívější mobilní zobrazení

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState(0);

    const handleDrawerToggle = () => setMobileDrawerOpen(!mobileDrawerOpen);
    const handleTabChange = (event, newValue) => setActiveMobileTab(newValue);

    const drawerContent = (
        <Box sx={{ width: { xs: '85vw', sm: 320 }, height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ ml: 1 }}>
                    {activeMobileTab === 0 ? t('editorPage.mobileDrawer.coursesTitle', 'Kurzy') : t('editorPage.mobileDrawer.propertiesTitle', 'Preference')}
                </Typography>
                <IconButton onClick={handleDrawerToggle}><CloseIcon /></IconButton>
            </Box>
            <Tabs value={activeMobileTab} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab icon={<ListIcon />} label={t('editorPage.mobileDrawer.coursesTab', 'Kurzy')} />
                <Tab icon={<TuneIcon />} label={t('editorPage.mobileDrawer.propertiesTab', 'Preference')} />
            </Tabs>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {/* Komponenty CourseBar a PropertiesBar by měly mít padding řešený interně */}
                {activeMobileTab === 0 && <CourseBar />}
                {activeMobileTab === 1 && <PropertiesBar />}
            </Box>
        </Box>
    );

    return (
        <EditorPageRoot>
            {isMobile ? (
                <>
                    <MainContentWrapper sx={{ borderRadius: 0, boxShadow: 'none', height: '100%' }}>
                        <ScheduleBox />
                    </MainContentWrapper>
                    <MobileDrawerToggleButton onClick={handleDrawerToggle} size="large">
                        <MenuIcon />
                    </MobileDrawerToggleButton>
                    <SwipeableDrawer
                        anchor="left"
                        open={mobileDrawerOpen}
                        onClose={() => setMobileDrawerOpen(false)}
                        onOpen={() => setMobileDrawerOpen(true)}
                        PaperProps={{ sx: { height: '100%', borderRight: `1px solid ${theme.palette.divider}` } }}
                    >
                        {drawerContent}
                    </SwipeableDrawer>
                </>
            ) : (
                <EditorLayoutDesktop>
                    <SidebarWrapper customWidth={LEFT_SIDEBAR_WIDTH_DESKTOP}>
                        <CourseBar /> {/* Předpokládá se, že CourseBar vyplní výšku */}
                    </SidebarWrapper>
                    <MainContentWrapper>
                        <ScheduleBox /> {/* Předpokládá se, že ScheduleBox vyplní výšku */}
                    </MainContentWrapper>
                    <SidebarWrapper customWidth={RIGHT_SIDEBAR_WIDTH_DESKTOP}>
                        <PropertiesBar /> {/* PropertiesBar by měl vyplnit výšku */}
                    </SidebarWrapper>
                </EditorLayoutDesktop>
            )}
        </EditorPageRoot>
    );
}

export default EditorPage;
