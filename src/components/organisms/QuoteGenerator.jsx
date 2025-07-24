import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"
import ApperIcon from "@/components/ApperIcon"
import RoomCard from "@/components/organisms/RoomCard"
import PricingCalculator from "@/components/organisms/PricingCalculator"
import WhatsAppParser from "@/components/organisms/WhatsAppParser"
import { tariffService } from "@/services/api/tariffService"
import { leadService } from "@/services/api/leadService"
import { calculateQuoteTotals } from "@/utils/pricing"
import { generateQuoteText } from "@/utils/quoteGenerator"

const QuoteGenerator = ({ onLeadCreated }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    mobile: "",
    checkinDate: "",
    checkoutDate: "",
    rooms: [
      {
        type: "Standard",
        adults: 2,
        children: 0,
        infants: 0,
        hasAC: true,
        nightlyDiscounts: [],
        pets: 0
      }
    ],
    mealPlans: ["CP"],
    overallDiscount: 0,
    notes: ""
  })

  const [tariffs, setTariffs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pricing, setPricing] = useState(null)

  useEffect(() => {
    loadTariffs()
  }, [])

  useEffect(() => {
    if (formData.checkinDate && formData.checkoutDate && tariffs.length > 0) {
      calculatePricing()
    }
  }, [formData, tariffs])

  const loadTariffs = async () => {
    try {
      const tariffsData = await tariffService.getAll()
      setTariffs(tariffsData)
    } catch (error) {
      toast.error("Failed to load tariffs")
    }
  }

  const calculatePricing = () => {
    try {
      const checkinDate = new Date(formData.checkinDate)
      const checkoutDate = new Date(formData.checkoutDate)
      
      if (checkinDate >= checkoutDate) {
        setPricing(null)
        return
      }

      const pricingData = calculateQuoteTotals(
        formData.rooms,
        checkinDate,
        checkoutDate,
        tariffs,
        formData.overallDiscount
      )
      
      setPricing(pricingData)
    } catch (error) {
      console.error("Pricing calculation error:", error)
      setPricing(null)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRoomChange = (roomIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, index) => 
        index === roomIndex ? { ...room, [field]: value } : room
      )
    }))
  }

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, {
        type: "Standard",
        adults: 2,
        children: 0,
        infants: 0,
        hasAC: true,
        nightlyDiscounts: [],
        pets: 0
      }]
    }))
  }

  const removeRoom = (roomIndex) => {
    if (formData.rooms.length > 1) {
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.filter((_, index) => index !== roomIndex)
      }))
    }
  }

  const handleParseWhatsApp = (parsedData) => {
    setFormData(prev => ({
      ...prev,
      ...parsedData
    }))
    toast.success("WhatsApp message parsed successfully!")
  }

  const generateQuote = async () => {
    if (!formData.clientName || !formData.mobile || !formData.checkinDate || !formData.checkoutDate) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!pricing) {
      toast.error("Unable to calculate pricing. Please check your inputs.")
      return
    }

    setIsLoading(true)
    try {
      const quoteText = generateQuoteText(formData, pricing)
      
      // Check if lead exists
      const existingLeads = await leadService.getAll()
      const existingLead = existingLeads.find(
        lead => lead.mobile === formData.mobile && 
        new Date(lead.checkinDate).toDateString() === new Date(formData.checkinDate).toDateString()
      )

      const quoteData = {
        rooms: formData.rooms,
        mealPlans: formData.mealPlans,
        totalAmount: pricing.finalTotal,
        advanceAmount: Math.round(pricing.finalTotal * 0.3),
        quoteText
      }

      if (existingLead) {
        // Add quote to existing lead
        await leadService.addQuote(existingLead.Id, quoteData)
        toast.success("Quote added to existing lead!")
      } else {
        // Create new lead
        const newLead = await leadService.create({
          name: formData.clientName,
          mobile: formData.mobile,
          checkinDate: formData.checkinDate,
          checkoutDate: formData.checkoutDate,
          notes: formData.notes
        })
        await leadService.addQuote(newLead.Id, quoteData)
        toast.success("Quote generated and lead created!")
        if (onLeadCreated) onLeadCreated()
      }

      // Copy quote to clipboard
      navigator.clipboard.writeText(quoteText)
      toast.info("Quote copied to clipboard!")
      
    } catch (error) {
      toast.error("Failed to generate quote")
    } finally {
      setIsLoading(false)
    }
  }

  const clearForm = () => {
    setFormData({
      clientName: "",
      mobile: "",
      checkinDate: "",
      checkoutDate: "",
      rooms: [
        {
          type: "Standard",
          adults: 2,
          children: 0,
          infants: 0,
          hasAC: true,
          nightlyDiscounts: [],
          pets: 0
        }
      ],
      mealPlans: ["CP"],
      overallDiscount: 0,
      notes: ""
    })
    setPricing(null)
  }

  return (
    <div className="space-y-6">
      <WhatsAppParser onParse={handleParseWhatsApp} />
      
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Quote Generator
          </h2>
          <Button onClick={clearForm} variant="ghost" size="sm">
            <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
            Clear Form
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label="Client Name *"
              value={formData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              placeholder="Enter client name"
            />

            <Input
              label="Mobile Number *"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="Enter mobile number"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Check-in Date *"
                type="date"
                value={formData.checkinDate}
                onChange={(e) => handleInputChange("checkinDate", e.target.value)}
              />

              <Input
                label="Check-out Date *"
                type="date"
                value={formData.checkoutDate}
                onChange={(e) => handleInputChange("checkoutDate", e.target.value)}
              />
            </div>

            <Select
              label="Meal Plan"
              value={formData.mealPlans[0]}
              onChange={(e) => handleInputChange("mealPlans", [e.target.value])}
            >
              <option value="CP">Continental Plan (CP)</option>
              <option value="MAP">Modified American Plan (MAP)</option>
              <option value="AP">American Plan (AP)</option>
            </Select>

            <Input
              label="Overall Discount (%)"
              type="number"
              value={formData.overallDiscount}
              onChange={(e) => handleInputChange("overallDiscount", parseFloat(e.target.value) || 0)}
              placeholder="Enter discount percentage"
            />

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes or requirements"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Room Configuration</h3>
              <Button onClick={addRoom} variant="accent" size="sm">
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>

            <div className="space-y-4">
              {formData.rooms.map((room, index) => (
                <RoomCard
                  key={index}
                  room={room}
                  roomIndex={index}
                  onRoomChange={handleRoomChange}
                  onRemove={() => removeRoom(index)}
                  canRemove={formData.rooms.length > 1}
                  nights={formData.checkinDate && formData.checkoutDate ? 
                    Math.ceil((new Date(formData.checkoutDate) - new Date(formData.checkinDate)) / (1000 * 60 * 60 * 24)) : 0
                  }
                />
              ))}
            </div>

            {pricing && (
              <PricingCalculator pricing={pricing} />
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={generateQuote} 
                variant="primary" 
                size="lg" 
                className="flex-1"
                loading={isLoading}
                disabled={!pricing}
              >
                <ApperIcon name="FileText" className="w-4 h-4 mr-2" />
                Generate Quote
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default QuoteGenerator