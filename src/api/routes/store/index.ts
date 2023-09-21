// main file (storeRoutes.ts)

import { ConfigModule } from "@medusajs/medusa";
import { Router } from "express";
import cors from "cors";
import { getCampaignListHandler, getCampaignProductsHandler } from "./campain";

export default function storeRoutes(router: Router, options: ConfigModule) {
  const { projectConfig } = options;

  const storeCorsOptions = {
    origin: projectConfig?.store_cors?.split(","),
    credentials: true,
  };

  const storeRouter = Router();
  router.use("/store", storeRouter);

  storeRouter.use(cors(storeCorsOptions));

  // Define the route using the imported handler function
  storeRouter.get("/campaign-list", getCampaignListHandler);
  storeRouter.get("/campaign-product/:id", getCampaignProductsHandler);
}
