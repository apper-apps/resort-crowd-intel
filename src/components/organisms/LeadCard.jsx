import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import StatusBadge from "@/components/molecules/StatusBadge"
import { format, formatDistanceToNow } from "date-fns"

const LeadCard = ({ lead, onStatusUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQuotes, setShowQuotes] = useState(false)

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(lead.Id, newStatus)
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const getNextReminderText = () => {
    if (!lead.reminderDateTimeUTC) return "No reminder set"
    
    const reminderDate = new Date(lead.reminderDateTimeUTC)
    const now = new Date()
    
    if (reminderDate < now) {
      return `Overdue by ${formatDistanceToNow(reminderDate)}`
    }
    
    return `In ${formatDistanceToNow(reminderDate)}`
  }

  const isReminderOverdue = () => {
    if (!lead.reminderDateTimeUTC) return false
    return new Date(lead.reminderDateTimeUTC) < new Date()
  }

  const getReminderBadgeVariant = () => {
    if (!lead.reminderDateTimeUTC) return "default"
    return isReminderOverdue() ? "error" : "warning"
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-primary">{lead.name}</h3>
            <StatusBadge status={lead.status} />
            <Badge variant={getReminderBadgeVariant()}>
              <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
              {getNextReminderText()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Phone" className="w-4 h-4 text-slate-500" />
              <span className="text-sm">{lead.mobile}</span>
              <Button
                onClick={() => copyToClipboard(lead.mobile, "Mobile number")}
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
              >
                <ApperIcon name="Copy" className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <ApperIcon name="Calendar" className="w-4 h-4 text-slate-500" />
              <span className="text-sm">
                {format(new Date(lead.checkinDate), "MMM dd")} - {format(new Date(lead.checkoutDate), "MMM dd, yyyy")}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <ApperIcon name="FileText" className="w-4 h-4 text-slate-500" />
              <span className="text-sm">{lead.quotes.length} quote(s)</span>
              {lead.quotes.length > 0 && (
                <Button
                  onClick={() => setShowQuotes(!showQuotes)}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                >
                  <ApperIcon name={showQuotes ? "ChevronUp" : "ChevronDown"} className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {lead.notes && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="min-w-[120px]"
          >
            <option value="open">Open</option>
            <option value="contacted">Contacted</option>
            <option value="negotiation">Negotiation</option>
            <option value="nurturing">Nurturing</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </Select>

          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
          >
            <ApperIcon name="MoreVertical" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-200 pt-4 mt-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm">
                <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button
                onClick={() => copyToClipboard(`Hi ${lead.name}, regarding your booking from ${format(new Date(lead.checkinDate), "dd MMM")} to ${format(new Date(lead.checkoutDate), "dd MMM")}...`, "Message template")}
                variant="secondary"
                size="sm"
              >
                <ApperIcon name="MessageSquare" className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="secondary" size="sm">
                <ApperIcon name="Bell" className="w-4 h-4 mr-2" />
                Set Reminder
              </Button>
            </div>

            <Button
              onClick={() => onDelete(lead.Id)}
              variant="ghost"
              size="sm"
              className="text-error hover:bg-error/10"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Quotes Section */}
      {showQuotes && lead.quotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-200 pt-4 mt-4"
        >
          <h4 className="font-semibold text-primary mb-3">Quotes History</h4>
          <div className="space-y-3">
            {lead.quotes.map((quote) => (
              <div key={quote.Id} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Quote #{quote.Id} - ₹{quote.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(quote.createdAt), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mb-2">
                  {quote.rooms.length} room(s) • {quote.mealPlans.join(", ")} • Advance: ₹{quote.advanceAmount.toLocaleString()}
                </div>
                <Button
                  onClick={() => copyToClipboard(quote.quoteText, "Quote")}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  <ApperIcon name="Copy" className="w-3 h-3 mr-1" />
                  Copy Quote
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  )
}

export default LeadCard