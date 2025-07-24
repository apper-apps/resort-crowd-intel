import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import StatusBadge from "@/components/molecules/StatusBadge"
import SearchBar from "@/components/molecules/SearchBar"
import LeadCard from "@/components/organisms/LeadCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { leadService } from "@/services/api/leadService"
import { format } from "date-fns"

const LeadsList = ({ refreshTrigger }) => {
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all"
  })

  useEffect(() => {
    loadLeads()
  }, [refreshTrigger])

  useEffect(() => {
    applyFilters()
  }, [leads, filters])

  const loadLeads = async () => {
    setLoading(true)
    setError("")
    try {
const leadsData = await leadService.getAll()
      setLeads(leadsData.sort((a, b) => new Date(b.reminderDateTimeUTC || 0) - new Date(a.reminderDateTimeUTC || 0)))
    } catch (err) {
      setError(err.message || "Failed to load leads")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...leads]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm) ||
        lead.mobile.includes(searchTerm)
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(lead => lead.status === filters.status)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filters.dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() + 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() + 1)
          break
        case "past":
          filtered = filtered.filter(lead => new Date(lead.checkinDate) < now)
          break
        default:
          break
      }

      if (filters.dateRange !== "past") {
        filtered = filtered.filter(lead => 
          new Date(lead.checkinDate) >= now && new Date(lead.checkinDate) <= cutoffDate
        )
      }
    }

    setFilteredLeads(filtered)
  }

const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const updatedLead = await leadService.updateStatus(leadId, newStatus)
      setLeads(prev => prev.map(lead => 
        lead.Id === leadId ? updatedLead : lead
      ))
      toast.success(`Lead status updated to ${newStatus}`)
    } catch (error) {
      toast.error(error.message || "Failed to update lead status")
    }
  }

const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return

    try {
      const deleted = await leadService.delete(leadId)
      if (deleted) {
        setLeads(prev => prev.filter(lead => lead.Id !== leadId))
        toast.success("Lead deleted successfully")
      } else {
        toast.error("Failed to delete lead")
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete lead")
    }
  }

  const exportToCSV = () => {
    const csvData = filteredLeads.map(lead => ({
      Name: lead.name,
      Mobile: lead.mobile,
      "Check-in": format(new Date(lead.checkinDate), "yyyy-MM-dd"),
      "Check-out": format(new Date(lead.checkoutDate), "yyyy-MM-dd"),
      Status: lead.status,
      "Total Quotes": lead.quotes.length,
      "Last Quote Amount": lead.quotes.length > 0 ? lead.quotes[lead.quotes.length - 1].totalAmount : 0,
      Notes: lead.notes
    }))

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0]).join(",") + "\n"
      + csvData.map(row => Object.values(row).join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `leads-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Leads exported to CSV")
  }

  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={loadLeads} />

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Leads & Reminders
          </h2>
          <div className="flex items-center space-x-3">
            <Button onClick={exportToCSV} variant="secondary" size="sm">
              <ApperIcon name="Download" className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={loadLeads} variant="ghost" size="sm">
              <ApperIcon name="RefreshCw" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <SearchBar
              onSearch={(term) => setFilters(prev => ({ ...prev, search: term }))}
              onClear={() => setFilters(prev => ({ ...prev, search: "" }))}
              placeholder="Search by name or mobile..."
            />
          </div>

          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="contacted">Contacted</option>
            <option value="negotiation">Negotiation</option>
            <option value="nurturing">Nurturing</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </Select>

          <Select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          >
            <option value="all">All Dates</option>
            <option value="week">Next 7 Days</option>
            <option value="month">Next 30 Days</option>
            <option value="past">Past Dates</option>
          </Select>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length, icon: "Users", color: "info" },
          { label: "Open", value: leads.filter(l => l.status === "open").length, icon: "Clock", color: "warning" },
          { label: "Won", value: leads.filter(l => l.status === "won").length, icon: "CheckCircle", color: "success" },
          { label: "This Week", value: leads.filter(l => {
            const checkin = new Date(l.checkinDate)
            const weekFromNow = new Date()
            weekFromNow.setDate(weekFromNow.getDate() + 7)
            return checkin <= weekFromNow && checkin >= new Date()
          }).length, icon: "Calendar", color: "secondary" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-${stat.color}/10 flex items-center justify-center`}>
                <ApperIcon name={stat.icon} className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Empty
          title="No leads found"
          description="No leads match your current filters."
          icon="Users"
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredLeads.map((lead, index) => (
              <motion.div
                key={lead.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <LeadCard
                  lead={lead}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDeleteLead}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default LeadsList