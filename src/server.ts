import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import express, { Request, Response } from "express";
// import { NextFunction } from "express";
import "reflect-metadata";
import { container } from "tsyringe";

import "express-async-errors";

import EnvVars from "@src/declarations/major/EnvVars";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import { NodeEnvs } from "@src/declarations/enums";
import RouteError from "@src/declarations/classes";
import UserController from "@src/controllers/UserController";

// **** Init express **** //

const app = express();

// **** Set basic express settings **** //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.cookieProps.secret));

// Show routes called in console during development
if (EnvVars.nodeEnv === NodeEnvs.Dev) {
  app.use(morgan("dev"));
}

// Security
if (EnvVars.nodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

// **** Add API routes **** //

// Add Controllers
app.use("/user", container.resolve(UserController).routes());

// Setup error handler
app.use(
  (
    err: Error,
    _: Request,
    res: Response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // next: NextFunction
  ) => {
    let status = HttpStatusCodes.BAD_REQUEST;
    if (err instanceof RouteError) {
      status = err.status;
    }
    return res.status(status).json({ error: err.message });
  }
);

// **** Export default **** //

export default app;
