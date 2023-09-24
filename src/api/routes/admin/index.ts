// main file (storeRoutes.ts)

import { ConfigModule, authenticate, wrapHandler } from "@medusajs/medusa";
import { Router } from "express";
import cors from "cors";
import {
  createPriceSettingsHandler,
  deletePriceSettingsHandler,
  getPriceSettingsListHandler,
  updatePriceSettingsHandler,
} from "./price-settings";
import { CreatePriceSettingValidation } from "../../../middlewares/create-price-validation-middlewares";
import { UpdatePriceSettingValidation } from "../../../middlewares/update-price-validation-middleware";
import {
  getProductDetailsHandler,
  getProductListHandler,
  retrieveMoveOnInventoryHandler,
} from "./moveOn-inventory";

export default function adminRoutes(router: Router, options: ConfigModule) {
  const { projectConfig } = options;

  const adminCorsOptions = {
    origin: projectConfig?.admin_cors?.split(","),
    credentials: true,
  };

  const adminRouter = Router();
  router.use(/\/admin\/((?!auth)(?!invites).*)/, adminRouter);
  adminRouter.use(cors(adminCorsOptions));
  adminRouter.use(authenticate());

  // product import
  router.get("/inventory-products", getProductListHandler);
  router.get("/inventory-product-details", getProductDetailsHandler);
  router.get("/retrieve-inventory-product", retrieveMoveOnInventoryHandler);

  // inventory product price role settings
  router.get("/admin/price-role-settings", getPriceSettingsListHandler);
  router.post(
    "/admin/price-role-settings",
    CreatePriceSettingValidation,
    createPriceSettingsHandler
  );
  router.patch(
    "/admin/price-role-settings/:id",
    UpdatePriceSettingValidation,
    updatePriceSettingsHandler
  );
  router.delete("/admin/price-role-settings/:id", deletePriceSettingsHandler);
}
