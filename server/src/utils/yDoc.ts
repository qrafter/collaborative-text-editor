import * as Y from "yjs";
import { In } from "typeorm";
import appDataSource from "src/db/datasource";
import Document from "src/entities/document.entity";

// Y-websocket has no TypeScript support, so we need to use require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WSSharedDoc } = require("y-websocket/bin/utils");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type SharedDoc = WSSharedDoc;

export const Y_DOC_CONFIG = {
  saveInterval: 10 * 1000, // 10 seconds
  inactiveThreshold: 60 * 60 * 1000, // 1 hour in milliseconds
};

export async function loadDocument(
  docId: string,
  docs: Map<string, SharedDoc>
): Promise<void> {
  const doc = docs.get(docId);

  // Check first if there's an existing doc in memory
  // Take note that there should always be an existing document in the database
  const documentRepo = appDataSource.getRepository(Document);
  const existingDoc = await documentRepo.findOne({ where: { id: docId } });

  if (!existingDoc) {
    throw new Error(`Document does not exist in the database: ${docId}`);
  }

  if (doc) {
    // If there is get the latest snapshot from the database and apply it
    if (existingDoc && existingDoc.snapshot) {
      Y.applyUpdate(doc, existingDoc.snapshot);
      console.log(`Loaded snapshot on existing document: ${docId}`);
    }
    return;
  }

  // If there is no existing doc in memory, create a new one
  if (!doc) {
    const newDoc = new WSSharedDoc(docId);
    docs.set(docId, newDoc);
    Y.applyUpdate(newDoc, new Uint8Array(existingDoc.snapshot));
    console.log(
      `Creating new document in memory: ${docId}. Total docs: ${docs.size}`
    );
  }
}

// Optmize to only save YJS docs with active connections
export async function saveSnapshots(
  docs?: Map<string, SharedDoc>
): Promise<void> {
  if (!docs || docs.size === 0) {
    console.log("No documents to process.");
    return;
  }

  const documentRepo = appDataSource.getRepository(Document);

  // Filter docs with active connections
  const activeDocEntries = docs
    ? Array.from(docs.entries()).filter(([, doc]) => doc.conns.size > 0)
    : [];
  const activeDocIds = activeDocEntries.map(([docId]) => docId);

  if (activeDocIds.length === 0) {
    console.log("No active documents to save.");
    return;
  }

  const existingDocs = await documentRepo.find({
    where: { id: In(activeDocIds) },
    select: ["id"],
  });

  const existingDocIds = new Set(existingDocs.map((doc) => doc.id));

  const updates: Partial<Document>[] = [];
  const inserts: Partial<Document>[] = [];

  for (const [docId, doc] of activeDocEntries) {
    const snapshot = Y.encodeStateAsUpdate(doc);

    if (existingDocIds.has(docId)) {
      updates.push({ id: docId, snapshot: Buffer.from(snapshot) });
    } else {
      inserts.push({ id: docId, snapshot: Buffer.from(snapshot) });
    }
  }

  if (updates.length > 0) {
    await documentRepo.save(updates);
  }

  if (inserts.length > 0) {
    await documentRepo.insert(inserts);
  }

  console.log(
    `Saved snapshots for ${activeDocIds.length} active documents (${updates.length} updated, ${inserts.length} inserted)`
  );
}

export function updateLastModified(doc: SharedDoc): void {
  if (!doc.meta) {
    doc.meta = new Map();
  }
  doc.meta.set("lastModified", Date.now());
}

export function clearInactiveDocs(docs: Map<string, SharedDoc>): void {
  const now = Date.now();
  for (const [docId, doc] of docs as Map<string, SharedDoc>) {
    const connections = doc.conns.size;
    const lastModified = (doc.meta?.get("lastModified") as number) || 0;
    if (
      connections === 0 &&
      now - lastModified > Y_DOC_CONFIG.inactiveThreshold
    ) {
      docs.delete(docId);
      console.log(`Cleared inactive doc: ${docId}`);
    }
  }
}
