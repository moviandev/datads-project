import 'dotenv/config';
import express from 'express';
import { AdQueryImplementationRepository } from './repositories';
import { createPerformanceRouter } from './routes/performance.route';
import { createTopPerformingRouter } from './routes/top-performing.route';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

const repository = new AdQueryImplementationRepository();

app.use('/api/performance', createPerformanceRouter(repository));
app.use('/api/top-performing', createTopPerformingRouter(repository));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`  GET /api/performance`);
  console.log(`  GET /api/top-performing`);
});
