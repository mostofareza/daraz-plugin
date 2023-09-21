// main file (storeRoutes.ts)

import { ConfigModule, authenticate, wrapHandler } from "@medusajs/medusa";
import { Request, Response, Router } from "express";
import cors from "cors";

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

  // Define the route using the imported handler function
  //   adminRouter.get(
  //     "/test",
  //     wrapHandler(async (req: Request, res: Response) => {
  //       // @ts-ignore
  //       console.log(res);
  //       res.json("Hello World");
  //     })
  //   );
}
