import "dotenv/config";
import { z } from "zod";
import type { StringValue } from "ms";

const durationSchema = z
  .string()
  .regex(/^\d+(ms|s|m|h|d|w|y)$/)
  .transform((value) => value as StringValue);

const envSchema = z.object({
  NODE_ENV : z.string(),
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().url(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15),
  JWT_ACCESS_SECRET: z.string().min(5),
  JWT_ACCESS_EXPIRES_IN: durationSchema,
  JWT_REFRESH_SECRET: z.string().min(5),
  JWT_REFRESH_EXPIRES_IN: durationSchema,
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv : parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  bcryptSaltRounds: parsedEnv.BCRYPT_SALT_ROUNDS,
  jwtAccessSecret: parsedEnv.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: parsedEnv.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshSecret: parsedEnv.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: parsedEnv.JWT_REFRESH_EXPIRES_IN,
};
