import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"

export function AnalyticsModal({ onClose }) {
  const [month, setMonth] = useState("November")
  const [monthIndex, setMonthIndex] = useState(10) // November = 10 (0-indexed)

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Generate calendar data with realistic consumption patterns
  const generateCalendarData = (monthIdx) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const days = daysInMonth[monthIdx]
    
    return Array.from({ length: days }, (_, i) => {
      // Weekends tend to have higher consumption
      const isWeekend = (i % 7 === 0 || i % 7 === 6)
      const baseConsumption = Math.random() * 100
      const consumption = isWeekend ? baseConsumption * 1.2 : baseConsumption
      
      if (consumption < 33) return "low"
      if (consumption < 66) return "medium"
      return "high"
    })
  }

  // Generate appliance data for different months
  const generateApplianceData = (monthIdx) => {
    // October data (previous month)
    if (monthIdx === 9) {
      return [
        { name: "Air Conditioner", current: 260, previous: 245, voltage: "240V" },
        { name: "Refrigerator", current: 115, previous: 118, voltage: "220V" },
        { name: "Water Heater", current: 90, previous: 88, voltage: "240V" },
        { name: "Lighting", current: 40, previous: 42, voltage: "120V" },
      ]
    }
    
    // November data (current month)
    return [
      { name: "Air Conditioner", current: 240, previous: 260, voltage: "240V" },
      { name: "Refrigerator", current: 120, previous: 115, voltage: "220V" },
      { name: "Water Heater", current: 85, previous: 90, voltage: "240V" },
      { name: "Lighting", current: 35, previous: 40, voltage: "120V" },
    ]
  }

  const calendarDays = generateCalendarData(monthIndex)
  const appliances = generateApplianceData(monthIndex)

  // Calculate improvement percentage
  const totalCurrent = appliances.reduce((sum, app) => sum + app.current, 0)
  const totalPrevious = appliances.reduce((sum, app) => sum + app.previous, 0)
  const improvement = Math.round(((totalPrevious - totalCurrent) / totalPrevious) * 100)
  const isImproved = improvement > 0

  const handlePreviousMonth = () => {
    const newIndex = monthIndex === 0 ? 11 : monthIndex - 1
    setMonthIndex(newIndex)
    setMonth(months[newIndex])
  }

  const handleNextMonth = () => {
    const newIndex = monthIndex === 11 ? 0 : monthIndex + 1
    setMonthIndex(newIndex)
    setMonth(months[newIndex])
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-md rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-card/95 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">Monthly Analytics</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
          {/* Monthly Comparison */}
          <div className={`bg-gradient-to-br ${isImproved ? 'from-green-500/20 to-green-500/10 border-green-500/30' : 'from-red-500/20 to-red-500/10 border-red-500/30'} border rounded-2xl p-4`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">This Month vs Last Month</p>
            <p className="text-xl font-bold text-foreground mt-2">
              {isImproved ? `${improvement}% Improvement` : `${Math.abs(improvement)}% Increase`}
            </p>
            <p className={`text-sm mt-1 ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
              {isImproved 
                ? 'Overall energy efficiency improved this month' 
                : 'Energy consumption increased this month'}
            </p>
          </div>

          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">Daily Consumption</p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-medium min-w-[80px] text-center">{month}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <div key={day} className="text-xs font-semibold text-center text-muted-foreground py-1">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium border ${
                    day === "low"
                      ? "bg-primary/30 border-primary/50 text-primary"
                      : day === "medium"
                        ? "bg-yellow-500/30 border-yellow-500/50 text-yellow-700"
                        : "bg-destructive/30 border-destructive/50 text-destructive"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary rounded" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-destructive rounded" />
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Key Insights</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Peak Hours</p>
                <p className="text-sm font-semibold text-foreground">6–9 PM</p>
              </div>
              <div className="flex-1 bg-muted/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Top Consumer</p>
                <p className="text-sm font-semibold text-foreground">AC</p>
              </div>
            </div>
          </div>

          {/* Appliances */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Appliance Overview</p>
            <div className="space-y-2">
              {appliances.map((app) => (
                <div key={app.name} className="bg-muted/30 border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-foreground">{app.name}</p>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{app.voltage}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {app.current}kWh</span>
                    <span>Previous: {app.previous}kWh</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 mt-2">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(app.current / (app.current + app.previous)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
