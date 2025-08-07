# Smart Scheduler - Quick Start Guide

## Overview
The Smart Scheduler uses AI to optimize cleaning schedules based on job complexity, travel time, and client preferences.

## Prerequisites
- OpenAI API key
- Supabase project
- Node.js 18+

## Step-by-Step Setup

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login and verify your account
3. Go to API Keys section
4. Create a new secret key
5. Copy the key (starts with `sk-`)

### 2. Configure Environment Variables
```bash
# Add to .env.local
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here

# Optional: Google Maps for enhanced route optimization
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Install Dependencies
```bash
npm install openai @google/generative-ai --legacy-peer-deps

# Optional: For Google Maps integration
npm install @googlemaps/js-api-loader
```

### 4. Test the Feature
1. Start your development server: `npm run dev`
2. Navigate to `/ai-tools`
3. Select "Smart Scheduler" tab
4. Choose a client with multiple jobs
5. Select a date
6. Click "Generate Smart Schedule"

### 5. Expected Results
The AI should return:
- Optimal start time
- Route optimization
- Time slot allocation
- Efficiency score
- AI recommendations

## Database Setup (Optional)

```sql
-- Create schedules table in Supabase
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  optimal_time TIME,
  route_optimization JSONB,
  time_slots JSONB,
  efficiency_score INTEGER,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedule_jobs junction table
CREATE TABLE schedule_jobs (
  schedule_id UUID REFERENCES schedules(id),
  job_id UUID REFERENCES jobs(id),
  start_time TIME,
  end_time TIME,
  PRIMARY KEY (schedule_id, job_id)
);
```

## Google Maps Integration (Optional)

For enhanced route optimization:

1. **Google Cloud Console Setup**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Maps JavaScript API
   - Enable Directions API
   - Enable Geocoding API

2. **Get API Key**
   - Create credentials > API Key
   - Restrict the key to your domain
   - Add to .env.local

3. **Enhanced Route Optimization**
   ```typescript
   // The component will automatically use Google Maps
   // if the API key is provided
   ```

## Troubleshooting

### Common Issues
1. **"No jobs found"** - Ensure the selected client has jobs in the system
2. **"API key not found"** - Check your .env.local file
3. **"Invalid API key"** - Verify your OpenAI API key is correct
4. **"Route optimization failed"** - Check Google Maps API key (if using)

### Cost Estimation
- ~$0.01-0.02 per schedule generation
- 50 schedules/month ≈ $0.50-1.00

## Production Deployment
1. Set environment variables in your hosting platform
2. Implement rate limiting
3. Add error monitoring
4. Set up cost alerts in OpenAI dashboard
5. Configure Google Maps API restrictions

---

**Need help?** Check the main [AI_DEPLOYMENT_GUIDES.md](./AI_DEPLOYMENT_GUIDES.md) for detailed information. 