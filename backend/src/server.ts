import http from "http";
import app from "./app";
import { env } from "./config/env";
import prisma from "./lib/prisma";

const server = http.createServer(app);

async function bootstrap(): Promise<void> {
  try {
    console.log("Connecting to DB...");

    await prisma.$connect();

    console.log("DB connected successfully...");

    server.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start application", error);
    process.exit(1);
  }
}

bootstrap();
