import { Request, Response, NextFunction } from "express";
import InventoryProductService from "../../../../services/inventory-product";
import { appConfig } from "../../../../utils/app-config";

export default async (req: Request, res: Response, next: NextFunction) => {
  const InventoryProductServiceInstance: InventoryProductService =
    req.scope.resolve("inventoryProductService");

  const url = req.query.url;

  if (!url || typeof url !== "string") {
    return res.status(422).json({
      error: [
        {
          key: "url",
          message: "url is required and must be a string",
        },
      ],
    });
  }

  try {
    InventoryProductServiceInstance.setToken(appConfig.token);

    const response =
      await InventoryProductServiceInstance.getProductDetailsByUrl(url);
    res.status(200).json({
      ...response,
    });
  } catch (error) {
    // res.status(error.status || 500).json({
    //   error: error.data || "Unknown error occurred",
    // });
    next(error);
  }
};
