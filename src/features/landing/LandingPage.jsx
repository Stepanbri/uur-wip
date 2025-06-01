import React from 'react';
import {
    Typography,
    Button,
    Container,
    Box,
    Grid, // Stále použito pro Hero a další layouty, ale ne pro Funkce
    Divider,
    Card,
    CardContent,
    CardHeader,
    Chip,
    useTheme,
    ListItemIcon
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Ikony
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitHubIcon from '@mui/icons-material/GitHub';
import SchoolIcon from '@mui/icons-material/School';

function LandingPage() {
    const { t } = useTranslation();
    const theme = useTheme();
    const UNIVERSITY_URL = "https://www.zcu.cz";
    const PROJECT_GITHUB_URL = "https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME"; // AKTUALIZUJTE!

    const technologies = [
        { name: 'React', logoSrc: '/src/assets/react-logo.svg', descriptionKey: 'landingPage.tech.reactDesc', version: "18.2.0" },
        { name: 'MUI', logoSrc: '/src/assets/mui-logo.svg', descriptionKey: 'landingPage.tech.muiDesc', version: "5.15.0" },
        { name: 'Vite', logoSrc: '/src/assets/vite-logo.svg', descriptionKey: 'landingPage.tech.viteDesc', version: "5.0.0" },
        { name: 'i18next', logoSrc: '/src/assets/i18next-logo.svg', descriptionKey: 'landingPage.tech.i18nextDesc', version: "23.7.0" },
    ];

    const appFunctionKeys = [
        { titleKey: 'landingPage.functions.func1.title', descKey: 'landingPage.functions.func1.desc' },
        { titleKey: 'landingPage.functions.func2.title', descKey: 'landingPage.functions.func2.desc' },
        { titleKey: 'landingPage.functions.func3.title', descKey: 'landingPage.functions.func3.desc' },
        { titleKey: 'landingPage.functions.func4.title', descKey: 'landingPage.functions.func4.desc' },
        { titleKey: 'landingPage.functions.func5.title', descKey: 'landingPage.functions.func5.desc' },
        { titleKey: 'landingPage.functions.func6.title', descKey: 'landingPage.functions.func6.desc' },
    ];

    const sectionBoxSx = {
        width: '100%',
        py: { xs: 5, md: 8 },
        px: { xs: 2, md: 3 },
        backgroundColor: theme.palette.background.default, // Jednotné pozadí
        component: "section",
    };

    const sectionTitleSxProp = {
        variant: "h3",
        component: "h2",
        sx: {
            mb: 6,
            fontWeight: '500',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }
    };

    const cardBaseSx = {
        height: '100%', // Důležité pro konzistentní výšku, pokud jsou karty v jednom řádku (což Flexbox zajistí)
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadows[3],
        borderRadius: 2,
        transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[6],
        }
    };

    return (
        <>
            {/* 1. Hero Sekce */}
            <Box
                component="section"
                sx={{
                    width: '100%',
                    minHeight: { xs: 'auto', md: '80vh' },
                    display: 'flex',
                    alignItems: 'center',
                    py: { xs: 6, md: 8 },
                    px: { xs: 2, md: 3 },
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Container maxWidth="lg">
                    <Grid container alignItems="center" spacing={{ xs: 4, md: 6 }} justifyContent="center">
                        <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', mb: 3, fontSize: {xs: '2.8rem', sm: '3.5rem', md: '4rem'}, lineHeight: 1.15 }}>
                                {t('landingPage.hero.title')}
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ mb: 5, opacity: 0.8, fontSize: {xs: '1.1rem', md: '1.25rem'} }}>
                                {t('landingPage.hero.description')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    component={RouterLink}
                                    to="/editor"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{ py: 1.5, px: 5, fontSize: '1.1rem', textTransform: 'none' }}
                                >
                                    {t('landingPage.hero.editorButton')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    href={UNIVERSITY_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<SchoolIcon />}
                                    sx={{ py: 1.5, px: 5, fontSize: '1.1rem', textTransform: 'none' }}
                                >
                                    {t('landingPage.hero.universityButton')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Divider />

            {/* 2. Funkce Aplikace*/}
            <Box sx={sectionBoxSx}>
                <Container maxWidth="lg">
                    <Typography {...sectionTitleSxProp}>
                        {t('landingPage.functions.sectionTitle')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 5, fontSize: '1.15rem', color: 'text.secondary', textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
                        {t('landingPage.functions.intro')}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: theme.spacing(4),
                        }}
                    >
                        {appFunctionKeys.map((func, index) => (
                            <Card
                                key={index}

                                sx={{
                                    ...cardBaseSx, // Společné styly pro karty
                                    width: { xs: '100%', sm: `calc(50% - ${theme.spacing(2)})`, md: `calc(33.333% - ${theme.spacing(8/3)})` }, // Responzivní šířka
                                    // Pro 3 karty: 100%/3 = 33.333%. Odečteme část gapu, aby se vešly. Gap je 4, takže 2*4/3 = 8/3.
                                    // Pro 2 karty (sm): 100%/2 = 50%. Odečteme část gapu, 1*4/2 = 2.
                                    // Na xs zaberou celou šířku.
                                    minWidth: { sm: 280 }, // Minimální šířka karty na menších obrazovkách
                                }}
                            >
                                <CardHeader
                                    title={
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium' }}>
                                            {t(func.titleKey)}
                                        </Typography>
                                    }
                                    sx={{ pb: 0, alignItems: 'flex-start' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}> {/* flexGrow pro vyplnění výšky */}
                                    <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
                                        {t(func.descKey)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            <Divider />

            {/* 3. Použité Technologie */}
            <Box sx={sectionBoxSx}>
                <Container maxWidth="lg">
                    <Typography {...sectionTitleSxProp}>
                        {t('landingPage.tech.sectionTitle')}
                    </Typography>
                    <Box>
                        {technologies.map((tech, index) => (
                            <React.Fragment key={tech.name}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    py: 3,
                                    gap: 3,
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    textAlign: { xs: 'center', sm: 'left' }
                                }}>
                                    <Box sx={{ flexShrink: 0, width: {xs: 64, sm: 80}, height: {xs: 64, sm: 80}, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img
                                            src={tech.logoSrc}
                                            alt={`${tech.name} logo`}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, justifyContent: {xs: 'center', sm: 'flex-start'} }}>
                                            <Typography variant="h5" component="h3" sx={{ fontWeight: 'medium' }}>
                                                {tech.name}
                                            </Typography>
                                            <Chip
                                                label={`${t('landingPage.tech.versionLabel', 'Verze')}: ${tech.version}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="body1" color="text.secondary">
                                            {t(tech.descriptionKey)}
                                        </Typography>
                                    </Box>
                                </Box>
                                {index < technologies.length - 1 && <Divider variant="middle" />}
                            </React.Fragment>
                        ))}
                    </Box>
                </Container>
            </Box>

            <Divider />

            {/* 4. O Autorech / GitHub */}
            <Box sx={sectionBoxSx}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography {...sectionTitleSxProp}>
                        {t('landingPage.author.sectionTitle')}
                    </Typography>
                    <Typography variant="h6" component="p" sx={{ mb: 2, color: 'text.secondary' }}>
                        {t('landingPage.author.namePlaceholder', '[Vaše Jméno / Název Týmu]')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', color: 'text.secondary' }}>
                        {t('landingPage.author.summary')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        href={PROJECT_GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GitHubIcon />}
                        sx={{ py: 1.5, px: 5, fontSize: '1.1rem', textTransform: 'none' }}
                    >
                        {t('landingPage.author.githubButton')}
                    </Button>
                </Container>
            </Box>
        </>
    );
}

export default LandingPage;