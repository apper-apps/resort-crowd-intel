import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="bg-white shadow-sm border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative py-4 px-1 font-medium text-sm transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-t-lg",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-slate-600 hover:text-primary/80"
              )}
            >
              <div className="flex items-center space-x-2">
                <ApperIcon name={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </div>
              
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                  layoutId="activeTab"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TabNavigation