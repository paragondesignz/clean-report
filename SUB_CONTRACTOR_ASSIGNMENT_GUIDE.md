# Sub-Contractor Job Assignment Guide

## Overview

Pro users can now assign sub-contractors to jobs, allowing them to scale their cleaning business by delegating work to external contractors. This feature provides a complete workflow for job assignment, tracking, and management.

## Features

### For Pro Users (Administrators)

#### 1. **Job Assignment**
- Assign sub-contractors to specific jobs
- Add notes and instructions for each assignment
- View assignment status and progress
- Manage multiple assignments per job

#### 2. **Assignment Management**
- **Status Tracking**: Monitor assignment progress through different stages:
  - `assigned` - Job has been assigned to sub-contractor
  - `accepted` - Sub-contractor has accepted the job
  - `in_progress` - Sub-contractor is actively working on the job
  - `completed` - Job has been completed
  - `cancelled` - Assignment has been cancelled

#### 3. **Assignment Actions**
- **Accept**: Change status from assigned to accepted
- **Start**: Change status from accepted to in progress
- **Complete**: Change status from in progress to completed
- **Remove**: Delete the assignment entirely

### For Sub-Contractors

#### 1. **Job Access**
- View assigned jobs in their dashboard
- Access job details, client information, and location
- Use built-in timer for accurate time tracking
- Upload photos and complete tasks

#### 2. **Status Updates**
- Accept or decline job assignments
- Update job progress status
- Add notes and communicate with admin

## How to Use

### Step 1: Add Sub-Contractors
1. Navigate to **Sub-Contractors** in the sidebar
2. Click **"Add Sub-Contractor"**
3. Fill in the required information:
   - First Name
   - Last Name
   - Email
   - Phone
   - Hourly Rate
   - Specialties (optional)
4. Click **"Add Sub-Contractor"**

### Step 2: Assign Jobs to Sub-Contractors
1. Navigate to any job detail page
2. In the sidebar, find the **"Sub-Contractor Assignment"** section
3. Click **"Assign"** button
4. Select a sub-contractor from the dropdown
5. Add optional notes or instructions
6. Click **"Assign"** to create the assignment

### Step 3: Manage Assignments
1. View current assignments in the job detail page
2. Use the action buttons to update assignment status:
   - **Accept**: When sub-contractor accepts the job
   - **Start**: When sub-contractor begins work
   - **Complete**: When job is finished
   - **Remove**: To cancel the assignment

## Database Schema

### Sub-Contractor Job Assignments Table
```sql
sub_contractor_job_assignments (
  id: UUID PRIMARY KEY
  job_id: UUID REFERENCES jobs(id)
  sub_contractor_id: UUID REFERENCES sub_contractors(id)
  assigned_at: TIMESTAMP
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  notes: TEXT (sub-contractor notes)
  admin_notes: TEXT (admin notes)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

## API Endpoints

### Get Job Assignments
```
GET /api/sub-contractors/job-assignments/{jobId}
```
Returns all assignments for a specific job.

### Assign Job to Sub-Contractor
```
POST /api/sub-contractors/assign-job
```
Body:
```json
{
  "job_id": "uuid",
  "sub_contractor_id": "uuid",
  "notes": "optional notes"
}
```

### Update Assignment
```
PATCH /api/sub-contractors/assignments/{assignmentId}
```
Body:
```json
{
  "status": "new_status",
  "notes": "optional notes",
  "admin_notes": "optional admin notes"
}
```

### Delete Assignment
```
DELETE /api/sub-contractors/assignments/{assignmentId}
```

## Security & Permissions

### Row Level Security (RLS)
- Administrators can only manage assignments for their own sub-contractors
- Sub-contractors can only view and update their own assignments
- All operations are validated against user permissions

### Access Control
- Only Pro users with `subContractors` feature access can assign jobs
- Sub-contractors must be in `active` status to be assigned
- Users can only assign jobs they own to their own sub-contractors

## Workflow Example

1. **Admin creates a job** for client "ABC Company"
2. **Admin assigns the job** to sub-contractor "John Smith"
3. **John receives notification** and can view the job in his dashboard
4. **John accepts the assignment** (status: accepted)
5. **John starts the job** (status: in_progress)
6. **John completes the job** (status: completed)
7. **Admin can review** the completed work and photos

## Benefits

### For Administrators
- **Scale Operations**: Delegate work to trusted contractors
- **Track Progress**: Monitor job status in real-time
- **Quality Control**: Review completed work and photos
- **Flexibility**: Assign multiple contractors to complex jobs

### For Sub-Contractors
- **Clear Instructions**: Receive detailed job information
- **Easy Tracking**: Built-in timer and photo upload
- **Communication**: Direct access to admin contact
- **Professional Tools**: Access to client information and locations

## Troubleshooting

### Common Issues

1. **"No sub-contractors available"**
   - Ensure you have added sub-contractors in the Sub-Contractors page
   - Verify sub-contractors are in "active" status

2. **"Cannot assign job"**
   - Check that you have Pro subscription with sub-contractor access
   - Verify the job belongs to your account
   - Ensure the sub-contractor is active

3. **"Assignment not found"**
   - Refresh the page to reload assignments
   - Check if the assignment was deleted by another user

### Support
For technical issues or questions about sub-contractor assignments, contact support through the Help & Support section in Settings.
