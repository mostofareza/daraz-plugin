// UpdateInventoryProductPriceSettingsDto.ts
import {
  IsOptional,
  IsNumber,
  IsEnum,
  Validate,
  IsString,
  IsObject,
  Contains,
} from "class-validator";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

enum ProfitOperation {
  ADDITION = "addition",
  MULTIPLICATION = "multiplication",
  PERCENT = "percent",
}

// number validator
@ValidatorConstraint({ name: "message", async: false })
export class CustomIsNumber implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== "number") {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a number`;
  }
}

// enum validator
@ValidatorConstraint({ name: "message", async: false })
export class CustomEnumValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const enumValues = args.constraints[0]; // Get the allowed enum values from the constraint
    return enumValues.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    const enumValues = args.constraints[0]; // Get the allowed enum values from the constraint
    return `${args.property} must be one of [${enumValues.join(", ")}]`;
  }
}

export class UpdatePriceSettingsValidation {
  @IsOptional()
  @IsNumber()
  conversion_rate?: number;

  @IsOptional()
  @Validate(CustomIsNumber)
  profit_amount?: number;

  @IsOptional()
  @Validate(CustomIsNumber)
  shipping_charge?: number;

  @IsOptional()
  @Validate(CustomEnumValidator, [Object.values(ProfitOperation)])
  profit_operation?: ProfitOperation;
}

export class CreatePriceSettingsValidation {
  @IsNumber()
  conversion_rate?: number;

  @Validate(CustomIsNumber)
  profit_amount?: number;

  @Validate(CustomIsNumber)
  shipping_charge?: number;

  @Validate(CustomEnumValidator, [Object.values(ProfitOperation)])
  profit_operation?: ProfitOperation;

  @IsString({ message: "Store slug must be a string" })
  store_slug?: string;

  @IsString({ message: "Currency code  must be a string" })
  currency_code?: string;
}
