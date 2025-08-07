"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, startOfWeek, endOfWeek } from "date-fns"

interface DateTimePickerProps {
  selectedDate: string
  selectedTime: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  availableSlots?: string[]
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  availableSlots = [],
  minDate = new Date(),
  maxDate = addDays(new Date(), 30),
  className = ""
}: DateTimePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
        setIsTimeOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }

  const isDateAvailable = (date: Date) => {
    return date >= minDate && date <= maxDate
  }

  const isDateSelected = (date: Date) => {
    return selectedDate === format(date, "yyyy-MM-dd")
  }

  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      onDateChange(format(date, "yyyy-MM-dd"))
      setIsCalendarOpen(false)
    }
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const timeSlots = availableSlots.length > 0 ? availableSlots : [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ]

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Date Picker */}
      <div className="relative" ref={calendarRef}>
        <Button
          variant="outline"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="w-full justify-between bg-white border-slate-200 hover:bg-slate-50"
        >
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-slate-500" />
            <span className={selectedDate ? "text-slate-900" : "text-slate-500"}>
              {selectedDate ? format(new Date(selectedDate), "EEEE, MMMM d, yyyy") : "Select date"}
            </span>
          </div>
          <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${isCalendarOpen ? "rotate-90" : ""}`} />
        </Button>

        {isCalendarOpen && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-slate-200">
            <CardContent className="p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevMonth}
                  disabled={isSameMonth(currentMonth, minDate)}
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold text-slate-900">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMonth}
                  disabled={isSameMonth(currentMonth, maxDate)}
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day) => {
                  const isAvailable = isDateAvailable(day)
                  const isSelected = isDateSelected(day)
                  const isCurrentDay = isToday(day)
                  const isOtherMonth = !isSameMonth(day, currentMonth)

                  return (
                    <Button
                      key={day.toString()}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateSelect(day)}
                      disabled={!isAvailable}
                      className={`
                        h-10 w-10 p-0 text-sm font-medium rounded-lg transition-all duration-200
                        ${isOtherMonth ? "text-slate-300" : "text-slate-700"}
                        ${isCurrentDay ? "bg-blue-100 text-blue-700 border-2 border-blue-300" : ""}
                        ${isSelected ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : ""}
                        ${isAvailable && !isSelected && !isCurrentDay ? "hover:bg-slate-100" : ""}
                        ${!isAvailable ? "text-slate-300 cursor-not-allowed" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Time Picker */}
      <div className="relative" ref={timeRef}>
        <Button
          variant="outline"
          onClick={() => setIsTimeOpen(!isTimeOpen)}
          className="w-full justify-between bg-white border-slate-200 hover:bg-slate-50"
        >
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-slate-500" />
            <span className={selectedTime ? "text-slate-900" : "text-slate-500"}>
              {selectedTime ? formatTimeDisplay(selectedTime) : "Select time"}
            </span>
          </div>
          <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${isTimeOpen ? "rotate-90" : ""}`} />
        </Button>

        {isTimeOpen && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onTimeChange(time)
                      setIsTimeOpen(false)
                    }}
                    className={`
                      justify-start text-sm font-medium transition-all duration-200
                      ${selectedTime === time 
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                        : "hover:bg-slate-100 text-slate-700"
                      }
                    `}
                  >
                    {formatTimeDisplay(time)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Date & Time Display */}
      {(selectedDate || selectedTime) && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-slate-900">
                    {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
              )}
              {selectedTime && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-slate-900">
                    {formatTimeDisplay(selectedTime)}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateChange("")
                onTimeChange("")
              }}
              className="h-6 w-6 p-0 hover:bg-white/50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 