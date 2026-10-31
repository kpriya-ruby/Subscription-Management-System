import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit2, Tag, Check, PackagePlus, AlertCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import { getStoredProducts, saveStoredProducts } from "../../services/demoData";

const PRODUCT_TYPES = ["Software", "Digital service", "Add-on"];

export default function Products() {
  const [products, setProducts] = useState(() => getStoredProducts());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "Software",
    salesPrice: "",
    costPrice: "",
    category: "Software",
    notes: "",
    variants: [{ id: "v1", name: "Standard Edition", extraPrice: 0 }],
  });

  function persistProducts(nextList) {
    setProducts(nextList);
    saveStoredProducts(nextList);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
      const matchType = filterType === "All" || p.type === filterType;
      return matchSearch && matchType;
    });
  }, [products, search, filterType]);

  function handleOpenCreate() {
    setEditingProduct(null);
    setFormData({
      name: "",
      type: "Software",
      salesPrice: "",
      costPrice: "",
      category: "Software",
      notes: "",
      variants: [{ id: "v-def", name: "Standard Edition", extraPrice: 0 }],
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type || "Software",
      salesPrice: product.salesPrice || "",
      costPrice: product.costPrice || "",
      category: product.category || "Software",
      notes: product.notes || "",
      variants: product.variants?.length
        ? JSON.parse(JSON.stringify(product.variants))
        : [{ id: "v-def", name: "Standard Edition", extraPrice: 0 }],
    });
    setIsModalOpen(true);
  }

  function handleAddVariant() {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { id: `v-${Date.now()}`, name: "Odoo Enterprise Edition", extraPrice: 560 },
      ],
    });
  }

  function handleRemoveVariant(idx) {
    if (formData.variants.length === 1) return;
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== idx),
    });
  }

  function handleVariantChange(idx, field, value) {
    const updated = [...formData.variants];
    updated[idx] = { ...updated[idx], [field]: field === "extraPrice" ? Number(value) || 0 : value };
    setFormData({ ...formData, variants: updated });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const salesNum = Number(formData.salesPrice) || 0;
    const costNum = Number(formData.costPrice) || 0;

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              type: formData.type,
              salesPrice: salesNum,
              costPrice: costNum,
              category: formData.type,
              notes: formData.notes,
              variants: formData.variants,
            }
          : p
      );
      persistProducts(updated);
    } else {
      const newProduct = {
        id: `PROD-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        type: formData.type,
        salesPrice: salesNum,
        costPrice: costNum,
        category: formData.type,
        notes: formData.notes,
        variants: formData.variants,
        status: "Active",
      };
      persistProducts([newProduct, ...products]);
    }

    setIsModalOpen(false);
  }

  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter((p) => p.id !== id);
      persistProducts(updated);
    }
  }

  function handleToggleStatus(id) {
    const updated = products.map((p) =>
      p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p
    );
    persistProducts(updated);
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Create and manage the products and variants offered in subscription plans."
        action={
          <button className="primary-button" onClick={handleOpenCreate}>
            <Plus size={16} /> Add product
          </button>
        }
      />

      {/* Filter and Search Bar */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "240px" }}>
            <Search size={16} color="#7b8498" />
            <input
              type="text"
              placeholder="Search products by name or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px 12px",
                width: "100%",
                maxWidth: "340px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Filter:</span>
            {["All", ...PRODUCT_TYPES].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  border: 0,
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: filterType === type ? "#6558d3" : "#f1f5f9",
                  color: filterType === type ? "#ffffff" : "#475569",
                  transition: "0.15s",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Table */}
      <section className="panel table-panel">
        <div className="panel-heading">
          <h2>Product catalogue</h2>
          <span className="muted">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {filteredProducts.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Sales Price</th>
                  <th>Cost Price</th>
                  <th>Gross Margin</th>
                  <th>Variants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const margin =
                    p.salesPrice && p.costPrice
                      ? Math.round(((p.salesPrice - p.costPrice) / p.salesPrice) * 100)
                      : null;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="strong-cell">{p.name}</div>
                        {p.notes && <small style={{ color: "#94a3b8", fontSize: "11px" }}>{p.notes}</small>}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: p.type === "Software" ? "#eff6ff" : p.type === "Add-on" ? "#fef3c7" : "#f3e8ff",
                            color: p.type === "Software" ? "#1d4ed8" : p.type === "Add-on" ? "#b45309" : "#6b21a8",
                          }}
                        >
                          {p.type}
                        </span>
                      </td>
                      <td className="strong-cell">₹{Number(p.salesPrice).toLocaleString("en-IN")}</td>
                      <td>{p.costPrice ? `₹${Number(p.costPrice).toLocaleString("en-IN")}` : "—"}</td>
                      <td>
                        {margin !== null ? (
                          <span style={{ color: margin > 50 ? "#059669" : "#d97706", fontWeight: 700 }}>
                            {margin}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "220px" }}>
                          {p.variants && p.variants.length > 0 ? (
                            p.variants.map((v) => (
                              <span
                                key={v.id || v.name}
                                style={{
                                  fontSize: "10px",
                                  backgroundColor: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "4px",
                                  padding: "2px 6px",
                                  color: "#334155",
                                }}
                              >
                                {v.name} {v.extraPrice > 0 ? `(+₹${v.extraPrice})` : ""}
                              </span>
                            ))
                          ) : (
                            <small className="muted">Standard</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          onClick={() => handleToggleStatus(p.id)}
                          style={{ cursor: "pointer" }}
                          title="Click to toggle status"
                        >
                          <StatusBadge status={p.status || "Active"} />
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="secondary-button"
                            style={{ padding: "5px 8px", fontSize: "11px" }}
                            onClick={() => handleOpenEdit(p)}
                            title="Edit product"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            className="secondary-button"
                            style={{ padding: "5px 8px", fontSize: "11px", color: "#dc2626" }}
                            onClick={() => handleDelete(p.id)}
                            title="Delete product"
                          >
                            <Trash2 size={13} />
                          </button>
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
            title="No matching products found"
            description="Try modifying your search or filter criteria, or add a new product."
          />
        )}
      </section>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Product"}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Product Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Brightloop Cloud ERP"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Product Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "9px 10px",
                  fontSize: "13px",
                  background: "#fff",
                }}
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Sales Price (₹) *
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="2499"
                value={formData.salesPrice}
                onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
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
                Cost Price (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="950"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
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

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Notes & Description
            </label>
            <input
              type="text"
              placeholder="e.g. Business ERP with recurring subscription and updates"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Variant Builder Section (Highlighted in Odoo challenge spec) */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                Product Variants (e.g. Odoo Edition +₹560)
              </span>
              <button
                type="button"
                className="secondary-button"
                style={{ padding: "4px 9px", fontSize: "11px" }}
                onClick={handleAddVariant}
              >
                <Plus size={13} /> Add Variant
              </button>
            </div>

            <div style={{ display: "grid", gap: "8px" }}>
              {formData.variants.map((v, idx) => (
                <div key={v.id || idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Variant name (e.g. Odoo Edition)"
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                    style={{
                      flex: 2,
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      fontSize: "12px",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>+₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="560"
                      value={v.extraPrice}
                      onChange={(e) => handleVariantChange(idx, "extraPrice", e.target.value)}
                      style={{
                        width: "100%",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      style={{ border: 0, background: "transparent", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      title="Remove variant"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {editingProduct ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
