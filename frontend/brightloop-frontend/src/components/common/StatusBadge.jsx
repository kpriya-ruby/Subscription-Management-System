export default function StatusBadge({ status = "Pending" }) {
  const key = status.toLowerCase();
  return <span className={`status-badge ${key}`}>{status}</span>;
}
