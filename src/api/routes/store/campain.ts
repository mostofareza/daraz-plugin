// priceListRoutes.ts

import { Request, Response, Router } from "express";
import {
  FilterablePriceListProps,
  FindConfig,
  PriceList,
  PriceListService,
  PriceListStatus,
} from "@medusajs/medusa";

export async function getCampaignListHandler(req: Request, res: Response) {
  const priceListService: PriceListService =
    req.scope.resolve("priceListService");

  const { limit, offset } = req.query;
  const config: FindConfig<PriceList> = {
    take: limit ? Number(limit) : 100,
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
    offset: 0,
    limit: 100,
  });
}
