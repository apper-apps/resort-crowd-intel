import React from "react"
import { cn } from "@/utils/cn"
import { motion } from "framer-motion"

const Card = React.forwardRef(({ 
  className, 
  children, 
  hover = false,
  ...props 
}, ref) => {
  const cardContent = (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-primary/10 bg-surface shadow-md p-6",
        hover && "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
})

Card.displayName = "Card"

export default Card