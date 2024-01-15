import { OrderService, DraftOrderService, DraftOrder, CartService, defaultAdminDraftOrdersFields, defaultAdminDraftOrdersRelations, defaultAdminDraftOrdersCartRelations, defaultAdminDraftOrdersCartFields } from "@medusajs/medusa";
import { Request, Response } from "express";
import DarazProductService from "services/daraz-product";
import { EntityManager } from "typeorm";
import { DraftOrderCreateProps } from "types/draft-order";

export default async (req: Request, res: Response) => {
  console.log("Pulling orders from Daraz");

  const draftOrderService: DraftOrderService = req.scope.resolve("draftOrderService");
  const darazProductService: DarazProductService = req.scope.resolve("darazProductService");
  const interval = 300000;

  const createdDraftOrder = await pullOrdersAndProcess(req, darazProductService, draftOrderService);

  setInterval(async () => {
    await pullOrdersAndProcess(req, darazProductService, draftOrderService);
  }, interval);

  res.json({ message: "Order pulling process initiated", createdDraftOrder });
};

async function pullOrdersAndProcess(req: Request, darazProductService: DarazProductService, draftOrderService: DraftOrderService) {
  try {
    const orders = await darazProductService.pullOrders();
    
    if (orders && orders.length > 0) {
      // Iterate through the orders and create draft orders
      for (const order of orders) {
        const orderData:DraftOrderCreateProps = {

          email: "admin@medusa-test.com",
          items: [
              {
                  quantity: 1,
                  variant_id: order.id
              }
          ],
          region_id: "reg_01HK4RFB4BTZWCGW08P2P457CB",
          metadata: {
              order_id: order._id,
              sales_channel_id: "sc_daraz",
              sales_channel_name: "Daraz",
          },
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

        const manager: EntityManager = req.scope.resolve("manager");
        let draftOrder: DraftOrder = await manager.transaction(async (transactionManager) => {
          // //check if draft order already exists
          // const existingDraftOrder = await draftOrderService
          //   .withTransaction(transactionManager)
          //   .retrieveByCartId(order.cart_id, {
              
          //   });
          //   console.log("existingDraftOrder", existingDraftOrder);
          
          return await draftOrderService
            .withTransaction(transactionManager)
            .create(orderData);
        });

        draftOrder = await updateDraftOrderDetails(req, draftOrder);

        return draftOrder;
      }
    } else {
      console.log("No new orders found.");
    }
  } catch (error) {
    console.error("Error pulling orders from Daraz:", error);
  }
}

async function updateDraftOrderDetails(req: Request, draftOrder: DraftOrder) {
  const cartService: CartService = req.scope.resolve("cartService");

  draftOrder.cart = await cartService
    .withTransaction(req.scope.resolve("manager"))
    .retrieveWithTotals(draftOrder.cart_id, {
      relations: defaultAdminDraftOrdersCartRelations,
      select: defaultAdminDraftOrdersCartFields,
    });

  return draftOrder;
}
