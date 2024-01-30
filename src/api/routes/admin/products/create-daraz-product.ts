import {
  BatchJobService,
  ProductService,
  defaultAdminProductRelations,
} from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import { MedusaError } from "medusa-core-utils/dist";
import DarazProductService from "services/daraz-product";

export default async (req: any, res: any) => {
  const { productIds } = req.query;
  const productIdArray = productIds.split(",");
  const productService: ProductService = req.scope.resolve("productService");
  const darazProductService: DarazProductService = req.scope.resolve(
    "darazProductService"
  );
  const entityManager: EntityManager = req.scope.resolve("manager");
  const batchJobService: BatchJobService = req.scope.resolve("batchJobService");
  //@ts-ignore
  const createdProduct = await entityManager.transaction(async (manager) => {
    // using loop
    productIdArray.forEach(async (id: any) => {
      const product = await productService.retrieve(id, {
        relations: defaultAdminProductRelations,
      });
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with id: ${id} was not found`
        );
      }

      const batchJob = await batchJobService.create({
        type: "publish-products-to-daraz",
        context: {
          product_id: id,
        },
        dry_run: false,
        created_by: req.user.id,
      });
      return batchJob;
    });
    return res.json({ data: createdProduct });
  });
};
