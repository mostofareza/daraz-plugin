import { Logger, Product, ProductVariant, ProductService, ProductVariantService, defaultAdminProductRelations, EventBusService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import { MedusaError } from "medusa-core-utils/dist"
import DarazProductService from "services/daraz-product"
import { convertToDarazProduct } from "utils/reform-to-daraz-payload"


export default async (req:any, res:any) => {
  const {id} = req.params
  const logger: Logger = req.scope.resolve("logger")
  const productService: ProductService = req.scope.resolve("productService")
  const eventBusService:EventBusService = req.scope.resolve("eventBusService")
  const darazProductService: DarazProductService = req.scope.resolve("darazProductService")
  const entityManager: EntityManager = req.scope.resolve("manager")
  const productModuleService = req.scope.resolve("productModuleService")
  const productVariantService: ProductVariantService = req.scope.resolve("productVariantService")

  const createdProduct = await entityManager.transaction(async (manager) => {
      const product = await productService.retrieve(id,{relations: defaultAdminProductRelations})
      if(!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with id: ${id} was not found`
        )
      }
      // check the product sales channel is daraz or not. if not, throw error
      const salesChannels = product.sales_channels
      const isDaraz = salesChannels.some((sc) => sc.id === "sc_daraz")
      if(!isDaraz) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with id: ${id} is not a daraz product`
        )
      }


      const newProduct = await darazProductService
        .withTransaction(manager)
        .create(product)

      return newProduct
    })

  res.json({ data: createdProduct })
}



