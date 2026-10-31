// Brightloop Subscription Management System - Centralized Demo Data Store
// Preserves all existing exports for full backward-compatibility and adds localStorage persistence.

export const demoCompany = {
  name: "Brightloop Software Technologies (Demo)",
  address: "Plot 42, Tech Park Central, Outer Ring Road, Bengaluru, KA 560103",
  gstin: "29AABCU9603R1Z7 (DEMO ONLY)",
  email: "billing@brightloop.demo",
  phone: "+91 80 4123 7890",
  website: "www.brightloop.demo",
};

// Existing stats preserved exactly for backward compatibility
export const stats = [
  { label: "Total revenue", value: "₹2,48,500", change: "+12.8%", tone: "green" },
  { label: "Active subscriptions", value: "1,284", change: "+8.2%", tone: "green" },
  { label: "Total customers", value: "946", change: "+5.4%", tone: "green" },
  { label: "Pending invoices", value: "38", change: "Needs attention", tone: "orange" },
];

// Existing monthly revenue trend for Recharts
export const revenueData = [
  { month: "May", revenue: 32000 },
  { month: "Jun", revenue: 41000 },
  { month: "Jul", revenue: 38000 },
  { month: "Aug", revenue: 52000 },
  { month: "Sep", revenue: 47000 },
  { month: "Oct", revenue: 68500 },
];

export const yearlyRevenueData = [
  { month: "Q1 2025", revenue: 98000 },
  { month: "Q2 2025", revenue: 124000 },
  { month: "Q3 2025", revenue: 156000 },
  { month: "Q4 2025", revenue: 189000 },
  { month: "Q1 2026", revenue: 220000 },
  { month: "Q2 2026", revenue: 248500 },
];

// Existing transactions preserved exactly
export const transactions = [
  { id: "INV-1048", customer: "Aarav Nair", plan: "Pro Monthly", amount: "₹2,499", status: "Paid" },
  { id: "INV-1047", customer: "Maya Thomas", plan: "Starter Yearly", amount: "₹5,999", status: "Pending" },
  { id: "INV-1046", customer: "Ishan Menon", plan: "Business Monthly", amount: "₹4,999", status: "Paid" },
  { id: "INV-1045", customer: "Diya Shah", plan: "Pro Monthly", amount: "₹2,499", status: "Overdue" },
];

// Existing plans preserved exactly with additional lifecycle fields
export const plans = [
  {
    id: 1,
    name: "Starter",
    description: "For individuals and small shops getting started",
    price: 499,
    cycle: "month",
    billingCycle: "monthly",
    minQuantity: 1,
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    allowPause: true,
    allowRenewal: true,
    autoCloseAtEnd: false,
    status: "Active",
    features: ["Core features", "Email support", "1 staff user", "Automated monthly billing"],
  },
  {
    id: 2,
    name: "Professional",
    description: "For growing teams that need automated billing and reports",
    price: 1499,
    cycle: "month",
    billingCycle: "monthly",
    minQuantity: 1,
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    allowPause: true,
    allowRenewal: true,
    autoCloseAtEnd: false,
    status: "Active",
    features: [
      "All Starter features",
      "Priority email & chat support",
      "Up to 5 staff users",
      "Real-time revenue reports",
      "Automated tax & discounts",
    ],
  },
  {
    id: 3,
    name: "Business",
    description: "For established businesses with high volume contracts",
    price: 3999,
    cycle: "month",
    billingCycle: "monthly",
    minQuantity: 2,
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    allowPause: false,
    allowRenewal: true,
    autoCloseAtEnd: false,
    status: "Active",
    features: [
      "All Pro features",
      "Advanced custom reports",
      "Unlimited staff users",
      "Dedicated account concierge",
      "Odoo connector integration",
    ],
  },
];

