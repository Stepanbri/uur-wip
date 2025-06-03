import React from 'react';
import { Box, Typography } from '@mui/material';
import PreferenceItem from './PreferenceItem';
import { useTranslation } from 'react-i18next';

function PreferenceList({
                            preferences,
                            onPriorityChange,
                            onToggleActive,
                            onDelete,
                            getPreferenceDisplayLabel
                        }) {
    const { t } = useTranslation();

    if (!preferences || preferences.length === 0) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    {t('propertiesBar.preferenceList.noPreferences', 'Zatím nebyly přidány žádné preference.')}
                </Typography>
            </Box>
        );
    }

    // Seznam je již seřazen a normalizován v PropertiesBar
    // const sortedPreferences = [...preferences].sort((a, b) => a.priority - b.priority);

    return (
        <Box sx={{ pt: 0.5, overflowY:"auto", overflowX:"hidden",  }}> {/* Malý padding nahoře seznamu */}
            {preferences.map((preference, index) => (
                <PreferenceItem
                    key={preference.id}
                    preference={preference}
                    onPriorityChange={onPriorityChange}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                    isFirst={index === 0} // Správně funguje, pokud je pole 'preferences' již seřazeno
                    isLast={index === preferences.length - 1}
                    displayLabel={getPreferenceDisplayLabel(preference)}
                />
            ))}
        </Box>
    );
}

export default PreferenceList;