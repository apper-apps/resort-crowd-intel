import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { leadService } from "@/services/api/leadService";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Textarea from "@/components/atoms/Textarea";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const BookingConfirmations = () => {
  const [wonLeads, setWonLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [confirmationText, setConfirmationText] = useState("")
  const [advanceAmount, setAdvanceAmount] = useState("")

  useEffect(() => {
    loadWonLeads()
  }, [])

const loadWonLeads = async () => {
    setLoading(true)
    try {
      const allLeads = await leadService.getAll()
      const won = allLeads.filter(lead => lead.status === "won")
      setWonLeads(won)
    } catch (error) {
      toast.error(error.message || "Failed to load booking confirmations")
    } finally {
      setLoading(false)
    }
  }
  const generateConfirmationText = (lead, quote, advance) => {
    const checkinDate = format(new Date(lead.checkinDate), "dd MMM yyyy")
    const checkoutDate = format(new Date(lead.checkoutDate), "dd MMM yyyy")
    const nights = Math.ceil((new Date(lead.checkoutDate) - new Date(lead.checkinDate)) / (1000 * 60 * 60 * 24))

    return `🏨 *BOOKING CONFIRMED* 🏨

Dear ${lead.name},

Thank you for choosing Grand Resort Mahabaleshwar! Your booking has been confirmed.

📋 *BOOKING DETAILS:*
• Guest Name: ${lead.name}
• Mobile: ${lead.mobile}
• Check-in: ${checkinDate}
• Check-out: ${checkoutDate}
• Duration: ${nights} night(s)
• Room(s): ${quote.rooms.length}
• Meal Plan: ${quote.mealPlans.join(", ")}

💰 *PAYMENT DETAILS:*
• Total Amount: ₹${quote.totalAmount.toLocaleString()}
• Advance Paid: ₹${advance.toLocaleString()}
• Balance: ₹${(quote.totalAmount - advance).toLocaleString()}

📍 *RESORT DETAILS:*
Grand Resort Mahabaleshwar
Address: [Resort Address]
Contact: [Resort Contact]

⭐ *WHAT'S INCLUDED:*
• Comfortable accommodation
• ${quote.mealPlans.includes("CP") ? "Complimentary breakfast" : quote.mealPlans.includes("MAP") ? "Breakfast & dinner" : "All meals"}
• Access to all resort facilities
• 24/7 room service
• Free Wi-Fi

📌 *CHECK-IN INSTRUCTIONS:*
• Check-in time: 2:00 PM
• Check-out time: 11:00 AM
• Please carry original ID proof
• Balance amount to be paid at check-in

Looking forward to hosting you at Grand Resort Mahabaleshwar!

For any queries, feel free to contact us.

Best regards,
Grand Resort Mahabaleshwar Team`
  }

  const handleGenerateConfirmation = (lead) => {
    const latestQuote = lead.quotes[lead.quotes.length - 1]
    if (!latestQuote) {
      toast.error("No quote found for this lead")
      return
    }

    setSelectedLead(lead)
    setAdvanceAmount(latestQuote.advanceAmount.toString())
    setConfirmationText(generateConfirmationText(lead, latestQuote, latestQuote.advanceAmount))
  }

  const handleSendConfirmation = () => {
    if (!selectedLead || !confirmationText || !advanceAmount) {
      toast.error("Please fill in all required fields")
      return
    }

    // Copy to clipboard
    navigator.clipboard.writeText(confirmationText)
    toast.success("Booking confirmation copied to clipboard!")
    
    // Close modal
    setSelectedLead(null)
    setConfirmationText("")
    setAdvanceAmount("")
  }

  if (loading) return <Loading type="cards" />

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
          Booking Confirmations
        </h2>

        {wonLeads.length === 0 ? (
          <Empty
            title="No confirmed bookings"
            description="Bookings marked as 'Won' will appear here for confirmation processing."
            icon="Calendar"
          />
        ) : (
          <div className="space-y-4">
            {wonLeads.map((lead) => (
              <motion.div
                key={lead.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-success/20 rounded-lg p-4 bg-success/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-primary">{lead.name}</h3>
                      <Badge variant="success">
                        <ApperIcon name="CheckCircle" className="w-3 h-3 mr-1" />
                        Confirmed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Phone" className="w-4 h-4 text-slate-500" />
                        <span>{lead.mobile}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Calendar" className="w-4 h-4 text-slate-500" />
                        <span>
                          {format(new Date(lead.checkinDate), "MMM dd")} - {format(new Date(lead.checkoutDate), "MMM dd, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <ApperIcon name="IndianRupee" className="w-4 h-4 text-slate-500" />
                        <span>
                          {lead.quotes.length > 0 && (
                            <>₹{lead.quotes[lead.quotes.length - 1].totalAmount.toLocaleString()}</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleGenerateConfirmation(lead)}
                    variant="accent"
                    size="sm"
                  >
                    <ApperIcon name="FileText" className="w-4 h-4 mr-2" />
                    Generate Confirmation
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      {selectedLead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLead(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">
                  Booking Confirmation - {selectedLead.name}
                </h3>
                <Button
                  onClick={() => setSelectedLead(null)}
                  variant="ghost"
                  size="sm"
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Advance Amount Received (₹)"
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  placeholder="Enter advance amount"
                />

                <Textarea
                  label="Confirmation Message"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setSelectedLead(null)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendConfirmation}
                    variant="accent"
                  >
                    <ApperIcon name="Copy" className="w-4 h-4 mr-2" />
                    Copy & Send
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default BookingConfirmations