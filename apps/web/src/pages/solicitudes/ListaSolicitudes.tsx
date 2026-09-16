import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Chip, CircularProgress } from '@mui/material';
import type { Solicitud } from '@ebr/contracts';
import { api } from '../../lib/api';

export default function ListaSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Solicitud[]>('/requests')
      .then(setSolicitudes)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!solicitudes) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Mis solicitudes
      </Typography>
      {solicitudes.length === 0 && (
        <Typography color="text.secondary">Todavía no hay solicitudes.</Typography>
      )}
      <List>
        {solicitudes.map((s) => (
          <ListItem key={s.id} divider>
            <ListItemText primary={s.motivo} secondary={s.detalle} />
            <Chip
              label={s.estado}
              color={s.estado === 'enviada' ? 'success' : 'default'}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}
