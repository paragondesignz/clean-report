"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Clock, Calendar, AlertCircle } from "lucide-react"

interface RecurringTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskTitle: string
  jobTitle: string
  onAddToRecurring: (frequency: string, customWeeks?: number) => void
  onAddOnceOnly: () => void
}

export function RecurringTaskDialog({
  open,
  onOpenChange,
  taskTitle,
  jobTitle,
  onAddToRecurring,
  onAddOnceOnly
}: RecurringTaskDialogProps) {
  const [frequency, setFrequency] = useState<string>("monthly")
  const [customWeeks, setCustomWeeks] = useState<number>(4)

  const handleAddToRecurring = () => {
    if (frequency === "custom") {
      onAddToRecurring(frequency, customWeeks)
    } else {
      onAddToRecurring(frequency)
    }
    onOpenChange(false)
  }

  const handleAddOnceOnly = () => {
    onAddOnceOnly()
    onOpenChange(false)
  }

  const getFrequencyDescription = (freq: string, weeks?: number) => {
    switch (freq) {
      case "weekly": return "Every week"
      case "bi_weekly": return "Every 2 weeks"
      case "monthly": return "Every month"
      case "quarterly": return "Every 3 months"
      case "bi_annual": return "Twice per year"
      case "annual": return "Once per year"
      case "custom": return `Every ${weeks || customWeeks} weeks`
      default: return "Unknown frequency"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span>Add Task to Recurring Job?</span>
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                You've added <strong>"{taskTitle}"</strong> to this instance of 
                <strong> "{jobTitle}"</strong>.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Would you like to add this task to future instances of this recurring job?
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add to Recurring Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <Label className="text-sm font-medium text-green-800">
                Add to future instances
              </Label>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Recommended
              </Badge>
            </div>
            
            <div className="pl-6 space-y-4">
              <p className="text-sm text-gray-600">
                Choose how often this task should be added to future jobs:
              </p>
              
              <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>Weekly</span>
                      <span className="text-xs text-gray-500">Most frequent</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="bi_weekly" id="bi_weekly" />
                  <Label htmlFor="bi_weekly" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>Bi-weekly (every 2 weeks)</span>
                      <span className="text-xs text-gray-500">Common for maintenance</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>Monthly</span>
                      <span className="text-xs text-gray-500">Default</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>Quarterly (every 3 months)</span>
                      <span className="text-xs text-gray-500">Deep cleaning tasks</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="bi_annual" id="bi_annual" />
                  <Label htmlFor="bi_annual" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>Bi-annual (twice per year)</span>
                      <span className="text-xs text-gray-500">Seasonal tasks</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>Annual (once per year)</span>
                      <span className="text-xs text-gray-500">Least frequent</span>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="text-sm cursor-pointer">
                    Custom frequency
                  </Label>
                </div>
                
                {frequency === "custom" && (
                  <div className="pl-6 flex items-center space-x-2">
                    <Label htmlFor="customWeeks" className="text-sm">Every</Label>
                    <Input
                      id="customWeeks"
                      type="number"
                      min="1"
                      max="52"
                      value={customWeeks}
                      onChange={(e) => setCustomWeeks(parseInt(e.target.value) || 1)}
                      className="w-20 h-8"
                    />
                    <Label className="text-sm">weeks</Label>
                  </div>
                )}
              </RadioGroup>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <strong>Preview:</strong> "{taskTitle}" will be added {getFrequencyDescription(frequency, customWeeks).toLowerCase()} to future "{jobTitle}" jobs.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Once Only Section */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <Label className="text-sm font-medium text-orange-800">
                Keep as one-time task
              </Label>
            </div>
            <p className="text-sm text-gray-600 pl-6">
              Only add this task to the current job instance. Future instances of "{jobTitle}" will not include this task.
            </p>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleAddOnceOnly}
            className="flex items-center space-x-2"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Once Only</span>
          </Button>
          <Button 
            onClick={handleAddToRecurring}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Add to Recurring ({getFrequencyDescription(frequency, customWeeks)})</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}