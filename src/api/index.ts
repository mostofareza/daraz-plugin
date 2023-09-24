import express, { Router, NextFunction } from "express";
import { errorHandler } from "@medusajs/medusa";
import bodyParser from "body-parser";
import storeRoutes from "./routes/store";
import adminRoutes from "./routes/admin";

export default function createRouter(
  rootDirectory: string,
  options: any
): Router {
  const router = express.Router();

  router.use(bodyParser.json());
  storeRoutes(router, options);
  adminRoutes(router, options);
  router.use(errorHandler());
  module.exports = router;

  return router;
}

// router.get("/inventory-products", getProductListHandler);

// router.get(
//   "/inventory-product-details",

// );

// router.post(
//   "/add-inventory-products",
//   async (req: Request, res: Response) => {
//     try {
//       const InventoryProductServiceInstance = req.scope.resolve(
//         "inventoryProductService"
//       );
//       const { urls } = req.body;

//       if (!urls || !Array.isArray(urls)) {
//         return res.status(422).json({
//           error: {
//             message: "urls is required and must be an array",
//             status: "error",
//             code: 422,
//           },
//         });
//       }

//       InventoryProductServiceInstance.setToken(token);
//       const productDetailsPromises = urls.map(async (url) => {
//         const response =
//           await InventoryProductServiceInstance.getProductDetailsByUrl(url);
//         return response.data; // Assuming response.data holds the product details
//       });

//       const productDetailsArray = await Promise.all(productDetailsPromises);

//       const addProductPromises = productDetailsArray.map(
//         async (productDetail) => {
//           try {
//             const newProduct =
//               await InventoryProductServiceInstance.addProduct({
//                 ...productDetail,
//               });
//             return newProduct;
//           } catch (error) {
//             throw error; // Rethrow the error to be caught later
//           }
//         }
//       );

//       const newlyAddedProducts = await Promise.all(addProductPromises);

//       res.status(200).json({
//         success: true,
//         message: "Products added successfully",
//         products: newlyAddedProducts,
//       });
//     } catch (error: any) {
//       res.status(error.status || 500).json({
//         error: error.data || "Unknown error occurred",
//       });
//     }
//   }
// );
// router.get(
//   "/retrieve-inventory-product",
//   async (req: Request, res: Response) => {
//     const InventoryProductServiceInstance = req.scope.resolve(
//       "inventoryProductService"
//     );
//     const { offset, limit } = req.query as IRetrieveInventoryProductQuery;

//     const filters = {
//       limit: limit ? Number(limit) : appConfig.limit,
//       offset: offset ? Number(offset) : 0,
//     };

//     try {
//       InventoryProductServiceInstance.setToken(appConfig.token);
//       const response =
//         await InventoryProductServiceInstance.getInventoryProduct(filters);
//       res.status(200).json({
//         ...response,
//         statusCode: 200,
//         message: "Retrieve inventory product successful",
//       });
//     } catch (error: any) {
//       res.status(error.status || 500).json({
//         error: error.data || "Unknown error occurred",
//       });
//     }
//   }
// );
