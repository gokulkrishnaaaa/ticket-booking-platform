import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";
import theaterChainRouter from "./modules/theater-chain/theater-chain.route";
import { errorHandler } from "./errors/error-handler.middleware";
import adminRouter from "./modules/admin/admin.routes";
import theaterRoutes from "./modules/theater/theater.routes";
import screenRoutes from "./modules/screen/screen.routes";
import movieRoutes from "./modules/movies/movie.routes";
import seatRoutes from "./modules/seat/seat.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/theater-chain", theaterChainRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/theaters", theaterRoutes);
app.use("/api/v1/theaters", screenRoutes);
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/screens", seatRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Ticket Booking API is running ");
});

export default app;
