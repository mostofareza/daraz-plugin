export enum ProfitOperation {
  ADDITION = "addition",
  MULTIPLICATION = "multiplication",
  PERCENT = "percent",
}

export interface PriceSettingCreate {
  store_slug: string;
  currency_code: string;
  conversion_rate: number;
  profit_amount: number;
  shipping_charge: number;
  profit_operation: ProfitOperation;
}

export interface PriceSettingUpdate {
  id: string;
  conversion_rate: number;
  profit_amount: number;
  shipping_charge: number;
  profit_operation: ProfitOperation;
}

export interface PriceSettingList extends PriceSettingCreate {
  id: string;
  created_at: string;
  updated_at: string;
}
