import { NextFunction, Request, Response } from "express";
import InventoryProductService from "../../../../services/inventory-product";
import { IProductQuery } from "../../../../interfaces/moveon-product";
import { appConfig } from "../../../../utils/app-config";

export default async (req: Request, res: Response, next: NextFunction) => {
  const InventoryProductServiceInstance: InventoryProductService =
    req.scope.resolve("inventoryProductService");

  const {
    keyword,
    shop_id,
    offset,
    limit,
    attr,
    features,
    sortType,
    sortOrder,
    cid,
    pr,
  } = req.query as IProductQuery;

  const filters = {
    limit: limit ? Number(limit) : appConfig.limit,
    offset: offset ? Number(offset) : 0,
    attr,
    keyword,
    shop_id,
    features,
    sortType,
    sortOrder,
    cid,
    pr,
  };

  try {
    // Assuming setToken method exists in your InventoryProductServiceInstance
    InventoryProductServiceInstance.setToken(appConfig.token);
    const response = await InventoryProductServiceInstance.getProducts(filters);

    res.status(200).json({
      ...response,
      statusCode: 200,
      message: "Successfully fetch products",
    });
  } catch (error) {
    next(error);
  }
};
