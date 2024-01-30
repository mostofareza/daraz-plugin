import axios from "axios";
//@ts-nocheck
import { MedusaError, isDefined } from "medusa-core-utils/dist";

import { EntityManager, In } from "typeorm";
import {
  EventBusService,
  Product,
  TransactionBaseService,
} from "@medusajs/medusa";
import ProductRepository from "@medusajs/medusa/dist/repositories/product";
import { DarazGetProductsConfig } from "api/routes/admin/products/get-daraz-products";
import { convertToXml } from "utils/convert-to-xml";

type InjectedDependencies = {
  manager: EntityManager;
  productRepository: typeof ProductRepository;
  eventBusService: EventBusService;
};

class DarazProductService extends TransactionBaseService {
  protected readonly productRepository_: typeof ProductRepository;
  // eslint-disable-next-line max-len
  protected readonly eventBus_: EventBusService;

  static readonly IndexName = `products`;
  static readonly Events = {
    UPDATED: "product.updated",
    CREATED: "product.created",
    DELETED: "product.deleted",
  };

  constructor({ productRepository, eventBusService }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);
    this.productRepository_ = productRepository;
    this.eventBus_ = eventBusService;
  }

  async retrieve(productId: string): Promise<any> {
    if (!isDefined(productId)) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"productId" must be defined`
      );
    }

    return await this.retrieve_({ handle: productId });
  }

  /* --------- retrieve_ -------------- */
  async retrieve_(selector: any): Promise<any> {
    try {
      const response = await axios.get(
        `${process.env.DARAZ_SERVER_URL}/product/handle/${selector.handle}`
      );
      return response.data;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        ` ${error} "productId" must be defined`
      );
    }
  }

  /* ---------- retrieve all ---------------- */
  async retrieveAll(selector: DarazGetProductsConfig): Promise<any> {
    try {
      const response = await axios.get(
        `${process.env.DARAZ_SERVER_URL}/products/get`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        ` ${error} "productId" must be defined`
      );
    }
  }

  async create(productObject: Product): Promise<any> {
    const reformedToXmlProduct = convertToXml(productObject);
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.post(
          `${process.env.DARAZ_SERVER_URL}/product/create?status=200`,
          reformedToXmlProduct,
          {
            headers: {
              "Content-Type": "application/xml",
            },
          }
        );

        return response.data;
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `${error} "something went wrong while creating product"`
        );
      }
    });
  }

  /* Pull orders */
  async pullOrders(): Promise<any> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.get(
          `${process.env.DARAZ_SERVER_URL}/orders/get`
        );
        return response.data;
      } catch (error) {
        console.error("Error sending product to Daraz API:");
        throw error;
      }
    });
  }
  /* get single order item */
  async getOrder(orderId: string): Promise<any> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.get(
          `${process.env.DARAZ_SERVER_URL}/order/items/get?order_id=${orderId}`
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    });
  }

  /* remove product */
  async remove(productId: string): Promise<any> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.delete(
          `${process.env.DARAZ_SERVER_URL}/product/remove?product_id=${productId}`
        );
        return response.data;
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          ` ${error} "something went wrong while deleting product"`
        );
      }
    });
  }
}

export default DarazProductService;
