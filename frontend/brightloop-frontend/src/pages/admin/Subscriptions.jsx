import { useState, useMemo } from "react";
import {
  Search,
  Pause,
  Play,
  XCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ShieldAlert,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import {
  getStoredSubscriptions,
  saveStoredSubscriptions,
  getStoredPlans,
} from "../../services/demoData";

const SUB_FILTERS = ["All", "Active", "Paused", "Closed"];

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState(() => getStoredSubscriptions());
  const [plansList] = useState(() => getStoredPlans());
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState(null);
  const [notice, setNotice] = useState("");

  function persistSubs(next) {
    setSubscriptions(next);
    saveStoredSubscriptions(next);
  }

  // Find corresponding plan for lifecycle policies
  function getPlanPolicy(planName) {
    const found = plansList.find(
      (p) => p.name.toLowerCase() === (planName || "").toLowerCase()
    );
    return found || { allowPause: true, allowRenewal: true, autoCloseAtEnd: false };
  }

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch =
        s.subscriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (s.company && s.company.toLowerCase().includes(search.toLowerCase())) ||
        s.planName.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        activeFilter === "All" ||
        s.status.toLowerCase() === activeFilter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [subscriptions, search, activeFilter]);

  function handlePauseSubscription(sub) {
    const policy = getPlanPolicy(sub.planName);
    if (policy.allowPause === false) {
      alert(`The plan "${sub.planName}" is configured as non-pausable per its subscription contract terms.`);
      return;
    }

    const updated = subscriptions.map((item) =>
      item.id === sub.id ? { ...item, status: "Paused" } : item
    );
    persistSubs(updated);
    if (selectedSub && selectedSub.id === sub.id) {
      setSelectedSub({ ...selectedSub, status: "Paused" });
    }
    setNotice(`Subscription ${sub.subscriptionNumber} has been paused.`);
    setTimeout(() => setNotice(""), 4000);
  }

  function handleResumeSubscription(sub) {
    const updated = subscriptions.map((item) =>
      item.id === sub.id ? { ...item, status: "Active" } : item
    );
    persistSubs(updated);
    if (selectedSub && selectedSub.id === sub.id) {
      setSelectedSub({ ...selectedSub, status: "Active" });
    }
    setNotice(`Subscription ${sub.subscriptionNumber} is now Active.`);
    setTimeout(() => setNotice(""), 4000);
  }

  function handleCloseSubscription(sub) {
    if (window.confirm(`Are you sure you want to close and cancel subscription ${sub.subscriptionNumber}?`)) {
      const updated = subscriptions.map((item) =>
        item.id === sub.id ? { ...item, status: "Closed", autoRenew: false } : item
      );
      persistSubs(updated);
      if (selectedSub && selectedSub.id === sub.id) {
        setSelectedSub({ ...selectedSub, status: "Closed", autoRenew: false });
      }
      setNotice(`Subscription ${sub.subscriptionNumber} has been Closed.`);
      setTimeout(() => setNotice(""), 4000);
    }
  }

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Monitor active customer contracts, paused accounts, renewals, and lifecycle status."
      />

      {notice && (
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
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Panel */}
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
              placeholder="Search by subscription number, customer, plan..."
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

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginRight: "4px" }}>Status:</span>
            {SUB_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  border: 0,
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: activeFilter === filter ? "#6558d3" : "#f1f5f9",
                  color: activeFilter === filter ? "#ffffff" : "#475569",
                  transition: "0.15s",
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Subscriptions Table */}
      <section className="panel table-panel">
        <div className="panel-heading">
          <h2>All subscriptions</h2>
          <span className="muted">
            Showing {filteredSubs.length} of {subscriptions.length} records
          </span>
        </div>

        {filteredSubs.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Subscription #</th>
                  <th>Customer</th>
                  <th>Plan & Variant</th>
                  <th>Billing Frequency</th>
                  <th>Recurring Total</th>
                  <th>Next Billing Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((sub) => {
                  const policy = getPlanPolicy(sub.planName);

                  return (
                    <tr key={sub.id}>
                      <td className="strong-cell">{sub.subscriptionNumber}</td>
                      <td>
                        <div className="strong-cell">{sub.customerName}</div>
                        <small style={{ color: "#94a3b8", fontSize: "11px" }}>{sub.company || sub.customerEmail}</small>
                      </td>
                      <td>
                        <div>{sub.planName}</div>
                        {sub.selectedVariant && (
                          <small style={{ color: "#6558d3", fontSize: "11px", fontWeight: 600 }}>
                            {sub.selectedVariant}
                          </small>
                        )}
                      </td>
                      <td>
                        <span style={{ textTransform: "capitalize" }}>{sub.billingCycle}</span>
                      </td>
                      <td className="strong-cell">₹{Number(sub.totalAmount).toLocaleString("en-IN")}</td>
                      <td>{sub.nextBillingDate}</td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            className="secondary-button"
                            style={{ padding: "5px 8px", fontSize: "11px" }}
                            onClick={() => setSelectedSub(sub)}
                            title="View subscription details"
                          >
                            <Eye size={13} /> View
                          </button>

                          {sub.status === "Active" && (
                            <button
                              className="secondary-button"
                              style={{
                                padding: "5px 8px",
                                fontSize: "11px",
                                color: policy.allowPause ? "#d97706" : "#94a3b8",
                              }}
                              onClick={() => handlePauseSubscription(sub)}
                              title={policy.allowPause ? "Pause subscription" : "Plan contract does not permit pause"}
                            >
                              <Pause size={12} /> Pause
                            </button>
                          )}

                          {sub.status === "Paused" && (
                            <button
                              className="secondary-button"
                              style={{ padding: "5px 8px", fontSize: "11px", color: "#059669" }}
                              onClick={() => handleResumeSubscription(sub)}
                              title="Resume subscription"
                            >
                              <Play size={12} /> Resume
                            </button>
                          )}

                          {sub.status !== "Closed" && (
                            <button
                              className="secondary-button"
                              style={{ padding: "5px 8px", fontSize: "11px", color: "#dc2626" }}
                              onClick={() => handleCloseSubscription(sub)}
                              title="Close / Cancel subscription"
                            >
                              <XCircle size={12} /> Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching subscriptions"
            description="Try adjusting your status filter or search query."
          />
        )}
      </section>

      {/* Subscription Detail Modal */}
      <Modal
        isOpen={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        title={selectedSub ? `Subscription: ${selectedSub.subscriptionNumber}` : "Subscription Details"}
        maxWidth="620px"
      >
        {selectedSub && (
          <div style={{ display: "grid", gap: "16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "10px",
                fontSize: "13px",
              }}
            >
              <div>
                <small style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Customer</small>
                <div style={{ fontWeight: 800, fontSize: "15px", color: "#182033" }}>{selectedSub.customerName}</div>
                <div style={{ color: "#475569", fontSize: "12px" }}>{selectedSub.company}</div>
                <div style={{ color: "#64748b", fontSize: "12px" }}>{selectedSub.customerEmail}</div>
              </div>

              <div>
                <small style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Current Status</small>
                <div style={{ marginTop: "4px" }}>
                  <StatusBadge status={selectedSub.status} />
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#475569" }}>
                  Auto-Renewal: <strong>{selectedSub.autoRenew ? "Enabled" : "Disabled"}</strong>
                </div>
              </div>

              <div>
                <small style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Plan & Cycle</small>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>{selectedSub.planName}</div>
                <div style={{ color: "#64748b", fontSize: "12px", textTransform: "capitalize" }}>
                  Billed {selectedSub.billingCycle} (Qty: {selectedSub.quantity || 1})
                </div>
                {selectedSub.selectedVariant && (
                  <div style={{ color: "#6558d3", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                    {selectedSub.selectedVariant}
                  </div>
                )}
              </div>

              <div>
                <small style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Recurring Charge</small>
                <div style={{ fontWeight: 800, fontSize: "18px", color: "#6558d3" }}>
                  ₹{Number(selectedSub.totalAmount).toLocaleString("en-IN")}
                </div>
                <small style={{ color: "#94a3b8", fontSize: "11px" }}>Includes 18% demo GST</small>
              </div>

              <div>
                <small style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Start Date</small>
                <div>{selectedSub.startDate}</div>
              </div>

              <div>
                <small style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Next Billing / Expiry</small>
                <div>
                  <strong>{selectedSub.nextBillingDate}</strong> (Expires {selectedSub.expiryDate})
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {selectedSub.status === "Active" && (
                  <button
                    className="secondary-button"
                    style={{ color: "#d97706" }}
                    onClick={() => handlePauseSubscription(selectedSub)}
                  >
                    <Pause size={14} /> Pause
                  </button>
                )}

                {selectedSub.status === "Paused" && (
                  <button
                    className="secondary-button"
                    style={{ color: "#059669" }}
                    onClick={() => handleResumeSubscription(selectedSub)}
                  >
                    <Play size={14} /> Resume
                  </button>
                )}

                {selectedSub.status !== "Closed" && (
                  <button
                    className="secondary-button"
                    style={{ color: "#dc2626" }}
                    onClick={() => handleCloseSubscription(selectedSub)}
                  >
                    <XCircle size={14} /> Close Subscription
                  </button>
                )}
              </div>

              <button className="secondary-button" onClick={() => setSelectedSub(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
