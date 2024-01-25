import axios from 'axios';
//@ts-nocheck
import { MedusaError, isDefined } from "medusa-core-utils/dist"
import xml2js from "xml2js"

import { EntityManager, In } from "typeorm"
import { buildQuery, EventBusService, FindConfig, Product, ProductService, TransactionBaseService } from "@medusajs/medusa"
import ProductRepository from "@medusajs/medusa/dist/repositories/product"
import { darazProductData } from '../types/daraz-product-type';
import { DarazGetProductsConfig } from 'api/routes/admin/products/get-daraz-products';

type InjectedDependencies = {
  manager: EntityManager
  productRepository: typeof ProductRepository
  eventBusService: EventBusService
}

class DarazProductService extends TransactionBaseService {
  protected readonly productRepository_: typeof ProductRepository
  // eslint-disable-next-line max-len
  protected readonly eventBus_: EventBusService

  static readonly IndexName = `products`
  static readonly Events = {
    UPDATED: "product.updated",
    CREATED: "product.created",
    DELETED: "product.deleted",
  }

  constructor({
    productRepository,
    eventBusService,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.productRepository_ = productRepository
    this.eventBus_ = eventBusService
  }


  async retrieve(
    productId: string,
  ): Promise<any> {
    if (!isDefined(productId)) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"productId" must be defined`
      )
    }

    return await this.retrieve_({ handle: productId })
  }

  /* --------- retrieve_ -------------- */
  async retrieve_(
    selector: any
  ): Promise<any> {
    try {
      const response = await axios.get(`${process.env.DARAZ_SERVER_URL}/product/handle/${selector.handle}`);
      return response.data;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        ` ${error} "productId" must be defined`
      )
    }
  }

  /* ---------- retrieve all ---------------- */
  async retrieveAll(
    selector: DarazGetProductsConfig
  ): Promise<any> {
    try {
      const response = await axios.get(`${process.env.DARAZ_SERVER_URL}/products/get`, {});
      return response.data;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        ` ${error} "productId" must be defined`
      )
    }
  }

  async create(productObject: Product): Promise<any> {
    const xmlBuilder = new xml2js.Builder();
    const xmlPayload = xmlBuilder.buildObject(xmlProduct);
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.post(`${process.env.DARAZ_SERVER_URL}/product/create?status=1`, xmlPayload, {
          headers: {
            'Content-Type': 'application/xml',
          },
        });

        return response.data;
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `${error} "something went wrong while creating product"`
        );
      }
    });
  }

  /* Place order */
  async placeOrder(orderObject: any): Promise<any> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.post('http://localhost:4000/api/daraz/place-order', orderObject);
        return response.data;
      } catch (error) {
        console.error('Error sending product to Daraz API:');
        throw error;
      }
    }
    );
  }

  /* Pull orders */
  async pullOrders(): Promise<any> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.get(`${process.env.DARAZ_SERVER_URL}/order/all`);
        return response.data;
      } catch (error) {
        console.error('Error sending product to Daraz API:');
        throw error;
      }
    }
    );
  }
  /* delete product */
  async delete(productId: string): Promise<any> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.delete(`${process.env.DARAZ_SERVER_URL}/product/${productId}`);
        return response.data;
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          ` ${error} "something went wrong while deleting product"`
        )
      }
    }
    );
  }

  /* remove product */
  async remove(): Promise<any> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const response = await axios.delete(`${process.env.DARAZ_SERVER_URL}/product/remove`);
        return response.data;
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          ` ${error} "something went wrong while deleting product"`
        )
      }
    }
    );
  }
}

export default DarazProductService


const xmlProduct = `<?xml version="1.0" encoding="UTF-8"?>
<Request>
    <Product>
        <PrimaryCategory>6614</PrimaryCategory>
        <SPUId/>
        <AssociatedSku/>
        <Images>
            <Image>https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png</Image>
        </Images>
        <Attributes>
            <name>Medusa T-Shirt</name>
            <short_description>Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.</short_description>
            <brand>Remark</brand>
            <model>asdf</model>
            <kid_years>Kids (6-10yrs)</kid_years>
            <delivery_option_sof>Yes</delivery_option_sof>
        </Attributes>
        <Skus>
            <Sku>
                <SellerSku>variant_01HMDY98QEKTAMG77G9WNV2CV9</SellerSku>
                <color_family>Black</color_family>
                <size>S</size>
                <quantity>108</quantity>
                <price>19.50</price>
                <package_length>11</package_length>
                <package_height>22</package_height>
                <package_weight>400</package_weight>
                <package_width>44</package_width>
                <package_content>This is what's in the box</package_content>
                <Images>
                    <!-- Add additional image URLs from your JSON data here -->
                    <Image>https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png</Image>
                </Images>
            </Sku>
        </Skus>
    </Product>
</Request>
`