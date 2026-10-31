import { useState, useMemo } from "react";
import {
  Search,
  Printer,
  CheckCircle2,
  Send,
  Zap,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import {
  getStoredInvoices,
  saveStoredInvoices,
  generateBillingDayInvoices,
  demoCompany,
} from "../../services/demoData";

const INVOICE_FILTERS = ["All", "Pending", "Paid", "Overdue", "Draft"];

export default function Invoices() {
  const [invoices, setInvoices] = useState(() => getStoredInvoices());
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [bannerNotice, setBannerNotice] = useState("");

  function persistInvoices(nextList) {
    setInvoices(nextList);
    saveStoredInvoices(nextList);
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (inv.company && inv.company.toLowerCase().includes(search.toLowerCase()));

      const matchFilter =
        activeFilter === "All" ||
        inv.status.toLowerCase() === activeFilter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [invoices, search, activeFilter]);

  function handleRunBillingDay() {
    const res = generateBillingDayInvoices();
    if (res.success) {
      setInvoices(getStoredInvoices());
      setBannerNotice(`Successfully generated ${res.count} invoices for today's billing cycle.`);
    } else {
      setBannerNotice(res.message || "Active subscriptions are already up to date.");
    }
    setTimeout(() => setBannerNotice(""), 5000);
  }

  function handleConfirmDraft(invoiceId) {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: "Pending" } : inv
    );
    persistInvoices(updated);
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: "Pending" });
    }
    setBannerNotice(`Invoice ${invoiceId} confirmed and moved to Pending.`);
    setTimeout(() => setBannerNotice(""), 4000);
  }

  function handleSendInvoice(invoiceId, email) {
    setBannerNotice(`Invoice ${invoiceId} successfully dispatched to ${email || "customer"}.`);
    setTimeout(() => setBannerNotice(""), 4000);
  }

  function handleMarkAsPaid(invoiceId) {
    const today = new Date().toISOString().split("T")[0];
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: "Paid", paidDate: today } : inv
    );
    persistInvoices(updated);
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: "Paid", paidDate: today });
    }
    setBannerNotice(`Invoice ${invoiceId} marked as Paid.`);
    setTimeout(() => setBannerNotice(""), 4000);
  }

  function handleCancelInvoice(invoiceId) {
    if (window.confirm(`Are you sure you want to cancel invoice ${invoiceId}?`)) {
      const updated = invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "Cancelled" } : inv
      );
      persistInvoices(updated);
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: "Cancelled" });
      }
    }
  }

  function handlePrintInvoice() {
    window.print();
  }

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Review billing documents, monitor outstanding balances, and generate recurring invoices."
        action={
          <button
            className="primary-button"
            onClick={handleRunBillingDay}
            title="Generate invoices for all due active subscriptions"
          >
            <Zap size={16} /> Run Billing Day Invoices
          </button>
        }
      />

      {bannerNotice && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Search and Status Filter Bar */}
      <section className="panel" style={{ padding: "16px 20px", marginBottom: "18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#7b8498" />
            <input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px 12px",
                width: "100%",
                maxWidth: "360px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginRight: "4px" }}>Status:</span>
            {INVOICE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  border: 0,
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: activeFilter === f ? "#6558d3" : "#f1f5f9",
                  color: activeFilter === f ? "#ffffff" : "#475569",
                  transition: "0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Invoice Register Table */}
      <section className="panel table-panel">
        <div className="panel-heading">
          <h2>Invoice register</h2>
          <span className="muted">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
        </div>

        {filteredInvoices.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Plan & Cycle</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="strong-cell">{inv.id}</td>
                    <td>
                      <div className="strong-cell">{inv.customerName}</div>
                      <small style={{ color: "#94a3b8", fontSize: "11px" }}>{inv.company || inv.customerEmail}</small>
                    </td>
                    <td>{inv.planName}</td>
                    <td>{inv.issueDate}</td>
                    <td>{inv.dueDate}</td>
                    <td className="strong-cell" style={{ color: "#182033" }}>
                      ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button
                          className="secondary-button"
                          style={{ padding: "5px 8px", fontSize: "11px" }}
                          onClick={() => setSelectedInvoice(inv)}
                          title="View and print invoice"
                        >
                          <Eye size={13} /> View
                        </button>

                        {inv.status === "Draft" && (
                          <button
                            className="secondary-button"
                            style={{ padding: "5px 8px", fontSize: "11px", color: "#1d4ed8" }}
                            onClick={() => handleConfirmDraft(inv.id)}
                            title="Confirm Draft"
                          >
                            Confirm
                          </button>
                        )}

                        {inv.status !== "Paid" && inv.status !== "Cancelled" && (
                          <button
                            className="secondary-button"
                            style={{ padding: "5px 8px", fontSize: "11px", color: "#059669" }}
                            onClick={() => handleMarkAsPaid(inv.id)}
                            title="Mark as Paid"
                          >
                            Paid
                          </button>
                        )}

                        <button
                          className="secondary-button"
                          style={{ padding: "5px 8px", fontSize: "11px" }}
                          onClick={() => handleSendInvoice(inv.id, inv.customerEmail)}
                          title="Send to customer"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching invoices found"
            description="Adjust your search or filter options, or click 'Run Billing Day Invoices' to generate invoices."
          />
        )}
      </section>

      {/* View / Print Invoice Modal */}
      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice: ${selectedInvoice.id}` : "Invoice View"}
        maxWidth="720px"
      >
        {selectedInvoice && (
          <div style={{ display: "grid", gap: "18px" }}>
            {/* Printable Invoice Sheet Container */}
            <div
              id="printable-invoice-content"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "24px",
                fontSize: "13px",
              }}
            >
              {/* Header with Demo Company and GSTIN */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "2px solid #edf0f5",
                  paddingBottom: "18px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        backgroundColor: "#6558d3",
                        color: "#fff",
                        borderRadius: "8px",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: "15px",
                      }}
                    >
                      B
                    </span>
                    <strong style={{ fontSize: "18px", color: "#182033" }}>{demoCompany.name}</strong>
                  </div>
                  <div style={{ color: "#64748b", fontSize: "12px", lineHeight: "1.5" }}>
                    <div>{demoCompany.address}</div>
                    <div>Email: {demoCompany.email} | Phone: {demoCompany.phone}</div>
                    <div style={{ fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
                      GSTIN: DEMO-GSTIN-NOT-REAL
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#6558d3",
                      letterSpacing: "-0.5px",
                      display: "block",
                    }}
                  >
                    TAX INVOICE
                  </span>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", marginTop: "4px" }}>
                    {selectedInvoice.id}
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>
              </div>

              {/* Billed To & Dates Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "18px",
                  marginBottom: "20px",
                  backgroundColor: "#f8fafc",
                  padding: "14px",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <small style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>
                    BILLED TO:
                  </small>
                  <div style={{ fontWeight: 800, color: "#182033", fontSize: "14px", marginTop: "3px" }}>
                    {selectedInvoice.customerName}
                  </div>
                  <div style={{ color: "#475569", fontSize: "12px" }}>{selectedInvoice.company}</div>
                  <div style={{ color: "#64748b", fontSize: "12px" }}>{selectedInvoice.customerEmail}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Issue Date:</span>
                    <strong>{selectedInvoice.issueDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Due Date:</span>
                    <strong>{selectedInvoice.dueDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Payment Method:</span>
                    <span>{selectedInvoice.paymentMethod || "Pending"}</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Cycle:</span>
                    <span>{selectedInvoice.billingCycle || "Standard"}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Products Table */}
              <table style={{ width: "100%", marginBottom: "16px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px" }}>Description</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px" }}>Qty</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px" }}>Unit Price</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px", fontWeight: 600, color: "#1e293b" }}>{item.description}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          ₹{Number(item.unitPrice).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>
                          ₹{Number(item.total).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={{ padding: "10px" }}>{selectedInvoice.planName}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        ₹{Number(selectedInvoice.subtotal).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>
                        ₹{Number(selectedInvoice.subtotal).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ marginLeft: "auto", width: "260px", display: "grid", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "12px" }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>
                    ₹{Number(selectedInvoice.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>

                {selectedInvoice.discountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#059669", fontSize: "12px" }}>
                    <span>Discount:</span>
                    <span>-₹{Number(selectedInvoice.discountAmount).toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "12px" }}>
                  <span>Demo GST (18%):</span>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>
                    ₹{Number(selectedInvoice.taxAmount).toLocaleString("en-IN")}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "2px solid #edf0f5",
                    paddingTop: "8px",
                    marginTop: "4px",
                    fontWeight: 800,
                    fontSize: "15px",
                    color: "#182033",
                  }}
                >
                  <span>Total Due:</span>
                  <span style={{ color: "#6558d3" }}>
                    ₹{Number(selectedInvoice.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {selectedInvoice.status === "Paid" && selectedInvoice.paidDate && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "8px 12px",
                    backgroundColor: "#ecfdf5",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#065f46",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle2 size={16} /> Paid in full on {selectedInvoice.paidDate} via{" "}
                  {selectedInvoice.paymentMethod}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="secondary-button" onClick={handlePrintInvoice} title="Print or Save PDF">
                <Printer size={16} /> Print / Save PDF
              </button>

              <div style={{ display: "flex", gap: "8px" }}>
                {selectedInvoice.status === "Draft" && (
                  <button className="primary-button" onClick={() => handleConfirmDraft(selectedInvoice.id)}>
                    Confirm Draft
                  </button>
                )}

                {selectedInvoice.status !== "Paid" && selectedInvoice.status !== "Cancelled" && (
                  <button
                    className="primary-button"
                    style={{ backgroundColor: "#059669" }}
                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                  >
                    Mark as Paid
                  </button>
                )}

                <button className="secondary-button" onClick={() => setSelectedInvoice(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
