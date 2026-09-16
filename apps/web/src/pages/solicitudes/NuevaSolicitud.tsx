import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import type { SolicitudBase, Solicitud } from '@ebr/contracts';
import { api } from '../../lib/api';

// D09: Guardar borrador -> Enviar. El envío válido crea el Caso (idempotente en la API).
type FormValues = {
  empresaId: string;
  motivo: string;
  detalle?: string;
};

export default function NuevaSolicitud() {
  const { register, handleSubmit, formState } = useForm<FormValues>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const guardarBorrador = async (values: FormValues) => {
    setError(null);
    try {
      const payload: SolicitudBase = { empresaId: values.empresaId, motivo: values.motivo, detalle: values.detalle };
      const creada = await api.post<Solicitud>('/requests', payload);
      // Enviar de inmediato en este flujo simple; separar "guardar" de "enviar" es una mejora siguiente.
      await api.post(`/requests/${creada.id}/submit`);
      navigate('/solicitudes');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(guardarBorrador)} sx={{ maxWidth: 480 }}>
      <Typography variant="h5" gutterBottom>
        Nueva solicitud
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth
        margin="normal"
        label="ID de empresa (temporal, hasta integrar selector de P1)"
        {...register('empresaId', { required: true })}
      />
      <TextField fullWidth margin="normal" label="Motivo" {...register('motivo', { required: true })} />
      <TextField
        fullWidth
        margin="normal"
        label="Detalle"
        multiline
        rows={3}
        {...register('detalle')}
      />
      <Button type="submit" variant="contained" disabled={formState.isSubmitting} sx={{ mt: 2 }}>
        Enviar solicitud
      </Button>
    </Box>
  );
}
