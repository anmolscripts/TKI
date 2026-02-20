import InvoiceForm from "@/app/(home)/_components/Form/InvoiceForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getQuotations } from "./fetch";

const QuotationTable = async ({ className }: { className?: string }) => {
  const data = await getQuotations();

  const formatAmount = (value: number) =>
    value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      className={cn(
        "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
          Quotation Table
        </h2>
        <InvoiceForm mode="create" triggerLabel="ADD" />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="!text-left">Tab ID</TableHead>
            <TableHead className="!text-left">Client</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="!text-right">Amount</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length ? (
            data.map((quotation) => {
              const totalAmount = quotation.items.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0,
              );

              return (
                <TableRow
                  className="text-center text-base font-medium text-dark dark:text-white"
                  key={quotation.id}
                >
                  <TableCell className="!text-left">{quotation.tab_id}</TableCell>
                  <TableCell className="!text-left">
                    <div className="font-semibold">{quotation.client_name}</div>
                    <div className="text-xs text-dark-4">{quotation.title}</div>
                  </TableCell>
                  <TableCell>{quotation.items.length}</TableCell>
                  <TableCell className="!text-right text-green-light-1">
                    {formatAmount(totalAmount)}
                  </TableCell>
                  <TableCell>
                    {quotation.active ? (
                      <span className="rounded bg-green/10 px-2 py-1 text-xs text-green">
                        Active
                      </span>
                    ) : (
                      <span className="rounded bg-red/10 px-2 py-1 text-xs text-red">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <InvoiceForm
                      mode="edit"
                      triggerLabel="Edit"
                      initialData={{
                        id: quotation.id,
                        client_name: quotation.client_name,
                        bill_date: quotation.bill_date,
                        title: quotation.title,
                        active: quotation.active,
                        items: quotation.items,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-dark-4">
                No quotations found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationTable;
