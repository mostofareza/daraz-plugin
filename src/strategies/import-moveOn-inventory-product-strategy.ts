import { EntityManager } from "typeorm";
import {
  ProductService,
  BatchJobService,
  AbstractBatchJobStrategy,
  CreateBatchJobInput,
  ProductStatus,
  Product,
} from "@medusajs/medusa";
import {
 
  ImportProductsManualBatchJob,
  ImportProductsManualBatchJobContext,
} from "strategies";
import InventoryProductService from "services/inventory-product";
import { title } from "process";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";

type InjectedDependencies = {
  inventoryProductService: InventoryProductService;
  productService: ProductService;
  batchJobService: BatchJobService;
  manager: EntityManager;
};

class ImportMoveOnInventoryProductsStrategy extends AbstractBatchJobStrategy {
  protected readonly batchJobService_: BatchJobService;
  protected readonly productService_: ProductService;
  protected readonly inventoryProductService_: InventoryProductService;
  public static identifier = "moveOn-inventory-product-import-strategy";
  public static batchType = "moveOn-inventory-product-import";
  protected readonly DEFAULT_LIMIT = 100;
  public defaultMaxRetry = 3;

  constructor({
    batchJobService,
    productService,
    inventoryProductService,
    manager,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);

    this.manager_ = manager;
    this.batchJobService_ = batchJobService;
    this.productService_ = productService;
    this.inventoryProductService_ = inventoryProductService;
  }

  async prepareBatchJobForProcessing(
    batchJob: CreateBatchJobInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: Express.Request
  ): Promise<CreateBatchJobInput> {
    return batchJob;
  }

  async preProcessBatchJob(batchJobId: string): Promise<void> {
    return await this.atomicPhase_(async (transactionManager) => {
      const batchServiceTx =
        this.batchJobService_.withTransaction(transactionManager);

      const batchJob = (await batchServiceTx.retrieve(
        batchJobId
      )) as ImportProductsManualBatchJob;

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
      });
    });
  }

  async processJob(batchJobId: string): Promise<void> {
    return await this.atomicPhase_(async (transactionManager) => {
      let batchJob = (await this.batchJobService_
        .withTransaction(transactionManager)
        .retrieve(batchJobId)) as ImportProductsManualBatchJob;

      const products = batchJob.context?.products;

      const productServiceTx =
        this.productService_.withTransaction(transactionManager);

      this.inventoryProductService_.setToken(process.env.MOVEON_API_TOKEN || "");
      try {
        for (const product of products) {
          const productDetails =
            await this.inventoryProductService_.getProductDetailsByUrl(
              product.link
            );

          if (productDetails.code === 200) {
            const productData = productDetails.data;

            const productCreationData:CreateProductInput = {
              title: productData.title,
              status: ProductStatus.DRAFT,
              thumbnail: productData.image,
              images: productData.gallery?.map((g) => g.url) || [],
              options:
                productData.variation.props?.map((x) => {
                  return {
                    title: x.name,
                    metadata: { values:x.values },
                  };
                }) || [],

                
              // variants: productData.variation.skus?.map((s) => {
              //   const propsSplitArray = s.props.split(",");
              //   let propsValue = [];
              //   if (Array.isArray(propsSplitArray)) {
              //     propsSplitArray.map((x) => {
              //       productData.variation.props?.map((prop) => {
              //         const matchPropsValue = prop.values?.find(
              //           (prop) => prop.id === x
              //         );

              //         if (matchPropsValue) {
              //           propsValue.push({
              //             value: matchPropsValue.name,
              //             metadata: { ...matchPropsValue },
              //           });
              //         }
              //       });
              //     });
              //   } else {
              //     propsValue = [];
              //   }

              //   return {
              //     title: "here is title",
              //     options: propsValue,
              //     prices: [{ amount: s.price.actual }],
              //     inventory_quantity: 10,
              //     manage_inventory: true,
              //   };
              // }),
              description:  productData.description !== null ? productData.description : undefined,
              metadata: {
                source: "moveon",
                ...productData.meta,
              },
            };

            try {
              await productServiceTx.create(productCreationData);
            } catch (error:any) {
              console.log(error, "error");

              // console.log(error.parameters[0],"error")

              if (
                error.message.includes(
                  "duplicate key value violates unique constraint"
                )
              ) {
                // await productServiceTx.update(
                //   error.parameters[0],
                //   productCreationData
                // );
              } else {
                // Handle other database-related errors
              }
            }
          }
        }
      } catch (err) {
        console.log(err, "response");
      }
    });
  }

  public async buildTemplate(): Promise<string> {
    return "";
  }
}

export default ImportMoveOnInventoryProductsStrategy;
