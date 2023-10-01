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

  // Create a dedicated admin router for better organization
  const adminRouter = Router();

  // Apply CORS middleware for the admin routes
  adminRouter.use(cors(adminCorsOptions));

  // Use the authentication middleware for all admin routes
  adminRouter.use(authenticate());

  // Generate token for admin to customize their own theme
  adminRouter.get(
    "/api/v1/generate-token",
    themeSettings.generateAuthTokenHandler
  );

  // MoveOn inventory product routes
  adminRouter.get(
    "/api/v1/inventory-products",
    moveOnInventory.inventoryProducts
  );
  adminRouter.get("/api/v1/inventory-product-details", moveOnInventory.details);
  adminRouter.get(
    "/api/v1/retrieve-inventory-product",
    moveOnInventory.importedProducts
  );

  // Inventory product price role settings routes
  adminRouter.get("/api/v1/price-role-settings", priceSettings.list);
  adminRouter.post(
    "/api/v1/price-role-settings",
    CreatePriceSettingValidation,
    priceSettings.create
  );
  adminRouter.patch(
    "/api/v1/price-role-settings/:id",
    UpdatePriceSettingValidation,
    priceSettings.update
  );
  adminRouter.delete("/api/v1/price-role-settings/:id", priceSettings.remove);

  // Batch Job Extended Routes
  adminRouter.delete(
    "/api/v1/batch-job-extended/:id",
    batchJobExtended.removeById
  );
  adminRouter.delete("/api/v1/batch-job-extended", batchJobExtended.removeAll);

  // Mount the admin router under the "/admin" path
  router.use("/admin", adminRouter);
}
