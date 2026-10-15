import "./lib/env.js";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`NORTH API running on port ${PORT}`);
});