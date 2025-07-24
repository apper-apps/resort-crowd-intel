import { format } from "date-fns"

export const generateQuoteText = (formData, pricing) => {
  const checkinDate = format(new Date(formData.checkinDate), "dd MMM yyyy")
  const checkoutDate = format(new Date(formData.checkoutDate), "dd MMM yyyy")
  const nights = pricing.nights

  const roomDetails = formData.rooms.map((room, index) => {
    const roomTotal = pricing.roomTotals[index]
    return `Room ${index + 1}: ${room.type} ${room.hasAC ? "(AC)" : "(Non-AC)"} - ${room.adults} Adult(s), ${room.children} Child(ren) = ₹${roomTotal.total.toLocaleString()}`
  }).join("\n")

  const mealPlanText = formData.mealPlans.includes("CP") ? "Continental Plan (Breakfast)" :
                      formData.mealPlans.includes("MAP") ? "Modified American Plan (Breakfast + Dinner)" :
                      formData.mealPlans.includes("AP") ? "American Plan (All Meals)" : "Room Only"

  const gstText = pricing.avgRoomRate > 7500 ? "18%" : "12%"

  return `🏨 *GRAND RESORT MAHABALESHWAR* 🏨

Dear ${formData.clientName},

Greetings from Grand Resort Mahabaleshwar!

Thank you for your inquiry. Please find below the quote for your stay:

📋 *BOOKING DETAILS:*
• Guest Name: ${formData.clientName}
• Mobile: ${formData.mobile}
• Check-in: ${checkinDate}
• Check-out: ${checkoutDate}
• Duration: ${nights} night(s)
• Meal Plan: ${mealPlanText}

🏠 *ROOM DETAILS:*
${roomDetails}

💰 *PRICING BREAKDOWN:*
• Room Charges: ₹${pricing.subtotal.toLocaleString()}
${pricing.overallDiscount > 0 ? `• Discount (${pricing.overallDiscount}%): -₹${(pricing.subtotal - pricing.discountedSubtotal).toLocaleString()}` : ""}
• GST (${gstText}): ₹${pricing.gst.toLocaleString()}
• *Total Amount: ₹${pricing.finalTotal.toLocaleString()}*

💳 *PAYMENT TERMS:*
• Advance: ₹${Math.round(pricing.finalTotal * 0.3).toLocaleString()} (30%)
• Balance: ₹${(pricing.finalTotal - Math.round(pricing.finalTotal * 0.3)).toLocaleString()} (at check-in)

⭐ *INCLUSIONS:*
• Comfortable accommodation as per selection
• ${mealPlanText}
• Access to all resort facilities
• Swimming pool, indoor games, outdoor activities
• 24/7 room service
• Free Wi-Fi
• Complimentary parking

📞 *CONTACT DETAILS:*
Grand Resort Mahabaleshwar
📍 [Resort Address]
📞 [Resort Contact Number]
📧 [Resort Email]

⏰ *CHECK-IN/OUT:*
• Check-in: 2:00 PM
• Check-out: 11:00 AM

📌 *TERMS & CONDITIONS:*
• Rates are subject to availability
• Valid ID proof required at check-in
• Cancellation charges as per hotel policy
• Outside food & beverages not allowed
• Peak season rates may apply

For confirmation or any queries, please feel free to contact us.

Looking forward to hosting you at Grand Resort Mahabaleshwar!

Best regards,
Grand Resort Mahabaleshwar Team

---
*This quote is valid for 48 hours from the date of generation.*`
}