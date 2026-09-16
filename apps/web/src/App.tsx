import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import ListaSolicitudes from './pages/solicitudes/ListaSolicitudes';
import NuevaSolicitud from './pages/solicitudes/NuevaSolicitud';

// Esqueleto de navegación por rol. Cada Persona añade sus rutas aquí bajo su
// propio directorio en src/pages/. P1 añadirá guardas de autenticación/rol.
export default function App() {
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            EBR / BPM
          </Typography>
          <Button color="inherit" component={Link} to="/solicitudes">
            Mis solicitudes
          </Button>
          <Button color="inherit" component={Link} to="/solicitudes/nueva">
            Nueva solicitud
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ListaSolicitudes />} />
          <Route path="/solicitudes" element={<ListaSolicitudes />} />
          <Route path="/solicitudes/nueva" element={<NuevaSolicitud />} />
          {/* TODO: rutas de P1 (empresas), P3 (formulario/evidencias), P4 (revisión/informes) */}
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
