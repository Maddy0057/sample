# Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Variables
- [ ] Copy `env.example` to `.env.local`
- [ ] Fill in all required environment variables
- [ ] Test locally with `npm run dev`

### 2. Database Setup
- [ ] Create Supabase project
- [ ] Run `supabase-schema.sql` in Supabase SQL editor
- [ ] Verify table creation and RLS policies

### 3. Auth0 Configuration
- [ ] Create Auth0 application
- [ ] Configure callback URLs for localhost
- [ ] Test authentication flow locally

### 4. Google AI Setup
- [ ] Get API key from Google AI Studio
- [ ] Test API key locally

## Vercel Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: ChatGPT Clone Mobile"
git branch -M main
git remote add origin https://github.com/yourusername/chatgpt-clone-mobile.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Environment Variables in Vercel
Add all environment variables from your `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH0_SECRET`
- `AUTH0_BASE_URL` (your Vercel domain)
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `GOOGLE_AI_API_KEY`

### 4. Update Auth0 Settings
After deployment, update your Auth0 application:
- **Allowed Callback URLs**: `https://your-domain.vercel.app/api/auth/callback`
- **Allowed Logout URLs**: `https://your-domain.vercel.app`
- **Allowed Web Origins**: `https://your-domain.vercel.app`

## Post-Deployment Verification

### 1. Test Authentication
- [ ] Login flow works
- [ ] Logout flow works
- [ ] Protected routes are secure

### 2. Test Chat Functionality
- [ ] Text generation works
- [ ] Image generation works (with `/imagine`)
- [ ] Chat history persists

### 3. Test Mobile Experience
- [ ] UI is properly constrained to 480px max width
- [ ] Touch interactions work properly
- [ ] Responsive design functions correctly

## Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure all are set in Vercel
2. **CORS Issues**: Check Auth0 callback URLs
3. **Database Connection**: Verify Supabase credentials
4. **API Limits**: Check Google AI Studio quotas

### Support
- Check Vercel deployment logs
- Verify environment variables are correct
- Test API endpoints individually
