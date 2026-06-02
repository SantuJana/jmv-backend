import { env } from "@/config/env";
import { createApp } from "@/app";
import { logStartupHealth } from "@/utils/startup-health";

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`JMV Grocery API listening on http://${env.HOST}:${env.PORT}`);
  void logStartupHealth();
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Closing HTTP server.`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
