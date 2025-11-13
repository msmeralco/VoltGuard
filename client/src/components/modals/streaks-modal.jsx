import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function getEfficiencyLevel(avgConsumption) {
  if (avgConsumption === 0) return { level: "Starter / New", color: "#FFFFFF" }
  if (avgConsumption > 80) return { level: "Low Efficiency", color: "#FE8D00" }
  if (avgConsumption > 60) return { level: "Medium Efficiency", color: "#FFC94A" }
  if (avgConsumption > 40) return { level: "High Efficiency", color: "#245C94" }
  return { level: "Perfect Streak", color: "#1C74D9" }
}

export function StreaksModal({ onClose }) {
  const avgConsumption = 35 // This represents the average daily consumption percentage
  const efficiency = getEfficiencyLevel(avgConsumption)

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-md rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">Streak History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Streak</p>
            <p className="text-3xl font-bold text-foreground mt-2">5 Days</p>
            <p className="text-sm text-muted-foreground mt-1">Below-average consumption</p>
          </div>

          {/* Daily Usage Graph */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Daily Usage Pattern</p>
            <div className="flex items-end gap-1 h-20">
              {[40, 35, 50, 30, 25, 45, 38].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-sm opacity-70 hover:opacity-100 transition-all duration-500 animate-in slide-in-from-bottom"
                  style={{ 
                    height: `${height}%`,
                    animationDelay: `${i * 100}ms`,
                    animationFillMode: 'backwards'
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Your Energy Pet</p>
            <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md border border-white/30 shadow-lg">
              {/* Glass background with radial gradient */}
              <div className="p-8 flex flex-col items-center justify-center min-h-[280px] relative">
                {/* Radial gradient behind pet */}
                <div 
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(circle at center, ${efficiency.color} 0%, transparent 70%)`
                  }}
                />
                
                {/* Pet Image */}
                <div className="w-48 h-48 relative mb-4 z-10">
                  <img
                    src="/images/energy-pet.png"
                    alt="Energy Pet"
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>

                {/* Efficiency Level Label */}
                <div className="bg-card/95 backdrop-blur-sm rounded-full px-6 py-2 border border-border shadow-lg z-10">
                  <p className="text-sm font-bold text-foreground text-center">{efficiency.level}</p>
                </div>
              </div>
            </div>

            {/* Efficiency Description */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Keep up your energy-saving habits to reach the next level!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
