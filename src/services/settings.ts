import {
  FindConfig,
  TransactionBaseService,
  errorHandler,
} from "@medusajs/medusa";
import { InventoryProductPriceSettings } from "../models/inventory-product-price-settings";
import { EntityManager, EntityNotFoundError } from "typeorm";
import { isDefined, MedusaError } from "medusa-core-utils";
import { buildQuery } from "@medusajs/medusa";
import {
  PriceSettingCreate,
  PriceSettingUpdate,
} from "interfaces/price-settings";

type InjectedDependencies = {
  manager: EntityManager;
  priceRoleRepository: typeof InventoryProductPriceSettings;
};

class SettingsService extends TransactionBaseService {
  constructor(container: InjectedDependencies) {
    super(container);
  }

  async list(
    config: { skip: number; take: number; where?: { store_slug?: string } } = {
      skip: 0,
      take: 2,
    }
  ): Promise<any> {
    const repository = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    return await repository.findAndCount(config);
  }

  async create(
    priceSettings: PriceSettingCreate
  ): Promise<InventoryProductPriceSettings> {
    const priceSettingsRepository = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    try {
      // @ts-ignore
      const data = priceSettingsRepository.create(priceSettings);
      return await priceSettingsRepository.save(data);
    } catch (error: any) {
      if (error.detail?.includes("already exists")) {
        // throw new MedusaError(
        //   MedusaError.Types.DUPLICATE_ERROR,
        //   `Duplicate entry for store_slug and currency_code.`,
        //   "422"
        // );

        throw { status: 422, message: "Already exists" };
      } else {
        // Handle other errors or rethrow the original error
        this.handleErrorResponse(error);
      }
    }
  }

  async update(priceSettingsUpdate: PriceSettingUpdate): Promise<any | null> {
    const priceSettingsRepository = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    try {
      const existingPriceSettings = await this.retrieve(priceSettingsUpdate.id);

      if (!this.isFalsy(priceSettingsUpdate.conversion_rate)) {
        existingPriceSettings.conversion_rate =
          priceSettingsUpdate.conversion_rate;
      }

      if (!this.isFalsy(priceSettingsUpdate.profit_amount)) {
        existingPriceSettings.profit_amount = priceSettingsUpdate.profit_amount;
      }

      if (!this.isFalsy(priceSettingsUpdate.shipping_charge)) {
        existingPriceSettings.shipping_charge =
          priceSettingsUpdate.shipping_charge;
      }

      if (!this.isFalsy(priceSettingsUpdate.profit_operation)) {
        existingPriceSettings.profit_operation =
          priceSettingsUpdate.profit_operation;
      }

      await priceSettingsRepository.save(existingPriceSettings);

      // Save the updated entity
      return {
        ...priceSettingsUpdate,
      };
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  async delete(id: string): Promise<any | null> {
    const priceSettingsRepository = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    try {
      const existingPriceSettings = await this.retrieve(id);
      await priceSettingsRepository.remove([existingPriceSettings]);
      return {
        id,
      };
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  async retrieve(
    id: string,
    config: FindConfig<{}> = {}
  ): Promise<InventoryProductPriceSettings> {
    if (!isDefined(id)) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"Setting id" must be defined`
      );
    }

    const priceSettingsRepository = this.activeManager_.getRepository(
      InventoryProductPriceSettings
    );
    const query = buildQuery({ id: id }, config);

    const settings = await priceSettingsRepository.find(query);

    if (!settings.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Setting with id: ${id} was not found`,
        "404"
      );
    }

    return settings[0];
  }

  private isFalsy(value: any) {
    if (typeof value === "string") {
      return value.trim() === "";
    }
    return value === null || value === undefined || value === false;
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
