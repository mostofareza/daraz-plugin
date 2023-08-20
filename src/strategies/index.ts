import { BatchJob } from "@medusajs/medusa"

export type IProduct = {
    title: string
}

export type ImportProductsManualBatchJobContext = {
    products: IProduct[]
}

export type ImportProductsManualBatchJob = BatchJob & {
   context: ImportProductsManualBatchJobContext
}
