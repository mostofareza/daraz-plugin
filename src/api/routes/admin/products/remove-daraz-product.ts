import DarazProductService from "services/daraz-product";
import { EntityManager } from "typeorm";
import { CommonParams } from "types/common/common";

export default async (req: any, res: any) => {
    const {id} = req.params
  const darazProductService: DarazProductService = req.scope.resolve(
    "darazProductService"
  );
  const entityManager: EntityManager = req.scope.resolve("manager");

  const createdProducts = await entityManager.transaction(async (manager) => {
    const products = await darazProductService
      .withTransaction(manager)
      .remove(id);

    return products;
  });

  res.json({ data: createdProducts });
};

interface DarazRemoveProductsConfig extends CommonParams {
  seller_sku_list: string;
}
