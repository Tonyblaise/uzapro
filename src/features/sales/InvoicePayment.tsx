"use client";
/**
 * "Record payment" on an invoice (FR-016a): the shared customer payment form from Receivables,
 * opened for the invoice's customer with its receivable already ticked.
 */
import { useReceivables, useInvoices } from "@/data";
import { PaymentForm } from "@/features/receivables";

export function InvoicePayment({ invoice, onClose }: { invoice: string; onClose: () => void }) {
  const receivables = useReceivables();
  const invoices = useInvoices();
  const inv = invoices.find((i) => i.number === invoice);
  const rcv = receivables.find((r) => r.doc === invoice && r.balance > 0);
  if (!inv) return null;
  return <PaymentForm side="rcv" open onClose={onClose} initial={{ party: inv.customer, selected: rcv ? [rcv.ref] : [] }} />;
}

/** True when the invoice still has an open receivable to pay. */
export function useInvoicePayable(invoice: string | null): boolean {
  const receivables = useReceivables();
  return !!invoice && receivables.some((r) => r.doc === invoice && r.balance > 0);
}
