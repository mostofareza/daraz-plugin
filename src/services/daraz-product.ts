import axios from 'axios';
//@ts-nocheck
import { MedusaError,isDefined } from "medusa-core-utils/dist"

import { EntityManager, In } from "typeorm"
// import ProductRepository from "@medusajs/medusa/dist/repositories/product"
import { buildQuery, EventBusService, ProductService, TransactionBaseService } from "@medusajs/medusa"
import ProductRepository from "@medusajs/medusa/dist/repositories/product"
  
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
          const response= await axios.get(`http://localhost:4000/api/daraz/product/handle/${selector.handle}`);
          return response.data;
        } catch (error) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            ` ${error} "productId" must be defined`
          )
        }
      }

      async create(productObject: any): Promise<any> {
        return await this.atomicPhase_(async (manager) => {
            try {
              const response = await axios.post('http://localhost:4000/api/daraz/product/create-product', productObject);
              return response.data;
            } catch (error) {
              throw new MedusaError(
                MedusaError.Types.NOT_FOUND,
                ` ${error} "something went wrong while creating product"`
              )
            } 
            }
        );
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
              const response = await axios.get('http://localhost:4000/api/daraz/order/all');
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
              const response = await axios.delete(`http://localhost:4000/api/daraz/product/${productId}`);
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
  