import { Request, Response } from "express";
import BatchJobExtendedService from "services/batch-job-extended";

export default async (req: Request, res: Response) => {
  const batchJobExtendedService: BatchJobExtendedService = req.scope.resolve(
    "batchJobExtendedService"
  );

  try {
    const response = await batchJobExtendedService.deleteAll();
    res.status(200).json({
      result: response,
      statusCode: 200,
      message: "successfully deleted all batch jobs",
    });
  } catch (error: any) {
    res.status(error.status || Number(error.code) || 500).json({
      error: error,
    });
  }
};