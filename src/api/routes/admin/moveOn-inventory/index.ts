import { Request, Response, NextFunction, RequestHandler } from "express";
import InventoryProductService from "../../../../services/inventory-product";
import {
  IProductQuery,
  IRetrieveInventoryProductQuery,
} from "../../../../interfaces/moveon-product";
import { appConfig } from "../../../../utils/app-config";

export const getProductListHandler: RequestHandler = async (req, res, next) => {
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

export const getProductDetailsHandler: RequestHandler = async (req, res, next) => {
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

export const retrieveMoveOnInventoryHandler: RequestHandler = async (
  req,
  res,
  next
) => {
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
