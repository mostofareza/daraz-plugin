import { OrderService, DraftOrderService, DraftOrder, CartService, defaultAdminDraftOrdersFields, defaultAdminDraftOrdersRelations, defaultAdminDraftOrdersCartRelations, defaultAdminDraftOrdersCartFields, Cart, ProductVariantInventoryService } from "@medusajs/medusa";
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

  res.json({ message: "Order pulling process initiated", createdDraftOrder: createdDraftOrder });
};

async function pullOrdersAndProcess(req: Request, darazProductService: DarazProductService, draftOrderService: DraftOrderService) {
  try {
    const orders = await darazProductService.pullOrders();
    
    if (orders && orders.length > 0) {
      // Iterate through the orders and create draft orders
      for (const order of orders) {
        const orderData:DraftOrderCreateProps = {

          email: "reza@gmail.com",
          items: [
              {
                  quantity: 1,
                  variant_id: "variant_01HMDY98QEKTAMG77G9WNV2CV9",
                  unit_price: 30000,
              },
          ],
          region_id: "reg_01HMDY98GXNSTBXMNTS5PMPS9C",
          metadata: {},   
          shipping_address: {
              address_1: "daraz address",
              city: "city",
              country_code: "us",
              first_name: "daraz first name",
              last_name: "daraz last name",
              postal_code: "postcode"
          },
          shipping_methods: [],
          billing_address: {
              address_1: "daraz address",
              city: "city",
              country_code: "us",
              first_name: "daraz first name",
              last_name: "daraz last name",
              postal_code: "postcode"
          },
          customer_id: "cus_01HME1PYVX52RTEEPQQJ599W3V"
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
  const orderService: OrderService = req.scope.resolve("orderService");
  const manager: EntityManager = req.scope.resolve("manager");
  const productVariantInventoryService: ProductVariantInventoryService = req.scope.resolve("productVariantInventoryService");
  const productVariantService = req.scope.resolve("productVariantService");

  draftOrder.cart = await cartService
    .withTransaction(req.scope.resolve("manager"))
    .retrieveWithTotals(draftOrder.cart_id, {
      relations: defaultAdminDraftOrdersCartRelations,
      select: defaultAdminDraftOrdersCartFields,
    });
  // await cartService.setPaymentSession(draftOrder.cart_id, "system")
  await cartService.setPaymentSessions(draftOrder.cart_id)
  await cartService.setPaymentSession(draftOrder.cart_id, "manual")

  const draftOrderCart: Cart = draftOrder.cart;
  draftOrderCart.items[0].variant_id = "variant_01HMDY98QEKTAMG77G9WNV2CV9";
  draftOrderCart.items[0].unit_price = 10000;
  draftOrderCart.items[0].subtotal = 1;
  draftOrderCart.subtotal = 10000;
  await productVariantInventoryService.adjustInventory('variant_01HMDY98QEKTAMG77G9WNV2CV9',  "decrement",1);
  
  const createdOrder = await orderService.createFromCart(draftOrderCart)
  console.log("createdOrder", createdOrder);
  await orderService.withTransaction(manager).capturePayment(createdOrder.id);
  const completedOrder = await orderService.withTransaction(manager).completeOrder(createdOrder.id);

  console.log("completedOrder", completedOrder);
  
  return draftOrder;
}
