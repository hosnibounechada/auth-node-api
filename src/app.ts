import express from "express";
import "express-async-errors";
import { json } from "body-parser";

import { authRouter } from "./routes";
import { errorHandler } from "./middlewares";

const app = express();
app.use(json());

app.use(authRouter);

app.use(errorHandler);
export default app;
