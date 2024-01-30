import { SingleOrderDetailsType } from "types/daraz-order-item-response-type";
import { SingleOrderType } from "types/daraz-order-response-type";
import { DraftOrderCreateProps } from "types/draft-order";

export const convertToDraftOrderPayload = (
    orderDetails: SingleOrderDetailsType,
    order: SingleOrderType
  ): DraftOrderCreateProps => {
    return {
      email: `darazguest${Date.now()}@gmail.com`,
      items: [
        {
          quantity: 1,
          variant_id: orderDetails.sku,
          unit_price: Number(order.price) || 0,
        },
      ],
      region_id: "reg_01HN7E0E91CVCZW83G6P41XRFT",
      metadata: {},
      shipping_address: {
        address_1: order.address_shipping.address1,
        city: order.address_shipping.city,
        country_code: "us",
        first_name: order.address_shipping.first_name,
        last_name: order.address_shipping.last_name,
        postal_code: order.address_shipping.post_code,
      },
      shipping_methods: [],
      billing_address: {
        address_1: order.address_shipping.address1,
        city: order.address_shipping.city,
        country_code: "us",
        first_name: order.address_shipping.first_name,
        last_name: order.address_shipping.last_name,
        postal_code: order.address_shipping.post_code,
      },
    };
  };