import { EntityManager } from "typeorm";
import {
  ProductService,
  BatchJobService,
  AbstractBatchJobStrategy,
  CreateBatchJobInput,
  ProductStatus,
  ProductVariantService,
  StoreService,
} from "@medusajs/medusa";
import InventoryProductService from "../services/inventory-product";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import { IProductDetailsResponseData, IPropType, IPropValueType, ISkuType } from "interfaces/moveon-product";
import ProductRepository from "@medusajs/medusa/dist/repositories/product";
import { MedusaError } from "medusa-core-utils";
import { calculateTotalPrice } from "../utils/calculate-price-convertion";
import { InventoryProductPriceSettings } from "../models/inventory-product-price-settings";
import { IProcessImportProductData, ImportProductsManualBatchJob } from "../interfaces/batchjob";

type InjectedDependencies = {
  productRepository: typeof ProductRepository;
  inventoryProductService: InventoryProductService;
  productService: ProductService;
  productVariantService: ProductVariantService;
  batchJobService: BatchJobService;
  storeService: StoreService;
  manager: EntityManager;
};

class ImportMoveOnInventoryProductsStrategy extends AbstractBatchJobStrategy {
  protected readonly productRepository_: typeof ProductRepository;
  protected readonly storeService_: StoreService;
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
    storeService,
    manager,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);
    this.manager_ = manager;
    this.batchJobService_ = batchJobService;
    this.productService_ = productService;
    this.inventoryProductService_ = inventoryProductService;
    this.productVariantService_ = productVariantService;
    this.storeService_ = storeService;
    this.productRepository_ = productRepository;
  }

   /**
   * Create a description of a row on which the error occurred and throw a Medusa error.
   *
   * @param row - Parsed CSV row data
   * @param errorDescription - Concrete error
   */
  protected static throwDescriptiveError(
    failedProductImports: IProcessImportProductData[] = [],
  ): never {
    const errorMessages = failedProductImports.map((product) => `${product.title}\n${product.link}\n${product.message}`);
    const message = `${errorMessages}`;
    
    throw new MedusaError(MedusaError.Types.INVALID_DATA, message);
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
      const batchServiceTx =
        this.batchJobService_.withTransaction(transactionManager);
        
      const batchJob = (await batchServiceTx
        .retrieve(batchJobId)) as ImportProductsManualBatchJob;

      const products = batchJob.context?.products;
      const store_slug = batchJob.context?.store_slug as string;

      let failedProductImports: IProcessImportProductData[] = [];

      if (!store_slug) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Store slug not found`,
          "404"
        );
      } else {
        const storeService =
          this.storeService_.withTransaction(transactionManager);
        const priceSettingRepo = this.manager_.getRepository(
          InventoryProductPriceSettings
        );
        const priceSettingByStore = await priceSettingRepo.findBy({
          store_slug: store_slug,
        });

        const store = await storeService.retrieve({});

        if (priceSettingByStore.length <= 0) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `Price role settings with store: ${store_slug} not found`,
            "404"
          );
        }
        this.inventoryProductService_.setToken(
          process.env.MOVEON_API_TOKEN || ""
        );
        try {
          for (const product of products) {
            const productDetails =
              await this.inventoryProductService_.getProductDetailsByUrl(
                product.link
              );
            
            if(productDetails.code!==200){
              failedProductImports.push({...product, message: "Product not found"})
            }

            if (productDetails.code === 200) {
              const productData = productDetails.data;
              const optionsValues: string[][] = [];

              const productCreationData: CreateProductInput = {
                title: productData.title,
                status: ProductStatus.PUBLISHED,
                sales_channels: store.default_sales_channel_id
                  ? [{ id: store.default_sales_channel_id }]
                  : null,
                thumbnail: productData.image,
                images: productData.gallery?.map((g) => g.url) || [],
                options:
                  productData.variation.props?.map((x) => {
                    return {
                      title: x.name,
                      metadata: { values: x.values },
                    };
                  }) || [],

                variants: productData.variation.skus.map((s) => {
                  const propsValues = this.getPropsValuesFromSku(
                    s,
                    productData.variation.props || []
                  );
                  const propsNameStringArray =
                    this.getValueNamesArray(propsValues);

                  optionsValues.push(propsNameStringArray);
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

                  return {
                    title: `${productData.title}-${titleFromPropsNameString}`,
                    sku: String(s.id),
                    inventory_quantity: s.stock.available,
                    allow_backorder: false,
                    manage_inventory: true,
                    weight: weight ? Math.round(weight * 1000) : undefined,
                    origin_country: productData.shop.country_code,
                    prices: priceSettingByStore.map((x) => {
                      const mainPrice = Number(s.price.actual);
                      const shippingCharge = x.shipping_charge
                        ? Number(x.shipping_charge)
                        : undefined;
                      const conversionRate = x.conversion_rate
                        ? Number(x.conversion_rate)
                        : undefined;
                      const profitAmount = x.profit_amount
                        ? Number(x.profit_amount)
                        : undefined;
                      const profitOperation = x.profit_operation;

                      return {
                        currency_code: x.currency_code,
                        amount: calculateTotalPrice({
                          mainPrice,
                          shippingCharge,
                          conversionRate,
                          profitAmount,
                          profitOperation,
                        }),
                      };
                    }),
                    metadata: {
                      weight_type,
                      original_options: propsNameStringArray.map(
                        (value) => value
                      ),
                    },
                  };
                }),
                description:
                  productData.description !== null
                    ? productData.description
                    : undefined,
                metadata: {
                  source: "moveon",
                  pdId: productData.id,
                  ...productData.meta,
                },
              };

              try {
                const newProduct = await this.productService_.create(
                  productCreationData
                );
                const newProductWithVariant =
                  await this.productService_.retrieve(newProduct.id, {
                    relations: ["variants", "variants.options"],
                  });

                newProductWithVariant.variants.map(async (variant, index) => {
                  optionsValues[index].forEach(
                    async (option, optionValueIndex) => {
                      await this.productVariantService_.addOptionValue(
                        variant.id,
                        newProduct.options[optionValueIndex].id,
                        option
                      );
                    }
                  );
                });
              } catch (error: any) {
                failedProductImports.push({...product, message: "Product already exist"})
                console.log(error);
                if (
                  error.message.includes(
                    "duplicate key value violates unique constraint"
                  )
                ) {
                  ImportMoveOnInventoryProductsStrategy.throwDescriptiveError(failedProductImports)
                } else {
                  throw new MedusaError(
                    MedusaError.Types.NOT_FOUND,
                    `Product not found`,
                    "404"
                  );
                }
              }
            }
          }
        } catch (err: any) {
          console.log(err);
          ImportMoveOnInventoryProductsStrategy.throwDescriptiveError(failedProductImports)
        }
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
