import { BatchJob } from "@medusajs/medusa"

export type IProduct = {
    vpid: string, 
    link: string
}

export type ImportProductsManualBatchJobContext = {
    products: IProduct[]
}

export type ImportProductsManualBatchJob = BatchJob & {
   context: ImportProductsManualBatchJobContext
}
