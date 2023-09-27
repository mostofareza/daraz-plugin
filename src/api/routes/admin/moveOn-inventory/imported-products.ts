import { Request, Response, NextFunction } from "express";
import { IRetrieveInventoryProductQuery } from "../../../../interfaces/moveon-product";
import { appConfig } from "../../../../utils/app-config";

export default async (req: Request, res: Response, next: NextFunction) => {
  const InventoryProductServiceInstance = req.scope.resolve(
    "inventoryProductService"
  );
  const { offset, limit } = req.query as IRetrieveInventoryProductQuery;

  const filters = {
    limit: limit ? Number(limit) : appConfig.limit,
    offset: offset ? Number(offset) : 0,
  };

  try {
    InventoryProductServiceInstance.setToken(appConfig.token);
    const response = await InventoryProductServiceInstance.getInventoryProduct(
      filters
    );
    res.status(200).json({
      ...response,
      statusCode: 200,
      message: "Retrieve inventory product successful",
    });
  } catch (error) {
    // res.status(error.status || 500).json({
    //   error: error.data || "Unknown error occurred",
    // });
    next(error);
  }
};
