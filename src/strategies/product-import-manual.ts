import { EntityManager } from "typeorm"
import {ProductService , BatchJobService, AbstractBatchJobStrategy, CreateBatchJobInput } from "@medusajs/medusa"
import { ImportProductsManualBatchJob, ImportProductsManualBatchJobContext } from "strategies"
import InventoryProductService from "services/inventory-product"


type InjectedDependencies = {
  inventoryProductService: InventoryProductService
  productService: ProductService
  batchJobService: BatchJobService
  manager: EntityManager
}

class ImportProductsManualStrategy extends AbstractBatchJobStrategy {
  public static identifier = "product-import-manual-strategy"
  public static batchType = "product-import-manual"

  public defaultMaxRetry = 3

  protected readonly DEFAULT_LIMIT = 100

  protected readonly batchJobService_: BatchJobService
  protected readonly productService_: ProductService
  protected readonly inventoryProductService_: InventoryProductService

  constructor({
    batchJobService,
    productService,
    inventoryProductService,
    manager,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.manager_ = manager
    this.batchJobService_ = batchJobService
    this.productService_ = productService
    this.inventoryProductService_ = inventoryProductService

  }

  async prepareBatchJobForProcessing(
    batchJob: CreateBatchJobInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: Express.Request
  ): Promise<CreateBatchJobInput> {
    return batchJob
  }

  async preProcessBatchJob(batchJobId: string): Promise<void> {
    return await this.atomicPhase_(async (transactionManager) => {
      const batchServiceTx = this.batchJobService_
      .withTransaction(transactionManager);

      const batchJob = (await 
        batchServiceTx.retrieve(batchJobId)) as ImportProductsManualBatchJob

        await batchServiceTx.update(batchJobId, {
          result: {
            stat_descriptors: [
              {
                key: "product-import-count",
                name: "Product count to import",
                message: `There will be ${batchJob.context.products.length} products imported by this action`,
              },
            ],
          },
    
    })

  }
    )
}

  async processJob(batchJobId: string): Promise<void> {
    return await this.atomicPhase_(
      async (transactionManager) => {
        let batchJob = (await this.batchJobService_
          .withTransaction(transactionManager)
          .retrieve(batchJobId)) as ImportProductsManualBatchJob

      const products = batchJob.context?.products

      const productServiceTx =
      this.productService_.withTransaction(transactionManager)

      this.inventoryProductService_.setToken(process.env.MOVEON_API_TOKEN);

      for (const productOp of products) {
        const productDetails = await this.inventoryProductService_.getProductDetailsByUrl(productOp.link)
        //@ts-ignore
        await productServiceTx.create({title:productDetails.data.title, images: productDetails.data.gallery.map(g=>g.url), metadata:{
          source: "moveon"
        }})
      }

      
  })
} 

  public async buildTemplate(): Promise<string> {
    return ""
  }


}

export default ImportProductsManualStrategy