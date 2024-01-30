import { DraftOrderService, DraftOrder } from "@medusajs/medusa";
import { Request, Response } from "express";
import { MedusaError } from "medusa-core-utils";
import DarazProductService from "../../../../services/daraz-product";
import { EntityManager } from "typeorm";
import { SingleOrderDetailsType } from "../../../../types/daraz-order-item-response-type";
import {
  DarazOrderApiResponse,
  SingleOrderType,
} from "../../../../types/daraz-order-response-type";
import { convertToDraftOrderPayload } from "../../../../utils/convert-to-draft-order-payload";

export default async (req: Request, res: Response) => {
  const draftOrderService: DraftOrderService =
    req.scope.resolve("draftOrderService");
  const darazProductService: DarazProductService = req.scope.resolve(
    "darazProductService"
  );
  // const interval = 300000;

  const createdDraftOrder = await pullOrdersAndProcess(
    req,
    darazProductService,
    draftOrderService
  );

  // setInterval(async () => {
  //   await pullOrdersAndProcess(req, darazProductService, draftOrderService);
  // }, interval);

  res.json({
    message: "Order pulling process initiated",
    createdDraftOrder: createdDraftOrder,
  });
};

async function pullOrdersAndProcess(
  req: Request,
  darazProductService: DarazProductService,
  draftOrderService: DraftOrderService
) {
  try {
    const ordersResponse: DarazOrderApiResponse =
      await darazProductService.pullOrders();
    const orders: SingleOrderType[] = ordersResponse.data.orders;
    if (orders && orders.length > 0) {
      for (const order of orders) {
        const orderDetails: SingleOrderDetailsType =
          await darazProductService.getOrder(order.order_id);
        const draftOrderPayload = convertToDraftOrderPayload(
          orderDetails,
          order
        );
        console.log("draftOrderPayload", draftOrderPayload);
        const manager: EntityManager = req.scope.resolve("manager");
        let draftOrder: DraftOrder = await manager.transaction(
          async (transactionManager) => {
            return await draftOrderService
              .withTransaction(transactionManager)
              .create(draftOrderPayload);
          }
        );

        return draftOrder;
      }
    } else {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No orders found in Daraz`
      );
    }
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      ` ${error} "something went wrong while pulling orders"`
    );
  }
}
