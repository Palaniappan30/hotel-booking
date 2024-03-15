// src/App.js
import React from 'react';
import { Grid, ThemeProvider, createTheme } from '@mui/material';
import { orange } from '@mui/material/colors'; // Importing a color from MUI
import BookingForm from './components/BookingForm';
import BookingView from './components/BookingView';
import '@fontsource/poppins'; // Import Poppins font

const theme = createTheme({
  typography: {
    fontFamily: ['Poppins', 'sans-serif'].join(','), // Use Poppins font for typography
  },
  palette: {
    primary: {
      main: orange[500], // Example usage of MUI color
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={2}>
        {/* Left half */}
        <Grid item xs={6}>
          <h1 className="title">Dashboard</h1>
          <BookingForm />
        </Grid>
        
        {/* Right half */}
        <Grid item xs={6}>
          <BookingView />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default App;
