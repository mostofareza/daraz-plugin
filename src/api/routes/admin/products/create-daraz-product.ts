import { ProductService, defaultAdminProductRelations } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import { MedusaError } from "medusa-core-utils/dist"
import DarazProductService from "services/daraz-product"


export default async (req:any, res:any) => {
  const {id} = req.params
  const productService: ProductService = req.scope.resolve("productService")
  const darazProductService: DarazProductService = req.scope.resolve("darazProductService")
  const entityManager: EntityManager = req.scope.resolve("manager")

  const createdProduct = await entityManager.transaction(async (manager) => {
      const product = await productService.retrieve(id,{relations: defaultAdminProductRelations})
      if(!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with id: ${id} was not found`
        )
      }

      const newProduct = await darazProductService
        .withTransaction(manager)
        .create(product)

      return newProduct
    })

  res.json({ data: createdProduct })
}



