import DarazProductService from "services/daraz-product"
import { EntityManager } from "typeorm"


export default async (req: any, res: any) => {
    //extract the filter from the query
    const { filter } = req.query as DarazGetProductsConfig
    const darazProductService: DarazProductService = req.scope.resolve("darazProductService")
    const entityManager: EntityManager = req.scope.resolve("manager")

    const createdProducts = await entityManager.transaction(async (manager) => {
        const products = await darazProductService
            .withTransaction(manager)
            .retrieveAll({filter})

        return products
    })

    res.json({ data: createdProducts })
}

export interface DarazGetProductsConfig {
    filter: string
    limit?: string
    update_before?: string
    update_after?: string
    create_before?: string
    create_after?: string
    options?: string
    sku_seller_list?: string
    offset?: string
}