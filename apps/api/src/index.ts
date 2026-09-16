import express from 'express';
import cors from 'cors';
import { requestsRouter } from './modules/requests/routes.js';
import { casesRouter } from './modules/cases/routes.js';
import { calendarRouter } from './modules/cases/calendar.js';

const app = express();
const PORT = process.env.PORT ?? 3005;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// TODO(P1): GET /api/me, login, recuperación de contraseña.
app.use('/api/requests', requestsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/calendar', calendarRouter);

// Manejador de errores simple; separar 401/403/409/422 según el contrato (ver plan).
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'error_interno' });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
