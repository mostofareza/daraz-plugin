import axios, { AxiosInstance } from "axios";
import { TransactionBaseService } from "@medusajs/medusa";
import {
  IInventoryProductInternalType,
  IInventoryResponseType,
  IProductDetailsResponse,
  IProductDetailsResponseData,
  IProductQuery,
  IRetrieveInventoryProductQuery,
} from "interfaces/moveon-product";
import { ProductRepository } from "@medusajs/medusa/dist/repositories/product";
import { IRetrieveInventoryProductReturnType } from "interfaces/medusa-product";

class InventoryProductService extends TransactionBaseService {
  protected readonly productRepository_: typeof ProductRepository;
  private apiRequest: AxiosInstance;
  private token: string;

  constructor({ productRepository }: any) {
    super(arguments[0]);
    this.productRepository_ = productRepository;
    this.token = "";
    this.apiRequest = this.initAxiosClient(this.token);
  }

  // Initialize Axios client
  private initAxiosClient(token: string): AxiosInstance {
    return axios.create({
      baseURL: "https://inventory.ali2bd.com/api",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Setter method to set the token and update the Axios client
  setToken(token: string): void {
    this.token = token;
    this.apiRequest = this.initAxiosClient(token);
  }

  /**
   * Get products from moveon based on provided filters.
   * @param {IProductQuery} filters - filters
   * @return {IInventoryProductInternalType} an object containing
   *    products,
   *    filters,
   *    offset,
   *    limit,
   *    count,
   *    error: if any
   */
  async getProducts(
    filters: IProductQuery
  ): Promise<IInventoryProductInternalType> {
    const { limit, offset, attr, ...rest } = filters;
    const page = Math.floor((offset || 0) / (limit || 0)) + 1;
    const per_page = limit || 20;

    const decodedAttr = attr ? decodeURIComponent(attr) : undefined;
    const queryParams: Record<string, any> = { ...rest, page, per_page };
    if (decodedAttr !== undefined) {
      queryParams.attr = decodedAttr;
    }

    try {
      const response = await this.apiRequest.get<IInventoryResponseType>(
        "/v1/products",
        {
          params: queryParams,
        }
      );
      const resData = response.data;
      return {
        products: resData?.data ?? [],
        filters: resData?.filters ?? null,
        offset: Number(offset),
        limit: Number(limit),
        count: resData?.total ? Number(resData.total) : 0,
      };
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  /**
   * Get single product from moveon with matched link.
   * @param url - string
   * @return {IInventoryProductInternalType} an object containing
   *    status,
   *    code,
   *    message,
   *    data,
   *    error: if any
   */
  async getProductDetailsByUrl(url: string): Promise<IProductDetailsResponse> {
    try {
      const response = await this.apiRequest.post<
        string,
        { data: IProductDetailsResponse }
      >("/v1/products/fetch", { url });

      return {
        ...response.data,
      };
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  /**
   * Add product from moveon to medusa.
   * @param product - object
   * @return new product,
   *    error: if any
   */
  async addProduct(product: IProductDetailsResponseData) {
    // @ts-ignore
    const { title, description, vid, image, gallery, profile_id } = product;
    if (!title)
      throw new Error("Adding a product requires a unique handle and a title");
    const productRepository = this.activeManager_.withRepository(
      this.productRepository_
    );
    const createdProduct = productRepository.create({
      title,
      metadata: { source: "moveon" },
    });
    try {
      const newProduct = await productRepository.save(createdProduct);
      return newProduct;
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  /**
   * Get products that has metadata source = moveon.
   * @param filters
   * @return products, offset, limit, count
   *    error: if any
   */
  async getInventoryProduct(
    filters: IRetrieveInventoryProductQuery
  ): Promise<IRetrieveInventoryProductReturnType> {
    const { limit, offset } = filters;

    const currentPage = Math.floor((offset || 0) / (limit || 0)) + 1;
    const productsPerPage = limit || 20;

    const productRepository = this.activeManager_.withRepository(
      this.productRepository_
    );

    try {
      const [products, totalCount] = await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.variants", "variants")
        .leftJoinAndSelect("variants.prices", "prices")
        .leftJoinAndSelect("variants.options", "options")
        .leftJoinAndSelect("product.images", "images")
        .leftJoinAndSelect("product.tags", "tags")
        .leftJoinAndSelect("product.collection", "collection")
        .where(`product.metadata->>'source' = 'moveon'`)
        .skip((currentPage - 1) * productsPerPage) // Calculate how many records to skip
        .take(productsPerPage) // Specify the number of records to take
        .getManyAndCount();

      return {
        products: products,
        offset: Number(offset),
        limit: Number(productsPerPage),
        count: totalCount,
      };
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  // Reusable error handling function
  private handleErrorResponse(error: any): never {
    if (error.response) {
      throw {
        status: error.response.status,
        data: error,
      };
    } else if (error.request) {
      throw {
        status: 500,
        data: error,
      };
    } else {
      throw {
        status: 500,
        data: error,
      };
    }
  }
}

export default InventoryProductService;
