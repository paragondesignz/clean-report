'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Edit, Save } from 'lucide-react'
import { updateRecurringJob, getJobsForRecurringJob, updateJob } from '@/lib/supabase-client'
import type { RecurringJob } from '@/types/database'

interface RecurringJobEditDialogProps {
  recurringJob: RecurringJob
  onUpdate?: () => void
  trigger?: React.ReactNode
}

export function RecurringJobEditDialog({ recurringJob, onUpdate, trigger }: RecurringJobEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: recurringJob.title,
    description: recurringJob.description,
    frequency: recurringJob.frequency,
    start_date: recurringJob.start_date,
    end_date: recurringJob.end_date || '',
    scheduled_time: recurringJob.scheduled_time,
    agreed_hours: recurringJob.agreed_hours?.toString() || '',
    is_active: recurringJob.is_active
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setFormData({
        title: recurringJob.title,
        description: recurringJob.description,
        frequency: recurringJob.frequency,
        start_date: recurringJob.start_date,
        end_date: recurringJob.end_date || '',
        scheduled_time: recurringJob.scheduled_time,
        agreed_hours: recurringJob.agreed_hours?.toString() || '',
        is_active: recurringJob.is_active
      })
    }
  }, [open, recurringJob])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update the recurring job
      await updateRecurringJob(recurringJob.id, {
        ...formData,
        agreed_hours: formData.agreed_hours ? parseFloat(formData.agreed_hours) : null
      })

      // Get all job instances and update them with the new details
      const jobInstances = await getJobsForRecurringJob(recurringJob.id)
      
      // Update future instances (not completed ones)
      const futureInstances = jobInstances.filter(job => 
        job.status !== 'completed' && 
        new Date(job.scheduled_date) >= new Date()
      )

      // Update each future instance
      for (const job of futureInstances) {
        await updateJob(job.id, {
          title: formData.title,
          description: formData.description,
          scheduled_time: formData.scheduled_time,
          agreed_hours: formData.agreed_hours ? parseFloat(formData.agreed_hours) : null
        })
      }

      toast({
        title: 'Success',
        description: `Recurring job updated successfully. ${futureInstances.length} future instances were also updated.`
      })

      setOpen(false)
      onUpdate?.()
    } catch (error) {
      console.error('Error updating recurring job:', error)
      toast({
        title: 'Error',
        description: 'Failed to update recurring job',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-blue-600 hover:text-blue-700"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recurring Job</DialogTitle>
          <DialogDescription>
            Update this recurring job. Future job instances will be updated automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value as typeof formData.frequency })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_time">Scheduled Time</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="agreed_hours">Agreed Hours per Job (Optional)</Label>
              <Input
                id="agreed_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.agreed_hours}
                onChange={(e) => setFormData({ ...formData, agreed_hours: e.target.value })}
                placeholder="e.g., 2.5"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter className="flex items-center justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}