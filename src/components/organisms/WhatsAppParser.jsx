import { useState } from "react"
import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Textarea from "@/components/atoms/Textarea"
import ApperIcon from "@/components/ApperIcon"
import { parseWhatsAppInquiry } from "@/utils/inquiryParser"

const WhatsAppParser = ({ onParse }) => {
  const [inputText, setInputText] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleParse = () => {
    if (!inputText.trim()) return

    const parsedData = parseWhatsAppInquiry(inputText)
    onParse(parsedData)
    setInputText("")
  }

  return (
    <Card className="border-dashed border-2 border-info/30 bg-gradient-to-r from-info/5 to-blue-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ApperIcon name="MessageSquare" className="w-5 h-5 text-info" />
          <h3 className="text-lg font-semibold text-info">WhatsApp Inquiry Parser</h3>
        </div>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
        >
          <ApperIcon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            className="w-4 h-4" 
          />
        </Button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: "hidden" }}
      >
        <div className="space-y-4">
          <Textarea
            placeholder="Paste WhatsApp message here... e.g., 'Hi, I need 2 rooms for 4 people from 15th March to 17th March. My name is John and mobile is 9876543210'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="bg-white"
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Parser will automatically extract: name, mobile, dates, room requirements
            </div>
            <Button
              onClick={handleParse}
              variant="info"
              disabled={!inputText.trim()}
            >
              <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
              Parse Message
            </Button>
          </div>
        </div>
      </motion.div>
    </Card>
  )
}

export default WhatsAppParser