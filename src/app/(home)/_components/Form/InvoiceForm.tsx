"use client";

import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import InputGroup from "@/components/FormElements/InputGroup";
import { Button } from "@/components/ui-elements/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useState } from "react";

type InvoiceRow = {
  id: number;
  item: string;
  quantity: string;
  unit: string;
  rate: string;
  hasGeneratedNext: boolean;
};

type InvoiceItemPayload = {
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
};

export type InvoiceFormInitialData = {
  id: string;
  client_name: string;
  bill_date: string;
  title: string;
  active?: boolean;
  items: InvoiceItemPayload[];
};

type InvoiceFormProps = {
  mode?: "create" | "edit";
  triggerLabel?: string;
  initialData?: InvoiceFormInitialData;
};

const INPUT_CLASS =
  "w-full rounded-lg border-[1.5px] border-black bg-transparent px-5.5 py-3 text-lg text-black outline-none transition placeholder:text-dark-6 focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary";

const EMPTY_ROW_BASE: Omit<InvoiceRow, "id"> = {
  item: "",
  quantity: "",
  unit: "",
  rate: "",
  hasGeneratedNext: false,
};

const createEmptyRow = (id: number): InvoiceRow => ({
  id,
  ...EMPTY_ROW_BASE,
});

const buildRowsFromItems = (items: InvoiceItemPayload[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [createEmptyRow(1)];
  }

  const mappedRows = items.map((item, index) => ({
    id: index + 1,
    item: item.item || "",
    quantity: item.quantity > 0 ? String(item.quantity) : "",
    unit: item.unit || "",
    rate: item.rate > 0 ? String(item.rate) : "",
    hasGeneratedNext: true,
  }));

  mappedRows.push(createEmptyRow(mappedRows.length + 1));
  return mappedRows;
};

