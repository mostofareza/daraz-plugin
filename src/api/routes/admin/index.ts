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
<<<<<<< HEAD
import { MedusaError } from "medusa-core-utils";
=======
import { deleteAllBatchJobHandler, deleteBatchJobHandler } from "./batch-job-extended";
>>>>>>> stage-dev

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

  router.get("/admin/token", async (req, res) => {
    const tokenService: TokenService = req.scope.resolve("tokenService");
    const userService: UserService = req.scope.resolve("userService");
    const user = req.user;

    if (!user?.userId) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "User id not found");
    }

    const currentUser = await userService.retrieve(user?.userId);
    const userTokenData = {
      email: currentUser.email,
      id: currentUser.id,
      role: currentUser.role,
    };

    const token = tokenService.signToken(
      { ...userTokenData },
      { expiresIn: 30 }
    );

    const redirect_url = `http://localhost:3000/edit/?token=${token}`;

    res.status(200).json({
      redirect_url,
      token,
    });
  });

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
  router.delete("/admin/batch-job-extended/:id", deleteBatchJobHandler);
  router.delete("/admin/batch-job-extended", deleteAllBatchJobHandler);

}
