import { app } from './app.js';

const port = 6790;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
