import InvoiceSection from "@/app/(home)/_components/Invoice/InvoiceSection";
import Invoice from "@/app/(home)/_components/Invoice/Invoice";
import Quotation from "@/app/(home)/_components/Invoice/Quotation";
import React from "react";

const page = () => {
  return (
    <InvoiceSection
      quotationContent={<Quotation />}
      invoiceContent={<Invoice />}
    />
  );
};

export default page;
