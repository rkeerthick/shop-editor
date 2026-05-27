"use client";

export function InvoiceToolbar({ invoiceNo, orderId }: { invoiceNo: string; orderId: string }) {
  return (
    <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
      <span className="text-sm font-medium">Invoice {invoiceNo}</span>
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Print / Save as PDF
        </button>
        <a
          href={`/dashboard/orders/${orderId}`}
          className="text-slate-300 hover:text-white text-sm py-1.5"
        >
          ← Back to order
        </a>
      </div>
    </div>
  );
}
