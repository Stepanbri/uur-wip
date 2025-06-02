import React from 'react';
import { Paper, Typography } from '@mui/material';

function ScheduleBox() {
    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                ScheduleBox (Center Content)
            </Typography>
            <Typography variant="body2">
                The schedule table will be rendered here.
            </Typography>
            {/* Placeholder content for schedule table */}
        </Paper>
    );
}

export default ScheduleBox;