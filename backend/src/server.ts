import http from "http";
import app from "./app";
import { env } from "./config/env";

const server = http.createServer(app);

server.listen(env.port, ()=> {
    console.log(`Server is running on port ${env.port}`);
});

export default server;
