import { Logger, Product, ProductVariant, ProductService, ProductVariantService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import { MedusaError } from "medusa-core-utils/dist"
import DarazProductService from "services/daraz-product"


export default async (req:any, res:any) => {
  const {id} = req.params
  const logger: Logger = req.scope.resolve("logger")
  const productService: ProductService = req.scope.resolve("productService")
  const darazProductService: DarazProductService = req.scope.resolve("darazProductService")
  const entityManager: EntityManager = req.scope.resolve("manager")
  const productModuleService = req.scope.resolve("productModuleService")
  const productVariantService: ProductVariantService = req.scope.resolve("productVariantService")

  let product
    product = await entityManager.transaction(async (manager) => {
      const findVariant = await productVariantService.retrieve(id,{relations: ["product", "prices"]})
      if(!findVariant) {
         throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with id: ${id} was not found`
        )
      }
      const reformedProduct = convertToDarazProduct(findVariant)
      const newProduct = await darazProductService
        .withTransaction(manager)
        .create(reformedProduct)

      return newProduct
    })

  res.json({ data: product })
}


function convertToDarazProduct(productData:ProductVariant) {
  const darazProductData = {
      PrimaryCategory: "Default", 
      SPUId: productData.id ?? null,
      AssociatedSku: null, 
      Images: {
        Image: [productData.product.thumbnail ?? null],
      },
      Attributes: {
        name: productData.title ?? null,
        short_description: productData.product.description ?? null,
        brand: null, 
        model: null, 
        kid_years: null, 
        delivery_option_sof: null, 
      },
      Skus: {
        SellerSku: null,
        color_family: null, 
        size: productData.title ?? null, 
        quantity: productData.inventory_quantity ?? null,
        price: productData.prices[0].amount ?? null, 
        package_length: productData.product.length ?? null, 
        package_height: productData.product.height ?? null,
        package_weight: productData.product.weight ?? null,
        package_width: productData.product.width ?? null, 
        package_content: null, 
        Images: {
          Image: [productData.product.thumbnail ?? null],
        },
      },
  };

  return darazProductData;
}
