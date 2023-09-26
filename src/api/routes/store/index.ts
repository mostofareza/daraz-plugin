// main file (storeRoutes.ts)

import { ConfigModule, TokenService } from "@medusajs/medusa";
import { Router } from "express";
import cors from "cors";
import { getCampaignListHandler, getCampaignProductsHandler } from "./campain";
import { checkThemeCustomizabilityMiddleware } from "../../../middlewares/theme-customize-ability-middleware";
import { verifyAuthTokenMiddleware } from "../../../middlewares/verify-auth-token";
import themeSettings from "./theme-settings";

export default function storeRoutes(router: Router, options: ConfigModule) {
  const { projectConfig } = options;

  const storeCorsOptions = {
    origin: projectConfig?.store_cors?.split(","),
    credentials: true,
  };
  const storeRouter = Router();
  router.use("/store", storeRouter);
  storeRouter.use(cors(storeCorsOptions));

  storeRouter.post(
    "/token/verify",
    verifyAuthTokenMiddleware,
    themeSettings.setCookiesForAdminHandler
  );

  storeRouter.get(
    "/theme",
    checkThemeCustomizabilityMiddleware,
    async (req, res, next) => {
      res.send({ success: req.user });
    }
  );

  // Define the route using the imported handler function
  storeRouter.get("/campaign-list", getCampaignListHandler);
  storeRouter.get("/campaign-product/:id", getCampaignProductsHandler);
}
