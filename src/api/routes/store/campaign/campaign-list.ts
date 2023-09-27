import { Request, RequestHandler } from "express";
import {
  FilterablePriceListProps,
  FindConfig,
  PriceList,
  PriceListService,
  PriceListStatus,
} from "@medusajs/medusa";

const LIMIT = 100;

const getPriceListService = (req: Request): PriceListService =>
  req.scope.resolve("priceListService");

export const getCampaignListHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { limit, offset } = req.query;
    const config: FindConfig<PriceList> = {
      take: limit ? Number(limit) : LIMIT,
      skip: offset ? Number(offset) : 0,
    };

    const filter: FilterablePriceListProps = {
      status: [PriceListStatus.ACTIVE],
    };

    const priceListService = getPriceListService(req);
    const [priceLists, count] = await priceListService.listAndCount(
      filter,
      config
    );

    res.json({ priceLists, count, offset: config.skip, limit: config.take });
  } catch (error) {
    next(error);
  }
};
