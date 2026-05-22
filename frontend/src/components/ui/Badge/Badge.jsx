export default function Badge({ label, color = 'green' }) {
  return <span className={`badge badge-${color}`}>{label}</span>
}
