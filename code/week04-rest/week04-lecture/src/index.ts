import { app } from './app.js';
import { db } from './db/db.js';

const port = 6790;

await db.init();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
