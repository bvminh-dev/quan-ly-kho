"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ORDER_STATE_CONFIG } from "@/features/orders/constants/order-state-config";
import { getWarehouseDisplayName } from "@/features/warehouse/utils/sort-warehouse";
import type { OrderDetail, WarehouseItem } from "@/types/api";
import { formatNGN, formatNumber, formatUSD } from "@/utils/currency";
import { toPng } from "html-to-image";
import { Copy, Download, X } from "lucide-react";
import { Fragment, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  order: OrderDetail | null;
  warehouseMap: Record<string, WarehouseItem>;
}

export function InvoiceDialog({
  open,
  onClose,
  order,
  warehouseMap,
}: InvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const isSetProduct = (product: OrderDetail["products"][number]) => {
    const qtySet = product.quantitySet ?? 0;
    const hasSetMeta =
      Boolean(product.nameSet?.trim()) ||
      (product.priceSet ?? 0) > 0 ||
      (product.saleSet ?? 0) > 0;
    return qtySet > 0 && (hasSetMeta || product.items.length > 1);
  };

  const generateImage = useCallback(async () => {
    const node = invoiceRef.current;
    if (!node) return null;

    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    const width = Math.ceil(node.scrollWidth);
    const height = Math.ceil(node.scrollHeight);

    // Keep canvas size under browser limits to avoid export failures.
    const maxPixels = 16_000_000;
    const area = Math.max(width * height, 1);
    const safeRatio = Math.min(2, Math.sqrt(maxPixels / area));
    const pixelRatio = Math.max(1, safeRatio);

    return await toPng(node, {
      backgroundColor: "#ffffff",
      cacheBust: true,
      pixelRatio,
      width,
      height,
      canvasWidth: Math.ceil(width * pixelRatio),
      canvasHeight: Math.ceil(height * pixelRatio),
      style: {
        transform: "none",
      },
    });
  }, []);

  const handleCopy = async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
        throw new Error("Clipboard API unavailable");
      }
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Đã copy ảnh hóa đơn");
    } catch {
      toast.error("Không thể copy ảnh");
    }
  };

  const handleDownload = async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) {
        toast.error("Không thể tạo ảnh hóa đơn");
        return;
      }
      const link = document.createElement("a");
      link.download = `invoice-${order?._id?.slice(-5) || "unknown"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Không thể tải ảnh");
    }
  };

  const priceType = order?.type === "cao" ? "high" : "low";
  const invoiceLabel = priceType === "high" ? "C" : "T";
  const now = new Date(order?.createdAt ?? Date.now());
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const invoiceDate = `${dateStr}, ${timeStr}`;
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}${String(now.getDate()).padStart(2, "0")}`;
  const invoiceNo = `INV-${ymd}-${order?._id?.slice(-4).toUpperCase() || "XXXX"}`;

  const lowerState = order?.state?.toLowerCase() as
    | keyof typeof ORDER_STATE_CONFIG
    | undefined;
  const stateCfg = lowerState ? ORDER_STATE_CONFIG[lowerState] : undefined;

  const getSetColors = (index: number) => {
    const hue = (index * 47) % 360;
    return {
      borderColor: `hsl(${hue} 72% 42%)`,
      bgColor: `hsl(${hue} 80% 96%)`,
      chipColor: `hsl(${hue} 72% 90%)`,
    };
  };

  const calculatedProducts = useMemo(() => {
    if (!order) return [];

    let setCounter = 0;
    const mapped = order.products.map((product) => {
      const isSet = isSetProduct(product);
      const setQty = isSet ? Math.max(product.quantitySet ?? 0, 0) : 1;
      const isCalcSet = Boolean(
        isSet && ((product.priceSet ?? 0) > 0 || product.isCalcSet),
      );

      const items = product.items.map((item) => {
        const wh = warehouseMap[item.id];
        const displayName = wh ? getWarehouseDisplayName(wh) : item.id;
        const qtyPerSet = item.quantity ?? 0;
        const qty = qtyPerSet * setQty;
        const totalUSD = (item.price ?? 0) * qty;

        return {
          ...item,
          wh,
          displayName,
          qtyPerSet,
          qty,
          totalUSD,
          totalNGN: totalUSD * order.exchangeRate,
        };
      });

      const itemsTotalUSD = items.reduce((sum, item) => sum + item.totalUSD, 0);
      const setTotalUSD = isCalcSet
        ? (product.priceSet ?? 0) * setQty
        : itemsTotalUSD;

      const setVisualIndex = isSet ? setCounter++ : -1;

      return {
        product,
        isSet,
        isCalcSet,
        setQty,
        setTotalUSD,
        setTotalNGN: setTotalUSD * order.exchangeRate,
        items,
        setVisualIndex,
      };
    });
    return [...mapped].sort((a, b) => {
      if (!a.isSet && b.isSet) return -1;
      if (a.isSet && !b.isSet) return 1;
      return 0;
    });
  }, [order, warehouseMap]);
  const exchangeRate = order?.exchangeRate ?? 0;

  const subtotalUSD = calculatedProducts.reduce(
    (sum, entry) => sum + entry.setTotalUSD,
    0,
  );
  const subtotalNGN = subtotalUSD * exchangeRate;

  const discountUSD = calculatedProducts.reduce((sum, entry) => {
    if (entry.isSet && entry.isCalcSet) {
      return sum + (entry.product.saleSet ?? 0) * entry.setQty;
    }
    return sum + entry.items.reduce((s, it) => s + (it.sale ?? 0) * it.qty, 0);
  }, 0);
  const discountNGN = discountUSD * exchangeRate;

  const debtUSD = order?.debt ?? 0;
  const debtNGN = debtUSD * exchangeRate;

  const paidUSD =
    order?.history?.length == 0 ? (order?.paid ?? 0) : (order?.paidedUsd ?? 0);
  const paidNGN = paidUSD * exchangeRate;

  const amountToPayUSD = subtotalUSD - discountUSD;
  const amountToPayNGN = amountToPayUSD * exchangeRate;
  const balanceUSD = amountToPayUSD + debtUSD - paidUSD;
  const balanceNGN = balanceUSD * exchangeRate;

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none! sm:max-w-none! inset-0 top-0 left-0 translate-x-0 translate-y-0 w-full h-full max-h-dvh rounded-none border-0 p-0 gap-0 flex flex-col overflow-hidden"
      >
        <DialogHeader className="px-6 pt-4 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-3">
            Hóa đơn bán hàng
            <Badge
              variant="outline"
              className={
                stateCfg?.className ||
                "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
              }
            >
              <span
                className={`size-2 rounded-full shrink-0 mr-2 ${stateCfg?.dot || "bg-gray-500"}`}
              />
              {order.state}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-w-0 overflow-auto px-6 flex justify-center">
          <div
            ref={invoiceRef}
            className="bg-white text-gray-900 p-8 shrink-0 max-w-4xl mx-auto"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-indigo-900">
                  SALES INVOICE ({invoiceLabel})
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Invoice No: {invoiceNo}
                </p>
                <p className="text-sm text-gray-600">Date: {invoiceDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Customer:</p>
                <p className="text-xl font-bold">{order.customer?.name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Rate: 1 USD = {formatNumber(order.exchangeRate)} NGN
                </p>
              </div>
            </div>

            <table className="w-full border-collapse mb-6 table-fixed">
              <thead>
                <tr className="border-y-2 border-indigo-600">
                  <th className="text-left py-2 text-sm font-semibold min-w-0">
                    Description
                  </th>
                  <th className="text-center py-2 text-sm font-semibold w-20">
                    Quantity
                  </th>
                  <th className="text-right py-2 text-sm font-semibold w-28">
                    Unit Price
                  </th>
                  <th className="text-right py-2 text-sm font-semibold w-28">
                    Amount (USD)
                  </th>
                  <th className="text-right py-2 text-sm font-semibold w-32">
                    Amount (NGN)
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculatedProducts.map((entry, idx) => {
                  if (entry.isSet) {
                    const colors = getSetColors(entry.setVisualIndex);
                    const salePerSet = entry.isCalcSet
                      ? (entry.product.saleSet ?? 0)
                      : 0;
                    const itemCount = entry.items.length;

                    return (
                      <Fragment key={`set-group-${idx}`}>
                        {entry.items.map((it, itemIdx) => (
                          <tr
                            key={`set-item-${idx}-${itemIdx}`}
                            className="border-b border-gray-100"
                            style={{
                              borderLeft: `4px solid ${colors.borderColor}`,
                            }}
                          >
                            <td className="py-2 pl-3 text-sm min-w-0 wrap-break-word leading-snug align-top">
                              {it.displayName}
                            </td>
                            <td className="py-2 text-sm text-center tabular-nums">
                              {formatNumber(it.qty)}{" "}
                              {it.wh?.unitOfCalculation?.toLowerCase() || "pcs"}
                            </td>
                            {itemIdx === 0 && (
                              <>
                                <td
                                  rowSpan={itemCount}
                                  className="py-2 text-sm text-right tabular-nums align-middle"
                                >
                                  <div className="font-semibold">
                                    {formatUSD(entry.product.priceSet ?? 0)}
                                  </div>

                                </td>
                                <td
                                  rowSpan={itemCount}
                                  className="py-2 text-sm text-right tabular-nums font-semibold align-middle"
                                >
                                  <div>{formatUSD(entry.setTotalUSD)}</div>
                                  <div className="text-xs text-gray-500 font-normal">
                                    x{formatNumber(entry.setQty)} set
                                  </div>
                                </td>
                                <td
                                  rowSpan={itemCount}
                                  className="py-2 text-sm text-right tabular-nums font-semibold align-middle"
                                >
                                  {formatNGN(entry.setTotalNGN)}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </Fragment>
                    );
                  }

                  return entry.items.map((it, itemIdx) => (
                    <tr
                      key={`single-row-${idx}-${itemIdx}`}
                      className="border-b border-gray-100"
                    >
                      <td className="py-2 text-sm min-w-0 wrap-break-word leading-snug align-top">
                        {it.displayName}
                      </td>
                      <td className="py-2 text-sm text-center tabular-nums">
                        {formatNumber(it.qty)}{" "}
                        {it.wh?.unitOfCalculation?.toLowerCase() || "pcs"}
                      </td>
                      <td
                        className={`py-2 text-sm text-right tabular-nums ${it.customPrice || it.customSale ? "font-bold" : ""
                          }`}
                      >
                        {formatUSD(it.price)}
                      </td>
                      <td className="py-2 text-sm text-right tabular-nums">
                        {formatUSD(it.totalUSD)}
                      </td>
                      <td className="py-2 text-sm text-right tabular-nums">
                        {formatNGN(it.totalNGN)}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>

            <div
              className="border-gray-200 pt-3 space-y-1.5 grid gap-y-1.5"
              style={{
                gridTemplateColumns: "1fr 5rem 7rem 7rem 8rem",
              }}
            >
              <div className="col-span-3 text-right text-sm text-gray-500">
                Subtotal:
              </div>
              <div className="text-right text-sm tabular-nums whitespace-nowrap">
                {formatUSD(subtotalUSD)}
              </div>
              <div className="text-right text-sm tabular-nums whitespace-nowrap">
                {formatNGN(subtotalNGN)}
              </div>

              {discountUSD > 0 && (
                <>
                  <div className="col-span-3 text-right text-sm text-emerald-600 italic">
                    Discount:
                  </div>
                  <div className="text-right text-sm tabular-nums whitespace-nowrap text-emerald-600">
                    {formatUSD(discountUSD)}
                  </div>
                  <div className="text-right text-sm tabular-nums whitespace-nowrap text-emerald-600">
                    {formatNGN(discountNGN)}
                  </div>
                </>
              )}

              <div className="col-span-5 border-t-2 border-gray-300 pt-3 mt-1" />
              <div className="col-span-3 text-right text-lg font-bold">
                Total:
              </div>
              <div className="text-right text-lg font-bold tabular-nums whitespace-nowrap text-red-600">
                {formatUSD(amountToPayUSD)}
              </div>
              <div className="text-right text-lg font-bold tabular-nums whitespace-nowrap text-red-600">
                {formatNGN(amountToPayNGN)}
              </div>

              {order.history.length > 0
                ? order.history.map((h, i) => (
                  <Fragment key={`history-paid-${i}`}>
                    <div className="col-span-2 text-right text-sm text-emerald-600 italic">
                      Paid: {formatNGN(h.moneyPaidNGN)}
                    </div>
                    <div className="text-right text-sm text-emerald-600 italic">
                      rate: {formatNumber(h.exchangeRate)}
                    </div>
                    <div className="text-right text-sm tabular-nums whitespace-nowrap text-emerald-600">
                      {formatUSD(h.moneyPaidDolar)}
                    </div>
                    <div />
                  </Fragment>
                ))
                : paidUSD !== 0 && (
                  <>
                    <div className="col-span-2 text-right text-sm text-emerald-600 italic">
                      Paid: {formatNGN(paidNGN)}
                    </div>
                    <div className="text-right text-sm text-emerald-600 italic">
                      rate: {formatNumber(exchangeRate)}
                    </div>
                    <div className="text-right text-sm tabular-nums whitespace-nowrap text-emerald-600">
                      {formatUSD(paidUSD)}
                    </div>
                    <div />
                  </>
                )}

              {debtUSD !== 0 && (
                <>
                  <div className="col-span-2 text-right text-sm text-red-600 italic">
                    Debt: {formatNGN(Math.abs(debtNGN))}
                  </div>
                  <div className="text-right text-sm text-red-600 italic">
                    rate: {formatNumber(exchangeRate)}
                  </div>
                  <div className="text-right text-sm tabular-nums whitespace-nowrap text-red-600">
                    {formatUSD(Math.abs(debtUSD))}
                  </div>
                  <div />
                </>
              )}

              {(paidUSD !== 0 || order.history.length > 0 || debtUSD !== 0) && (
                <>
                  <div className="col-span-5 border-t border-gray-200 pt-2 mt-1" />
                  <div className="col-span-3 text-right text-sm font-semibold">
                    Balance:
                  </div>
                  {balanceUSD > 0 ? (
                    <>
                      <div className="text-right text-sm font-semibold tabular-nums whitespace-nowrap text-red-600">
                        {formatUSD(balanceUSD)}
                      </div>
                      <div className="text-right text-sm font-semibold tabular-nums whitespace-nowrap text-red-600">
                        {formatNGN(balanceNGN)}
                      </div>
                    </>
                  ) : balanceUSD < 0 ? (
                    <>
                      <div className="text-right text-sm font-semibold text-emerald-600">
                        <div>Overpaid</div>
                        <div className="tabular-nums whitespace-nowrap">
                          {formatUSD(Math.abs(balanceUSD))}
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold text-emerald-600">
                        <div>Overpaid</div>
                        <div className="tabular-nums whitespace-nowrap">
                          {formatNGN(Math.abs(balanceNGN))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-right text-sm font-semibold text-emerald-600">
                        Fully paid
                      </div>
                      <div className="text-right text-sm font-semibold text-emerald-600">
                        Fully paid
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="cursor-pointer"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy ảnh
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            Tải PNG
          </Button>
          {/* <Button
            variant="outline"
            onClick={handleOpenNewTab}
            className="cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Mở tab mới
          </Button> */}
          <Button
            variant="destructive"
            onClick={onClose}
            className="cursor-pointer"
          >
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
