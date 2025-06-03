// src/features/editor/PropertiesBar.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, Divider, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, TextField,
    FormControl, InputLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';
import PreferenceList from './PropertyBar/PreferenceList';

// Definice typů preferencí a jejich parametrů
const PREFERENCE_CONFIG = {
    FREE_DAY: {
        labelKey: 'preferences.types.FREE_DAY.label',
        shortLabelKey: 'preferences.types.FREE_DAY.shortLabel',
        defaultLabel: 'Volný den',
        params: [
            { name: 'day', labelKey: 'preferences.params.day', type: 'select', options: ['PO', 'UT', 'ST', 'CT', 'PA'], defaultValue: 'PO' },
        ],
        displayFormatter: (params, t) => t('preferences.displayLabels.freeDay', `Volný den: {{day}}`, { day: params.day })
    },
    AVOID_TIMES: {
        labelKey: 'preferences.types.AVOID_TIMES.label',
        shortLabelKey: 'preferences.types.AVOID_TIMES.shortLabel',
        defaultLabel: 'Vyhnout se časům',
        params: [
            { name: 'day', labelKey: 'preferences.params.day', type: 'select', options: ['PO', 'UT', 'ST', 'CT', 'PA'], defaultValue: 'PO' },
            { name: 'startTime', labelKey: 'preferences.params.startTime', type: 'time', defaultValue: '10:00' },
            { name: 'endTime', labelKey: 'preferences.params.endTime', type: 'time', defaultValue: '12:00' },
        ],
        displayFormatter: (params, t) => t('preferences.displayLabels.avoidTimes', `Nevolno {{day}}: {{startTime}} - {{endTime}}`, { day: params.day, startTime: params.startTime, endTime: params.endTime })
    },
    // Další typy preferencí mohou být přidány zde
};

