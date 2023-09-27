import { Request, Response } from "express";
import SettingsService from "../../../../services/settings";

export default async (req: Request, res: Response) => {
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
