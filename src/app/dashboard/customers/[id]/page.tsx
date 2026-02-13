"use client";

import { use } from "react";
import { CustomerDetail } from "@/features/customers/components/customer-detail";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CustomerDetail customerId={id} />;
}
