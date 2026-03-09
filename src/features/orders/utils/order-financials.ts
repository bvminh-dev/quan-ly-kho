import type { OrderDetail } from "@/types/api";

export function computeOrderFinancials(order: OrderDetail) {
  const lowerState = order.state?.toLowerCase();
  const exchangeRate = order.exchangeRate ?? 1;

  let subtotalUSD = 0;
  let discountUSD = 0;

  for (const product of order.products ?? []) {
    const qtySet = product.quantitySet ?? 0;
    const hasSetMeta =
      Boolean(product.nameSet?.trim()) ||
      (product.priceSet ?? 0) > 0 ||
      (product.saleSet ?? 0) > 0;
    const isSet = qtySet > 0 && (hasSetMeta || product.items.length > 1);
    const setQty = isSet ? Math.max(qtySet, 0) : 1;
    const isCalcSet = Boolean(
      isSet && ((product.priceSet ?? 0) > 0 || product.isCalcSet),
    );

    let itemsTotalUSD = 0;
    let itemsDiscountUSD = 0;
    for (const item of product.items) {
      const qty = (item.quantity ?? 0) * setQty;
      itemsTotalUSD += (item.price ?? 0) * qty;
      itemsDiscountUSD += (item.sale ?? 0) * qty;
    }

    subtotalUSD += isCalcSet ? (product.priceSet ?? 0) * setQty : itemsTotalUSD;
    discountUSD += isCalcSet
      ? (product.saleSet ?? 0) * setQty
      : itemsDiscountUSD;
  }

  const baseTotalUSD = subtotalUSD - discountUSD;
  const debtUSD = order.debt ?? 0;
  const totalUSD = baseTotalUSD + debtUSD;
  const totalNGN = totalUSD * exchangeRate;

  let paidUSD = 0;
  let paidNGN = 0;

  if (lowerState === "báo giá") {
    paidUSD = order.paid ?? 0;
    paidNGN = paidUSD * exchangeRate;
  } else {
    // Tính từ history: sum('khách trả') - sum('hoàn tiền')
    for (const h of order.history ?? []) {
      const isRefund = h.type?.toLowerCase() === "hoàn tiền";
      const sign = isRefund ? -1 : 1;
      paidUSD += sign * (h.moneyPaidDolar ?? 0);
      paidNGN += sign * (h.moneyPaidNGN ?? 0);
    }
  }

  const remainingUSD = totalUSD - paidUSD;
  const remainingNGN = remainingUSD * exchangeRate;

  return { totalUSD, totalNGN, paidUSD, paidNGN, remainingUSD, remainingNGN };
}
