import { DiscountService, ProductService,  SalesChannelService, defaultAdminProductRelations } from "@medusajs/medusa"
import { IEventBusService, ISearchService } from "@medusajs/types"
import { defaultSearchIndexingProductRelations } from "@medusajs/utils"
import { indexTypes } from "medusa-core-utils"
import DarazProductService from "services/daraz-product"
import InventoryProductService from "services/inventory-product"

type InjectedDependencies = {
  eventBusService: IEventBusService
  searchService: ISearchService
  productService: ProductService
  darazProductService: DarazProductService
  salesChannelService: SalesChannelService
  inventoryService: InventoryProductService
}

class ProductSearchSubscriber {
  private readonly eventBusService_: IEventBusService
  private readonly searchService_: ISearchService
  private readonly productService_: ProductService
  private readonly darazProductService_: DarazProductService
  private readonly salesChannelService_: SalesChannelService

  constructor(container: InjectedDependencies) {
    this.eventBusService_ = container.eventBusService
    this.searchService_ = container.searchService
    this.productService_ = container.productService
    this.darazProductService_ = container.darazProductService
    this.salesChannelService_ = container.salesChannelService

    this.eventBusService_
      .subscribe(ProductService.Events.CREATED, this.handleProductCreation)
      .subscribe(ProductService.Events.UPDATED, this.handleProductUpdate)
      .subscribe(ProductService.Events.DELETED, this.handleProductDeletion)
  }

  handleProductCreation = async (data:any) => {
    const product = await this.productService_.retrieve(data.id, {
      relations: defaultSearchIndexingProductRelations,
    })
    await this.searchService_.addDocuments(
      ProductService.IndexName,
      [product],
      indexTypes.products
    )
  }

  handleProductUpdate = async (data:any) => {
    const product = await this.productService_.retrieve(data.id, {
      relations: defaultAdminProductRelations,
    })
    //check is product has daraz sales channel
    const isDarazInSalesChannel = product.sales_channels.some((sc) => sc.id === "sc_daraz")

    if(isDarazInSalesChannel) {
      await this.darazProductService_.create(product)
    }else{
      if(!product.handle) throw new Error("Product handle is not defined")
      const shouldDelete = await this.darazProductService_.retrieve(product.handle)
      if(shouldDelete) {
        await this.darazProductService_.delete(shouldDelete._id)
      }
    }
  }

  handleProductDeletion = async (data:any) => {
    await this.searchService_.deleteDocument(ProductService.IndexName, data.id)
  }
}

export default ProductSearchSubscriber
