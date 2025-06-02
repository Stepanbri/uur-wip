import React from 'react';
import {
    Paper,
    Typography,
    IconButton,
    Switch,
    Box
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';

function PreferenceItem({
                            preference,
                            onPriorityChange,
                            onToggleActive,
                            onDelete,
                            isFirst,
                            isLast,
                            displayLabel // Formátovaný textový popis preference
                        }) {
    const { t } = useTranslation();

    const handleIncreasePriority = () => {
        if (!isFirst) {
            onPriorityChange(preference.id, 'up');
        }
    };

    const handleDecreasePriority = () => {
        if (!isLast) {
            onPriorityChange(preference.id, 'down');
        }
    };

    return (
        <Paper
            elevation={1}
            sx={{
                p: 1,
                mb: 1,
                display: 'flex',
                alignItems: 'center', // Vertikální zarovnání obsahu na střed
                gap: 0.5, // Zmenšená mezera mezi hlavními bloky
                opacity: preference.isActive ? 1 : 0.65,
                transition: 'opacity 0.3s ease, background-color 0.3s ease',
                '&:hover': {
                    backgroundColor: (theme) => theme.palette.action.hover,
                },
                minHeight: '56px', // Minimální výška pro konzistenci
            }}
        >
            {/* Priorita a šipky */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', pr: 0.5 }}>
                <IconButton
                    size="small"
                    onClick={handleIncreasePriority}
                    disabled={isFirst || !preference.isActive}
                    aria-label={t('propertiesBar.preferenceItem.increasePriority', 'Zvýšit prioritu')}
                    sx={{ p: 0.25, flex: 1 }}
                >
                    <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
                <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2, p: '2px 0', textAlign: 'center', minWidth: '20px' }}>
                    {preference.priority}
                </Typography>
                <IconButton
                    size="small"
                    onClick={handleDecreasePriority}
                    disabled={isLast || !preference.isActive}
                    aria-label={t('propertiesBar.preferenceItem.decreasePriority', 'Snížit prioritu')}
                    sx={{ p: 0.25, flex: 1 }}
                >
                    <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
            </Box>

            {/* Popis preference */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', py: 0.5, alignSelf: 'center' }}>
                <Typography variant="caption" component="div" sx={{ fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase', color: 'text.secondary' }}>
                    {t(`preferences.types.${preference.type}.shortLabel`, preference.type)}
                </Typography>
                <Typography variant="body2" component="div" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={displayLabel}>
                    {displayLabel}
                </Typography>
            </Box>

            {/* Přepínač a mazání */}
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5 }}>
                <Switch
                    checked={preference.isActive}
                    onChange={() => onToggleActive(preference.id)}
                    size="small"
                    aria-label={t('propertiesBar.preferenceItem.toggleActive', 'Aktivovat/deaktivovat preferenci')}
                />
                <IconButton
                    size="small"
                    onClick={() => onDelete(preference.id)}
                    aria-label={t('propertiesBar.preferenceItem.deletePreference', 'Smazat preferenci')}
                    sx={{ color: (theme) => theme.palette.text.secondary, '&:hover': { color: (theme) => theme.palette.error.main } }}
                >
                    <DeleteOutlineIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
            </Box>
        </Paper>
    );
}

export default PreferenceItem;