// Initial Products seed data matching the Odoo hackathon challenge
export const initialProducts = [
  {
    id: "PROD-101",
    name: "Brightloop Cloud ERP",
    type: "Software",
    salesPrice: 2499,
    costPrice: 950,
    category: "Software",
    notes: "Core business management suite with multi-company support.",
    variants: [
      { id: "v1", name: "Standard Edition", extraPrice: 0 },
      { id: "v2", name: "Odoo Enterprise Edition", extraPrice: 560 }, // Specifically highlighted in Odoo challenge spec
      { id: "v3", name: "High-Availability Cluster", extraPrice: 1200 },
    ],
    status: "Active",
  },
  {
    id: "PROD-102",
    name: "Realtime Analytics Suite",
    type: "Digital service",
    salesPrice: 1499,
    costPrice: 500,
    category: "Digital service",
    notes: "Tracks MRR, active cohorts, and churn indicators in real time.",
    variants: [
      { id: "v4", name: "Standard (up to 50k events)", extraPrice: 0 },
      { id: "v5", name: "Scale (up to 500k events)", extraPrice: 850 },
    ],
    status: "Active",
  },
  {
    id: "PROD-103",
    name: "Automated GST Invoicing Engine",
    type: "Software",
    salesPrice: 899,
    costPrice: 300,
    category: "Software",
    notes: "Generates GST-compliant itemized billing and automated payment reminders.",
    variants: [
      { id: "v6", name: "Email only", extraPrice: 0 },
      { id: "v7", name: "SMS + WhatsApp Alerts", extraPrice: 400 },
    ],
    status: "Active",
  },
  {
    id: "PROD-104",
    name: "Priority Support Concierge",
    type: "Add-on",
    salesPrice: 1999,
    costPrice: 700,
    category: "Add-on",
    notes: "24/7 dedicated support representative with 1-hour SLA response.",
    variants: [
      { id: "v8", name: "Standard SLA (4 hours)", extraPrice: 0 },
      { id: "v9", name: "Urgent SLA (30 mins)", extraPrice: 1500 },
    ],
    status: "Active",
  },
];

