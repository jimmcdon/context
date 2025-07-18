# Next.js Migration Playbook

## 🎯 Executive Summary

This playbook provides a step-by-step guide for migrating the GTD app from Create React App to Next.js 14. The migration enables AI integration through built-in API routes while maintaining all existing functionality and improving performance.

## 🎪 Migration Strategy Overview

### **Why Next.js?**
- **Built-in API Routes**: Perfect for AI integration
- **Single Codebase**: Frontend + backend in one project
- **Performance**: SSR, automatic optimization, code splitting
- **Railway Support**: Seamless deployment
- **Future-Proof**: Industry-standard React framework

### **Migration Approach: Parallel Development**
```typescript
// Strategy: Build alongside existing app
const migrationStrategy = {
  approach: 'Create new Next.js project',
  riskLevel: 'Low',
  downtime: 'Zero',
  rollback: 'Keep existing app as backup',
  timeline: '1-2 weeks'
}
```

## 📋 Pre-Migration Checklist

### **Current App Analysis**
```bash
# Analyze current codebase
find src -name "*.tsx" -o -name "*.ts" | wc -l    # Count TypeScript files
find src -name "*.css" | wc -l                    # Count CSS files
find public -type f | wc -l                       # Count public assets
```

### **Dependencies Audit**
```bash
# Check current dependencies
npm ls --depth=0
npm outdated
npm audit
```

### **Feature Inventory**
- ✅ Core GTD workflow components
- ✅ Zustand state management
- ✅ Virtual scrolling system
- ✅ PWA configuration
- ✅ Voice capture functionality
- ✅ Onboarding system
- ✅ Keyboard shortcuts
- ✅ Timer and gamification

## 🚀 Migration Steps

### **Day 1: Project Setup**

#### **Step 1: Create Next.js Project**
```bash
# Create new Next.js project
npx create-next-app@latest gtd-app-nextjs \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd gtd-app-nextjs
```

#### **Step 2: Configure Project Structure**
```bash
# Create necessary directories
mkdir -p src/components/Capture
mkdir -p src/components/Clarify
mkdir -p src/components/Engage
mkdir -p src/components/Layout
mkdir -p src/components/Onboarding
mkdir -p src/components/Projects
mkdir -p src/components/Review
mkdir -p src/components/Settings
mkdir -p src/components/Shortcuts
mkdir -p src/components/Timer
mkdir -p src/components/Today
mkdir -p src/components/VirtualList
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/types
mkdir -p src/utils
```

#### **Step 3: Copy Configuration Files**
```bash
# Copy configuration files from existing project
cp ../gtd-app/tailwind.config.js .
cp ../gtd-app/tsconfig.json .
cp ../gtd-app/next.config.js . || echo "// next.config.js will be created"
```

#### **Step 4: Install Dependencies**
```bash
# Copy package.json dependencies
npm install zustand lucide-react framer-motion serve

# Development dependencies
npm install -D @types/node
```

### **Day 2: Component Migration**

#### **Step 1: Copy Core Components**
```bash
# Copy all components (maintaining structure)
cp -r ../gtd-app/src/components/* src/components/
cp -r ../gtd-app/src/hooks/* src/hooks/
cp -r ../gtd-app/src/store/* src/store/
cp -r ../gtd-app/src/types/* src/types/
cp -r ../gtd-app/src/utils/* src/utils/
```

#### **Step 2: Update Import Paths**
```typescript
// Update imports in all files
// From: import { ... } from '../../../components/...'
// To: import { ... } from '@/components/...'

// Script to update imports
const updateImports = `
find src -name "*.tsx" -o -name "*.ts" -exec sed -i '' 's|from "../../|from "@/|g' {} +
find src -name "*.tsx" -o -name "*.ts" -exec sed -i '' 's|from "../|from "@/|g' {} +
`;
```

#### **Step 3: Copy Styles**
```bash
# Copy global styles
cp ../gtd-app/src/index.css src/app/globals.css

# Update Tailwind imports if needed
```

### **Day 3: Routing Migration**

#### **Step 1: Create App Router Structure**
```bash
# Create route structure
mkdir -p src/app/(main)
mkdir -p src/app/api
```

#### **Step 2: Main App Layout**
```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GTD - Getting Things Done',
  description: 'A comprehensive Getting Things Done productivity application',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GTD App',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
```

