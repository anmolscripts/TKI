import { getDb } from "@/lib/mongodb";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

type QuotationItemInput = {
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
};

type UpdateQuotationRequest = {
  client_name?: string;
  bill_date?: string;
  title?: string;
  items?: QuotationItemInput[];
  active?: boolean;
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid quotation id." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as UpdateQuotationRequest;
  const clientName = (body.client_name || "").trim();
  const billDate = (body.bill_date || "").trim();
  const title = (body.title || "").trim();
  const items = Array.isArray(body.items) ? body.items : [];
  const active = body.active ?? true;

  if (!clientName || !billDate || !title || items.length === 0) {
    return NextResponse.json(
      { success: false, message: "Missing required fields." },
      { status: 400 },
    );
  }

  const sanitizedItems = items
    .map((item) => ({
      item: (item.item || "").trim(),
      unit: (item.unit || "").trim(),
      quantity: Number(item.quantity || 0),
      rate: Number(item.rate || 0),
      amount: Number(item.amount || 0),
    }))
    .filter((item) => item.item && item.quantity > 0 && item.rate > 0);

  if (sanitizedItems.length === 0) {
    return NextResponse.json(
      { success: false, message: "At least one valid item is required." },
      { status: 400 },
    );
  }

  const db = await getDb();
  const quotationCollection = db.collection("quotation");
  const now = new Date();
  const actor = session.name || session.email;

  const result = await quotationCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        client_name: clientName,
        bill_date: billDate,
        title,
        items: sanitizedItems,
        active: Boolean(active),
        updated_at: now,
        updated_by: actor,
      },
    },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { success: false, message: "Quotation not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
