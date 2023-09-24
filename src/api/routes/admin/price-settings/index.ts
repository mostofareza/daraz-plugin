import { Request, Response } from "express";
import SettingsService from "../../../../services/settings";
import { appConfig } from "../../../../utils/app-config";

export const getPriceSettingsListHandler = async (
  req: Request,
  res: Response
) => {
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

export const createPriceSettingsHandler = async (
  req: Request,
  res: Response
) => {
  const InventorySettings: SettingsService =
    req.scope.resolve("settingsService");
  const data = req.body;

  try {
    const response = await InventorySettings.create(data);
    res.status(200).json({
      result: response,
      statusCode: 200,
      message: "successfully created",
    });
  } catch (error: any) {
    res.status(error.status || Number(error.code) || 500).json({
      error: error,
    });
  }
};

export const updatePriceSettingsHandler = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;
  const updatedData = req.body;

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
  const InventorySettings: SettingsService =
    req.scope.resolve("settingsService");

  try {
    const response = await InventorySettings.update({ id, ...updatedData });
    res.status(200).json({
      result: response,
      statusCode: 200,
      message: "successfully updated",
    });
  } catch (error: any) {
    res.status(error.status || Number(error.code) || 500).json({
      error: error,
    });
  }
};

export const deletePriceSettingsHandler = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;

  const InventorySettings: SettingsService =
    req.scope.resolve("settingsService");

  try {
    const response = await InventorySettings.delete(id);
    res.status(200).json({
      result: response,
      statusCode: 200,
      message: "successfully deleted",
    });
  } catch (error: any) {
    res.status(error.status || Number(error.code) || 500).json({
      error: error,
    });
  }
};