// Initial Subscriptions seed data with full lifecycle status
export const initialSubscriptions = [
  {
    id: "SUB-101",
    subscriptionNumber: "SUB-2026-0101",
    customerName: "Aarav Nair",
    customerEmail: "aarav@nairlogistics.in",
    company: "Nair Logistics Pvt Ltd",
    planId: 2,
    planName: "Professional",
    billingCycle: "monthly",
    unitPrice: 1499,
    quantity: 1,
    selectedVariant: "Odoo Enterprise Edition (+₹560)",
    variantPrice: 560,
    taxPercent: 18,
    discountAmount: 0,
    totalAmount: 2429.62, // (1499 + 560) * 1.18
    startDate: "2026-09-01",
    nextBillingDate: "2026-11-01",
    expiryDate: "2027-09-01",
    status: "Active", // Active, Paused, Closed, Confirmed
    paymentTerms: "Net 15",
    paymentMethod: "Credit Card (ending 4242)",
    autoRenew: true,
  },
  {
    id: "SUB-102",
    subscriptionNumber: "SUB-2026-0102",
    customerName: "Maya Thomas",
    customerEmail: "maya@thomasretail.com",
    company: "Thomas Retailers",
    planId: 1,
    planName: "Starter",
    billingCycle: "yearly",
    unitPrice: 4999,
    quantity: 1,
    selectedVariant: "Standard Edition",
    variantPrice: 0,
    taxPercent: 18,
    discountAmount: 500,
    totalAmount: 5308.82, // (4999 - 500) * 1.18
    startDate: "2026-08-10",
    nextBillingDate: "2026-11-10",
    expiryDate: "2027-08-10",
    status: "Active",
    paymentTerms: "Net 30",
    paymentMethod: "Bank Transfer",
    autoRenew: true,
  },
  {
    id: "SUB-103",
    subscriptionNumber: "SUB-2026-0103",
    customerName: "Ishan Menon",
    customerEmail: "ishan@menontechnologies.com",
    company: "Menon Technologies",
    planId: 3,
    planName: "Business",
    billingCycle: "monthly",
    unitPrice: 3999,
    quantity: 2,
    selectedVariant: "Standard Edition",
    variantPrice: 0,
    taxPercent: 18,
    discountAmount: 0,
    totalAmount: 9437.64, // (7998) * 1.18
    startDate: "2026-07-15",
    nextBillingDate: "2026-11-15",
    expiryDate: "2027-07-15",
    status: "Active",
    paymentTerms: "Net 15",
    paymentMethod: "UPI",
    autoRenew: true,
  },
  {
    id: "SUB-104",
    subscriptionNumber: "SUB-2026-0104",
    customerName: "Diya Shah",
    customerEmail: "diya@shahdesignstudio.com",
    company: "Shah Design Studio",
    planId: 2,
    planName: "Professional",
    billingCycle: "monthly",
    unitPrice: 1499,
    quantity: 1,
    selectedVariant: "Standard Edition",
    variantPrice: 0,
    taxPercent: 18,
    discountAmount: 0,
    totalAmount: 1768.82,
    startDate: "2026-06-01",
    nextBillingDate: "2026-10-01",
    expiryDate: "2027-06-01",
    status: "Paused",
    paymentTerms: "Immediate",
    paymentMethod: "Credit Card (ending 8812)",
    autoRenew: false,
  },
  {
    id: "SUB-105",
    subscriptionNumber: "SUB-2026-0105",
    customerName: "Karan Johar",
    customerEmail: "karan@dharmanet.com",
    company: "Dharma Media Works",
    planId: 1,
    planName: "Starter",
    billingCycle: "monthly",
    unitPrice: 499,
    quantity: 1,
    selectedVariant: "Standard Edition",
    variantPrice: 0,
    taxPercent: 18,
    discountAmount: 0,
    totalAmount: 588.82,
    startDate: "2026-01-01",
    nextBillingDate: "2026-06-01",
    expiryDate: "2026-06-01",
    status: "Closed",
    paymentTerms: "Immediate",
    paymentMethod: "UPI",
    autoRenew: false,
  },
];

