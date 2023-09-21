// main file (storeRoutes.ts)

import { ConfigModule, authenticate, wrapHandler } from "@medusajs/medusa";
import { Request, Response, Router } from "express";
import cors from "cors";
import {
  createPriceSettingsHandler,
  deletePriceSettingsHandler,
  getPriceSettingsListHandler,
  updatePriceSettingsHandler,
} from "./price-settings";
import { CreatePriceSettingValidation } from "../../../middlewares/create-price-validation-middlewares";
import { UpdatePriceSettingValidation } from "../../../middlewares/update-price-validation-middleware";

export default function adminRoutes(router: Router, options: ConfigModule) {
  const { projectConfig } = options;

  const adminCorsOptions = {
    origin: projectConfig?.admin_cors?.split(","),
    credentials: true,
  };

  const adminRouter = Router();
  router.use("/admin", adminRouter);

  adminRouter.use(cors(adminCorsOptions));
  adminRouter.use(authenticate());

  // inventory product price role settings
  router.get("/price-role-settings", getPriceSettingsListHandler);
  router.post(
    "/price-role-settings",
    CreatePriceSettingValidation,
    createPriceSettingsHandler
  );
  router.patch(
    "/price-role-settings/:id",
    UpdatePriceSettingValidation,
    updatePriceSettingsHandler
  );
  router.delete("/price-role-settings/:id", deletePriceSettingsHandler);
}
