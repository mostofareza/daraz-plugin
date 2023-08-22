import { EntityManager } from "typeorm";
import {
  ProductService,
  BatchJobService,
  AbstractBatchJobStrategy,
  CreateBatchJobInput,
  ProductStatus,
  ProductVariantService,
} from "@medusajs/medusa";
import { ImportProductsManualBatchJob } from "strategies";
import InventoryProductService from "services/inventory-product";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import { IPropType, IPropValueType, ISkuType } from "interfaces/moveon-product";
import ProductRepository from "@medusajs/medusa/dist/repositories/product";

type InjectedDependencies = {
  productRepository: typeof ProductRepository;

  inventoryProductService: InventoryProductService;
  productService: ProductService;
  productVariantService: ProductVariantService;
  batchJobService: BatchJobService;
  manager: EntityManager;
};

class ImportMoveOnInventoryProductsStrategy extends AbstractBatchJobStrategy {
  protected readonly productRepository_: typeof ProductRepository;

  protected readonly batchJobService_: BatchJobService;
  protected readonly productService_: ProductService;
  protected readonly productVariantService_: ProductVariantService;
  protected readonly inventoryProductService_: InventoryProductService;
  public static identifier = "moveOn-inventory-product-import-strategy";
  public static batchType = "moveOn-inventory-product-import";
  protected readonly DEFAULT_LIMIT = 100;
  public defaultMaxRetry = 3;

  constructor({
    productVariantService,
    productRepository,
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
    this.productVariantService_ = productVariantService;

    this.productRepository_ = productRepository;
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

      this.inventoryProductService_.setToken(
        process.env.MOVEON_API_TOKEN || ""
      );
      try {
        for (const product of products) {
          const productDetails =
            await this.inventoryProductService_.getProductDetailsByUrl(
              product.link
            );

          if (productDetails.code === 200) {
            const productData = productDetails.data;
            const options: { index: number; value: string }[] = [];

            const productCreationData: CreateProductInput = {
              title: productData.title,
              status: ProductStatus.DRAFT,
              thumbnail: productData.image,
              images: productData.gallery?.map((g) => g.url) || [],
              options:
                productData.variation.props?.map((x) => {
                  return {
                    title: x.name,
                    metadata: { values: x.values },
                  };
                }) || [],

              variants: productData.variation.skus.map((s, index) => {
                const propsValues = this.getPropsValuesFromSku(
                  s,
                  productData.variation.props || []
                );
                const propsNameStringArray =
                  this.getValueNamesArray(propsValues);
                propsNameStringArray.map((val, index) => {
                  options.push({ index: index, value: val });
                });
                const titleFromPropsNameString =
                  this.getConcatenatedValueNames(propsValues);
                let weight: undefined | number = undefined;
                let weight_type: undefined | number = undefined;

                if (productData.meta.weight) {
                  weight = Number(productData.meta.weight);
                }
                if (productData.meta.weight_type) {
                  weight_type = Number(productData.meta.length);
                }

                console.log(weight, "weight");

                return {
                  title: `${productData.title}-${titleFromPropsNameString}`,
                  sku: String(s.id),
                  inventory_quantity: s.stock.available,
                  allow_backorder: false,
                  manage_inventory: true,
                  weight: weight,
                  origin_country: productData.shop.country_code,
                  prices: [
                    {
                      currency_code:
                        productData.shop.currency_code.toLowerCase(),
                      amount: Math.round(s.price.actual),
                    },
                  ],
                  metadata: {
                    weight_type,
                  },
                };
              }),
              description:
                productData.description !== null
                  ? productData.description
                  : undefined,
              metadata: {
                source: "moveon",
                ...productData.meta,
              },
            };

            try {
              const newProduct = await this.productService_.create(
                productCreationData
              );
              const newProductWithVariant = await this.productService_.retrieve(
                newProduct.id,
                {
                  relations: ["variants", "variants.options"],
                }
              );

              newProductWithVariant.variants.map(async (variant) => {
                await this.productVariantService_.addOptionValue(
                  variant.id,
                  newProduct.options[0].id,
                  options[0].value
                );
              });

              console.log(newProductWithVariant);

              console.log(newProduct.options, "inisde options");

              console.log(newProductWithVariant.variants, "inside variatns");

              console.log(options, "outisde optiosn");
            } catch (error: any) {
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

  // helper method

  private getPropsValuesFromSku(
    sku: ISkuType,
    props: IPropType[]
  ): IPropValueType[] {
    const propIds = sku.props.split(",");

    const propsValues: IPropValueType[] = [];

    for (const propId of propIds) {
      for (const prop of props) {
        const value = prop.values.find((value) => value.id === propId);

        if (value) {
          propsValues.push(value);
          break; // No need to continue searching within other props
        }
      }
    }

    return propsValues;
  }

  private getValueNamesArray(values: IPropValueType[]): string[] {
    return values.map((value) => value.name);
  }

  private getConcatenatedValueNames(values: IPropValueType[]): string {
    const names = values.map((value) => value.name);
    return names.join("-");
  }
}

export default ImportMoveOnInventoryProductsStrategy;
