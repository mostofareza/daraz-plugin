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
  adminRouter.use((req, res, next) => {
    if (req.path === "/auth" || req.path === "/invites") {
      // Exclude /admin/auth and /admin/invites from authentication
      return next();
    }
    authenticate()(req, res, next);
  });

  // Generate token for admin to customize their own theme
  adminRouter.get("/generate-token", themeSettings.generateAuthTokenHandler);

  // MoveOn inventory product routes
  adminRouter.get("/inventory-products", moveOnInventory.inventoryProducts);
  adminRouter.get("/inventory-product-details", moveOnInventory.details);
  adminRouter.get(
    "/retrieve-inventory-product",
    moveOnInventory.importedProducts
  );

  // Inventory product price role settings routes
  adminRouter.get("/price-role-settings", priceSettings.list);
  adminRouter.post(
    "/price-role-settings",
    CreatePriceSettingValidation,
    priceSettings.create
  );
  adminRouter.patch(
    "/price-role-settings/:id",
    UpdatePriceSettingValidation,
    priceSettings.update
  );
  adminRouter.delete("/price-role-settings/:id", priceSettings.remove);

  // Batch Job Extended Routes
  adminRouter.delete("/batch-job-extended/:id", batchJobExtended.removeById);
  adminRouter.delete("/batch-job-extended", batchJobExtended.removeAll);

  // Mount the admin router under the "/admin" path
  router.use("/admin/api/v1", adminRouter);
}
