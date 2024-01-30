import {
  CartService,
  ProductService,
  SalesChannelService,
  SubscriberConfig,
  defaultAdminDraftOrdersCartRelations,
  defaultAdminProductRelations,
} from "@medusajs/medusa";
import { IEventBusService, ISearchService } from "@medusajs/types";
import { defaultSearchIndexingProductRelations } from "@medusajs/utils";
import { indexTypes } from "medusa-core-utils";
import DarazProductService from "services/daraz-product";
import { Parser } from "xml2js";

type InjectedDependencies = {
  eventBusService: IEventBusService;
  searchService: ISearchService;
  productService: ProductService;
  darazProductService: DarazProductService;
  salesChannelService: SalesChannelService;
  cartService: CartService;
};

class DarazProductSubscriber {
  private readonly eventBusService_: IEventBusService;
  private readonly searchService_: ISearchService;
  private readonly productService_: ProductService;
  private readonly darazProductService_: DarazProductService;
  private readonly salesChannelService_: SalesChannelService;
  private readonly cartService_: CartService;

  constructor(container: InjectedDependencies) {
    this.eventBusService_ = container.eventBusService;
    this.searchService_ = container.searchService;
    this.productService_ = container.productService;
    this.darazProductService_ = container.darazProductService;
    this.salesChannelService_ = container.salesChannelService;
    this.cartService_ = container.cartService;

    this.eventBusService_
      .subscribe(ProductService.Events.UPDATED, this.handleProductUpdate)
      .subscribe(ProductService.Events.DELETED, this.handleProductDeletion);
  }

  handleProductUpdate = async (data: any) => {
    const product = await this.productService_.retrieve(data.id, {
      relations: defaultAdminProductRelations,
    });
    //check is product has daraz sales channel
    const isDarazInSalesChannel = product.sales_channels.some(
      (sc) => sc.id === "sc_daraz"
    );

    if (isDarazInSalesChannel) {
      await this.darazProductService_.create(product);
    } else {
      const shouldDelete = await this.darazProductService_.retrieve(product.id);
      if (shouldDelete) {
        await this.darazProductService_.remove(shouldDelete._id);
      }
    }
  };

  handleProductDeletion = async (data: any) => {
    await this.darazProductService_.remove(data.handle);
  };
}

export default DarazProductSubscriber;

export const config: SubscriberConfig = {
  event: [ProductService.Events.UPDATED, ProductService.Events.DELETED],
  context: {
    subscriberId: "daraz-product-subscriber",
  },
};
