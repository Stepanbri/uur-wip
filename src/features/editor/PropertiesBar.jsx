import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, TextField, FormControl, InputLabel } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';
import PreferenceList from './components/PreferenceList';

// Definice typů preferencí a jejich parametrů
// Klíče pro lokalizaci: preferences.types.{TYPE_KEY}.label (pro dialog), preferences.types.{TYPE_KEY}.shortLabel (pro item)
const PREFERENCE_CONFIG = {
    FREE_DAY: {
        labelKey: 'preferences.types.FREE_DAY.label',
        shortLabelKey: 'preferences.types.FREE_DAY.shortLabel',
        defaultLabel: 'Volný den', // Fallback
        params: [
            { name: 'day', labelKey: 'preferences.params.day', type: 'select', options: ['PO', 'UT', 'ST', 'CT', 'PA'], defaultValue: 'PO' },
        ],
        displayFormatter: (params, t) => t('preferences.displayLabels.freeDay', `Volný den: {{day}}`, { day: params.day })
    },
    AVOID_TIMES: {
        labelKey: 'preferences.types.AVOID_TIMES.label',
        shortLabelKey: 'preferences.types.AVOID_TIMES.shortLabel',
        defaultLabel: 'Vyhnout se časům', // Fallback
        params: [
            { name: 'day', labelKey: 'preferences.params.day', type: 'select', options: ['PO', 'UT', 'ST', 'CT', 'PA'], defaultValue: 'PO' },
            { name: 'startTime', labelKey: 'preferences.params.startTime', type: 'time', defaultValue: '10:00' },
            { name: 'endTime', labelKey: 'preferences.params.endTime', type: 'time', defaultValue: '12:00' },
        ],
        displayFormatter: (params, t) => t('preferences.displayLabels.avoidTimes', `Nevolno {{day}}: {{startTime}} - {{endTime}}`, { day: params.day, startTime: params.startTime, endTime: params.endTime })
    },
    // Další typy preferencí...
    // PREFER_INSTRUCTOR_FOR_SUBJECT_EVENT_TYPE atd. [cite: 192]
};