// Initial Invoices seed data matching the billing day workflow
export const initialInvoices = [
  {
    id: "INV-1048",
    invoiceNumber: "INV-2026-1048",
    subscriptionId: "SUB-101",
    customerName: "Aarav Nair",
    customerEmail: "aarav@nairlogistics.in",
    company: "Nair Logistics Pvt Ltd",
    planName: "Professional Monthly",
    subtotal: 2059.0,
    taxPercent: 18,
    taxAmount: 370.62,
    discountAmount: 0,
    totalAmount: 2429.62,
    status: "Paid", // Draft, Confirmed, Pending, Paid, Overdue, Cancelled
    issueDate: "2026-10-01",
    dueDate: "2026-10-15",
    paidDate: "2026-10-03",
    paymentMethod: "Credit Card (ending 4242)",
    billingCycle: "Monthly (Oct 2026)",
    items: [
      { description: "Professional Subscription Plan", quantity: 1, unitPrice: 1499, total: 1499 },
      { description: "Variant: Odoo Enterprise Edition (+₹560)", quantity: 1, unitPrice: 560, total: 560 },
    ],
  },
  {
    id: "INV-1047",
    invoiceNumber: "INV-2026-1047",
    subscriptionId: "SUB-102",
    customerName: "Maya Thomas",
    customerEmail: "maya@thomasretail.com",
    company: "Thomas Retailers",
    planName: "Starter Yearly",
    subtotal: 4499.0,
    taxPercent: 18,
    taxAmount: 809.82,
    discountAmount: 500,
    totalAmount: 5308.82,
    status: "Pending",
    issueDate: "2026-10-10",
    dueDate: "2026-11-09",
    paidDate: null,
    paymentMethod: "Bank Transfer (NEFT)",
    billingCycle: "Yearly (2026-2027)",
    items: [
      { description: "Starter Plan Annual License", quantity: 1, unitPrice: 4999, total: 4999 },
      { description: "Promotional Discount Code: FLAT500", quantity: 1, unitPrice: -500, total: -500 },
    ],
  },
  {
    id: "INV-1046",
    invoiceNumber: "INV-2026-1046",
    subscriptionId: "SUB-103",
    customerName: "Ishan Menon",
    customerEmail: "ishan@menontechnologies.com",
    company: "Menon Technologies",
    planName: "Business Monthly",
    subtotal: 7998.0,
    taxPercent: 18,
    taxAmount: 1439.64,
    discountAmount: 0,
    totalAmount: 9437.64,
    status: "Paid",
    issueDate: "2026-09-15",
    dueDate: "2026-09-30",
    paidDate: "2026-09-17",
    paymentMethod: "UPI",
    billingCycle: "Monthly (Sep 2026)",
    items: [
      { description: "Business Subscription Plan (2 seats)", quantity: 2, unitPrice: 3999, total: 7998 },
    ],
  },
  {
    id: "INV-1045",
    invoiceNumber: "INV-2026-1045",
    subscriptionId: "SUB-104",
    customerName: "Diya Shah",
    customerEmail: "diya@shahdesignstudio.com",
    company: "Shah Design Studio",
    planName: "Professional Monthly",
    subtotal: 1499.0,
    taxPercent: 18,
    taxAmount: 269.82,
    discountAmount: 0,
    totalAmount: 1768.82,
    status: "Overdue",
    issueDate: "2026-09-01",
    dueDate: "2026-09-15",
    paidDate: null,
    paymentMethod: "Credit Card (ending 8812)",
    billingCycle: "Monthly (Sep 2026)",
    items: [
      { description: "Professional Subscription Plan", quantity: 1, unitPrice: 1499, total: 1499 },
    ],
  },
  {
    id: "INV-1044",
    invoiceNumber: "INV-2026-1044",
    subscriptionId: "SUB-101",
    customerName: "Aarav Nair",
    customerEmail: "aarav@nairlogistics.in",
    company: "Nair Logistics Pvt Ltd",
    planName: "Professional Monthly",
    subtotal: 2059.0,
    taxPercent: 18,
    taxAmount: 370.62,
    discountAmount: 0,
    totalAmount: 2429.62,
    status: "Draft",
    issueDate: "2026-10-31",
    dueDate: "2026-11-15",
    paidDate: null,
    paymentMethod: "Credit Card (ending 4242)",
    billingCycle: "Monthly (Nov 2026 - Draft)",
    items: [
      { description: "Professional Subscription Renewal", quantity: 1, unitPrice: 1499, total: 1499 },
      { description: "Variant: Odoo Enterprise Edition (+₹560)", quantity: 1, unitPrice: 560, total: 560 },
    ],
  },
];

// Initial Customers directory seed data
export const initialCustomers = [
  {
    id: 1,
    name: "Aarav Nair",
    email: "aarav@nairlogistics.in",
    company: "Nair Logistics Pvt Ltd",
    phone: "+91 98450 12345",
    activeSubscriptions: 1,
    totalSpend: "₹7,288",
    status: "Active",
  },
  {
    id: 2,
    name: "Maya Thomas",
    email: "maya@thomasretail.com",
    company: "Thomas Retailers",
    phone: "+91 97410 54321",
    activeSubscriptions: 1,
    totalSpend: "₹5,308",
    status: "Active",
  },
  {
    id: 3,
    name: "Ishan Menon",
    email: "ishan@menontechnologies.com",
    company: "Menon Technologies",
    phone: "+91 98860 99887",
    activeSubscriptions: 1,
    totalSpend: "₹18,874",
    status: "Active",
  },
  {
    id: 4,
    name: "Diya Shah",
    email: "diya@shahdesignstudio.com",
    company: "Shah Design Studio",
    phone: "+91 99000 11223",
    activeSubscriptions: 0,
    totalSpend: "₹3,537",
    status: "Paused",
  },
];

