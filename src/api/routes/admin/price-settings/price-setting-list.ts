import { Request, Response } from "express";
import SettingsService from "../../../../services/settings";
import { appConfig } from "../../../../utils/app-config";

export default async (req: Request, res: Response) => {
  const InventorySettings: SettingsService =
    req.scope.resolve("settingsService");

  const { limit, offset, store_slug } = req.query;

  const config: {
    take: number;
    skip: number;
    where?: { store_slug?: string };
  } = {
    take: limit ? Number(limit) : appConfig.limit,
    skip: offset ? Number(offset) : 0,
  };

  if (store_slug && typeof store_slug === "string") {
    config.where = { store_slug };
  }

  try {
    const [response, count] = await InventorySettings.list(config);

    res.status(200).json({
      result: response,
      count,
      limit: config.take,
      offset: config.skip,
      filters: [
        {
          key: "store_slug",
          value: "string",
        },
      ],
      statusCode: 200,
      message: "Retrieve price settings successful",
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error,
    });
  }
};
