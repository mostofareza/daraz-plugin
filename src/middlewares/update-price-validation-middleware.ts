import { NextFunction, Request, Response } from "express";
import { UpdatePriceSettingsValidation } from "../utils/price-settings-validation";
import { ValidationError, validate } from "class-validator";
import { MedusaError } from "medusa-core-utils";

export async function UpdatePriceSettingValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const createDto = new UpdatePriceSettingsValidation();
    Object.assign(createDto, req.body);

    const errors: ValidationError[] = await validate(createDto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return {
          key: error.property,
          message:
            error.constraints?.[Object.keys(error.constraints)[0]] ||
            "Unknown error",
        };
      });
      return res.status(422).json({
        error: {
          status: 422,
          data: { errors: errorMessages, type: MedusaError.Types.INVALID_DATA },
        },
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
