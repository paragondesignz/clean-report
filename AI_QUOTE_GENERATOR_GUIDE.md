# AI Quote Generator - Quick Start Guide

## Overview
The AI Quote Generator analyzes photos of residential spaces and generates detailed cleaning quotes using OpenAI's GPT-4 Vision model.

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
3. Select "Quote Generator" tab
4. Fill in client information
5. Upload photos of a space
6. Click "Generate AI Quote"

### 5. Expected Results
The AI should return:
- Total price estimate
- Room-by-room breakdown
- Time estimates
- Required supplies list
- Complexity assessment

## Database Setup (Optional)

```sql
-- Create quotes table in Supabase
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
```

## Troubleshooting

### Common Issues
1. **"API key not found"** - Check your .env.local file
2. **"Invalid API key"** - Verify your OpenAI API key is correct
3. **"Rate limit exceeded"** - Wait a few minutes and try again
4. **"Image too large"** - The component automatically compresses images

### Cost Estimation
- ~$0.01-0.03 per quote (depending on image complexity)
- 100 quotes/month ≈ $1-3

## Production Deployment
1. Set environment variables in your hosting platform
2. Implement rate limiting
3. Add error monitoring
4. Set up cost alerts in OpenAI dashboard

---

**Need help?** Check the main [AI_DEPLOYMENT_GUIDES.md](./AI_DEPLOYMENT_GUIDES.md) for detailed information. 