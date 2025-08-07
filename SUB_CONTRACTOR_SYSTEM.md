# Sub Contractor System for Clean Report

## 🚀 **Overview**

The Sub Contractor system allows Pro users (Administrators) to scale their cleaning business by adding sub contractors at $5/month per contractor. This system provides a complete workflow for managing external workers, assigning jobs, and tracking performance.

## 🎯 **Key Features**

### **For Administrators:**
- **Add Sub Contractors**: Invite and manage sub contractors at $5/month each
- **Job Assignment**: Assign jobs to specific sub contractors
- **Performance Tracking**: Monitor job completion rates, ratings, and earnings
- **Communication**: Direct contact with sub contractors
- **Billing Management**: Track sub contractor costs and earnings

### **For Sub Contractors:**
- **Dedicated Dashboard**: View assigned jobs and track progress
- **Job Details Screen**: Complete job information with client details
- **Timer System**: Built-in timer for accurate time tracking
- **Photo Upload**: Document work with before/after photos
- **Task Management**: Mark tasks complete and add notes
- **Navigation**: Direct links to client locations
- **Admin Contact**: Easy access to administrator contact information

---

## 🏗️ **System Architecture**

### **User Roles**

#### **Administrator (Pro User)**
- Full access to all features
- Can add/manage sub contractors
- Assigns jobs to sub contractors
- Monitors performance and earnings
- Manages billing and payments

#### **Sub Contractor**
- Limited access to assigned jobs
- Job-specific dashboard and tools
- Timer and photo upload capabilities
- Task completion tracking
- Direct communication with admin

### **Database Schema**

#### **Sub Contractors Table**
```sql
sub_contractors (
  id: string
  user_id: string (admin's user_id)
  admin_id: string (admin's user_id)
  first_name: string
  last_name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  hourly_rate: number
  specialties: string[]
  availability: object
  created_at: timestamp
  updated_at: timestamp
)
```

#### **Job Assignments Table**
```sql
sub_contractor_job_assignments (
  id: string
  job_id: string
  sub_contractor_id: string
  assigned_at: timestamp
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  notes: string
  admin_notes: string
)
```

#### **Job Timers Table**
```sql
job_timers (
  id: string
  job_id: string
  sub_contractor_id: string
  start_time: timestamp
  end_time: timestamp
  duration_minutes: number
  status: 'running' | 'paused' | 'stopped'
  notes: string
  created_at: timestamp
  updated_at: timestamp
)
```

#### **Job Photos Table**
```sql
job_photos (
  id: string
  job_id: string
  sub_contractor_id: string
  task_id: string (optional)
  photo_url: string
  photo_type: 'before' | 'after' | 'general' | 'task_specific'
  description: string
  uploaded_at: timestamp
)
```

#### **Job Tasks Table**
```sql
job_tasks (
  id: string
  job_id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  priority: 'low' | 'medium' | 'high'
  estimated_time: number
  actual_time: number
  notes: string
  sub_contractor_notes: string
  completed_at: timestamp
  created_at: timestamp
  updated_at: timestamp
)
```

---

## 💰 **Pricing Model**

### **Sub Contractor Subscription**
- **Cost**: $5/month per sub contractor
- **Billing**: Monthly recurring charge
- **Limits**: Based on Pro subscription tier
- **Features**: Full access to sub contractor tools

### **Revenue Model**
- **Admin Markup**: Administrators can set their own rates
- **Sub Contractor Payment**: Based on hourly rate and actual time worked
- **Profit Tracking**: Automatic calculation of profit margins
- **Payment Processing**: Integrated with billing system

---

## 🎨 **User Interface**

### **Administrator Dashboard**

#### **Sub Contractors Management**
- **Overview**: Total sub contractors, active count, total jobs, total earnings
- **Add Sub Contractor**: Form to add new sub contractors
- **Sub Contractor List**: Detailed view of all sub contractors
- **Performance Metrics**: Job completion rates, ratings, earnings
- **Status Management**: Activate/deactivate sub contractors

#### **Job Assignment**
- **Job Selection**: Choose jobs to assign
- **Sub Contractor Selection**: Pick available sub contractors
- **Assignment Details**: Set expectations and notes
- **Status Tracking**: Monitor assignment status

### **Sub Contractor Dashboard**

#### **Job Overview**
- **Assigned Jobs**: List of all assigned jobs
- **Job Status**: Current status of each job
- **Quick Actions**: Navigate, start timer, take photos
- **Client Information**: Contact details and addresses

#### **Job Detail Screen**
- **Timer**: Start, pause, stop job timer
- **Tasks**: Mark tasks complete with notes
- **Photo Upload**: Add before/after photos
- **Client Details**: Full contact information
- **Admin Contact**: Direct communication with administrator

---

## ⚡ **Key Features Deep Dive**

### **1. Timer System**
- **Persistent Timer**: Continues running even if app is closed
- **Start/Pause/Stop**: Full timer control
- **Time Tracking**: Accurate recording of work hours
- **Integration**: Automatic job time updates

