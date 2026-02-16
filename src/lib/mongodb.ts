import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);

const clientPromise =
  global.__mongoClientPromise ||
  client.connect().then((connectedClient) => {
    global.__mongoClientPromise = Promise.resolve(connectedClient);
    return connectedClient;
  });

export async function getDb() {
  const connectedClient = await clientPromise;
  const dbName = process.env.MONGODB_DB || "THEKITCHENINVENTORY";
  return connectedClient.db(dbName);
}