// LocalStorage Persistence Helpers
const KEYS = {
  PRODUCTS: "brightloop_demo_products",
  PLANS: "brightloop_demo_plans",
  SUBSCRIPTIONS: "brightloop_demo_subscriptions",
  INVOICES: "brightloop_demo_invoices",
  CUSTOMERS: "brightloop_demo_customers",
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Storage write error:", err);
  }
}

export function getStoredProducts() {
  return safeGet(KEYS.PRODUCTS, initialProducts);
}

export function saveStoredProducts(data) {
  safeSet(KEYS.PRODUCTS, data);
}

export function getStoredPlans() {
  return safeGet(KEYS.PLANS, plans);
}

export function saveStoredPlans(data) {
  safeSet(KEYS.PLANS, data);
}

export function getStoredSubscriptions() {
  return safeGet(KEYS.SUBSCRIPTIONS, initialSubscriptions);
}

export function saveStoredSubscriptions(data) {
  safeSet(KEYS.SUBSCRIPTIONS, data);
}

export function getStoredInvoices() {
  return safeGet(KEYS.INVOICES, initialInvoices);
}

export function saveStoredInvoices(data) {
  safeSet(KEYS.INVOICES, data);
}

export function getStoredCustomers() {
  return safeGet(KEYS.CUSTOMERS, initialCustomers);
}

export function saveStoredCustomers(data) {
  safeSet(KEYS.CUSTOMERS, data);
}

// Frontend simulation: Generate invoices for Billing Day without duplicates
export function generateBillingDayInvoices() {
  const currentInvoices = getStoredInvoices();
  const activeSubs = getStoredSubscriptions().filter((s) => s.status === "Active");
  const todayStr = new Date().toISOString().split("T")[0];
  const newInvoices = [];

  activeSubs.forEach((sub) => {
    // Check if an invoice was already generated for this subscription on this issue date to prevent duplicates
    const alreadyExists = currentInvoices.some(
      (inv) => inv.subscriptionId === sub.id && inv.issueDate === todayStr
    );

    if (!alreadyExists) {
      const subtotal = (sub.unitPrice + (sub.variantPrice || 0)) * (sub.quantity || 1) - (sub.discountAmount || 0);
      const taxAmount = +(subtotal * 0.18).toFixed(2);
      const totalAmount = +(subtotal + taxAmount).toFixed(2);
      const nextId = `INV-${1050 + currentInvoices.length + newInvoices.length}`;

      const generated = {
        id: nextId,
        invoiceNumber: `${nextId}`,
        subscriptionId: sub.id,
        customerName: sub.customerName,
        customerEmail: sub.customerEmail,
        company: sub.company,
        planName: `${sub.planName} ${sub.billingCycle}`,
        subtotal: +subtotal.toFixed(2),
        taxPercent: 18,
        taxAmount,
        discountAmount: sub.discountAmount || 0,
        totalAmount,
        status: "Pending",
        issueDate: todayStr,
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        paidDate: null,
        paymentMethod: sub.paymentMethod || "Pending Selection",
        billingCycle: `Billing Day Auto-Generated (${sub.billingCycle})`,
        items: [
          {
            description: `${sub.planName} recurring subscription (${sub.billingCycle})`,
            quantity: sub.quantity || 1,
            unitPrice: sub.unitPrice,
            total: sub.unitPrice * (sub.quantity || 1),
          },
        ],
      };

      if (sub.variantPrice > 0) {
        generated.items.push({
          description: `Variant: ${sub.selectedVariant}`,
          quantity: 1,
          unitPrice: sub.variantPrice,
          total: sub.variantPrice,
        });
      }

      newInvoices.push(generated);
    }
  });

  if (newInvoices.length > 0) {
    const updated = [...newInvoices, ...currentInvoices];
    saveStoredInvoices(updated);
    return { success: true, count: newInvoices.length, newInvoices };
  }

  return { success: false, count: 0, message: "All active subscriptions are already invoiced for today." };
}
