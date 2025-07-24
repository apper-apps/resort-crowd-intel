import { motion } from "framer-motion"

const Loading = ({ type = "default" }) => {
  if (type === "cards") {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            className="bg-surface rounded-lg p-6 shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: item * 0.1 }}
          >
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded"></div>
                <div className="h-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded w-5/6"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className="bg-surface rounded-lg shadow-md overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="border-t border-primary/5 h-16 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

export default Loading