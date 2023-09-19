import { TransactionBaseService } from "@medusajs/medusa";
import { InventoryProductPriceSettings } from "../models/inventory-product-price-settings";
import { EntityManager, EntityNotFoundError } from "typeorm";
import { isDefined, MedusaError } from "medusa-core-utils";
import { buildQuery } from "@medusajs/medusa";

import {
  PriceSettingCreate,
  PriceSettingList,
} from "interfaces/price-seetings";

type InjectedDependencies = {
  manager: EntityManager;
  priceRoleRepository: typeof InventoryProductPriceSettings;
};

class SettingsService extends TransactionBaseService {
  constructor(container: InjectedDependencies) {
    super(container);
  }

  async list(
    selector = {},
    config: { skip: number; take: number; store_slug?: string } = {
      skip: 0,
      take: 2,
    }
  ): Promise<any> {
    const repository = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );

    const query = buildQuery(selector, config);
    return await repository.findAndCount(query);
  }

  // async list(
  //   selector = {},
  //   config = {
  //     relations: [],
  //     skip: 0,
  //     take: 2,
  //   }
  // ) {
  //   return this.atomicPhase_(async (manager) => {
  //     const repository = manager.getRepository(InventoryProductPriceSettings);
  //     const count = repository.count();
  //     const query = buildQuery(selector, config);
  //     try {
  //       const result = await repository.find(query);
  //       return [result, count];
  //     } catch (error: any) {}
  //   });
  // }

  async create(
    priceSettings: PriceSettingCreate
  ): Promise<InventoryProductPriceSettings> {
    const postRepo = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    try {
      const data = postRepo.create(priceSettings);
      return await postRepo.save(data);
    } catch (error: any) {
      if (error.detail?.includes("already exists")) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          `Duplicate entry for store_slug and currency_code.`,
          "422"
        );
      } else {
        // Handle other errors or rethrow the original error
        this.handleErrorResponse(error);
      }
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

export default SettingsService;
