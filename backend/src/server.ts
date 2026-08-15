import app from './app.js';
import { startForecastScheduler } from './services/forecastScheduler.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start the background forecast scheduler
  startForecastScheduler();
});

// Trigger restart
