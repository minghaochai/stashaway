import bodyParser from "body-parser";
import express, { ErrorRequestHandler } from "express";

import depositRoute from "./routes/Deposit";

const app = express();
const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  return res.status(400).send(err.message);
};

app.use(bodyParser.json());

app.use(depositRoute);

app.use(errorHandler);

app.listen(3000);
