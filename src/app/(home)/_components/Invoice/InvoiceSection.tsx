'use client';

import { ReactNode, useMemo, useState } from "react";

type InvoiceSectionProps = {
  quotationContent: ReactNode;
  invoiceContent: ReactNode;
};

const InvoiceSection = ({
  quotationContent,
  invoiceContent,
}: InvoiceSectionProps) => {
  const [tab, setTab] = useState(1);
  const content = useMemo(
    () => (tab === 1 ? quotationContent : invoiceContent),
    [invoiceContent, quotationContent, tab],
  );

  return (
    <section className="h-screen">
      <div className="grid place-items-center">
        <div className="flex gap-3 ">
          <button onClick={() => setTab(1)} className={`p-3 px-10 lg:px-20  ${tab == 1 ? 'bg-indigo-600 text-white' : 'bg-white text-black' }  font-bold rounded-lg shadow-7`}>Quotations</button>
          <button onClick={() => setTab(2)} className={`p-3 px-10 lg:px-20  ${tab == 2 ? 'bg-indigo-600 text-white' : 'bg-white text-black' }  font-bold rounded-lg shadow-7`}>Invoices</button>
        </div>
      </div>

      {content}

    </section>
  )
}

export default InvoiceSection
