import express from 'express';

const app: express.Application = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'worker-service' });
});

app.get('/metrics', (_req, res) => {
  res.status(200).send('metrics placeholder');
});

app.get('/ready', (_req, res) => {
  res.status(200).json({ status: 'ready', service: 'worker-service' });
});

export default app;
