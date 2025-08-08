"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trash2, RefreshCw, Calendar, CalendarX } from "lucide-react"

interface RecurringJobDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (deleteType: 'single' | 'all' | 'future') => Promise<void>
  jobTitle: string
  isRecurring: boolean
}

export function RecurringJobDeleteDialog({
  open,
  onOpenChange,
  onDelete,
  jobTitle,
  isRecurring
}: RecurringJobDeleteDialogProps) {
  const [deleteType, setDeleteType] = useState<'single' | 'all' | 'future'>('single')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(deleteType)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting job:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // If not a recurring job, show simple confirmation
  if (!isRecurring) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-red-600" />
              Delete Job
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{jobTitle}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
            Delete Recurring Job
          </DialogTitle>
          <DialogDescription>
            This job is part of a recurring series. Choose how you'd like to delete it:
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup value={deleteType} onValueChange={(value) => setDeleteType(value as typeof deleteType)}>
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="single" id="single" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="single" className="flex items-center font-medium cursor-pointer">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Delete only this instance
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Remove just this occurrence. Future scheduled instances will remain.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="future" id="future" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="future" className="flex items-center font-medium cursor-pointer">
                  <CalendarX className="h-4 w-4 mr-2 text-orange-600" />
                  Delete this and future instances
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Remove this occurrence and all future scheduled instances.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="all" id="all" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="all" className="flex items-center font-medium cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                  Delete entire recurring series
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Remove all instances (past, present, and future) of this recurring job.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteType === 'single' && 'Delete This Instance'}
                {deleteType === 'future' && 'Delete This & Future'}
                {deleteType === 'all' && 'Delete All Instances'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}