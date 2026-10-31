import { useState } from "react";
import { Plus, Edit2, Trash2, Check, Clock, Calendar, CheckCircle2, Shield, Layers, LayoutGrid, List } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import { getStoredPlans, saveStoredPlans } from "../../services/demoData";

const BILLING_CYCLES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function Plans() {
  const [plansList, setPlansList] = useState(() => getStoredPlans());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly",
    minQuantity: 1,
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    allowPause: true,
    allowRenewal: true,
    autoCloseAtEnd: false,
    status: "Active",
    features: ["Core features", "Standard support", "Automated recurring billing"],
  });

  const [newFeature, setNewFeature] = useState("");

  function persistPlans(next) {
    setPlansList(next);
    saveStoredPlans(next);
  }

  function handleOpenCreate() {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      billingCycle: "monthly",
      minQuantity: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2027-12-31",
      allowPause: true,
      allowRenewal: true,
      autoCloseAtEnd: false,
      status: "Active",
      features: ["Core business features", "Email & chat support", "Automated recurring billing"],
    });
    setNewFeature("");
    setIsModalOpen(true);
  }

  function handleOpenEdit(plan) {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price || "",
      billingCycle: plan.billingCycle || plan.cycle || "monthly",
      minQuantity: plan.minQuantity || 1,
      startDate: plan.startDate || "2026-01-01",
      endDate: plan.endDate || "2027-12-31",
      allowPause: plan.allowPause !== undefined ? plan.allowPause : true,
      allowRenewal: plan.allowRenewal !== undefined ? plan.allowRenewal : true,
      autoCloseAtEnd: Boolean(plan.autoCloseAtEnd),
      status: plan.status || "Active",
      features: plan.features ? [...plan.features] : [],
    });
    setNewFeature("");
    setIsModalOpen(true);
  }

  function handleAddFeature() {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  }

  function handleRemoveFeature(idx) {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== idx),
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const priceNum = Number(formData.price) || 0;
    const minQtyNum = Number(formData.minQuantity) || 1;

    if (editingPlan) {
      const updated = plansList.map((p) =>
        p.id === editingPlan.id
          ? {
              ...p,
              name: formData.name,
              description: formData.description,
              price: priceNum,
              cycle: formData.billingCycle === "yearly" ? "year" : formData.billingCycle === "weekly" ? "week" : formData.billingCycle === "daily" ? "day" : "month",
              billingCycle: formData.billingCycle,
              minQuantity: minQtyNum,
              startDate: formData.startDate,
              endDate: formData.endDate,
              allowPause: formData.allowPause,
              allowRenewal: formData.allowRenewal,
              autoCloseAtEnd: formData.autoCloseAtEnd,
              status: formData.status,
              features: formData.features,
            }
          : p
      );
      persistPlans(updated);
    } else {
      const newPlan = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        price: priceNum,
        cycle: formData.billingCycle === "yearly" ? "year" : formData.billingCycle === "weekly" ? "week" : formData.billingCycle === "daily" ? "day" : "month",
        billingCycle: formData.billingCycle,
        minQuantity: minQtyNum,
        startDate: formData.startDate,
        endDate: formData.endDate,
        allowPause: formData.allowPause,
        allowRenewal: formData.allowRenewal,
        autoCloseAtEnd: formData.autoCloseAtEnd,
        status: "Active",
        features: formData.features,
      };
      persistPlans([...plansList, newPlan]);
    }

    setIsModalOpen(false);
  }

  function handleDelete(id) {
    if (window.confirm("Are you sure you want to remove this plan?")) {
      persistPlans(plansList.filter((p) => p.id !== id));
    }
  }

  function handleToggleStatus(id) {
    const updated = plansList.map((p) =>
      p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p
    );
    persistPlans(updated);
  }

  return (
    <>
      <PageHeader
        title="Subscription plans"
        description="Configure pricing, billing frequency (daily, weekly, monthly, yearly), minimum quantities, and renewal rules."
        action={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", background: "#edeef4", padding: "3px", borderRadius: "8px" }}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  border: 0,
                  background: viewMode === "grid" ? "#fff" : "transparent",
                  color: viewMode === "grid" ? "#182033" : "#64748b",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
                title="Cards view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                style={{
                  border: 0,
                  background: viewMode === "table" ? "#fff" : "transparent",
                  color: viewMode === "table" ? "#182033" : "#64748b",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
                title="Table view"
              >
                <List size={15} />
              </button>
            </div>
            <button className="primary-button" onClick={handleOpenCreate}>
              <Plus size={16} /> Create plan
            </button>
          </div>
        }
      />

      {viewMode === "grid" ? (
        <div className="plans-grid">
          {plansList.map((p) => (
            <article className="plan-card" key={p.id} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="eyebrow">BRIGHTLOOP PLAN</span>
                <span
                  onClick={() => handleToggleStatus(p.id)}
                  style={{ cursor: "pointer" }}
                  title="Click to toggle status"
                >
                  <StatusBadge status={p.status || "Active"} />
                </span>
              </div>

              <h2>{p.name}</h2>
              <p className="muted">{p.description}</p>

              <div className="plan-price">
                ₹{Number(p.price).toLocaleString("en-IN")}
                <span> / {p.billingCycle || p.cycle}</span>
              </div>

              {/* Policy Pills as specified in the hackathon instructions */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    padding: "3px 7px",
                    borderRadius: "4px",
                  }}
                >
                  Min Qty: {p.minQuantity || 1}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    backgroundColor: p.allowPause ? "#ecfdf5" : "#fef2f2",
                    color: p.allowPause ? "#065f46" : "#991b1b",
                    padding: "3px 7px",
                    borderRadius: "4px",
                  }}
                >
                  {p.allowPause ? "Pausable" : "No Pause"}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    backgroundColor: p.autoCloseAtEnd ? "#fff7ed" : "#eff6ff",
                    color: p.autoCloseAtEnd ? "#9a3412" : "#1e40af",
                    padding: "3px 7px",
                    borderRadius: "4px",
                  }}
                >
                  {p.autoCloseAtEnd ? "Auto-Closes" : "Renewable"}
                </span>
              </div>

              <ul style={{ flex: 1 }}>
                {p.features && p.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>

              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button
                  className="secondary-button"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenEdit(p)}
                >
                  <Edit2 size={14} /> Manage plan
                </button>
                <button
                  className="secondary-button"
                  style={{ color: "#dc2626", padding: "10px" }}
                  onClick={() => handleDelete(p.id)}
                  title="Delete plan"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="panel table-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Billing Frequency</th>
                  <th>Price</th>
                  <th>Min Qty</th>
                  <th>Lifecycle Rules</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plansList.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="strong-cell">{p.name}</div>
                      <small className="muted">{p.description}</small>
                    </td>
                    <td>
                      <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                        {p.billingCycle || p.cycle}
                      </span>
                    </td>
                    <td className="strong-cell">₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td>{p.minQuantity || 1}</td>
                    <td>
                      <small style={{ color: "#64748b" }}>
                        {p.allowPause ? "Pause: Yes" : "Pause: No"} • {p.autoCloseAtEnd ? "Auto-Close" : "Renewable"}
                      </small>
                    </td>
                    <td>
                      <StatusBadge status={p.status || "Active"} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="secondary-button"
                          style={{ padding: "5px 9px", fontSize: "11px" }}
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="secondary-button"
                          style={{ padding: "5px 9px", fontSize: "11px", color: "#dc2626" }}
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Plan Modal (Configure Frequency, Rules, Pricing) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? `Manage Plan: ${editingPlan.name}` : "Create Subscription Plan"}
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Plan Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Professional Growth"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Short Description
            </label>
            <input
              type="text"
              placeholder="e.g. For growing teams that need automated billing"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Price (₹) *
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="1499"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Billing Frequency *
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                style={{
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "9px 10px",
                  fontSize: "13px",
                  background: "#fff",
                }}
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Min Quantity
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                style={{
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Lifecycle & Policy Checkboxes (Highlighted in Odoo challenge spec) */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "8px", display: "grid", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
              Subscription Lifecycle Rules
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.allowPause}
                  onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                />
                Allow customers to pause
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.allowRenewal}
                  onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                />
                Allow self-renewal
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.autoCloseAtEnd}
                  onChange={(e) => setFormData({ ...formData, autoCloseAtEnd: e.target.checked })}
                />
                Auto-close on expiration
              </label>
            </div>
          </div>

          {/* Feature Bullets Editor */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Plan Features Included
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="e.g. Priority phone support"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                style={{
                  flex: 1,
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={handleAddFeature}
                style={{ padding: "8px 14px", fontSize: "12px" }}
              >
                Add
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {formData.features.map((feat, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#f1f5f9",
                    padding: "3px 9px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#334155",
                  }}
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    style={{
                      border: 0,
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      fontSize: "12px",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {editingPlan ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
