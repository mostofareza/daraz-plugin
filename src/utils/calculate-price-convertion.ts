enum ProfitOperation {
  ADDITION = "addition",
  MULTIPLICATION = "multiplication",
  PERCENT = "percent",
}
interface ProductPriceCalculation {
  mainPrice: number;
  profitOperation?: ProfitOperation;
  profitAmount?: number;
  shippingCharge?: number;
  conversionRate?: number;
}

export const calculateTotalPrice = (
  settings: ProductPriceCalculation
): number => {
  const {
    mainPrice,
    profitOperation = ProfitOperation.ADDITION,
    profitAmount = 0,
    shippingCharge = 0,
    conversionRate = 1,
  } = settings;

  let totalPrice: number = mainPrice;

  if (conversionRate !== 1 && conversionRate > 1) {
    totalPrice *= conversionRate;
  }

  switch (profitOperation) {
    case ProfitOperation.ADDITION:
      totalPrice = totalPrice + profitAmount;
      break;
    case ProfitOperation.MULTIPLICATION:
      totalPrice = totalPrice * profitAmount;
      break;
    case ProfitOperation.PERCENT:
      totalPrice = totalPrice + (totalPrice * profitAmount) / 100;
      break;
    default:
      throw new Error("Invalid profit operation");
  }

  totalPrice += shippingCharge;

  // Round the total price to 2 decimal places
  return Math.round(parseFloat(totalPrice.toFixed(2)));
};