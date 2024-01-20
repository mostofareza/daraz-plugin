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
                  variant_id: order.id,
                  unit_price: order.price,
              }
          ],
          region_id: "reg_01HMDY98GXNSTBXMNTS5PMPS9C",
          metadata: {},
          shipping_methods: [],
          shipping_address: {
              address_1: "daraz address",
              city: "city",
              country_code: "us",
              first_name: "daraz first name",
              last_name: "daraz last name",
              postal_code: "postcode"
          },
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
  const ProductVariantInventoryService = req.scope.resolve("productVariantInventoryService");
  const ProductVariantService = req.scope.resolve("productVariantService");

  draftOrder.cart = await cartService
    .withTransaction(req.scope.resolve("manager"))
    .retrieveWithTotals(draftOrder.cart_id, {
      relations: defaultAdminDraftOrdersCartRelations,
      select: defaultAdminDraftOrdersCartFields,
    });
  console.log("draftOrder.cart", draftOrder.cart);
  draftOrder.cart.items[0].variant_id = "variant_01HMDY98QEKTAMG77G9WNV2CV9";
  draftOrder.cart.items[0].unit_price = 1000;
  draftOrder.cart.items[0].subtotal = 1;
  draftOrder.cart.subtotal = 1000;
  // draftOrder.cart.items = await Promise.all(
  //   draftOrder.cart.items.map(async (item) => {
  //     const variant = await ProductVariantService.retrieve(item.variant_id, {
  //       relations: ["product"],
  //     });
  //     const inventory = await ProductVariantInventoryService.retrieve(
  //       item.variant_id
  //     );
  //     return {
  //       ...item,
  //       variant,
  //       inventory_quantity: inventory.inventory_quantity,
  //     };
  //   })
  // );
  const createdOrder = await orderService.createFromCart(draftOrder.cart)
  console.log("createdOrder", createdOrder);
  // const completedOrder= await orderService.completeOrder(draftOrder.id)
  // console.log("completedOrder", completedOrder);
  
  return draftOrder;
}
