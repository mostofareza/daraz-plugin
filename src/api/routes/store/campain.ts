import { Request, Response, Router } from "express";
import {
  FilterablePriceListProps,
  FindConfig,
  PriceList,
  PriceListService,
  PriceListStatus,
  Product,
} from "@medusajs/medusa";
import { FilterableProductProps } from "@medusajs/medusa/dist/types/product";

const LIMIT = 100;
export async function getCampaignListHandler(req: Request, res: Response) {
  const priceListService: PriceListService =
    req.scope.resolve("priceListService");

  const { limit, offset } = req.query;
  const config: FindConfig<PriceList> = {
    take: limit ? Number(limit) : LIMIT,
    skip: offset ? Number(offset) : 0,
  };

  const filter: FilterablePriceListProps = {
    status: [PriceListStatus.ACTIVE],
  };

  const [price_lists, count] = await priceListService.listAndCount(
    filter,
    config
  );
  res.json({
    price_lists,
    count,
    offset: config.skip,
    limit: config.take,
  });
}

export async function getCampaignProductsHandler(req: Request, res: Response) {
  const id = req.params.id;
  const { limit, offset, orderBy, q } = req.query;

  if (!id) {
    return res.status(422).json({
      error: [
        {
          key: "id",
          message: "id is required and must be a string",
        },
      ],
    });
  }

  const searchText = q as string;

  const priceListService: PriceListService =
    req.scope.resolve("priceListService");

  const filterableFields: FilterableProductProps = {
    price_list_id: [id],
  };
  if (searchText && searchText.trim()) {
    filterableFields.q = searchText;
  }

  const config: FindConfig<Product> = {
    take: limit ? Number(limit) : LIMIT,
    skip: offset ? Number(offset) : 0,
    relations: ["variants", "images", "tags", "collection", "options"],
    order:
      orderBy && (orderBy === "ASC" || orderBy === "DESC")
        ? { created_at: orderBy }
        : { created_at: "ASC" },
  };

  const [products, count] = await priceListService.listProducts(
    id,
    filterableFields,
    config
  );

  res.json({
    products,
    count,
    offset: config.skip,
    limit: config.take,
    filters: [
      {
        key: "orderBy",
        value: ["ASC", "DESC"],
      },
      {
        key: "q",
        value: "string",
      },
    ],
  });
}
