import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"

const StatusBadge = ({ status }) => {
  const statusConfig = {
    open: {
      variant: "info",
      icon: "Clock",
      label: "Open"
    },
    contacted: {
      variant: "warning",
      icon: "Phone",
      label: "Contacted"
    },
    negotiation: {
      variant: "secondary",
      icon: "MessageCircle",
      label: "Negotiating"
    },
    nurturing: {
      variant: "default",
      icon: "Heart",
      label: "Nurturing"
    },
    won: {
      variant: "success",
      icon: "CheckCircle",
      label: "Won"
    },
    lost: {
      variant: "error",
      icon: "XCircle",
      label: "Lost"
    }
  }

  const config = statusConfig[status] || statusConfig.open

  return (
    <Badge variant={config.variant} className="inline-flex items-center gap-1">
      <ApperIcon name={config.icon} className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

export default StatusBadge