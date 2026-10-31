import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CreditCard, Users, Activity, FileText, Plus, Zap, CheckCircle2, Package, Layers } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import { stats, revenueData, yearlyRevenueData, transactions, generateBillingDayInvoices } from "../../services/demoData";

const icons = [CreditCard, Activity, Users, FileText];

export default function Dashboard() {
  const [period, setPeriod] = useState("Last 6 months");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [billingNotice, setBillingNotice] = useState("");

  const activeChartData = period === "This year" ? (yearlyRevenueData || revenueData) : revenueData;

  function handleExportReport() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Invoice,Customer,Plan,Amount,Status"]
        .concat(transactions.map((t) => `${t.id},"${t.customer}","${t.plan}",${t.amount},${t.status}`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brightloop-revenue-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleTriggerBilling() {
    const res = generateBillingDayInvoices();
    if (res.success) {
      setBillingNotice(`Generated ${res.count} invoices for today's billing cycle.`);
    } else {
      setBillingNotice(res.message || "Active subscriptions are already up to date.");
    }
    setTimeout(() => setBillingNotice(""), 4500);
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Here's what's happening with your subscriptions today."
        action={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className="secondary-button" onClick={handleExportReport} title="Download CSV summary">
              <ArrowUpRight size={16} /> Export report
            </button>
            <button className="primary-button" onClick={handleTriggerBilling} title="Simulate automated billing cycle">
              <Zap size={16} /> Run Billing Day
            </button>
          </div>
        }
      />

      {billingNotice && (
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
          <span>{billingNotice}</span>
          <Link to="/admin/invoices" style={{ marginLeft: "auto", fontWeight: 700, color: "#047857", textDecoration: "underline" }}>
            View in Invoices &rarr;
          </Link>
        </div>
      )}

      {/* Quick Access Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "22px",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "8px 14px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          <Package size={15} color="#6558d3" /> Manage Products
        </Link>
        <Link
          to="/admin/plans"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "8px 14px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          <Layers size={15} color="#6558d3" /> Manage Plans
        </Link>
        <Link
          to="/admin/invoices"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "8px 14px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          <FileText size={15} color="#6558d3" /> Invoice Register
        </Link>
      </div>

      <section className="stats-grid">
        {stats.map((s, i) => {
          const Icon = icons[i];
          return (
            <article className="stat-card" key={s.label}>
              <div className="stat-top">
                <span>{s.label}</span>
                <span className="stat-icon">
                  <Icon size={18} />
                </span>
              </div>
              <strong>{s.value}</strong>
              <span className={`stat-change ${s.tone}`}>{s.change}</span>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue overview</h2>
              <p>Monthly revenue performance</p>
            </div>
            <select
              aria-label="Chart period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="Last 6 months">Last 6 months</option>
              <option value="This year">This year</option>
            </select>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                <Bar dataKey="revenue" fill="#6558d3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Subscription snapshot</h2>
              <p>Current plan distribution</p>
            </div>
          </div>
          <div className="snapshot-number">
            1,284 <span>active</span>
          </div>
          <div className="progress-row">
            <span>Professional</span>
            <b>58%</b>
          </div>
          <div className="progress">
            <i style={{ width: "58%" }} />
          </div>
          <div className="progress-row">
            <span>Starter</span>
            <b>27%</b>
          </div>
          <div className="progress">
            <i style={{ width: "27%" }} />
          </div>
          <div className="progress-row">
            <span>Business</span>
            <b>15%</b>
          </div>
          <div className="progress">
            <i style={{ width: "15%" }} />
          </div>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent transactions</h2>
            <p>Latest invoice and payment activity</p>
          </div>
          <Link to="/admin/invoices">View all invoices</Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="strong-cell">{t.id}</td>
                  <td>{t.customer}</td>
                  <td>{t.plan}</td>
                  <td>{t.amount}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>
                    <button
                      className="secondary-button"
                      style={{ padding: "4px 9px", fontSize: "11px" }}
                      onClick={() => setSelectedTxn(t)}
                    >
                      Quick View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        title={selectedTxn ? `Transaction Details: ${selectedTxn.id}` : "Transaction"}
      >
        {selectedTxn && (
          <div style={{ display: "grid", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8f9fd", padding: "14px", borderRadius: "8px" }}>
              <div>
                <small style={{ color: "#7b8498", fontSize: "11px" }}>Customer</small>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#182033" }}>{selectedTxn.customer}</div>
              </div>
              <div>
                <small style={{ color: "#7b8498", fontSize: "11px" }}>Plan</small>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>{selectedTxn.plan}</div>
              </div>
              <div>
                <small style={{ color: "#7b8498", fontSize: "11px" }}>Amount</small>
                <div style={{ fontWeight: 800, fontSize: "16px", color: "#6558d3" }}>{selectedTxn.amount}</div>
              </div>
              <div>
                <small style={{ color: "#7b8498", fontSize: "11px" }}>Status</small>
                <div><StatusBadge status={selectedTxn.status} /></div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button className="secondary-button" onClick={() => setSelectedTxn(null)}>
                Close
              </button>
              <Link to="/admin/invoices" className="primary-button">
                Open Full Invoice Register
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