const InvoiceForm = ({
  mode = "create",
  triggerLabel,
  initialData,
}: InvoiceFormProps) => {
  const router = useRouter();
  const isEditMode = mode === "edit" && Boolean(initialData?.id);
  const [showForm, setShowForm] = useState(false);
  const [rows, setRows] = useState<InvoiceRow[]>([createEmptyRow(1)]);
  const [clientName, setClientName] = useState("");
  const [billDate, setBillDate] = useState("");
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const formatIndianAmount = (value: number) =>
    value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getAmount = (row: InvoiceRow) =>
    parseNumber(row.quantity) * parseNumber(row.rate);

  const hydrateEditForm = () => {
    if (!isEditMode || !initialData) {
      setClientName("");
      setBillDate("");
      setTitle("");
      setActive(true);
      setRows([createEmptyRow(1)]);
      return;
    }

    setClientName(initialData.client_name || "");
    setBillDate(initialData.bill_date || "");
    setTitle(initialData.title || "");
    setActive(initialData.active ?? true);
    setRows(buildRowsFromItems(initialData.items || []));
  };

  const openForm = () => {
    hydrateEditForm();
    setError("");
    setShowForm(true);
  };

  const handleRowChange = (
    rowId: number,
    field: "item" | "quantity" | "unit" | "rate",
    value: string,
  ) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      );

      const rowIndex = updatedRows.findIndex((row) => row.id === rowId);
      const updatedRow = updatedRows[rowIndex];
      const amount = getAmount(updatedRow);

      if (amount > 0 && !updatedRow.hasGeneratedNext) {
        updatedRows[rowIndex] = { ...updatedRow, hasGeneratedNext: true };

        const maxId = updatedRows.reduce(
          (max, row) => (row.id > max ? row.id : max),
          0,
        );

        updatedRows.push(createEmptyRow(maxId + 1));
      }

      return updatedRows;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const items = rows
      .map((row) => {
        const quantity = parseNumber(row.quantity);
        const rate = parseNumber(row.rate);
        return {
          item: row.item.trim(),
          quantity,
          unit: row.unit.trim(),
          rate,
          amount: Number((quantity * rate).toFixed(2)),
        };
      })
      .filter((row) => row.item && row.quantity > 0 && row.rate > 0);

    if (!clientName.trim() || !billDate.trim() || !title.trim()) {
      setError("Client name, bill date, and title are required.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one valid item with quantity and rate.");
      return;
    }

    setIsSaving(true);
    try {
      const endpoint =
        isEditMode && initialData?.id
          ? `/api/quotation/${initialData.id}`
          : "/api/quotation";
      const method = isEditMode ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: clientName.trim(),
          bill_date: billDate.trim(),
          title: title.trim(),
          active,
          items,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; success?: boolean }
        | null;

      if (!response.ok || !payload?.success) {
        setError(
          payload?.message ||
            (isEditMode ? "Failed to update quotation." : "Failed to save quotation."),
        );
        return;
      }

      setShowForm(false);
      router.refresh();
    } catch {
      setError(isEditMode ? "Failed to update quotation." : "Failed to save quotation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isEditMode ? (
        <button
          type="button"
          onClick={openForm}
          className="rounded-md border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
        >
          {triggerLabel || "Edit"}
        </button>
      ) : (
        <Button
          label={triggerLabel || "ADD"}
          variant="green"
          shape="full"
          onClick={openForm}
        />
      )}

      {showForm && (
        <section className="absolute inset-0 left-0 z-30 grid place-items-center overflow-auto rounded-xl px-2 backdrop-blur-lg">
          <div className="w-11/12 rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 z-30 flex items-center justify-between rounded-xl bg-white px-5 py-2 shadow-md">
              <h2 className="text-xl font-bold uppercase text-indigo-700">
                {isEditMode ? "Edit Quotation" : "Quotation"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full bg-red-400 p-2 px-4 text-xl text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600"
              >
                X
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-4.5 flex flex-col justify-between gap-4.5 xl:flex-row">
                  <InputGroup
                    label="Client Name"
                    type="text"
                    placeholder="Enter your Client name"
                    className="w-full xl:w-3/4"
                    required
                    name="client_name"
                    value={clientName}
                    handleChange={(e) => setClientName(e.target.value)}
                  />

                  <DatePickerOne
                    label="Bill Date"
                    placeholder="Select bill date"
                    type="text"
                    className="w-full xl:w-1/4"
                    required
                    name="bill_date"
                    value={billDate}
                    handleChange={(e) => setBillDate(e.target.value)}
                  />
                </div>

                <InputGroup
                  label="Title"
                  type="text"
                  placeholder="Enter quotation title"
                  className="mb-4.5"
                  required
                  name="title"
                  value={title}
                  handleChange={(e) => setTitle(e.target.value)}
                />

                <label className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-dark">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  Active
                </label>

                <div className="table-responsive overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="w-20 !text-left">S. No.</TableHead>
                        <TableHead className="w-100 !text-left">Items</TableHead>
                        <TableHead className="w-40 !text-center">Quantity</TableHead>
                        <TableHead className="w-30 !text-center">Unit</TableHead>
                        <TableHead className="w-45 !text-center">Rate</TableHead>
                        <TableHead className="w-50 !text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {rows.map((row, index) => {
                        const amount = getAmount(row);
                        const amountDisplay =
                          amount > 0 ? formatIndianAmount(amount) : "";

                        return (
                          <TableRow key={row.id}>
                            <TableCell className="text-lg text-black">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <input
                                placeholder="Item Name"
                                className={INPUT_CLASS}
                                type="text"
                                value={row.item}
                                onChange={(e) =>
                                  handleRowChange(row.id, "item", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                className={INPUT_CLASS}
                                type="number"
                                min="0"
                                step="1"
                                value={row.quantity}
                                onChange={(e) =>
                                  handleRowChange(
                                    row.id,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                className={INPUT_CLASS}
                                type="text"
                                value={row.unit}
                                onChange={(e) =>
                                  handleRowChange(row.id, "unit", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                className={INPUT_CLASS}
                                type="number"
                                min="0"
                                step="0.01"
                                value={row.rate}
                                onChange={(e) =>
                                  handleRowChange(row.id, "rate", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                className="w-full rounded-lg bg-transparent px-5.5 py-3 text-right text-lg text-black outline-none"
                                type="text"
                                value={amountDisplay}
                                readOnly
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {error ? (
                  <p className="mt-4 text-sm font-medium text-red">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="mt-6 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
                >
                  {isEditMode ? "Update" : "Save"}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default InvoiceForm;
