import type { NextFunction, Request, Response } from 'express';

// STUB temporal: P1 implementa sesión real con JWT (jose) + Argon2id.
// Por ahora lee un header de desarrollo para no bloquear el trabajo de otros
// módulos mientras identidad no está lista. Nunca usar esto en producción.
//
// Uso en dev: header `x-dev-user-id: <uuid>`.

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const devUserId = req.header('x-dev-user-id');
  if (!devUserId) {
    return res.status(401).json({ error: 'no_autenticado' });
  }
  req.userId = devUserId;
  next();
}
