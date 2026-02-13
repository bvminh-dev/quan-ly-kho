"use client";

import { use } from "react";
import { OrderEditPage } from "@/features/orders/components/order-edit-page";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderEditPage orderId={id} />;
}
