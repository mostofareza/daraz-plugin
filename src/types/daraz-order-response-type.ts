type Address = {
  country: string;
  address3: string;
  phone: string;
  address2: string;
  city: string;
  address1: string;
  post_code: string;
  phone2: string;
  last_name: string;
  address4?: string;
  address5?: string;
  first_name: string;
};

export type SingleOrderType = {
  voucher_platform: string;
  voucher: string;
  warehouse_code: string;
  voucher_seller: string;
  order_number: string;
  created_at: string;
  voucher_code: string;
  gift_option: string;
  shipping_fee_discount_platform: string;
  customer_last_name: string;
  promised_shipping_times: string;
  updated_at: string;
  price: string;
  shipping_fee_original: string;
  payment_method: string;
  address_updated_at: string | null;
  customer_first_name: string;
  shipping_fee_discount_seller: string;
  shipping_fee: string;
  national_registration_number1: string;
  branch_number: string;
  tax_code: string;
  items_count: string;
  delivery_info: string;
  statuses: string[];
  address_billing: Address;
  extra_attributes: string | null;
  order_id: string;
  gift_message: string;
  remarks: string;
  address_shipping: Address;
};

export type DarazOrdersResponseArray = {
  count: string;
  orders: SingleOrderType[];
};

export type DarazOrderApiResponse = {
  code: string;
  data: DarazOrdersResponseArray;
  request_id: string;
};
