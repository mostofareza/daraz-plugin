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
  // console.log('productData: ', productData);
  const darazProductData = {
      medusa_id: productData.id,
      PrimaryCategory: "Cloth", // Assuming a default category for now
      SPUId: productData.id,
      AssociatedSku: null, // Assuming the first variant as the AssociatedSku
      Images: {
        Image: [productData.thumbnail],
      },
      Attributes: {
        name: productData.title,
        short_description: productData.description,
        brand: null, // You can fill in the brand information if available in your data
        model: null, // You can fill in the model information if available in your data
        kid_years: null, // You can fill in the kid_years information if available in your data
        delivery_option_sof: null, // You can fill in the delivery_option_sof information if available in your data
      },
      Skus: {
        SellerSku: null, // Assuming the first variant as the SellerSku
        color_family: null, // You can fill in the color_family information if available in your data
        size: null, // Assuming the first variant's option as the size
        quantity: null,
        price: null, // Assuming the first price in EUR
        package_length: null, // You can fill in the package_length information if available in your data
        package_height: null, // You can fill in the package_height information if available in your data
        package_weight: null, // You can fill in the package_weight information if available in your data
        package_width: null, // You can fill in the package_width information if available in your data
        package_content: null, // You can fill in the package_content information if available in your data
        Images: {
          Image: [productData.thumbnail],
        },
      },
  };

  return darazProductData;
}
