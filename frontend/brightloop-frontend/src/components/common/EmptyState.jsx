export default function EmptyState({ title = "Nothing here yet", description = "New records will appear here." }) {
  return <div className="empty-state"><h3>{title}</h3><p>{description}</p></div>;
}