#### **Step 3: Main Page Component**
```typescript
// src/app/page.tsx
import { GTDApp } from '@/components/GTDApp';

export default function Home() {
  return <GTDApp />;
}
```

#### **Step 4: Migrate App Component**
```typescript
// src/components/GTDApp.tsx (renamed from App.tsx)
'use client';

import { useState, useCallback, useEffect } from 'react';
// ... rest of existing App.tsx code

export const GTDApp: React.FC = () => {
  // Existing App.tsx logic
  return (
    <div className="h-screen flex flex-col bg-cursor-bg text-cursor-text">
      {/* Existing JSX */}
    </div>
  );
};
```

### **Day 4: API Routes Setup**

#### **Step 1: Create API Route Structure**
```bash
# Create API directories
mkdir -p src/app/api/ai
mkdir -p src/app/api/voice
mkdir -p src/app/api/onboarding
```

#### **Step 2: Basic API Routes**
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
}

// src/app/api/ai/chat/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  // TODO: Implement OpenAI integration
  return Response.json({ 
    reply: `Echo: ${message}`,
    timestamp: new Date().toISOString()
  });
}

// src/app/api/voice/transcribe/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audio = formData.get('audio') as File;
  
  if (!audio) {
    return Response.json({ error: 'No audio file provided' }, { status: 400 });
  }
  
  // TODO: Implement Whisper integration
  return Response.json({ 
    text: `Transcribed: ${audio.name}`,
    confidence: 0.95
  });
}
```

### **Day 5: PWA Configuration**

#### **Step 1: Copy PWA Assets**
```bash
# Copy PWA files
cp ../gtd-app/public/manifest.json public/
cp ../gtd-app/public/sw.js public/
cp ../gtd-app/public/favicon.ico public/
cp ../gtd-app/public/logo192.png public/
cp ../gtd-app/public/logo512.png public/
```

#### **Step 2: Update Next.js Config**
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable service worker
  experimental: {
    appDir: true,
  },
  // PWA configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### **Day 6: Testing & Debugging**

#### **Step 1: Local Development Test**
```bash
# Start development server
npm run dev

# Test all major features
# - Quick capture
# - Voice input
# - Today dashboard
# - Projects view
# - Weekly review
# - Keyboard shortcuts
```

#### **Step 2: Build Test**
```bash
# Test production build
npm run build
npm start

# Verify:
# - All routes work
# - API endpoints respond
# - PWA functionality
# - Performance metrics
```

#### **Step 3: Component Testing**
```typescript
// Test critical components
const testComponents = [
  'QuickCapture',
  'TodayDashboard',
  'ProjectsView',
  'WeeklyReview',
  'OnboardingFlow',
  'VoiceCapture'
];

// Manual testing checklist
const testChecklist = {
  functionality: 'All features work as expected',
  performance: 'No performance regression',
  ui: 'All styling intact',
  responsiveness: 'Mobile functionality preserved',
  pwa: 'Install prompt and offline work',
  data: 'All data preserved and accessible'
};
```

### **Day 7: Deployment**

#### **Step 1: Railway Deployment**
```bash
# Push to separate branch first
git checkout -b nextjs-migration
git add .
git commit -m "feat: Complete Next.js migration

- Migrated from Create React App to Next.js 14
- Maintained all existing functionality
- Added API routes for future AI integration
- Preserved PWA capabilities
- Updated routing to App Router
- Maintained performance with SSR"

git push origin nextjs-migration
```

#### **Step 2: Deploy to Railway**
```bash
# Create new Railway project for testing
railway login
railway init
railway up
```

#### **Step 3: Verification**
```bash
# Test deployed version
curl https://your-app.railway.app/api/health
# Visit app and test all features
```

## 🔄 Component Migration Guide

### **State Management (Zustand)**
```typescript
// No changes needed - Zustand works identically
// src/store/gtdStore.ts remains the same
import { create } from 'zustand';

// Just update imports to use @/ alias
import { GTDIdea } from '@/types/gtd';
```

### **Styling (Tailwind CSS)**
```typescript
// Tailwind classes remain identical
// src/app/globals.css replaces src/index.css
// All component styling preserved
```

### **Components Updates**
```typescript
// Most components need minimal changes
// Main changes: import paths and 'use client' directives

