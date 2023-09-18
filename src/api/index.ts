import express, { Router, Request, Response } from "express";
import { getConfigFile, parseCorsOrigins } from "medusa-core-utils";
import InventoryProductService from "services/inventory-product.js";
import bodyParser from "body-parser";
import cors from "cors";
import {
  IProductQuery,
  IRetrieveInventoryProductQuery,
} from "interfaces/moveon-product";
import SettingsService from "services/settings";
import { StoreService } from "@medusajs/medusa";

const DEFAULT_lIMIT = 20;

export default function createRouter(
  rootDirectory: string,
  options: any
): Router {
  const router = express.Router();
  const token = process.env.MOVEON_API_TOKEN || "";

  const { configModule } = getConfigFile(rootDirectory, `medusa-config`);
  /* @ts-ignore */
  const config = (configModule && configModule.projectConfig) || {};

  const storeCors = config.store_cors || "";
  router.use(
    cors({
      origin: parseCorsOrigins(storeCors),
      credentials: true,
    })
  );
  router.use(bodyParser.json());

  router.get("/inventory-products", async (req: Request, res: Response) => {
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
      limit: limit ? Number(limit) : 20,
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
      InventoryProductServiceInstance.setToken(token);
      const response = await InventoryProductServiceInstance.getProducts(
        filters
      );

      res.status(200).json({
        ...response,
        statusCode: 200,
        message: "Successfully fetch products",
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: error.data || "Unknown error occurred",
      });
    }
  });

  router.get(
    "/inventory-product-details",
    async (req: Request, res: Response) => {
      const InventoryProductServiceInstance: InventoryProductService =
        req.scope.resolve("inventoryProductService");

      const url = req.query.url;

      if (!url || typeof url !== "string") {
        return res.status(422).json({
          error: {
            message: "url is required and must be a string",
            status: "error",
            code: 422,
          },
        });
      }

      try {
        InventoryProductServiceInstance.setToken(token);

        const response =
          await InventoryProductServiceInstance.getProductDetailsByUrl(url);
        res.status(200).json({
          ...response,
        });
      } catch (error: any) {
        res.status(error.status || 500).json({
          error: error.data || "Unknown error occurred",
        });
      }
    }
  );

  router.post(
    "/add-inventory-products",
    async (req: Request, res: Response) => {
      try {
        const InventoryProductServiceInstance = req.scope.resolve(
          "inventoryProductService"
        );
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls)) {
          return res.status(422).json({
            error: {
              message: "urls is required and must be an array",
              status: "error",
              code: 422,
            },
          });
        }

        InventoryProductServiceInstance.setToken(token);

        const productDetailsPromises = urls.map(async (url) => {
          const response =
            await InventoryProductServiceInstance.getProductDetailsByUrl(url);
          return response.data; // Assuming response.data holds the product details
        });

        const productDetailsArray = await Promise.all(productDetailsPromises);

        const addProductPromises = productDetailsArray.map(
          async (productDetail) => {
            try {
              const newProduct =
                await InventoryProductServiceInstance.addProduct({
                  ...productDetail,
                });
              return newProduct;
            } catch (error) {
              throw error; // Rethrow the error to be caught later
            }
          }
        );

        const newlyAddedProducts = await Promise.all(addProductPromises);

        res.status(200).json({
          success: true,
          message: "Products added successfully",
          products: newlyAddedProducts,
        });
      } catch (error: any) {
        res.status(error.status || 500).json({
          error: error.data || "Unknown error occurred",
        });
      }
    }
  );

  router.get(
    "/retrieve-inventory-product",
    async (req: Request, res: Response) => {
      const InventoryProductServiceInstance = req.scope.resolve(
        "inventoryProductService"
      );
      const { offset, limit } = req.query as IRetrieveInventoryProductQuery;

      const filters = {
        limit: limit ? Number(limit) : DEFAULT_lIMIT,
        offset: offset ? Number(offset) : 0,
      };

      try {
        InventoryProductServiceInstance.setToken(token);
        const response =
          await InventoryProductServiceInstance.getInventoryProduct(filters);
        res.status(200).json({
          ...response,
          statusCode: 200,
          message: "Retrieve inventory product successful",
        });
      } catch (error: any) {
        res.status(error.status || 500).json({
          error: error.data || "Unknown error occurred",
        });
      }
    }
  );

  // inventory product price role settings

  router.get("/currency", async (req: Request, res: Response) => {
    const InventorySettings: SettingsService =
      req.scope.resolve("settingsService");

    try {
      const response = await InventorySettings.list();
      res.status(200).json({
        result: response,
        statusCode: 200,
        message: "Retrieve regions successful",
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: error,
      });
    }
  });

  router.post("/currency", async (req: Request, res: Response) => {
    const InventorySettings: SettingsService =
      req.scope.resolve("settingsService");
    const data = req.body;
    try {
      const response = await InventorySettings.create(data);
      res.status(200).json({
        ...response,
        statusCode: 200,
        message: "successfully created",
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: error,
      });
    }
  });

  module.exports = router;

  return router;
}
