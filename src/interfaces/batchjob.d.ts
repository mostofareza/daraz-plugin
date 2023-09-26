import { BatchJob } from "@medusajs/medusa";

export interface ImportProductsManualBatchJobContext {
  products: IMoveOnInventoryProductUpdate[];
}

export type ImportProductsManualBatchJob = BatchJob & {
  context: ImportProductsManualBatchJobContext;
};


export interface IMoveOnInventoryProductUpdate {
  vpid: string;
  link: string;
  title: string;
  image: string;
}

export interface IProcessImportProductData extends IMoveOnInventoryProductUpdate {
  message?: string;
}