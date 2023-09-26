// main file (storeRoutes.ts)

import {
  ConfigModule,
  Customer,
  TokenService,
  User,
  UserService,
  authenticate,
  wrapHandler,
} from "@medusajs/medusa";
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
import { MedusaError } from "medusa-core-utils";
import batchJobExtended from "./batch-job-extended";
import themeSettings from "./theme-settings";

export default function adminRoutes(router: Router, options: ConfigModule) {
  const { projectConfig } = options;

  const adminCorsOptions = {
    origin: projectConfig?.admin_cors?.split(","),
    credentials: true,
  };

  const adminRouter = Router();
  const adminStoreRouter = Router();
  router.use(/\/admin\/((?!auth)(?!invites).*)/, adminRouter);
  adminStoreRouter.use(cors(adminCorsOptions));
  router.use(cors(adminCorsOptions));
  adminRouter.use(cors(adminCorsOptions));
  adminRouter.use(authenticate());

  // generate token for admin to customize there own theme
  router.get("/admin/token", themeSettings.generateAuthTokenHandler);

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

  // Batch Job Extended Routes
  router.delete(
    "/admin/batch-job-extended/:id",
    batchJobExtended.deleteBatchJobHandler
  );
  router.delete(
    "/admin/batch-job-extended",
    batchJobExtended.deleteAllBatchJobHandler
  );
}
