import { ConfigModule } from "@medusajs/medusa";
import { Router } from "express";
//@ts-ignore
import cors from "cors";
import campaign from "./campaign";
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

  // admin token verification routes
  storeRouter.post(
    "/api/v1/token/verify",
    verifyAuthTokenMiddleware,
    themeSettings.setCookiesForAdminHandler
  );

  storeRouter.get(
    "/api/v1/theme",
    checkThemeCustomizabilityMiddleware,
    async (req, res, next) => {
      res.send({ success: req.user });
    }
  );

  // Campaign routes
  storeRouter.get("/api/v1/campaign-list", campaign.getCampaignListHandler);
  storeRouter.get(
    "/api/v1/campaign-product/:id",
    campaign.getCampaignProductsHandler
  );
}
