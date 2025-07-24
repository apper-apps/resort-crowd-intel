import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const Empty = ({ 
  title = "No data found", 
  description = "Get started by creating your first item.",
  action,
  actionLabel = "Get Started",
  icon = "Inbox"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} className="w-10 h-10 text-primary/60" />
      </div>
      
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-slate-600 mb-8 max-w-md">{description}</p>
      
      {action && (
        <Button onClick={action} variant="primary" size="lg">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

export default Empty