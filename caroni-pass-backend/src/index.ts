import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import 'dotenv/config';

import { telemetriaRouter } from './routes/telemetria.js';
import { unidadRouter } from './routes/unidad.js';
import { usersRouter } from './routes/user.js';
import recargasRouter from './routes/recargas.js';
import { cobrosRouter } from './routes/cobros.js';

// Extensión de la interfaz Request de Express para admitir session
declare global {
  namespace Express {
    interface Request {
      session?: {
        id: string | null;
        user: string | null;
      };
    }
  }
}

const app = express();
export const server = new Server(app);
const __dirname = import.meta.dirname;

app.disable('x-powered-by');

// Middlewares base
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
const acceptedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (acceptedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware para extraer sesión desde Cookie
app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  req.session = { id: null, user: null };

  if (!token) return next();

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || 'secret_key_default';
    const decoded = jwt.verify(token, secret) as { id: string; username: string };
    req.session.id = decoded.id;
    req.session.user = decoded.username;
  } catch (error) {
    // Token expirado o inválido
  }
  next();
});

// Middleware de autenticación por Header (x-access-token) o Cookie
const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers['x-access-token'] as string) || req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ auth: false, message: 'No token provided' });
  }

  const secret = process.env.ACCESS_TOKEN_SECRET || 'secret_key_default';

  jwt.verify(token, secret, (err: Error | null, decoded: unknown) => {
    if (err || !decoded) {
      return res.status(403).json({ auth: false, message: 'Unauthorized token' });
    }

    const payload = decoded as { id: string; username: string };
    req.session = { id: payload.id, user: payload.username };
    next();
  });
};

// Rutas de Verificación y Sesión
app.get('/isVerifiedUsr', verifyJWT, (req: Request, res: Response) => {
  res.json({ auth: true, message: 'Authorized', session: req.session });
});

app.get('/get-session', (req: Request, res: Response) => {
  if (req.session?.id) {
    return res.json({ auth: true, user: req.session });
  }
  return res.json({ auth: false, message: 'No active session' });
});

// Archivos Estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Redirecciones de Autenticación
app.get('/login', (req: Request, res: Response) => {
  if (req.cookies?.access_token) {
    return res.redirect('/users/get-role');
  }
  res.status(200).json({ message: 'Render login page or form' });
});

app.get('/register', (req: Request, res: Response) => {
  if (req.cookies?.access_token) {
    return res.redirect('/users/get-role');
  }
  res.status(200).json({ message: 'Render register page or form' });
});

// Enrutadores de la API
app.use('/users', usersRouter);
app.use('/telemetria', telemetriaRouter);
app.use('/unidades', unidadRouter);
app.use('/recargas', recargasRouter);
app.use('/cobros', cobrosRouter);

// Cierre de Sesión (Logout)
app.get('/logout', (req: Request, res: Response) => {
  res
    .clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
    .status(200)
    .json({ message: 'Sesión cerrada correctamente' });
});

// Iniciar Servidor
server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});