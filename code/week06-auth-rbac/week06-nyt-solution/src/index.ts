import { app } from './app.js';
import { connect } from './db/db.js';

const port = 6790;

await connect();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
