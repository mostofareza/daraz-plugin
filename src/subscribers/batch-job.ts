import {
  BatchJobService,
  EventBusService,
  ProductService,
  StrategyResolverService,
  SubscriberConfig,
} from "@medusajs/medusa";
import DarazProductService from "services/daraz-product";
import { EntityManager } from "typeorm";

type InjectedDependencies = {
  eventBusService: EventBusService;
  batchJobService: BatchJobService;
  strategyResolverService: StrategyResolverService;
  manager: EntityManager;
  darazProductService: DarazProductService;
  productService: ProductService;
};

class BatchJobSubscriber {
  private readonly eventBusService_: EventBusService;
  private readonly batchJobService_: BatchJobService;
  private readonly strategyResolver_: StrategyResolverService;
  private readonly manager_: EntityManager;
  private readonly darazProductService_: DarazProductService;
  private readonly productSercice_: ProductService;

  constructor({
    eventBusService,
    batchJobService,
    strategyResolverService,
    manager,
    darazProductService,
    productService,
  }: InjectedDependencies) {
    this.eventBusService_ = eventBusService;
    this.batchJobService_ = batchJobService;
    this.strategyResolver_ = strategyResolverService;
    this.manager_ = manager;
    this.darazProductService_ = darazProductService;
    this.productSercice_ = productService;

    // this.eventBusService_.subscribe(
    //   BatchJobService.Events.CREATED,
    //   this.preProcessBatchJob
    // ) as EventBusService;

    this.eventBusService_.subscribe(
      BatchJobService.Events.CONFIRMED,
      this.processBatchJob
    ) as EventBusService;

    this.eventBusService_.subscribe(
      BatchJobService.Events.FAILED,
      this.handleFailedBatchJob
    ) as EventBusService;
  }

  handleFailedBatchJob = async (data: any): Promise<void> => {
    // await this.batchJobService_.setFailed(data.id, data.error);
  };

  handleSuccessfulBatchJob = async (batchJob: any): Promise<void> => {
    // const batchJobStrategy = this.strategyResolver_.resolveBatchJobByType(
    //   batchJob.type
    // )
    // await batchJobServiceTx.setProcessing(batchJob.id)
    // await batchJobStrategy.withTransaction(manager).processJob(batchJob.id)
    // await batchJobServiceTx.complete(batchJob.id)
  };

  processBatchJob = async (data: any): Promise<void> => {
    console.log("processBatchJob from subscriber", data);
    try {
      await this.manager_.transaction(async (manager) => {
        const batchJobServiceTx =
          this.batchJobService_.withTransaction(manager);
        const batchJob = await batchJobServiceTx.retrieve(data.id);

        const product = await this.productSercice_.retrieve(
          batchJob.context.product_id as string
        );

        if (!product) {
          throw new Error("Product not found");
        }

        await this.darazProductService_.create(product);
        const batchJobStrategy = this.strategyResolver_.resolveBatchJobByType(
          batchJob.type
        );

        // await batchJobServiceTx.setProcessing(batchJob.id);
        // await batchJobStrategy.withTransaction(manager).processJob(batchJob.id);
        // await batchJobServiceTx.complete(batchJob.id);
      });
    } catch (e: any) {
      await this.batchJobService_.setFailed(data.id, e.message);
      throw e;
    }
  };
}

export default BatchJobSubscriber;

export const config: SubscriberConfig = {
  event: [BatchJobService.Events.CONFIRMED, BatchJobService.Events.FAILED],
  context: {
    subscriberId: "batch-job-subscriber",
  },
};
