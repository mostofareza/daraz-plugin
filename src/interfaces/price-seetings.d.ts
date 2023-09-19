export interface PriceSettingCreate {
  store_slug: string;
  currency_code: string;
  conversion_rate: number;
  profit_amount: number;
  shipping_charge: number;
  profit_operation: "addition" | "multiplication" | "percent";
}

export interface PriceSettingList extends PriceSettingCreate {
  id: string;
  created_at: string;
  updated_at: string;
}
