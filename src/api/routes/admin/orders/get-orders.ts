import { OrderService, DraftOrderService } from "@medusajs/medusa";
import { Request, Response } from "express";
import DarazProductService from "services/daraz-product";

export default async (req: Request, res: Response) => {
    console.log("Pulling orders from Daraz");
  const draftOrderService: DraftOrderService = req.scope.resolve(
    "draftOrderService"
  );
  const darazProductService: DarazProductService = req.scope.resolve(
    "darazProductService"
  );
  const interval = 300000;

  await pullOrdersAndProcess(darazProductService, draftOrderService);

  setInterval(async () => {
    await pullOrdersAndProcess(darazProductService, draftOrderService);
  }, interval);

  res.json({ message: "Order pulling process initiated" });
};

async function pullOrdersAndProcess(
  darazProductService: DarazProductService,
  draftOrderService: DraftOrderService
) {
  try {
    const orders = await darazProductService.pullOrders();
    if (orders && orders.length > 0) {

      // Iterate through the orders and create draft orders
      for (const order of orders) {
        console.log("Processing order:", order);
        const orderData = {
            email: "admin@medusa-test.com",
            items: [
                {
                    quantity: 1,
                    variant_id: order.id
                }
            ],
            region_id: "reg_01HK4RFB4BTZWCGW08P2P457CB",
            shipping_methods: [
                {
                    option_id: "so_01HK4RFB6H1KHYPKK43X2VV7EV"
                }
            ],
            shipping_address: {
                address_1: "daraz address",
                city: "city",
                country_code: "se",
                first_name: "daraz first name",
                last_name: "daraz last name",
                postal_code: "postcode"
            },
            billing_address: {
                address_1: "daraz address",
                city: "city",
                country_code: "se",
                first_name: "daraz first name",
                last_name: "daraz last name",
                postal_code: "postcode"
            },
            customer_id: "cus_01HKZF2YQS3Y3GGSX0CAJRB2RW"
        };

        // Create a draft order
        const draftOrder = await draftOrderService.create(orderData);

        // Perform any additional actions with the created draft order if needed
        console.log("Draft order created:", draftOrder);
      }
    } else {
      console.log("No new orders found.");
    }
  } catch (error) {
    console.error("Error pulling orders from Daraz:", error);
  }
}
