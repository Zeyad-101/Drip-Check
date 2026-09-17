import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'in-browser-vision' });
});

app.listen(port, () => {
  console.log(`DripCheck running at http://localhost:${port}`);
});