const generateId = () => `pref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

function PropertiesBar({ workspace }) { // Přidán prop workspace pro budoucí použití
    const { t } = useTranslation();
    const [preferences, setPreferences] = useState([
        // Příklad počátečních dat - v budoucnu načteno z workspace
        { id: generateId(), type: 'FREE_DAY', priority: 1, isActive: true, params: { day: 'PO' } },
        { id: generateId(), type: 'AVOID_TIMES', priority: 2, isActive: true, params: { day: 'UT', startTime: '08:00', endTime: '10:00' } },
    ]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedPreferenceType, setSelectedPreferenceType] = useState(Object.keys(PREFERENCE_CONFIG)[0]);
    const [currentPreferenceParams, setCurrentPreferenceParams] = useState({});

    // Stabilní funkce pro normalizaci priorit
    const normalizePriorities = useCallback((prefs) => {
        if (!Array.isArray(prefs)) return []; // Obranný krok
        // Řadíme pouze aktivní preference pro sekvenční prioritu, neaktivní mohou mít placeholder priority
        // Nebo, pokud chceme normalizovat všechny, tak řadíme všechny. Záleží na logice.
        // Pro jednoduchost zatím normalizujeme všechny.
        const sorted = [...prefs].sort((a, b) => a.priority - b.priority);
        return sorted.map((p, index) => ({ ...p, priority: index + 1 }));
    }, []); // Prázdné pole závislostí = stabilní funkce

    // Memoizovaný string reprezentující ID a priority pro závislost v useEffect
    const preferencesIdAndPriorityKey = useMemo(() => {
        return JSON.stringify(preferences.map(p => `${p.id}_${p.priority}`));
    }, [preferences]);

    useEffect(() => {
        // Normalizuj priority při jakékoliv relevantní změně v poli preferencí
        setPreferences(prevPrefs => {
            const normalized = normalizePriorities(prevPrefs);

            // Porovnání, zda došlo ke skutečné změně priorit, aby se zabránilo nekonečné smyčce
            // Porovnáváme stringifikované pole priorit, abychom zjistili, zda normalizace něco změnila.
            const prevPrioritiesSignature = JSON.stringify(prevPrefs.map(p => p.priority));
            const normalizedPrioritiesSignature = JSON.stringify(normalized.map(p => p.priority));

            if (prevPrioritiesSignature !== normalizedPrioritiesSignature) {
                return normalized;
            }
            return prevPrefs;
        });
    }, [preferences.length, preferencesIdAndPriorityKey, normalizePriorities]);


    const getPreferenceDisplayLabel = useCallback((preference) => {
        const config = PREFERENCE_CONFIG[preference.type];
        if (config && config.displayFormatter) {
            return config.displayFormatter(preference.params, t);
        }
        return t(config?.shortLabelKey || `preferences.types.${preference.type}.label`, preference.type);
    }, [t]);

    const handleOpenAddDialog = () => {
        const firstTypeKey = Object.keys(PREFERENCE_CONFIG)[0];
        setSelectedPreferenceType(firstTypeKey);
        const initialConfig = PREFERENCE_CONFIG[firstTypeKey];
        const initialParams = {};
        if (initialConfig && initialConfig.params) {
            initialConfig.params.forEach(p => initialParams[p.name] = p.defaultValue);
        }
        setCurrentPreferenceParams(initialParams);
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => setIsAddDialogOpen(false);

    const handleParamChange = (paramName, value) => {
        setCurrentPreferenceParams(prev => ({ ...prev, [paramName]: value }));
    };

    useEffect(() => {
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
        const newPreference = {
            id: generateId(),
            type: selectedPreferenceType,
            // Priorita bude nastavena normalizací v useEffect, nebo můžeme nastavit prozatímní vysokou
            priority: preferences.length + 1, // Dočasná, bude normalizována
            isActive: true,
            params: { ...currentPreferenceParams }
        };
        // Zde setPreferences spustí useEffect, který provede normalizaci
        setPreferences(prev => [...prev, newPreference]);
        handleCloseAddDialog();
        // V budoucnu: workspace.addPreference(newPreference);
    };

    const handleDeletePreference = useCallback((id) => {
        // Zde setPreferences spustí useEffect, který provede normalizaci
        setPreferences(prev => prev.filter(p => p.id !== id));
        // V budoucnu: workspace.deletePreference(id);
    }, []);

    const handleGenerateSchedule = () => {
        const activePreferencesForGeneration = preferences
            .filter(p => p.isActive)
            .sort((a, b) => a.priority - b.priority); // Již by měly být seřazené díky normalizaci
        console.log(t('propertiesBar.generateScheduleLog'), activePreferencesForGeneration);
        alert(t('propertiesBar.generateScheduleAlert', { count: activePreferencesForGeneration.length }));
        // V budoucnu: workspace.generateSchedule(activePreferencesForGeneration);
    };

    const handleToggleActive = useCallback((id) => {
        setPreferences(prev =>
            prev.map(p =>
                p.id === id ? { ...p, isActive: !p.isActive } : p
            )
        );
        // V budoucnu: workspace.togglePreferenceActive(id);
    }, []);

    const handlePriorityChange = useCallback((id, direction) => {
        setPreferences(prev => {
            const prefsCopy = [...prev];
            const index = prefsCopy.findIndex(p => p.id === id);
            if (index === -1) return prev;

            const item = prefsCopy[index];
            if (direction === 'up' && index > 0) {
                // Prohodíme priority s předchozím prvkem
                const prevItem = prefsCopy[index - 1];
                [item.priority, prevItem.priority] = [prevItem.priority, item.priority];
            } else if (direction === 'down' && index < prefsCopy.length - 1) {
                // Prohodíme priority s následujícím prvkem
                const nextItem = prefsCopy[index + 1];
                [item.priority, nextItem.priority] = [nextItem.priority, item.priority];
            }
            // normalizePriorities se zavolá v useEffect
            return prefsCopy;
        });
        // V budoucnu: workspace.updatePreferencePriority(id, direction);
    }, []);

    return (
        <Box
            sx={{
                p: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: (theme) => theme.palette.background.paper, // Změna na paper pro konzistenci s ostatními sidebary
            }}
        >
            <Typography variant="h6" gutterBottom component="div" sx={{ px: { xs: 1, sm: 0 } }}>
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
                    preferences={preferences} // Předáváme již normalizované preference díky useEffect
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

            <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog} fullWidth maxWidth="xs" slotProps={{ paper: {component: 'form', onSubmit: (e) => { e.preventDefault(); handleConfirmAddPreference(); } }}}>
                <DialogTitle>{t('propertiesBar.addDialog.title', 'Přidat novou preferenci')}</DialogTitle>
                <DialogContent dividers>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="preference-type-label">{t('propertiesBar.addDialog.preferenceType', 'Typ preference')}</InputLabel>
                        <Select
                            labelId="preference-type-label"
                            value={selectedPreferenceType}
                            label={t('propertiesBar.addDialog.preferenceType', 'Typ preference')}
                            onChange={(e) => setSelectedPreferenceType(e.target.value)}
                            variant="filled"
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
                                        variant="filled"
                                    >
                                        {param.options.map(opt => (
                                            <MenuItem key={opt} value={opt}>
                                                {t(`preferences.dayOptions.${opt}`, opt)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </>
                            )}
                            {param.type === 'time' && (
                                <TextField
                                    label={t(param.labelKey, param.name)}
                                    type="time"
                                    value={currentPreferenceParams[param.name] || param.defaultValue || ''}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                    inputLabel={{ shrink: true }}
                                    htmlInput={{ step: 300 }} // 5 min
                                />
                            )}
                        </FormControl>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog}>{t('common.cancel', 'Zrušit')}</Button>
                    <Button type="submit" variant="contained">{t('common.add', 'Přidat')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PropertiesBar;