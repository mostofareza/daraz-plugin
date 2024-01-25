import { ConfigModule, authenticate } from "@medusajs/medusa";
import { Router } from "express";
import cors from "cors";
import {darazInventory} from './products'
import { darazOrders } from "./orders";

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
  //health check
  adminRouter.get("/health", (req, res) => {
    res.status(200).json({ message: "ok" });
  });


  //pull orders from daraz
  adminRouter.get("/daraz/pull-orders", darazOrders.getOrder);

  
  //Send product to daraz
  adminRouter.post("/daraz/send-product/:id", darazInventory.create);

  // Mount the admin router under the "/admin" path
  router.use("/admin/api/v1", adminRouter);
}
