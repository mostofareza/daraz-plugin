import {
  AbstractBatchJobStrategy,
  BatchJobService,
  EventBusService,
  Product,
  ProductService,
  ProductStatus,
} from "@medusajs/medusa";
import DarazProductService from "../services/daraz-product";
import { EntityManager } from "typeorm";

type InjectedDependencies = {
  eventBusService: EventBusService;
  batchJobService: BatchJobService;
  manager: EntityManager;
  productService: ProductService;
  darazProductService: DarazProductService;
};

class ProductPublishStrategy extends AbstractBatchJobStrategy {
  static identifier = "publish-products-strategy";
  static batchType = "publish-products-to-daraz";

  protected readonly DEFAULT_LIMIT = 100;
  public defaultMaxRetry = 3;

  protected batchJobService_: BatchJobService;
  protected manager_: EntityManager;
  protected transactionManager_: EntityManager;
  protected productService_: ProductService;
  protected eventBusService_: EventBusService;
  protected darazProductService_: DarazProductService;

  constructor({
    batchJobService,
    manager,
    productService,
    eventBusService,
    darazProductService,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);

    this.eventBusService_ = eventBusService;
    this.batchJobService_ = batchJobService;
    this.manager_ = manager;
    this.productService_ = productService;
    this.darazProductService_ = darazProductService;
  }

  /* 
    This method can be used in cases where you provide a template file to download, such as when implementing an import or export functionality.

    If not necessary to your use case, you can simply return an empty string.
    */
  async buildTemplate(): Promise<string> {
    return "";
  }

  /* 
    (Optional) preProcessBatchJob
    Medusa runs this method after it creates the batch job, but before it is confirmed and processed. You can use this method to perform any necessary action before the batch job is processed. You can also use this method to add information related to the expected result.

    For example, this implementation of the preProcessBatchJob method calculates how many draft products it will published and adds it to the result attribute of the batch job:
    */

  // async preProcessBatchJob(batchJobId: string): Promise<void> {
  //   // console.log("preProcessBatchJob", batchJobId);
  //   return await this.atomicPhase_(async (transactionManager) => {
  //     const batchJob = await this.batchJobService_
  //       .withTransaction(transactionManager)
  //       .retrieve(batchJobId);
  //     // console.log("batchJob", batchJob);
  //     const count = await this.productService_
  //       .withTransaction(transactionManager)
  //       .count({
  //         status: ProductStatus.DRAFT,
  //       });

  //     await this.batchJobService_
  //       .withTransaction(transactionManager)
  //       .update(batchJob, {
  //         result: {
  //           advancement_count: 0,
  //           count,
  //           stat_descriptors: [
  //             {
  //               key: "product-publish-count",
  //               name: "Number of products to publish",
  //               message: `${count} product(s) will be published.`,
  //             },
  //           ],
  //         },
  //       });
  //   });
  // }

  /* 
    Medusa runs this method to process the batch job once it is confirmed.
    For example, this implementation of the processJob method retrieves all draft products and changes their status to published
    */

  async processJob(batchJobId: string): Promise<void> {
    console.log("processJob from strategy", batchJobId);
    return await this.atomicPhase_(async (transactionManager) => {
      const productService = this.productService_;
      const productServiceTx =
        productService.withTransaction(transactionManager);
      const darazProductServiceTx =
        this.darazProductService_.withTransaction(transactionManager);

      const productList = await productServiceTx.list({
        status: ProductStatus.PUBLISHED,
      });
      // console.log("productList", productList.length);
      [1, 2].forEach(async (i: any) => {
        await darazProductServiceTx.create(i);
      });
      await this.batchJobService_
        .withTransaction(transactionManager)
        .update(batchJobId, {
          result: {
            advancement_count: productList.length,
          },
        });
    });
  }
}

export default ProductPublishStrategy;
