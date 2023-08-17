import { Product } from "@medusajs/medusa/dist/models";

  export interface IRetriveInventoryProductReturnType {
    products: Product[];
    offset: number;
    limit: number;
    count: number;
  }