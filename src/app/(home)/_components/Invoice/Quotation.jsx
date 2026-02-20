import { Suspense } from "react";
import { TopChannelsSkeleton } from "@/components/Tables/quotations/skeleton";
import QuotationTable from "@/components/Tables/quotations/QuotationTable";

const Quotation = () => {
  return (
    <section className="mt-10">
      <Suspense fallback={<TopChannelsSkeleton />}>
        <QuotationTable />
      </Suspense>
    </section>
  );
};

export default Quotation;
