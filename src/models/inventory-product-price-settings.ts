import { BaseEntity, generateEntityId } from "@medusajs/medusa";
import { BeforeInsert, Column, Entity, Index, Unique } from "typeorm";

@Entity()
@Unique(["store_slug", "currency_code"]) // This enforces uniqueness for storeSlug and currencyCode pairs
export class InventoryProductPriceSettings extends BaseEntity {
  @Column({ type: "varchar", length: 4, nullable: true })
  store_slug: string | undefined;

  @Column({ type: "varchar", length: 4, nullable: true })
  currency_code: string | undefined;

  @Column({ type: "float", nullable: true })
  conversion_rate: number | undefined;

  @Column({ type: "float" })
  profit_amount: number | undefined;

  @Column({ type: "float" })
  shipping_charge: number | undefined;

  @Column({ type: "enum", enum: ["addition", "multiplication", "percent"] })
  profile_operation: string | undefined;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "inventoryProductPriceSettings");
  }
}

/**
 * @schema inventory-product-price-settings
 * title: " inventory-product-price-settings  repository "
 * description: "this is inventory product repository"
 * x-resourceId: price settings
 * properties:
 *   storeSlug:
 *     description: "The store slug like 1688 or aliexpress or others. must be lowercase and be unique"
 *     `prev_`."
 *     type: string
 *   currencyCode:
 *     description: "The id of the Product that the Review is related to."
 *     type: string
 *   conversionRate:
 *     description: "The rating value of customer that has given a review (1 - 5)."
 *     type: integer
 *   profitAmount:
 *     description: "The rating body text of customer that has given a review."
 *     type: string
 *   profileOperation:
 *     description: "The email of customer that has given a review."
 *     type: string
 *   created_at:
 *     description: "The date with timezone at which the resource was created."
 *     type: string
 *     format: date-time
 *   updated_at:
 *     description: "The date with timezone at which the resource was last updated."
 *     type: string
 *     format: date-time
 */
