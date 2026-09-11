import app from "./app";
import { env } from "./config/envConfig";
import { connectDB } from "./config/db";

// Connect to DB first, then start express on port
const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on port: ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

// Listener for any unhandled promise rejection
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
