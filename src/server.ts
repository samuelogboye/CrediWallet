import app from "./app";
import config from "./config/config";

// Start the server
const PORT = config.serverPort;

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
