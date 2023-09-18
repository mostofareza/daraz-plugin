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
import RegionRepository from "@medusajs/medusa/dist/repositories/region";
import CurrencyRepository from "@medusajs/medusa/dist/repositories/currency";
import StoreRepository from "@medusajs/medusa/dist/repositories/store";
import { EntityManager } from "typeorm";
import { InventoryProductPriceSettings } from "../models/inventory-product-price-settings";

class SettingsService extends TransactionBaseService {
  async list(): Promise<InventoryProductPriceSettings[]> {
    const postRepo = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    return await postRepo.find();
  }

  async create(priceSettings: {
    store_slug: string;
    currency_code: string;
    conversion_rate: number;
    profit_amount: number;
    shipping_charge: number;
    profile_operation: "addition" | "multiplication" | "percent";
  }) {
    const postRepo = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    try {
      const data = postRepo.create(priceSettings);
      return await postRepo.save(data);
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  // async getRegions(): Promise<any> {
  //   try {
  //     const regionRepository = this.manager.getRepository(
  //       this.inventoryProductPriceSettingsRepository_
  //     );
  //     return regionRepository.find();
  //   } catch (error) {
  //     console.log(error);
  //     this.handleErrorResponse(error);
  //   }
  // }

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

export default SettingsService;