const generateId = () => `pref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

function PropertiesBar() {
    const { t } = useTranslation();
    const [preferences, setPreferences] = useState([
        // Příklad počátečních dat
        { id: generateId(), type: 'FREE_DAY', priority: 1, isActive: true, params: { day: 'PO' } },
        { id: generateId(), type: 'AVOID_TIMES', priority: 2, isActive: true, params: { day: 'UT', startTime: '08:00', endTime: '10:00' } },
    ]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedPreferenceType, setSelectedPreferenceType] = useState(Object.keys(PREFERENCE_CONFIG)[0]);
    const [currentPreferenceParams, setCurrentPreferenceParams] = useState({});

    // Normalizace priorit: zajistí, že priority jsou vždy 1, 2, 3...
    const normalizePriorities = (prefs) => {
        const sorted = [...prefs].sort((a, b) => a.priority - b.priority);
        return sorted.map((p, index) => ({ ...p, priority: index + 1 }));
    };

    useEffect(() => {
        // Normalizuj priority při jakékoliv změně pole preferencí
        // (přidání, smazání, změna priority)
        setPreferences(prevPrefs => {
            const normalized = normalizePriorities(prevPrefs);
            // Porovnání, zda došlo ke skutečné změně priorit, aby se zabránilo nekonečné smyčce
            if (JSON.stringify(prevPrefs.map(p=>p.priority)) !== JSON.stringify(normalized.map(p=>p.priority))) {
                return normalized;
            }
            return prevPrefs;
        });
    }, [preferences.length, JSON.stringify(preferences.map(p => p.id + "_" + p.priority))]); // Sledovat id a priority

    const getPreferenceDisplayLabel = useCallback((preference) => {
        const config = PREFERENCE_CONFIG[preference.type];
        if (config && config.displayFormatter) {
            return config.displayFormatter(preference.params, t);
        }
        return t(config?.shortLabelKey, preference.type); // Fallback na shortLabel nebo typ
    }, [t]);


    const handleOpenAddDialog = () => {
        setSelectedPreferenceType(Object.keys(PREFERENCE_CONFIG)[0]); // Reset na první typ
        const initialConfig = PREFERENCE_CONFIG[Object.keys(PREFERENCE_CONFIG)[0]];
        const initialParams = {};
        initialConfig.params.forEach(p => initialParams[p.name] = p.defaultValue);
        setCurrentPreferenceParams(initialParams);
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
    };

    const handleParamChange = (paramName, value) => {
        setCurrentPreferenceParams(prev => ({ ...prev, [paramName]: value }));
    };

    useEffect(() => { // Aktualizace parametrů v dialogu při změně typu preference
        if (isAddDialogOpen) {
            const config = PREFERENCE_CONFIG[selectedPreferenceType];
            const newParams = {};
            if (config && config.params) {
                config.params.forEach(p => {
                    newParams[p.name] = p.defaultValue !== undefined ? p.defaultValue : '';
                });
            }
            setCurrentPreferenceParams(newParams);
        }
    }, [selectedPreferenceType, isAddDialogOpen]);


    const handleConfirmAddPreference = () => {
        const newPriority = preferences.length > 0 ? Math.max(...preferences.map(p => p.priority)) + 1 : 1;
        const newPreference = {
            id: generateId(),
            type: selectedPreferenceType,
            priority: newPriority,
            isActive: true,
            params: { ...currentPreferenceParams }
        };
        setPreferences(prev => normalizePriorities([...prev, newPreference]));
        handleCloseAddDialog();
    };

    const handleDeletePreference = useCallback((id) => {
        setPreferences(prev => normalizePriorities(prev.filter(p => p.id !== id)));
    }, []);

    const handleGenerateSchedule = () => {
        const activePreferences = preferences.filter(p => p.isActive).sort((a,b) => a.priority - b.priority);
        console.log(t('propertiesBar.generateScheduleLog'), activePreferences);
        alert(t('propertiesBar.generateScheduleAlert', { count: activePreferences.length }));
    };

    const handleToggleActive = useCallback((id) => {
        setPreferences(prev =>
            prev.map(p =>
                p.id === id ? { ...p, isActive: !p.isActive } : p
            )
        );
    }, []);

    const handlePriorityChange = useCallback((id, direction) => {
        setPreferences(prev => {
            let newPrefs = [...prev];
            const sortedByPriority = [...newPrefs].sort((a,b) => a.priority - b.priority);
            const currentIndexInSorted = sortedByPriority.findIndex(p => p.id === id);

            if (direction === 'up' && currentIndexInSorted > 0) {
                const currentActualPriority = sortedByPriority[currentIndexInSorted].priority;
                const targetActualPriority = sortedByPriority[currentIndexInSorted - 1].priority;

                const itemToMoveUp = newPrefs.find(p => p.id === sortedByPriority[currentIndexInSorted].id);
                const itemToMoveDown = newPrefs.find(p => p.id === sortedByPriority[currentIndexInSorted - 1].id);

                if(itemToMoveUp) itemToMoveUp.priority = targetActualPriority;
                if(itemToMoveDown) itemToMoveDown.priority = currentActualPriority;

            } else if (direction === 'down' && currentIndexInSorted < sortedByPriority.length - 1) {
                const currentActualPriority = sortedByPriority[currentIndexInSorted].priority;
                const targetActualPriority = sortedByPriority[currentIndexInSorted + 1].priority;

                const itemToMoveDown = newPrefs.find(p => p.id === sortedByPriority[currentIndexInSorted].id);
                const itemToMoveUp = newPrefs.find(p => p.id === sortedByPriority[currentIndexInSorted + 1].id);

                if(itemToMoveDown) itemToMoveDown.priority = targetActualPriority;
                if(itemToMoveUp) itemToMoveUp.priority = currentActualPriority;
            }
            return normalizePriorities(newPrefs); // Normalizuj po změně
        });
    }, []);

    return (
        <Box
            sx={{
                p: {xs: 1, sm: 2}, // Responzivní padding
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: (theme) => theme.palette.background.default, // Odlišné pozadí od Paper v Item
            }}
        >
            <Typography variant="h6" gutterBottom component="div" sx={{px: {xs: 1, sm: 0}}}>
                {t('propertiesBar.title', 'Nastavení Generování')}
            </Typography>
            <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleOpenAddDialog}
                sx={{ mb: 2 }}
                fullWidth
            >
                {t('propertiesBar.addPreferenceButton', 'Přidat preferenci')}
            </Button>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                <PreferenceList
                    preferences={preferences} // Předáváme již normalizované a seřazené preference
                    onPriorityChange={handlePriorityChange}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDeletePreference}
                    getPreferenceDisplayLabel={getPreferenceDisplayLabel}
                />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleGenerateSchedule}
                fullWidth
                disabled={preferences.filter(p => p.isActive).length === 0 && preferences.length > 0}
            >
                {t('propertiesBar.generateButton', 'Vygenerovat Rozvrh')}
            </Button>

            {/* Dialog pro přidání preference */}
            <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog} fullWidth maxWidth="xs">
                <DialogTitle>{t('propertiesBar.addDialog.title', 'Přidat novou preferenci')}</DialogTitle>
                <DialogContent dividers>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="preference-type-label">{t('propertiesBar.addDialog.preferenceType', 'Typ preference')}</InputLabel>
                        <Select
                            labelId="preference-type-label"
                            value={selectedPreferenceType}
                            label={t('propertiesBar.addDialog.preferenceType', 'Typ preference')}
                            onChange={(e) => setSelectedPreferenceType(e.target.value)}
                        >
                            {Object.keys(PREFERENCE_CONFIG).map(typeKey => (
                                <MenuItem key={typeKey} value={typeKey}>
                                    {t(PREFERENCE_CONFIG[typeKey].labelKey, PREFERENCE_CONFIG[typeKey].defaultLabel)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {PREFERENCE_CONFIG[selectedPreferenceType]?.params.map(param => (
                        <FormControl key={param.name} fullWidth margin="normal">
                            {param.type === 'select' && (
                                <>
                                    <InputLabel id={`${param.name}-label`}>{t(param.labelKey, param.name)}</InputLabel>
                                    <Select
                                        labelId={`${param.name}-label`}
                                        value={currentPreferenceParams[param.name] || param.defaultValue || ''}
                                        label={t(param.labelKey, param.name)}
                                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                                    >
                                        {param.options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </>
                            )}
                            {param.type === 'time' && (
                                <TextField
                                    label={t(param.labelKey, param.name)}
                                    type="time"
                                    value={currentPreferenceParams[param.name] || param.defaultValue || ''}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                            {/* Zde mohou být další typy inputů pro parametry */}
                        </FormControl>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog}>{t('common.cancel', 'Zrušit')}</Button>
                    <Button onClick={handleConfirmAddPreference} variant="contained">{t('common.add', 'Přidat')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PropertiesBar;