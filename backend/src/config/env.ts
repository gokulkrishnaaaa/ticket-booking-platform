import "dotenv/config";
import { z } from "zod"

const envSchema = z.object({
    PORT : z.coerce.number().int().positive(),
    DATABASE_URL : z.string().url()
});

const parsedEnv= envSchema.parse(process.env);

export const env = {
    port : parsedEnv.PORT,
    databaseUrl : parsedEnv.DATABASE_URL
}