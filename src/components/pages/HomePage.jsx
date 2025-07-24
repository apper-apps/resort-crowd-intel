import { useState } from "react"
import { motion } from "framer-motion"
import TabNavigation from "@/components/molecules/TabNavigation"
import QuoteGenerator from "@/components/organisms/QuoteGenerator"
import LeadsList from "@/components/organisms/LeadsList"
import BookingConfirmations from "@/components/organisms/BookingConfirmations"
import ApperIcon from "@/components/ApperIcon"

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("quotes")
  const [leadsRefreshTrigger, setLeadsRefreshTrigger] = useState(0)

  const tabs = [
    {
      id: "quotes",
      label: "Quote Generator",
      icon: "Calculator",
      component: QuoteGenerator
    },
    {
      id: "leads",
      label: "Leads & Reminders",
      icon: "Users",
      component: LeadsList
    },
    {
      id: "confirmations",
      label: "Booking Confirmations",
      icon: "CheckSquare",
      component: BookingConfirmations
    }
  ]

  const handleLeadCreated = () => {
    setLeadsRefreshTrigger(prev => prev + 1)
  }

  const renderActiveTab = () => {
    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component
    
    if (!ActiveComponent) return null

    const props = {}
    
    if (activeTab === "quotes") {
      props.onLeadCreated = handleLeadCreated
    } else if (activeTab === "leads") {
      props.refreshTrigger = leadsRefreshTrigger
    }

    return <ActiveComponent {...props} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Building2" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Resort CRM Pro
                </h1>
                <p className="text-sm text-slate-600">Grand Resort Mahabaleshwar</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-primary">Sales Dashboard</div>
                <div className="text-sm text-slate-600">
                  {new Date().toLocaleDateString("en-IN", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveTab()}
        </motion.div>
      </main>
    </div>
  )
}

export default HomePage