import { IInventoryService, WorkflowTypes } from "@medusajs/types"
import { createProducts, Workflows } from "@medusajs/core-flows"
import { promiseAll } from "@medusajs/utils"
import { Logger, Product, ProductService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import { MedusaError } from "medusa-core-utils/dist"
import DarazProductService from "services/daraz-product"
// import { convertToDarazProduct } from "utils/reform-to-daraz-payload"


export default async (req:any, res:any) => {
  const {id} = req.params
  const logger: Logger = req.scope.resolve("logger")
  const productService: ProductService = req.scope.resolve("productService")
  const darazProductService: DarazProductService = req.scope.resolve("darazProductService")
  const entityManager: EntityManager = req.scope.resolve("manager")
  const productModuleService = req.scope.resolve("productModuleService")

  let product
    product = await entityManager.transaction(async (manager) => {
      const findProduct = await productService.retrieve(id,{}) 
      if(!findProduct) {
         throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with id: ${id} was not found`
        )
      }
      const reformedProduct = convertToDarazProduct(findProduct)
      const newProduct = await darazProductService
        .withTransaction(manager)
        .create(reformedProduct)

      return newProduct
    })

  res.json({ data:product })
}


function convertToDarazProduct(productData:Product) {
  const darazProductData = {
      medusa_id: productData.id,
      PrimaryCategory: "Cloth", 
      SPUId: productData.id,
      AssociatedSku: null, 
      Images: {
        Image: [productData.thumbnail],
      },
      Attributes: {
        name: productData.title,
        short_description: productData.description,
        brand: null, 
        model: null, 
        kid_years: null, 
        delivery_option_sof: null, 
      },
      Skus: {
        SellerSku: null,
        color_family: null, 
        size: null, 
        quantity: null,
        price: null, 
        package_length: null, 
        package_height: null,
        package_weight: null,
        package_width: null, 
        package_content: null, 
        Images: {
          Image: [productData.thumbnail],
        },
      },
  };

  return darazProductData;
}
