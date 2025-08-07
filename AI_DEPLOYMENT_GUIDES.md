# AI Features Deployment Guides

This document provides step-by-step guides to deploy and connect each AI feature in the Clean Report application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AI Quote Generator](#ai-quote-generator)
3. [Smart Scheduler](#smart-scheduler)
4. [Photo Analysis](#photo-analysis)
5. [Environment Setup](#environment-setup)
6. [Testing & Validation](#testing--validation)
7. [Production Deployment](#production-deployment)

## Prerequisites

Before deploying any AI features, ensure you have:

- Node.js 18+ installed
- A Supabase project set up
- API keys for OpenAI and/or Google AI
- Basic understanding of environment variables

## AI Quote Generator

### Overview
The AI Quote Generator analyzes photos of residential spaces and generates detailed cleaning quotes using OpenAI's GPT-4 Vision model.

### Setup Steps

#### 1. OpenAI API Setup

1. **Create OpenAI Account**
   ```bash
   # Visit https://platform.openai.com/
   # Sign up and verify your account
   ```

2. **Get API Key**
   - Go to API Keys section
   - Create a new secret key
   - Copy the key (starts with `sk-`)

3. **Set Environment Variable**
   ```bash
   # Add to your .env.local file
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
   # OR for server-side only
   OPENAI_API_KEY=sk-your-api-key-here
   ```

#### 2. Image Processing Setup

The component automatically handles:
- Image validation (minimum 320x200 pixels)
- Image compression (max 1024px)
- Base64 conversion for API calls

#### 3. Database Integration

Create a quotes table in Supabase:

```sql
-- Create quotes table
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  total_price DECIMAL(10,2) NOT NULL,
  total_time INTEGER NOT NULL,
  complexity TEXT CHECK (complexity IN ('low', 'medium', 'high')),
  breakdown JSONB,
  supplies TEXT[],
  notes TEXT,
  images JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own quotes" ON quotes
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can insert their own quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = client_id);
```

#### 4. Testing

```bash
# Test the quote generator
1. Navigate to /ai-tools
2. Select "Quote Generator" tab
3. Fill in client information
4. Upload photos of a space
5. Click "Generate AI Quote"
6. Verify the response includes:
   - Total price
   - Room breakdown
   - Time estimates
   - Supplies list
```

#### 5. Production Considerations

- **Rate Limiting**: Implement rate limiting for API calls
- **Image Storage**: Store images in Supabase Storage
- **Caching**: Cache similar quotes to reduce API costs
- **Error Handling**: Implement fallback responses

```typescript
// Example rate limiting implementation
const rateLimiter = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  // Implement your rate limiting logic
};
```

## Smart Scheduler

### Overview
The Smart Scheduler uses AI to optimize cleaning schedules based on job complexity, travel time, and client preferences.

### Setup Steps

#### 1. OpenAI API Setup (Same as Quote Generator)

#### 2. Google Maps Integration (Optional)

For enhanced route optimization:

1. **Google Cloud Console Setup**
   ```bash
   # Visit https://console.cloud.google.com/
   # Create a new project
   # Enable Maps JavaScript API
   # Enable Directions API
   # Enable Geocoding API
   ```

2. **Get API Key**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

3. **Install Google Maps Package**
   ```bash
   npm install @googlemaps/js-api-loader
   ```

#### 3. Database Schema

```sql
-- Create schedules table
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

#### 4. Enhanced Route Optimization

```typescript
// Add to smart-scheduler.tsx
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly'
});

// Enhanced route optimization
const optimizeRouteWithGoogleMaps = async (locations: any[]) => {
  const google = await loader.load();
  const directionsService = new google.maps.DirectionsService();
  
  // Implement Google Maps route optimization
  // This would replace the simple distance-based sorting
};
```

#### 5. Testing

```bash
# Test smart scheduling
1. Navigate to /ai-tools
2. Select "Smart Scheduler" tab
3. Choose a client with multiple jobs
4. Select a date
5. Click "Generate Smart Schedule"
6. Verify:
   - Optimal start time
   - Route optimization
   - Time slot allocation
   - Efficiency score
```

## Photo Analysis

### Overview
The Photo Analysis feature compares before/after cleaning photos to generate professional reports with improvement scores.

### Setup Steps

#### 1. OpenAI API Setup (Same as above)

#### 2. Image Storage Setup

```sql
-- Create photo_analysis table
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

-- Create Supabase Storage bucket
-- In Supabase Dashboard > Storage
-- Create bucket: 'cleaning-photos'
-- Set public access policies
```

#### 3. Storage Policies

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

#### 4. Enhanced Photo Processing

```typescript
// Add to photo-analysis.tsx
import { supabase } from '@/lib/supabase-client';

const uploadPhotosToStorage = async (files: File[], folder: string) => {
  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${folder}/${Date.now()}-${index}.jpg`;
    const { data, error } = await supabase.storage
      .from('cleaning-photos')
      .upload(fileName, file);
    
    if (error) throw error;
    return data.path;
  });
  
  return Promise.all(uploadPromises);
};
```

#### 5. Report Generation

```typescript
// Add PDF generation capability
import { jsPDF } from 'jspdf';

const generatePDFReport = (analysis: PhotoAnalysis) => {
  const doc = new jsPDF();
  
  // Add report content
  doc.text('Cleaning Analysis Report', 20, 20);
  doc.text(`Improvement Score: ${analysis.beforeAfterComparison.improvementScore}%`, 20, 40);
  // ... add more content
  
  return doc;
};
```

#### 6. Testing

```bash
# Test photo analysis
1. Navigate to /ai-tools
2. Select "Photo Analysis" tab
3. Fill in job information
4. Upload before photos
5. Upload after photos
6. Click "Generate AI Analysis"
7. Verify report includes:
   - Improvement score
   - Quality assessment
   - Before/after comparison
   - Recommendations
```

## Environment Setup

### Complete .env.local Configuration

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key
# OR for server-side only
OPENAI_API_KEY=sk-your-openai-api-key

# Google AI (Alternative to OpenAI)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-api-key

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Package Dependencies

```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "@google/generative-ai": "^0.2.0",
    "@googlemaps/js-api-loader": "^1.16.0",
    "jspdf": "^2.5.0"
  }
}
```

## Testing & Validation

### Unit Tests

```bash
# Create test files for each AI feature
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Test AI services
npm test ai-services.test.ts
npm test quote-generator.test.ts
npm test smart-scheduler.test.ts
npm test photo-analysis.test.ts
```

### Integration Tests

```typescript
// Example integration test
describe('AI Quote Generator Integration', () => {
  it('should generate quote from images', async () => {
    const mockImages = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
    const mockClientInfo = { name: 'Test Client', propertyType: 'Residential' };
    
    const quote = await AIQuoteGenerator.generateQuote(mockImages, mockClientInfo);
    
    expect(quote).toHaveProperty('totalPrice');
    expect(quote).toHaveProperty('breakdown');
    expect(quote.totalPrice).toBeGreaterThan(0);
  });
});
```

### API Testing

```bash
# Test OpenAI API directly
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4-vision-preview",
    "messages": [{"role": "user", "content": "Test message"}],
    "max_tokens": 100
  }'
```

## Production Deployment

### 1. Environment Variables

```bash
# Production environment variables
# Set these in your hosting platform (Vercel, Netlify, etc.)

NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
OPENAI_API_KEY=your-production-openai-key
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-production-google-ai-key
```

### 2. API Rate Limiting

```typescript
// Implement rate limiting middleware
import rateLimit from 'express-rate-limit';

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many AI requests, please try again later.'
});
```

### 3. Error Monitoring

```typescript
// Add error tracking
import * as Sentry from "@sentry/nextjs";

// Initialize Sentry
Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});

// Wrap AI calls with error tracking
try {
  const result = await AIQuoteGenerator.generateQuote(images, clientInfo);
} catch (error) {
  Sentry.captureException(error);
  // Handle error gracefully
}
```

### 4. Cost Optimization

```typescript
// Implement caching to reduce API calls
const cache = new Map();

const getCachedQuote = async (images: File[], clientInfo: any) => {
  const key = generateCacheKey(images, clientInfo);
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const quote = await AIQuoteGenerator.generateQuote(images, clientInfo);
  cache.set(key, quote);
  
  return quote;
};
```

### 5. Performance Monitoring

```typescript
// Add performance monitoring
const measureAIPerformance = async (fn: Function, ...args: any[]) => {
  const start = performance.now();
  const result = await fn(...args);
  const end = performance.now();
  
  console.log(`AI operation took ${end - start}ms`);
  
  // Send to analytics service
  analytics.track('ai_performance', {
    operation: fn.name,
    duration: end - start,
    success: true
  });
  
  return result;
};
```

## Troubleshooting

### Common Issues

1. **API Key Errors**
   ```bash
   # Check environment variables
   echo $OPENAI_API_KEY
   # Ensure key is valid and has sufficient credits
   ```

2. **Image Processing Errors**
   ```bash
   # Check image format and size
   # Ensure images are valid JPEG/PNG files
   # Verify minimum resolution requirements
   ```

3. **Rate Limiting**
   ```bash
   # Check OpenAI rate limits
   # Implement exponential backoff
   # Add request queuing if needed
   ```

4. **Memory Issues**
   ```bash
   # Optimize image compression
   # Implement streaming for large files
   # Add memory monitoring
   ```

### Support Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Security Considerations

1. **API Key Security**
   - Never expose API keys in client-side code
   - Use environment variables
   - Rotate keys regularly

2. **Image Security**
   - Validate file types
   - Scan for malicious content
   - Implement file size limits

3. **Data Privacy**
   - Anonymize client data in AI prompts
   - Implement data retention policies
   - Comply with GDPR/CCPA

4. **Access Control**
   - Implement proper authentication
   - Use Row Level Security (RLS)
   - Audit API usage

## Cost Management

### OpenAI Pricing (as of 2024)
- GPT-4 Vision: $0.01 per 1K tokens input, $0.03 per 1K tokens output
- GPT-4: $0.03 per 1K tokens input, $0.06 per 1K tokens output

### Cost Optimization Strategies
1. **Implement caching** for similar requests
2. **Use smaller models** for simple tasks
3. **Batch requests** when possible
4. **Monitor usage** with analytics
5. **Set spending limits** in OpenAI dashboard

### Monthly Cost Estimation
- 100 quotes/month: ~$50-100
- 50 schedules/month: ~$25-50
- 200 photo analyses/month: ~$100-200
- **Total estimated cost: $175-350/month**

---

## Quick Start Checklist

- [ ] Set up OpenAI API key
- [ ] Configure environment variables
- [ ] Install required dependencies
- [ ] Set up Supabase database tables
- [ ] Test each AI feature locally
- [ ] Deploy to production
- [ ] Monitor performance and costs
- [ ] Set up error tracking
- [ ] Implement rate limiting
- [ ] Configure backup AI provider

For additional support, refer to the individual feature documentation or contact the development team. 