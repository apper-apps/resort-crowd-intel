export const calculateQuoteTotals = (rooms, checkinDate, checkoutDate, tariffs, overallDiscount = 0) => {
  const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24))
  
  if (nights <= 0) {
    throw new Error("Invalid date range")
  }

  const roomTotals = rooms.map((room, roomIndex) => {
    const tariff = tariffs.find(t => t.roomType === room.type)
    if (!tariff) {
      throw new Error(`Tariff not found for room type: ${room.type}`)
    }

    let roomTotal = 0
    const nightBreakdown = []

    // Calculate each night
    for (let nightIndex = 0; nightIndex < nights; nightIndex++) {
      const currentDate = new Date(checkinDate)
      currentDate.setDate(currentDate.getDate() + nightIndex)
      
      // Get season rate
      const month = currentDate.getMonth() + 1
      let seasonRate = tariff.seasonRates.find(sr => {
        if (sr.startMonth <= sr.endMonth) {
          return month >= sr.startMonth && month <= sr.endMonth
        } else {
          // Handle year-end crossing (e.g., Dec-Feb)
          return month >= sr.startMonth || month <= sr.endMonth
        }
      })

      if (!seasonRate) {
        // Fallback to regular season
        seasonRate = tariff.seasonRates.find(sr => sr.season === "Regular") || tariff.seasonRates[0]
      }

      let nightRate = seasonRate.rate

      // Add AC charges
      if (room.hasAC) {
        nightRate += tariff.acCharges
      }

      // Add extra adult charges
      if (room.adults > 2) {
        nightRate += (room.adults - 2) * tariff.extraAdultCharge
      }

      // Add child charges
      if (room.children > 0) {
        nightRate += room.children * tariff.childCharge
      }

      // Apply nightly discount
      const nightlyDiscount = room.nightlyDiscounts?.[nightIndex] || 0
      if (nightlyDiscount > 0) {
        nightRate = nightRate * (1 - nightlyDiscount / 100)
      }

      nightBreakdown.push({
        night: nightIndex + 1,
        date: currentDate.toISOString().split('T')[0],
        baseRate: seasonRate.rate,
        totalRate: nightRate,
        season: seasonRate.season
      })

      roomTotal += nightRate
    }

    return {
      roomIndex,
      type: room.type,
      nights: nightBreakdown,
      total: Math.round(roomTotal)
    }
  })

  // Calculate totals
  const subtotal = roomTotals.reduce((sum, room) => sum + room.total, 0)
  
  // Apply overall discount
  const discountedSubtotal = overallDiscount > 0 ? 
    subtotal * (1 - overallDiscount / 100) : subtotal

  // Calculate average room rate for GST determination
  const totalRoomNights = rooms.length * nights
  const avgRoomRate = discountedSubtotal / totalRoomNights
  
  // Determine GST rate
  const gstRate = avgRoomRate > 7500 ? 0.18 : 0.12
  const gst = Math.round(discountedSubtotal * gstRate)
  
  const finalTotal = Math.round(discountedSubtotal + gst)

  return {
    roomTotals,
    subtotal: Math.round(subtotal),
    discountedSubtotal: Math.round(discountedSubtotal),
    gst,
    gstRate,
    finalTotal,
    avgRoomRate: Math.round(avgRoomRate),
    nights,
    overallDiscount
  }
}