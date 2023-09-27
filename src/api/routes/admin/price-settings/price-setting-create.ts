import { Request, Response } from "express";
import SettingsService from "../../../../services/settings";

export default async (req: Request, res: Response) => {
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
