import React from 'react';
import { Paper, Typography } from '@mui/material';

function CourseBar() {
    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                CourseBar (Left Sidebar)
            </Typography>
            <Typography variant="body2">
                Content for loaded courses and their events will be displayed here.
            </Typography>
            {/*{Array.from(new Array(30)).map((_, index) => <Typography key={index}>Položka {index + 1}</Typography>)}*/}

            {/* Placeholder content for RichTreeView and search */}
        </Paper>
    );
}

export default CourseBar;