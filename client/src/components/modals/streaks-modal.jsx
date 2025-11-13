import { X, Flame, TrendingUp, Award, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

// Four-tier streak system with pet evolution
function getStreakTier(streakDays, dailyUsageMinutes, missedDays) {
  // Starter: New users or after reset
  if (streakDays === 0 || missedDays > 2) {
    return {
      tier: "Starter",
      color: "#FFFFFF",
      gradient: "from-gray-100 to-gray-300",
      borderColor: "border-gray-300",
      image: "/images/energy-pet-starter.png",
      description: "Just starting your energy-saving journey!",
      petState: "Base form - small and inactive",
      nextTier: "Stay active for 4 days to reach Steady tier",
      badgeColor: "bg-gray-400",
      animation: "animate-bounce"
    }
  }
  
  // Low Activity: Missed days or low interaction
  if (streakDays < 4 || dailyUsageMinutes > 180 || missedDays >= 1) {
    return {
      tier: "Low Activity",
      color: "#FE8D00",
      gradient: "from-orange-400 to-orange-600",
      borderColor: "border-orange-400",
      image: "/images/energy-pet-bad.png",
      description: "Your pet needs more attention and care",
      petState: "Dull and sleepy - showing signs of neglect",
      nextTier: "Engage daily for 4+ days to reach Steady",
      badgeColor: "bg-orange-500",
      animation: "animate-bounce"
    }
  }
  
  // Steady: Consistent engagement (4-10 days) with acceptable usage
  if (streakDays >= 4 && streakDays <= 10 && dailyUsageMinutes <= 120) {
    return {
      tier: "Steady",
      color: "#FFC94A",
      gradient: "from-yellow-400 to-yellow-600",
      borderColor: "border-yellow-400",
      image: "/images/energy-pet-medium.png",
      description: "Great progress! Keep up the good work",
      petState: "Lively and growing - balanced care showing results",
      nextTier: "Maintain 11+ days for High Performer status",
      badgeColor: "bg-yellow-500",
      animation: "animate-bounce"
    }
  }
  
  // High Performer: 11+ days with efficient consumption
  if (streakDays > 10 && dailyUsageMinutes < 90) {
    return {
      tier: "High Performer",
      color: "#245C94",
      gradient: "from-blue-500 to-blue-700",
      borderColor: "border-blue-500",
      image: "/images/energy-pet-good.png",
      description: "Excellent! You're a VoltGuard champion!",
      petState: "Fully evolved - glowing and animated",
      nextTier: "Keep going to maintain your elite status!",
      badgeColor: "bg-blue-600",
      animation: "animate-bounce"
    }
  }
  
  // Default to Steady if conditions don't match
  return {
    tier: "Steady",
    color: "#FFC94A",
    gradient: "from-yellow-400 to-yellow-600",
    borderColor: "border-yellow-400",
    image: "/images/energy-pet-medium.png",
    description: "You're on the right track!",
    petState: "Growing steadily",
    nextTier: "Keep engaging to reach High Performer",
    badgeColor: "bg-yellow-500",
    animation: "animate-bounce"
  }
}

export function StreaksModal({ onClose }) {
  // TODO: Replace with actual API data
  const [streakData, setStreakData] = useState({
    currentStreak: 7,
    bestStreak: 15,
    missedDays: 0,
    weeklyUsage: [80, 90, 120, 75, 60, 110, 95], // Minutes per day
    totalDaysActive: 42,
    rewardsEarned: 3
  })

  const avgDailyUsage = Math.round(
    streakData.weeklyUsage.reduce((a, b) => a + b, 0) / streakData.weeklyUsage.length
  )
  
  const tierStatus = getStreakTier(
    streakData.currentStreak, 
    avgDailyUsage, 
    streakData.missedDays
  )

  const [petAnimation, setPetAnimation] = useState(false)

  // Trigger pet animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setPetAnimation(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-md rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-foreground">Streak Progress</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
          {/* Current Streak - Tier Badge */}
          <div className={`bg-gradient-to-br ${tierStatus.gradient} rounded-2xl p-4 shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${tierStatus.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                {tierStatus.tier}
              </span>
              <Award className="w-5 h-5 text-white" />
            </div>
            <p className="text-4xl font-bold text-white mt-2 flex items-center gap-2">
              {streakData.currentStreak} <span className="text-2xl">Days</span>
            </p>
            <p className="text-sm text-white/90 mt-1">{tierStatus.description}</p>
            
            {/* Progress to next tier */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/80 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {tierStatus.nextTier}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Best Streak</p>
              <p className="text-2xl font-bold text-foreground mt-1">{streakData.bestStreak}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
            <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Usage</p>
              <p className="text-2xl font-bold text-foreground mt-1">{avgDailyUsage}</p>
              <p className="text-xs text-muted-foreground">min/day</p>
            </div>
          </div>

          {/* Weekly Usage Graph */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Weekly Activity
              </p>
              <span className="text-xs text-muted-foreground">Minutes</span>
            </div>
            <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-4">
              <div className="flex items-end gap-1.5 h-24">
                {streakData.weeklyUsage.map((usage, i) => {
                  const height = (usage / 180) * 100 // Max 3 hours scale
                  const isToday = i === streakData.weeklyUsage.length - 1
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm transition-all duration-500 relative group cursor-pointer ${
                        isToday ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-gradient-to-t from-primary to-primary/50'
                      }`}
                      style={{ 
                        height: `${height}%`,
                        animationDelay: `${i * 100}ms`,
                        opacity: 0.8
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {usage} min
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-3">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span className="font-semibold text-blue-600">Sun</span>
              </div>
            </div>
          </div>

          {/* Energy Pet Evolution */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center justify-between">
              <span>Your Energy Pet</span>
              <span className={`text-xs ${tierStatus.badgeColor} text-white px-2 py-1 rounded-full`}>
                {tierStatus.tier}
              </span>
            </p>
            <div className={`relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md border-2 ${tierStatus.borderColor} shadow-lg`}>
              {/* Animated radial gradient background */}
              <div className="p-8 flex flex-col items-center justify-center min-h-[300px] relative">
                <div 
                  className={`absolute inset-0 transition-all duration-1000 ${petAnimation ? 'opacity-70' : 'opacity-0'}`}
                  style={{
                    background: `radial-gradient(circle at center, ${tierStatus.color} 0%, transparent 70%)`
                  }}
                />
                
                {/* Pet Image with evolution animation */}
                <div className={`w-52 h-52 relative mb-4 z-10 transition-all duration-700 ${tierStatus.animation} ${petAnimation ? 'scale-100' : 'scale-75 opacity-0'}`}>
                  <img
                    src={tierStatus.image}
                    alt={`${tierStatus.tier} Energy Pet`}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                  
                  {/* Sparkle effect for High Performer */}
                  {tierStatus.tier === "High Performer" && (
                    <div className="absolute inset-0 animate-ping opacity-20">
                      <div className="w-full h-full rounded-full bg-blue-400" />
                    </div>
                  )}
                </div>

                {/* Pet State Label */}
                <div className={`bg-card/95 backdrop-blur-sm rounded-full px-6 py-2 border-2 ${tierStatus.borderColor} shadow-lg z-10 transition-all duration-500 ${petAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <p className="text-sm font-bold text-foreground text-center">{tierStatus.tier}</p>
                </div>

                {/* Pet State Description */}
                <div className={`mt-3 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 z-10 transition-all duration-700 delay-300 ${petAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <p className="text-xs text-gray-700 text-center italic">
                    "{tierStatus.petState}"
                  </p>
                </div>
              </div>
            </div>

            {/* Tier Progress Indicator */}
            <div className="mt-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Tier Progress</span>
                <span className="text-xs text-muted-foreground">{streakData.currentStreak} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${tierStatus.gradient} transition-all duration-1000 rounded-full`}
                  style={{ 
                    width: `${Math.min((streakData.currentStreak / 11) * 100, 100)}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {tierStatus.nextTier}
              </p>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-300/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-semibold text-foreground">Rewards Earned</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{streakData.rewardsEarned}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unlock more by maintaining your streak!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
