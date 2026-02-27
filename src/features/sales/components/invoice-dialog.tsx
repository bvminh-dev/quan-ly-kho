"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getWarehouseDisplayName } from "@/features/warehouse/utils/sort-warehouse";
import type { OrderDetail, WarehouseItem } from "@/types/api";
import { formatNGN, formatNumber, formatUSD } from "@/utils/currency";
import { toPng } from "html-to-image";
import { Copy, Download, X } from "lucide-react";
import { Fragment, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ORDER_STATE_CONFIG } from "@/features/orders/constants/order-state-config";

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
    return order.products.map((product) => {
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
        const grossUSD = (item.price ?? 0) * qty;
        const discountUSD = (item.sale ?? 0) * qty;
        const totalUSD = grossUSD - discountUSD;

        return {
          ...item,
          wh,
          displayName,
          qtyPerSet,
          qty,
          grossUSD,
          discountUSD,
          totalUSD,
          totalNGN: totalUSD * order.exchangeRate,
        };
      });

      const itemsGrossUSD = items.reduce((sum, item) => sum + item.grossUSD, 0);
      const itemsDiscountUSD = items.reduce(
        (sum, item) => sum + item.discountUSD,
        0,
      );
      const setGrossUSD = isCalcSet
        ? (product.priceSet ?? 0) * setQty
        : itemsGrossUSD;
      const setDiscountUSD = isCalcSet
        ? (product.saleSet ?? 0) * setQty
        : itemsDiscountUSD;
      const setTotalUSD = setGrossUSD - setDiscountUSD;

      const setVisualIndex = isSet ? setCounter++ : -1;

      return {
        product,
        isSet,
        isCalcSet,
        setQty,
        setGrossUSD,
        setDiscountUSD,
        setTotalUSD,
        setTotalNGN: setTotalUSD * order.exchangeRate,
        items,
        setVisualIndex,
      };
    });
  }, [order, warehouseMap]);
  const subtotalUSD = calculatedProducts.reduce(
    (sum, product) => sum + product.setGrossUSD,
    0,
  );
  const discountUSD = calculatedProducts.reduce(
    (sum, product) => sum + product.setDiscountUSD,
    0,
  );
  const exchangeRate = order?.exchangeRate ?? 0;
  const subtotalNGN = subtotalUSD * exchangeRate;
  const discountNGN = discountUSD * exchangeRate;

  const debtUSD = order?.debt ?? 0;
  const paidUSD = order?.paid ?? 0;
  const debtNGN = debtUSD * exchangeRate;
  const paidNGN = paidUSD * exchangeRate;

  const totalUSD = subtotalUSD - discountUSD + debtUSD - paidUSD;
  const totalNGN = totalUSD * exchangeRate;

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none! sm:max-w-none! inset-0 top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen rounded-none border-0 p-0 gap-0 flex flex-col"
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

        <div className="flex-1 overflow-auto px-6 flex justify-center">
          <div
            ref={invoiceRef}
            className="bg-white text-gray-900 p-8 shrink-0"
            style={{ fontFamily: "Arial, sans-serif", minWidth: 1024 }}
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

            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="border-y-2 border-indigo-600">
                  <th className="text-left py-2 text-sm font-semibold">
                    Description
                  </th>
                  <th className="text-center py-2 text-sm font-semibold w-24">
                    Qty
                  </th>
                  <th className="text-right py-2 text-sm font-semibold w-28">
                    Unit Price
                  </th>
                  <th className="text-right py-2 text-sm font-semibold w-28">
                    Discount
                  </th>
                  <th className="text-right py-2 text-sm font-semibold w-32">
                    Total (USD)
                  </th>
                  <th className="text-right py-2 text-sm font-semibold w-36">
                    Total (NGN)
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculatedProducts.map((entry, idx) => {
                  if (entry.isSet) {
                    const colors = getSetColors(entry.setVisualIndex);
                    return (
                      <Fragment key={`set-group-${idx}`}>
                        <tr
                          key={`set-row-${idx}`}
                          className="border-b border-gray-200"
                          style={{ backgroundColor: colors.bgColor }}
                        >
                          <td className="py-2 text-sm font-semibold whitespace-normal wrap-break-word leading-snug">
                            <span
                              className="inline-block size-2 rounded-sm mr-2 align-middle"
                              style={{ backgroundColor: colors.borderColor }}
                            />
                            {entry.product.nameSet?.trim() ||
                              `Set ${entry.setVisualIndex + 1}`}
                          </td>
                          <td className="py-2 text-sm text-center tabular-nums">
                            {formatNumber(entry.setQty)}
                          </td>
                          <td className="py-2 text-sm text-right tabular-nums">
                            {entry.isCalcSet
                              ? formatUSD(entry.product.priceSet ?? 0)
                              : formatUSD(
                                  entry.setQty > 0
                                    ? entry.setGrossUSD / entry.setQty
                                    : 0,
                                )}
                          </td>
                          <td className="py-2 text-sm text-right tabular-nums text-red-600">
                            -{formatUSD(entry.setDiscountUSD)}
                          </td>
                          <td className="py-2 text-sm text-right tabular-nums font-semibold">
                            {formatUSD(entry.setTotalUSD)}
                          </td>
                          <td className="py-2 text-sm text-right tabular-nums font-semibold">
                            {formatNGN(entry.setTotalNGN)}
                          </td>
                        </tr>
                        {entry.items.map((it, itemIdx) => (
                          <tr
                            key={`set-item-${idx}-${itemIdx}`}
                            className="border-b border-gray-100"
                            style={{ backgroundColor: colors.bgColor }}
                          >
                            <td className="py-1.5 pl-6 text-sm text-gray-700 whitespace-normal wrap-break-word leading-snug">
                              • {it.displayName}
                            </td>
                            <td className="py-1.5 text-sm text-center text-gray-500 tabular-nums">
                              -
                            </td>
                            <td className="py-1.5 text-sm text-right text-gray-500 tabular-nums">
                              -
                            </td>
                            <td className="py-1.5 text-sm text-right text-gray-500 tabular-nums">
                              -
                            </td>
                            <td className="py-1.5 text-sm text-right text-gray-500 tabular-nums">
                              -
                            </td>
                            <td className="py-1.5 text-sm text-right text-gray-500 tabular-nums">
                              -
                            </td>
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
                      <td className="py-2 text-sm whitespace-normal wrap-break-word leading-snug">
                        {it.displayName}
                      </td>
                      <td className="py-2 text-sm text-center tabular-nums">
                        {formatNumber(it.qty)}{" "}
                        {it.wh?.unitOfCalculation?.toLowerCase() || "pcs"}
                      </td>
                      <td className="py-2 text-sm text-right tabular-nums">
                        {formatUSD(it.price)}
                      </td>
                      <td className="py-2 text-sm text-right tabular-nums text-red-600">
                        -{formatUSD(it.discountUSD)}
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

            <div className="border-gray-200 pt-3 space-y-1.5">
              <div className="flex justify-end gap-8 text-sm">
                <span className="text-gray-500">Subtotal Amount:</span>
                <span className="w-32 text-right whitespace-nowrap tabular-nums">
                  {formatUSD(subtotalUSD)}
                </span>
                <span className="w-36 text-right whitespace-nowrap tabular-nums">
                  {formatNGN(subtotalNGN)}
                </span>
              </div>

              {discountUSD > 0 && (
                <div className="flex justify-end gap-8 text-sm text-red-600">
                  <span className="text-gray-500">Discount:</span>
                  <span className="w-32 text-right whitespace-nowrap tabular-nums">
                    -{formatUSD(discountUSD)}
                  </span>
                  <span className="w-36 text-right whitespace-nowrap tabular-nums">
                    -{formatNGN(discountNGN)}
                  </span>
                </div>
              )}

              {debtUSD > 0 && (
                <div className="flex justify-end gap-8 text-sm text-red-600">
                  <span className="text-gray-500">Debt:</span>
                  <span className="w-32 text-right whitespace-nowrap tabular-nums">
                    {formatUSD(debtUSD)}
                  </span>
                  <span className="w-36 text-right whitespace-nowrap tabular-nums">
                    {formatNGN(debtNGN)}
                  </span>
                </div>
              )}

              {paidUSD > 0 && (
                <div className="flex justify-end gap-8 text-sm text-emerald-600">
                  <span className="text-gray-500">Paid:</span>
                  <span className="w-32 text-right whitespace-nowrap tabular-nums">
                    -{formatUSD(paidUSD)}
                  </span>
                  <span className="w-36 text-right whitespace-nowrap tabular-nums">
                    -{formatNGN(paidNGN)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-gray-300 mt-2 pt-3">
              <div className="flex justify-end gap-8 text-lg font-bold">
                <span>Total (USD):</span>
                <span className="text-red-600 w-32 text-right whitespace-nowrap tabular-nums">
                  {formatUSD(totalUSD)}
                </span>
                <span className="text-red-600 w-36 text-right whitespace-nowrap tabular-nums">
                  {formatNGN(totalNGN)}
                </span>
              </div>
            </div>

            {order.note && (
              <div
                className="mt-2 text-xs text-gray-500 max-w-xl"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                <span className="font-semibold mr-1">Ghi chú:</span>
                <span>{order.note}</span>
              </div>
            )}
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