// Example: src/components/Capture/QuickCapture.tsx
'use client'; // Add this for interactive components

import React, { useState } from 'react';
import { X, Send, Mic } from 'lucide-react';
// Update imports to use @/ alias
import { VoiceCapture } from '@/components/Capture/VoiceCapture';
```

### **Hooks Migration**
```typescript
// Custom hooks work identically
// src/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';
import { useGTDStore } from '@/store/gtdStore'; // Updated import

// Rest of hook remains the same
```

## 📊 Performance Comparison

### **Bundle Size Analysis**
```bash
# Before (CRA)
npm run build
# Check build/static/js/*.js sizes

# After (Next.js)
npm run build
# Check .next/static/chunks/*.js sizes
```

### **Performance Metrics**
```typescript
// Expected improvements
const performanceGains = {
  initialLoad: '20-30% faster (SSR)',
  bundleSize: '10-15% smaller (tree shaking)',
  cacheEfficiency: '40% better (automatic splitting)',
  devExperience: '50% faster builds (Turbopack)'
};
```

## 🚨 Troubleshooting Guide

### **Common Issues & Solutions**

#### **Issue: Import Errors**
```bash
# Problem: Module not found errors
# Solution: Update imports to use @/ alias
find src -name "*.tsx" -o -name "*.ts" -exec sed -i '' 's|from "../../|from "@/|g' {} +
```

#### **Issue: Client-Side Only Features**
```typescript
// Problem: useEffect, useState not working
// Solution: Add 'use client' directive
'use client';

import { useState, useEffect } from 'react';
```

#### **Issue: API Route Errors**
```typescript
// Problem: API routes not found
// Solution: Check file structure
// Ensure: src/app/api/[route]/route.ts format
```

#### **Issue: PWA Not Working**
```bash
# Problem: Service worker not registering
# Solution: Check public/sw.js and manifest.json
# Ensure: Correct headers in next.config.js
```

### **Rollback Plan**
```bash
# If migration fails, rollback steps:
1. Keep existing app running
2. Fix issues in Next.js version
3. Test thoroughly before switching
4. Use Railway branch deployments for testing
```

## 🎯 Success Criteria

### **Functional Requirements**
- ✅ All existing features work identically
- ✅ No data loss or corruption
- ✅ PWA functionality preserved
- ✅ Performance maintained or improved
- ✅ Mobile responsiveness intact

### **Technical Requirements**
- ✅ TypeScript compilation successful
- ✅ Build process completes without errors
- ✅ All tests pass (if applicable)
- ✅ API routes respond correctly
- ✅ Railway deployment successful

### **User Experience Requirements**
- ✅ No visual differences in UI
- ✅ All interactions work as expected
- ✅ Keyboard shortcuts functional
- ✅ Voice capture operational
- ✅ Data persistence working

## 📋 Post-Migration Checklist

### **Week 1: Monitoring**
```bash
# Monitor for issues
- Check error logs
- Monitor performance metrics
- Gather user feedback
- Test on multiple devices
```

### **Week 2: AI Integration**
```bash
# Begin AI feature development
- Set up OpenAI API integration
- Implement audio onboarding
- Add enhanced voice processing
- Test conversational AI
```

### **Documentation Updates**
```bash
# Update project documentation
- Update README.md
- Update deployment instructions
- Document new API routes
- Update development setup
```

## 🚀 Next Steps After Migration

### **Immediate (Week 1)**
1. **Monitor deployment**: Ensure stability
2. **OpenAI API setup**: Create account and test
3. **Audio onboarding**: Begin implementation
4. **User feedback**: Gather migration feedback

### **Short-term (Week 2-4)**
1. **AI features**: Implement Phase 1 features
2. **Performance optimization**: Leverage Next.js features
3. **Enhanced PWA**: Add new capabilities
4. **Testing**: Comprehensive feature testing

### **Long-term (Month 2+)**
1. **Advanced AI**: Multi-agent system
2. **New features**: Mind sweep, enhanced interface
3. **Scaling**: Handle increased usage
4. **Platform expansion**: Collaborative features

This migration playbook provides a comprehensive, step-by-step approach to moving from Create React App to Next.js while maintaining all existing functionality and enabling future AI enhancements.

---

*Document created: January 2025*  
*Status: Ready for execution*  
*Estimated completion: 7 days*