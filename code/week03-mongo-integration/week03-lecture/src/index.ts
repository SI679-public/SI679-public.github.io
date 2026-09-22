import { app } from './app.js';
import { connect } from './db.js';

const port = 6790;

await connect('mongodb://127.0.0.1:27017', 'week3app');

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
