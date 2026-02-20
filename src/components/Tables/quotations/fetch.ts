import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { unstable_noStore as noStore } from "next/cache";

type QuotationItem = {
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
};

export type QuotationRecord = {
  id: string;
  tab_id: number;
  active: boolean;
  client_name: string;
  bill_date: string;
  title: string;
  items: QuotationItem[];
  created_at?: string;
  updated_at?: string;
};

type QuotationDocument = {
  _id: ObjectId;
  tab_id?: number | string;
  active?: boolean;
  client_name?: string;
  bill_date?: string;
  title?: string;
  items?: QuotationItem[];
  created_at?: Date | string;
  updated_at?: Date | string;
};

export async function getQuotations() {
  noStore();
  const db = await getDb();
  const quotationCollection = db.collection<QuotationDocument>("quotation");
  const quotations = await quotationCollection
    .find({})
    .sort({ created_at: -1, _id: -1 })
    .toArray();

  return quotations.map((doc) => ({
    id: doc._id.toString(),
    tab_id: Number(doc.tab_id || 0),
    active: Boolean(doc.active ?? true),
    client_name: doc.client_name || "",
    bill_date: doc.bill_date || "",
    title: doc.title || "",
    items: Array.isArray(doc.items) ? doc.items : [],
    created_at: doc.created_at
      ? new Date(doc.created_at).toISOString()
      : undefined,
    updated_at: doc.updated_at
      ? new Date(doc.updated_at).toISOString()
      : undefined,
  }));
}
