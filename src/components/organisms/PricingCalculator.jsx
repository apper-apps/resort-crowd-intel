import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"

const PricingCalculator = ({ pricing }) => {
  if (!pricing) return null

  const { roomTotals, subtotal, gst, finalTotal, avgRoomRate } = pricing

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-surface to-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Pricing Breakdown</h3>
          <Badge variant={avgRoomRate > 7500 ? "warning" : "success"}>
            {avgRoomRate > 7500 ? "18% GST" : "12% GST"}
          </Badge>
        </div>

        <div className="space-y-3">
          {roomTotals.map((room, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-primary/10">
              <span className="text-sm font-medium text-primary">
                Room {index + 1} ({room.type})
              </span>
              <span className="font-semibold text-secondary">
                ₹{room.total.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="border-t border-primary/10 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">
                GST ({avgRoomRate > 7500 ? "18%" : "12%"})
              </span>
              <span className="font-medium">₹{gst.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-primary pt-2 border-t border-primary/10">
              <span>Total Amount</span>
              <div className="text-right">
                <div className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ₹{finalTotal.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  Avg Rate: ₹{avgRoomRate.toLocaleString()}/night
                </div>
              </div>
            </div>
          </div>

          {avgRoomRate > 7000 && avgRoomRate <= 7500 && (
            <div className="flex items-center p-3 bg-warning/10 rounded-lg border border-warning/20">
              <ApperIcon name="AlertTriangle" className="w-5 h-5 text-warning mr-2" />
              <div className="text-sm">
                <div className="font-medium text-warning">GST Saver Alert!</div>
                <div className="text-slate-600">Close to 18% GST threshold</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default PricingCalculator