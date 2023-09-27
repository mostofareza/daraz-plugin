import { ConfigModule, authenticate } from "@medusajs/medusa";
import { Router } from "express";
import cors from "cors";
import { CreatePriceSettingValidation } from "../../../middlewares/create-price-validation-middlewares";
import { UpdatePriceSettingValidation } from "../../../middlewares/update-price-validation-middleware";
import batchJobExtended from "./batch-job-extended";
import themeSettings from "./theme-settings";
import moveOnInventory from "./moveOn-inventory";
import priceSettings from "./price-settings";

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
  router.get(
    "/admin/api/v1/generate-token",
    themeSettings.generateAuthTokenHandler
  );

  // MoveOn inventory product
  router.get(
    "/admin/api/v1/inventory-products",
    moveOnInventory.inventoryProducts
  );
  router.get(
    "/admin/api/v1/inventory-product-details",
    moveOnInventory.details
  );
  router.get(
    "/admin/api/v1/retrieve-inventory-product",
    moveOnInventory.importedProducts
  );

  // inventory product price role settings
  router.get("/admin/api/v1/price-role-settings", priceSettings.list);
  router.post(
    "/admin/api/v1/price-role-settings",
    CreatePriceSettingValidation,
    priceSettings.create
  );
  router.patch(
    "/admin/api/v1/price-role-settings/:id",
    UpdatePriceSettingValidation,
    priceSettings.update
  );
  router.delete("/admin/api/v1/price-role-settings/:id", priceSettings.remove);

  // Batch Job Extended Routes
  router.delete(
    "/admin/api/v1/batch-job-extended/:id",
    batchJobExtended.removeById
  );
  router.delete("/admin/api/v1/batch-job-extended", batchJobExtended.removeAll);
}
