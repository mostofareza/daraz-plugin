import { EntityRepository, Repository } from "typeorm";

import { InventoryProductPriceSettings } from "../models/inventory-product-price-settings";

@EntityRepository(InventoryProductPriceSettings)
export class InventoryProductPriceSettingsRepository extends Repository<InventoryProductPriceSettings> {}
