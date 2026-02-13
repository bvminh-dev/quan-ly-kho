"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWarehouseDisplayName } from "@/features/warehouse/utils/sort-warehouse";
import type { OrderDetail, WarehouseItem } from "@/types/api";
import { toPng } from "html-to-image";
import { Copy, Download, ExternalLink, X } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { SET_INVOICE_BG_COLORS, SET_INVOICE_BORDER_COLORS } from "../types";

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  order: OrderDetail | null;
  priceType: "high" | "low";
  warehouseMap: Record<string, WarehouseItem>;
}

export function InvoiceDialog({
  open,
  onClose,
  order,
  priceType,
  warehouseMap,
}: InvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generateImage = useCallback(async () => {
    if (!invoiceRef.current) return null;
    return await toPng(invoiceRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    });
  }, []);

  const handleCopy = async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
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
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `invoice-${order?._id?.slice(-5) || "unknown"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Không thể tải ảnh");
    }
  };

  const handleOpenNewTab = async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<img src="${dataUrl}" />`);
      }
    } catch {
      toast.error("Không thể mở tab mới");
    }
  };

  if (!order) return null;

  const invoiceLabel = priceType === "high" ? "C" : "T";
  const now = new Date(order.createdAt);
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
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const invoiceNo = `INV-${ymd}-${order._id.slice(-4).toUpperCase()}`;

  const formatUSD = (v: number) => `$${v.toFixed(2)}`;
  const formatNGN = (v: number) => `₦${Math.round(v).toLocaleString()}`;

  let subtotalUSD = 0;
  let setColorCounter = 0;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none! sm:max-w-none! inset-0 top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen rounded-none border-0 p-0 gap-0 flex flex-col"
      >
        <DialogHeader className="px-6 pt-4 pb-2 shrink-0">
          <DialogTitle>Hóa đơn bán hàng</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div
            ref={invoiceRef}
            className="bg-white text-gray-900 p-8 max-w-4xl mx-auto"
            style={{ fontFamily: "Arial, sans-serif", minWidth: 600 }}
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
                  Rate: 1 USD = {order.exchangeRate.toLocaleString()} NGN
                </p>
              </div>
            </div>

            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="border-b-2 border-indigo-600">
                  <th className="text-left py-2 font-semibold text-sm">Description</th>
                  <th className="text-center py-2 font-semibold text-sm w-20">Qty</th>
                  <th className="text-center py-2 font-semibold text-sm w-28">Unit Price</th>
                  <th className="text-right py-2 font-semibold text-sm w-24">Amount</th>
                  <th className="text-right py-2 font-semibold text-sm w-28">Amount (NGN)</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((product, pIdx) => {
                  const isSet = product.isCalcSet && product.items.length > 1;

                  if (isSet) {
                    const colorIdx = setColorCounter++;
                    const borderColor = SET_INVOICE_BORDER_COLORS[colorIdx % SET_INVOICE_BORDER_COLORS.length];
                    const bgColor = SET_INVOICE_BG_COLORS[colorIdx % SET_INVOICE_BG_COLORS.length];
                    const setTotal = (product.priceSet - product.saleSet) * product.quantitySet;
                    subtotalUSD += setTotal;

                    return (
                      <tr key={pIdx}>
                        <td className="py-2" colSpan={5}>
                          <div className={`border-l-4 ${borderColor} ${bgColor} pl-3 rounded-r py-1`}>
                            <div className="text-xs font-semibold mb-1 text-gray-500">
                              {product.nameSet || `Set ${colorIdx + 1}`}
                            </div>
                            {product.items.map((it, iIdx) => {
                              const wh = warehouseMap[it.id];
                              const name = wh ? getWarehouseDisplayName(wh) : it.id;
                              return (
                                <div
                                  key={iIdx}
                                  className="flex items-center justify-between py-1"
                                >
                                  <span className="text-sm">{name}</span>
                                  <span className="text-sm text-center w-20">
                                    {it.quantity} {wh?.unitOfCalculation?.toLowerCase() || "pcs"}
                                  </span>
                                  {iIdx === 0 ? (
                                    <>
                                      <span className="text-sm font-semibold text-center w-28">
                                        Set: {formatUSD(product.priceSet - product.saleSet)}
                                      </span>
                                      <span className="text-sm text-right w-24">
                                        {formatUSD(setTotal)}
                                      </span>
                                      <span className="text-sm text-right w-28">
                                        {formatNGN(setTotal * order.exchangeRate)}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-28" />
                                      <span className="w-24" />
                                      <span className="w-28" />
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return product.items.map((it, iIdx) => {
                    const wh = warehouseMap[it.id];
                    const name = wh ? getWarehouseDisplayName(wh) : it.id;
                    const itemTotal = (it.price - it.sale) * it.quantity;
                    subtotalUSD += itemTotal;

                    return (
                      <tr key={`${pIdx}-${iIdx}`} className="border-b border-gray-100">
                        <td className="py-2 text-sm">{name}</td>
                        <td className="py-2 text-sm text-center">
                          {it.quantity} {wh?.unitOfCalculation?.toLowerCase() || "pcs"}
                        </td>
                        <td className="py-2 text-sm text-center">{formatUSD(it.price - it.sale)}</td>
                        <td className="py-2 text-sm text-right">{formatUSD(itemTotal)}</td>
                        <td className="py-2 text-sm text-right">
                          {formatNGN(itemTotal * order.exchangeRate)}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-end gap-8 text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="w-24 text-right">{formatUSD(order.totalPrice)}</span>
                <span className="w-28 text-right">
                  {formatNGN(order.totalPrice * order.exchangeRate)}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 mt-2 pt-3">
              <div className="flex justify-end gap-8 text-lg font-bold">
                <span>Total (USD):</span>
                <span className="text-red-600 w-24 text-right">
                  {formatUSD(order.totalPrice)}
                </span>
                <span className="text-red-600 w-28 text-right">
                  {formatNGN(order.totalPrice * order.exchangeRate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={handleCopy} className="cursor-pointer">
            <Copy className="h-4 w-4 mr-2" />
            Copy ảnh
          </Button>
          <Button variant="outline" onClick={handleDownload} className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Tải PNG
          </Button>
          <Button variant="outline" onClick={handleOpenNewTab} className="cursor-pointer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Mở tab mới
          </Button>
          <Button variant="destructive" onClick={onClose} className="cursor-pointer">
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
