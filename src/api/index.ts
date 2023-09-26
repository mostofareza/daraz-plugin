import express, {
  Router,
  NextFunction,
  RequestHandler,
  Request,
} from "express";
import { TokenService, errorHandler } from "@medusajs/medusa";
import bodyParser from "body-parser";
import storeRoutes from "./routes/store";
import adminRoutes from "./routes/admin";

export default function createRouter(
  rootDirectory: string,
  options: any
): Router {
  const router = express.Router();

  router.use(bodyParser.json());
  storeRoutes(router, options);
  adminRoutes(router, options);
  router.use(errorHandler());
  module.exports = router;

  return router;
}
