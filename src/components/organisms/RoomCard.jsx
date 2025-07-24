import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"

const RoomCard = ({ room, roomIndex, onRoomChange, onRemove, canRemove, nights }) => {
  const handleInputChange = (field, value) => {
    onRoomChange(roomIndex, field, value)
  }

  const handleNightlyDiscountChange = (nightIndex, value) => {
    const newDiscounts = [...room.nightlyDiscounts]
    while (newDiscounts.length < nights) {
      newDiscounts.push(0)
    }
    newDiscounts[nightIndex] = parseFloat(value) || 0
    onRoomChange(roomIndex, "nightlyDiscounts", newDiscounts)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-primary">
            Room {roomIndex + 1}
          </h4>
          {canRemove && (
            <Button
              onClick={onRemove}
              variant="ghost"
              size="sm"
              className="text-error hover:bg-error/10"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select
            label="Room Type"
            value={room.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
          >
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Super Deluxe">Super Deluxe</option>
          </Select>

          <div className="flex items-center space-x-3 pt-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={room.hasAC}
                onChange={(e) => handleInputChange("hasAC", e.target.checked)}
                className="rounded border-primary/20 text-primary focus:ring-primary/50"
              />
              <span className="text-sm font-medium text-primary">AC</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <Input
            label="Adults"
            type="number"
            min="1"
            value={room.adults}
            onChange={(e) => handleInputChange("adults", parseInt(e.target.value) || 1)}
          />

          <Input
            label="Children"
            type="number"
            min="0"
            value={room.children}
            onChange={(e) => handleInputChange("children", parseInt(e.target.value) || 0)}
          />

          <Input
            label="Infants"
            type="number"
            min="0"
            value={room.infants}
            onChange={(e) => handleInputChange("infants", parseInt(e.target.value) || 0)}
          />

          <Input
            label="Pets"
            type="number"
            min="0"
            value={room.pets}
            onChange={(e) => handleInputChange("pets", parseInt(e.target.value) || 0)}
          />
        </div>

        {nights > 0 && (
          <div>
            <h5 className="text-sm font-medium text-primary mb-2">
              Nightly Discounts (%)
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: nights }, (_, nightIndex) => (
                <Input
                  key={nightIndex}
                  label={`Night ${nightIndex + 1}`}
                  type="number"
                  min="0"
                  max="100"
                  value={room.nightlyDiscounts[nightIndex] || 0}
                  onChange={(e) => handleNightlyDiscountChange(nightIndex, e.target.value)}
                  placeholder="0"
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export default RoomCard