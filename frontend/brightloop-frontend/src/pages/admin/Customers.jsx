import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
export default function Customers(){return <><PageHeader title="Customers" description="View and manage customer accounts."/><section className="panel table-panel"><div className="panel-heading"><h2>Customer directory</h2><input className="small-search" placeholder="Search customers"/></div><EmptyState title="Customer data will appear here" description="Connect GET /customers to load real customer records."/></section></>}
