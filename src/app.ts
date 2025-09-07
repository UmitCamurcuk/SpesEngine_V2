import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error';
import { setupSwagger } from './swagger';

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api', routes);
  setupSwagger(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

