import { Product } from "@medusajs/medusa/dist/models";

  export interface IRetrieveInventoryProductReturnType {
    products: Product[];
    offset: number;
    limit: number;
    count: number;
  }