### **2. Photo Documentation**
- **Before/After Photos**: Document work quality
- **Task-Specific Photos**: Photos linked to specific tasks
- **Photo Types**: General, before, after, task-specific
- **Upload System**: Easy photo capture and upload

### **3. Task Management**
- **Task Status**: Pending, in progress, completed, skipped
- **Priority Levels**: High, medium, low priority tasks
- **Time Tracking**: Estimated vs actual time
- **Notes System**: Admin and sub contractor notes

### **4. Navigation Integration**
- **Direct Navigation**: One-click navigation to client locations
- **Address Integration**: Automatic address formatting
- **Map Integration**: Google Maps integration

### **5. Communication System**
- **Admin Contact**: Direct phone/email access
- **Client Contact**: Full client contact information
- **Notes System**: Two-way communication through notes

---

## 🔧 **Technical Implementation**

### **Authentication & Authorization**
- **Role-Based Access**: Different permissions for admin vs sub contractor
- **Job-Specific Access**: Sub contractors only see assigned jobs
- **Secure Access**: Protected routes and data access

### **Real-Time Updates**
- **Timer Sync**: Real-time timer updates across devices
- **Status Updates**: Live job status updates
- **Photo Upload**: Instant photo upload and display

### **Mobile Optimization**
- **Responsive Design**: Works on all device sizes
- **Touch-Friendly**: Optimized for mobile use
- **Offline Capability**: Basic functionality when offline

### **Data Security**
- **Row-Level Security**: Users only see their own data
- **Encrypted Storage**: Secure photo and data storage
- **Access Control**: Strict permission management

---

## 📊 **Business Benefits**

### **For Administrators:**
- **Scalability**: Grow business without hiring full-time employees
- **Cost Control**: Pay only for work completed
- **Quality Control**: Monitor work through photos and notes
- **Flexibility**: Scale up or down based on demand
- **Profit Margins**: Set own rates and maintain profit margins

### **For Sub Contractors:**
- **Flexible Work**: Choose jobs and work hours
- **Fair Pay**: Transparent hourly rates
- **Easy Tools**: Simple, intuitive job management
- **Professional Platform**: Access to professional tools
- **Growth Opportunity**: Build reputation and increase earnings

### **For Clients:**
- **Consistent Quality**: Monitored and documented work
- **Reliable Service**: Professional sub contractor network
- **Transparency**: Before/after photos and detailed reports
- **Accountability**: Tracked work and communication

---

## 🚀 **Getting Started**

### **For Administrators:**

1. **Upgrade to Pro**: Ensure you have a Pro subscription
2. **Add Sub Contractors**: Navigate to Sub Contractors page
3. **Invite Sub Contractors**: Add their information and send invitations
4. **Assign Jobs**: Start assigning jobs to sub contractors
5. **Monitor Performance**: Track completion rates and quality

### **For Sub Contractors:**

1. **Accept Invitation**: Receive and accept admin invitation
2. **Complete Profile**: Add contact information and preferences
3. **View Assigned Jobs**: Check dashboard for new assignments
4. **Start Working**: Use job detail screen for all work activities
5. **Submit Work**: Complete tasks and upload photos

---

## 📈 **Performance Metrics**

### **Key Performance Indicators**

#### **For Administrators:**
- **Sub Contractor Utilization**: Percentage of active sub contractors
- **Job Completion Rate**: Percentage of jobs completed on time
- **Quality Ratings**: Average client satisfaction scores
- **Cost Efficiency**: Profit margins per job
- **Sub Contractor Retention**: Long-term sub contractor retention

#### **For Sub Contractors:**
- **Job Completion Rate**: Percentage of assigned jobs completed
- **Average Rating**: Client satisfaction scores
- **Earnings**: Total and average earnings per job
- **Response Time**: Time to accept and start jobs
- **Photo Quality**: Quality of work documentation

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **Sub Contractor App**: Dedicated mobile application
- **Payment Integration**: Direct payment processing
- **Advanced Scheduling**: Automated job assignment
- **Performance Analytics**: Detailed performance insights
- **Communication Tools**: In-app messaging system
- **Training Modules**: Sub contractor training and certification

### **Advanced Features**
- **GPS Tracking**: Real-time location tracking
- **Automated Billing**: Automatic invoice generation
- **Quality Assurance**: Automated quality checks
- **Predictive Analytics**: Job completion time predictions
- **Integration APIs**: Connect with other cleaning software

---

## 🛡️ **Security & Compliance**

### **Data Protection**
- **GDPR Compliance**: European data protection compliance
- **Data Encryption**: All data encrypted in transit and at rest
- **Access Logs**: Complete audit trail of data access
- **Backup Systems**: Regular data backups and recovery

### **Privacy Controls**
- **Client Privacy**: Client information protected
- **Sub Contractor Privacy**: Personal information secured
- **Photo Privacy**: Secure photo storage and access
- **Communication Privacy**: Protected communication channels

---

This Sub Contractor system transforms Clean Report from a single-user tool into a scalable business management platform, enabling cleaning businesses to grow efficiently while maintaining quality and control. 