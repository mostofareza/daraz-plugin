// main file (storeRoutes.ts)

import { ConfigModule, TokenService } from "@medusajs/medusa";
import { Router } from "express";
import cors from "cors";
import { getCampaignListHandler, getCampaignProductsHandler } from "./campain";
import { themeCustomizabilityCheckMiddleware } from "../../../middlewares/theme-customize-ability-middleware";
import { verifyAuthTokenMiddleware } from "../../../middlewares/verify-auth-token";

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
    async (req, res, next) => {
      const tokenService: TokenService = req.scope.resolve("tokenService");

      try {
        const { exp, ...rest } = req.user as any;

        const newLongExpireToken = tokenService.signToken(
          { ...rest },
          { expiresIn: "24 days" }
        );

        res.cookie("MoveShop_admin_jwt", newLongExpireToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 60 * 60 * 10,
        });

        res.json({ message: newLongExpireToken });
      } catch (e) {
        console.log(e);
        return res.send({ e });
      }
      // const token = await tokenService.signToken();
    }
  );

  storeRouter.get(
    "/theme",
    themeCustomizabilityCheckMiddleware,
    async (req, res, next) => {
      res.send({ success: req.user });
    }
  );

  // Define the route using the imported handler function
  storeRouter.get("/campaign-list", getCampaignListHandler);
  storeRouter.get("/campaign-product/:id", getCampaignProductsHandler);
}
