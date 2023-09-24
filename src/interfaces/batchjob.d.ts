import { BatchJob } from "@medusajs/medusa";

export interface IMoveOnInventoryProductUpdate {
  vpid: string;
  link: string;
}

export interface ImportProductsManualBatchJobContext {
  products: IMoveOnInventoryProductUpdate[];
}

export type ImportProductsManualBatchJob = BatchJob & {
  context: ImportProductsManualBatchJobContext;
};
