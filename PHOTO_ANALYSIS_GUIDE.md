# Photo Analysis - Quick Start Guide

## Overview
The Photo Analysis feature compares before/after cleaning photos to generate professional reports with improvement scores using OpenAI's GPT-4 Vision model.

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
```

### 3. Install Dependencies
```bash
npm install openai @google/generative-ai --legacy-peer-deps
```

### 4. Test the Feature
1. Start your development server: `npm run dev`
2. Navigate to `/ai-tools`
3. Select "Photo Analysis" tab
4. Fill in job information
5. Upload before photos
6. Upload after photos
7. Click "Generate AI Analysis"

### 5. Expected Results
The AI should return:
- Improvement score
- Quality assessment
- Before/after comparison
- Tasks completed
- Supplies used
- AI recommendations
- Client satisfaction score

## Database Setup (Optional)

```sql
-- Create photo_analysis table in Supabase
CREATE TABLE photo_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  before_images TEXT[],
  after_images TEXT[],
  improvement_score INTEGER,
  quality_score INTEGER,
  client_satisfaction INTEGER,
  analysis_report JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Supabase Storage bucket for photos
-- In Supabase Dashboard > Storage
-- Create bucket: 'cleaning-photos'
-- Set public access policies
```

## Image Storage Setup (Optional)

### 1. Create Storage Bucket
1. Go to Supabase Dashboard > Storage
2. Create a new bucket called `cleaning-photos`
3. Set it to public or private based on your needs

### 2. Set Storage Policies
```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cleaning-photos' AND
    auth.role() = 'authenticated'
  );

-- Allow users to view their own photos
CREATE POLICY "Users can view their photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cleaning-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Image Requirements

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Size Requirements
- Minimum: 320x200 pixels
- Maximum: 10MB per image
- Recommended: 1024x1024 pixels

### Quality Tips
- Good lighting for better analysis
- Clear before/after shots
- Multiple angles for comprehensive analysis
- High contrast between dirty and clean areas

## Troubleshooting

### Common Issues
1. **"No photos uploaded"** - Ensure both before and after photos are uploaded
2. **"Image too small"** - Upload higher resolution images
3. **"API key not found"** - Check your .env.local file
4. **"Invalid API key"** - Verify your OpenAI API key is correct
5. **"Analysis failed"** - Check image quality and try again

### Cost Estimation
- ~$0.02-0.05 per analysis (depending on number of images)
- 200 analyses/month ≈ $4-10

## Production Deployment
1. Set environment variables in your hosting platform
2. Implement rate limiting
3. Add error monitoring
4. Set up cost alerts in OpenAI dashboard
5. Configure image storage and CDN
6. Implement image optimization

## Best Practices

### For Better Analysis Results
1. **Before Photos**: Show the actual dirty/untidy state
2. **After Photos**: Show the cleaned, organized result
3. **Same Angles**: Use similar camera angles for comparison
4. **Good Lighting**: Ensure photos are well-lit
5. **Multiple Shots**: Take photos of different areas/rooms

### Performance Optimization
1. **Image Compression**: The component automatically compresses images
2. **Batch Processing**: Process multiple analyses efficiently
3. **Caching**: Cache similar analyses to reduce API calls
4. **Error Handling**: Implement graceful fallbacks

---

**Need help?** Check the main [AI_DEPLOYMENT_GUIDES.md](./AI_DEPLOYMENT_GUIDES.md) for detailed information. 