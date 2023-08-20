import { EntityManager } from "typeorm"
import {ProductService , BatchJobService, AbstractBatchJobStrategy, CreateBatchJobInput } from "@medusajs/medusa"
import { ImportProductsManualBatchJob, ImportProductsManualBatchJobContext } from "strategies"


type InjectedDependencies = {
  productService: ProductService
  batchJobService: BatchJobService
  manager: EntityManager
}

class ImportProductsManualStrategy extends AbstractBatchJobStrategy {
  public static identifier = "import-products-manual-strategy"
  public static batchType = "import-products-manual"

  public defaultMaxRetry = 3

  protected readonly DEFAULT_LIMIT = 100

  protected readonly batchJobService_: BatchJobService
  protected readonly productService_: ProductService

  constructor({
    batchJobService,
    productService,
    manager,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.manager_ = manager
    this.batchJobService_ = batchJobService
    this.productService_ = productService

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

      for (const productOp of products) {
        await productServiceTx.create(productOp)
      }

      
  })
} 

  public async buildTemplate(): Promise<string> {
    return ""
  }


}

export default ImportProductsManualStrategy