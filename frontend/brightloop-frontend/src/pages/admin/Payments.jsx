import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
export default function Payments(){return <><PageHeader title="Payments" description="Review payments recorded against customer invoices."/><section className="panel table-panel"><div className="panel-heading"><h2>Payment history</h2></div><EmptyState title="No payment records connected" description="Connect GET /payments to display payment history."/></section></>}
