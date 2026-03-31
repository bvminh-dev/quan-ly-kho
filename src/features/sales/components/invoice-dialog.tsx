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

    // Clone node and place offscreen in body — free from any parent constraints
    const clone = node.cloneNode(true) as HTMLDivElement;
    clone.style.position = "absolute";
    clone.style.left = "-99999px";
    clone.style.top = "0";
    clone.style.width = "auto";
    clone.style.minWidth = "900px";
    clone.style.maxWidth = "none";
    clone.style.overflow = "visible";

    // Remove overflow constraints from table wrapper inside clone
    const tableWrapper = clone.querySelector("div.overflow-x-auto") as HTMLElement | null;
    if (tableWrapper) {
      tableWrapper.style.overflow = "visible";
    }

    document.body.appendChild(clone);

    // Wait for fonts
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    // Wait for layout to settle
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    const width = Math.ceil(clone.scrollWidth);
    const height = Math.ceil(clone.scrollHeight);

    // Keep canvas size under browser limits
    const maxPixels = 16_000_000;
    const area = Math.max(width * height, 1);
    const safeRatio = Math.min(2, Math.sqrt(maxPixels / area));
    const pixelRatio = Math.max(1, safeRatio);

    try {
      return await toPng(clone, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        pixelRatio,
        width,
        height,
        canvasWidth: Math.ceil(width * pixelRatio),
        canvasHeight: Math.ceil(height * pixelRatio),
        style: {
          transform: "none",
          position: "static",
          left: "auto",
          top: "auto",
        },
      });
    } finally {
      document.body.removeChild(clone);
    }
  }, []);

  const handleCopy = async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const tryClipboardWrite = async (): Promise<boolean> => {
        if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
          if (process.env.NODE_ENV === "development") {
            console.warn("[Invoice copy] Clipboard API không có sẵn");
          }
          return false;
        }
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          // Safari/mobile: wrap in Promise for better compatibility
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": Promise.resolve(blob),
            }),
          ]);
          return true;
        } catch (err) {
          // NotAllowedError / SecurityError = trình duyệt chặn (chính sách, không có user gesture, v.v.)
          if (process.env.NODE_ENV === "development") {
            console.warn("[Invoice copy] Clipboard bị chặn:", err);
          }
          return false;
        }
      };

      const copied = await tryClipboardWrite();
      if (copied) {
        toast.success("Đã copy ảnh hóa đơn");
        return;
      }

      // Fallback: trên điện thoại nhiều trình duyệt không hỗ trợ copy ảnh → tải xuống
      const link = document.createElement("a");
      link.download = `invoice-${order?._id?.slice(-5) || "unknown"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(
        "Trên thiết bị này không hỗ trợ copy ảnh. Đã tải ảnh xuống thay thế."
      );
    } catch {
      toast.error("Không thể copy hoặc tải ảnh");
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

        <div className="flex-1 min-w-0 overflow-auto px-6">
          <div
            ref={invoiceRef}
            className="bg-white text-gray-900 p-8 shrink-0 max-w-4xl mx-auto w-full"
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

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse table-auto min-w-[800px]">
                <thead>
                  <tr className="border-y-2 border-indigo-600">
                    <th className="text-left py-2 text-sm font-semibold min-w-[200px]">
                      Description
                    </th>
                    <th className="text-center py-2 text-sm font-semibold min-w-[100px]">
                      Quantity
                    </th>
                    <th className="text-right py-2 text-sm font-semibold min-w-[120px]">
                      Unit Price
                    </th>
                    <th className="text-right py-2 text-sm font-semibold min-w-[140px]">
                      Amount (USD)
                    </th>
                    <th className="text-right py-2 text-sm font-semibold min-w-[150px]">
                      Amount (NGN)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedProducts.map((entry, idx) => {
                    if (entry.isSet) {
                      const colors = getSetColors(entry.setVisualIndex);
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
                              <td className="py-2 pl-3 text-sm min-w-0 wrap-break-word leading-snug align-top" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
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
                        <td className="py-2 text-sm min-w-0 wrap-break-word leading-snug align-top" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
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

                  {discountUSD > 0 && (
                    <tr>
                      <td colSpan={3} className="text-right text-sm text-emerald-600 italic py-1">
                        Discount:
                      </td>
                      <td className="text-right text-sm tabular-nums whitespace-nowrap text-emerald-600 py-1">
                        {formatUSD(discountUSD)}
                      </td>
                      <td className="text-right text-sm tabular-nums whitespace-nowrap text-emerald-600 py-1">
                        {formatNGN(discountNGN)}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td colSpan={5} className="border-t-2 border-gray-300 pt-3" />
                  </tr>
                  <tr>
                    <td colSpan={3} className="text-right text-lg font-bold">
                      Total:
                    </td>
                    <td className="text-right text-lg font-bold tabular-nums whitespace-nowrap text-red-600">
                      {formatUSD(amountToPayUSD)}
                    </td>
                    <td className="text-right text-lg font-bold tabular-nums whitespace-nowrap text-red-600">
                      {formatNGN(amountToPayNGN)}
                    </td>
                  </tr>

                  {debtUSD !== 0 && (
                    <tr>
                      <td colSpan={3} className="text-right text-sm font-semibold text-red-600 py-1">
                        Debt:
                      </td>
                      <td className="text-right text-sm font-semibold tabular-nums whitespace-nowrap text-red-600 py-1">
                        {formatUSD(Math.abs(debtUSD))}
                      </td>
                      <td className="py-1" />
                    </tr>
                  )}

                  {order.history.length > 0
                    ? order.history.map((h, i) => (
                      <tr key={`history-paid-${i}`}>
                        <td colSpan={h.paymentType === "auto" ? 3 : 2} className={`text-right text-sm ${h.type === "khách trả" ? "text-emerald-600" : "text-red-600"} italic py-1`}>
                          {h.type === "khách trả" ? h.paymentType === "auto" ? "Overpaid last order" : "Paid" : "Refund"}:{h.paymentType === "auto" ? "" : ` ${formatNGN(h.moneyPaidNGN)}`}
                        </td>
                        {h.paymentType === "auto" ? null : (
                          <td className={`text-right text-sm ${h.type === "khách trả" ? "text-emerald-600" : "text-red-600"} py-1`}>
                            rate: {formatNumber(h.exchangeRate)}
                          </td>
                        )}
                        <td className={`text-right text-sm tabular-nums whitespace-nowrap ${h.type === "khách trả" ? "text-emerald-600" : "text-red-600"} py-1`}>
                          {formatUSD(h.moneyPaidDolar)}
                        </td>
                        <td className="py-1" />
                      </tr>
                    ))
                    : paidUSD !== 0 && (
                      <tr>
                        <td colSpan={3} className="text-right text-sm text-emerald-600 italic py-1">
                          Overpaid last order:
                        </td>
                        <td className="text-right text-sm tabular-nums whitespace-nowrap text-emerald-600 py-1">
                          {formatUSD(paidUSD)}
                        </td>
                        <td className="py-1" />
                      </tr>
                    )}

                  {(paidUSD !== 0 || order.history.length > 0 || debtUSD !== 0 || balanceUSD === 0) && (
                    <>
                      <tr>
                        <td colSpan={5} className="border-t border-gray-200 pt-2" />
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-right text-xl font-bold">
                          Balance:
                        </td>
                        {balanceUSD > 0 ? (
                          <>
                            <td className="text-right text-xl font-bold tabular-nums whitespace-nowrap text-red-600">
                              {formatUSD(balanceUSD)}
                            </td>
                            <td className="text-right text-xl font-bold tabular-nums whitespace-nowrap text-red-600">
                              {formatNGN(balanceNGN)}
                            </td>
                          </>
                        ) : balanceUSD < 0 ? (
                          <>
                            <td className="text-right text-xl font-bold text-emerald-600">
                              <div>Overpaid</div>
                              <div className="tabular-nums whitespace-nowrap">
                                {formatUSD(Math.abs(balanceUSD))}
                              </div>
                            </td>
                            <td className="text-right text-xl font-bold text-emerald-600">
                              <div>Overpaid</div>
                              <div className="tabular-nums whitespace-nowrap">
                                {formatNGN(Math.abs(balanceNGN))}
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="text-right text-xl font-bold text-emerald-600">
                              Fully paid
                            </td>
                            <td className="text-right text-xl font-bold text-emerald-600">
                              Fully paid
                            </td>
                          </>
                        )}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
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
