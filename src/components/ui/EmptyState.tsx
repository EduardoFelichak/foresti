interface Props {
  icon    : string
  title   : string
  message : string
}

export default function EmptyState({ icon, title, message }: Props) {
  return (
    <div className="text-center p-5">
      <i className={`bi ${icon} fs-1 text-muted`}></i>
      <h5 className="mt-3">{title}</h5>
      <p className="text-muted">{message}</p>
    </div>
  )
}