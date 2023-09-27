import { Request, Response } from "express";
import SettingsService from "../../../../services/settings";

export default async (req: Request, res: Response) => {
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
    console.log(error);
    res.status(error.status || Number(error.code) || 500).json({
      error: error,
    });
  }
};
