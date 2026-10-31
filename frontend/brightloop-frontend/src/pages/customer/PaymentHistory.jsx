import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
export default function PaymentHistory(){return <><PageHeader title="Payment history" description="Review payments and billing activity."/><section className="panel"><EmptyState title="No payment history yet" description="Your completed payments will appear here."/></section></>}
