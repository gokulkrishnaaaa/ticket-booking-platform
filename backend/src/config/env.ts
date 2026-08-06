import "dotenv/config";
import { z } from "zod"

const envSchema = z.object({
    PORT : z.coerce.number().int().positive(),
    DATABASE_URL : z.string().url(),
    BCRYPT_SALT_ROUNDS : z.coerce.number().int().min(8).max(15)
});

const parsedEnv= envSchema.parse(process.env);

export const env = {
    port : parsedEnv.PORT,
    databaseUrl : parsedEnv.DATABASE_URL,
    bcryptSaltRounds : parsedEnv.BCRYPT_SALT_ROUNDS,
}