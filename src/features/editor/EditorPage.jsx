import React from 'react';
import { Typography, Container, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

function EditorPage() {
    const { t } = useTranslation();

    return (
        <Container maxWidth="lg"> {/* Editor může potřebovat více šířky */}
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('editorPage.title')}
                </Typography>
                <Typography variant="body1">
                    Toto je placeholder pro Editor Rozvrhu. Funkcionalita bude implementována později.
                </Typography>
                {/* Zde bude hlavní obsah editoru */}
            </Paper>
        </Container>
    );
}

export default EditorPage;