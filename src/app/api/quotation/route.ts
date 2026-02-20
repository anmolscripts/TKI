import { getDb } from "@/lib/mongodb";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

type QuotationItemInput = {
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
};

type SaveQuotationRequest = {
  client_name?: string;
  bill_date?: string;
  title?: string;
  items?: QuotationItemInput[];
  active?: boolean;
};

type DbUser = {
  email?: string;
  emailLower?: string;
  user?: string;
  tab_id?: string | number;
};

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as SaveQuotationRequest;
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
  const usersCollection = db.collection<DbUser>(
    process.env.AUTH_USERS_COLLECTION || "users",
  );
  const quotationCollection = db.collection("quotation");

  const sessionEmailLower = (session.email || "").toLowerCase();
  const user = await usersCollection.findOne({
    $or: [
      { emailLower: sessionEmailLower },
      { email: sessionEmailLower },
      { user: session.name || session.email },
      { user: sessionEmailLower },
    ],
  });

  const now = new Date();
  const actor = session.name || session.email;
  const lastQuotation = await quotationCollection
    .find(
      {},
      {
        projection: {
          tab_id: 1,
        },
      },
    )
    .sort({ tab_id: -1 })
    .limit(1)
    .next();

  const lastTabIdNumber = Number(lastQuotation?.tab_id || 0);
  const nextTabId = Number.isFinite(lastTabIdNumber) ? lastTabIdNumber + 1 : 1;

  const result = await quotationCollection.insertOne({
    tab_id: nextTabId,
    user_tab_id: user?.tab_id ?? null,
    active: Boolean(active),
    client_name: clientName,
    bill_date: billDate,
    title,
    items: sanitizedItems,
    created_at: now,
    created_by: actor,
    updated_at: now,
    updated_by: actor,
  });

  return NextResponse.json({
    success: true,
    id: result.insertedId.toString(),
  });
}
