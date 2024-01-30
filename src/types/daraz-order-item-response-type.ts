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
  
  export type SingleOrderDetailsType = {
    tax_amount: string;
    reason: string;
    sla_time_stamp: string;
    purchase_order_id: string;
    voucher_seller: string;
    voucher_code_seller: string;
    voucher_code: string;
    package_id: string;
    buyer_id: string;
    variation: string;
    voucher_code_platform: string;
    purchase_order_number: string;
    sku: string;
    order_type: string;
    invoice_number: string;
    cancel_return_initiator: string;
    shop_sku: string;
    is_reroute: string;
    stage_pay_status: string;
    tracking_code_pre: string;
    order_item_id: string;
    shop_id: string;
    order_flag: string;
    is_fbl: string;
    name: string;
    delivery_option_sof: string;
    order_id: string;
    status: string;
    paid_price: string;
    product_main_image: string;
    voucher_platform: string;
    product_detail_url: string;
    warehouse_code: string;
    promised_shipping_time: string;
    shipping_type: string;
    created_at: string;
    voucher_seller_lpi: string;
    shipping_fee_discount_platform: string;
    wallet_credits: string;
    updated_at: string;
    currency: string;
    shipping_provider_type: string;
    voucher_platform_lpi: string;
    shipping_fee_original: string;
    is_digital: string;
    item_price: string;
    shipping_service_cost: string;
    tracking_code: string;
    shipping_fee_discount_seller: string;
    reason_detail: string;
    shipping_amount: string;
    return_status: string;
    shipment_provider: string;
    voucher_amount: string;
    extra_attributes: string;
    digital_delivery_info: string;
  };
  
  type ResponseData = {
    code: string;
    data: SingleOrderDetailsType[];
    request_id: string;
  };
  
  export type OrderItemApiResponse = {
    code: string;
    data: ResponseData;
    request_id: string;
  };
  