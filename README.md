# GTD App - Getting Things Done

A comprehensive productivity application implementing David Allen's Getting Things Done (GTD) methodology. Built with React, TypeScript, and modern web technologies to help you achieve "Mind Like Water" - a state of relaxed control and mental clarity.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/jimmcdon/context)

## 🎯 Overview

This GTD app provides a complete implementation of the five-step GTD workflow:
1. **Capture** - Collect what has your attention
2. **Clarify** - Process what it means
3. **Organize** - Put it where it belongs
4. **Reflect** - Review frequently
5. **Engage** - Simply do

## ✨ Features

### Core GTD Implementation
- **Comprehensive Workflow**: Complete Capture → Clarify → Organize → Reflect → Engage cycle
- **Dynamic Priority System**: No static priorities - uses Context → Time → Energy → Priority decision flow
- **True GTD Principles**: Implements David Allen's methodology faithfully
- **Ideas Terminology**: Everything starts as an "idea" that gets captured and processed

### Advanced Features
- **Virtual Scrolling**: Efficiently handle 200-300+ tasks with optimized performance
- **Progressive Web App**: Install as native app, works offline
- **Voice Capture**: Natural language processing for hands-free idea capture
- **Mobile Responsive**: Fully optimized for mobile devices
- **Keyboard Shortcuts**: Power user features for quick navigation
- **2-Minute Timer**: Gamified timer for the two-minute rule
- **Onboarding System**: Interactive GTD methodology training

### Technical Features
- **Offline-First**: All data stored locally using localStorage
- **Type-Safe**: 100% TypeScript coverage
- **Modern UI**: Professional dark theme with smooth animations
- **Performance**: Virtual scrolling activates automatically for lists > 50 items

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/jimmcdon/context.git
cd gtd-app

# Install dependencies
npm install

# Start development server
npm start
```

### Production Build

```bash
# Create optimized production build
npm run build

# Serve production build locally
npx serve -s build
```

## 📱 Progressive Web App

This app can be installed as a PWA on any device:

1. **Desktop**: Click the install icon in your browser's address bar
2. **Mobile**: Use "Add to Home Screen" in your browser menu
3. **Features**: 
   - Works offline
   - Native app feel
   - Push notifications ready
   - Background sync capable

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + A` | Quick Capture |
| `Cmd/Ctrl + Shift + T` | Today's Dashboard |
| `Cmd/Ctrl + Shift + E` | Engage Mode |
| `Cmd/Ctrl + Shift + R` | Weekly Review |
| `?` | Show all shortcuts |
| `1-6` | Navigate views |
| `Space` | Toggle Engage Mode |

## 🎮 Voice Commands

The app supports natural language voice capture with smart parsing:

- **Contexts**: "Call John about project" → @Calls
- **Energy**: "Brainstorm marketing ideas" → High Energy
- **Time**: "Quick email to team" → 2 minutes
- **Projects**: "Plan new website launch" → Project

## 📊 GTD Workflow

### 1. Capture
- Use Quick Capture (Cmd+Shift+A) to instantly capture ideas
- Voice capture for hands-free input
- Everything goes into the Inbox

### 2. Clarify
- Process inbox items through guided workflow
- Decide: Is it actionable?
- Apply 2-minute rule
- Assign context and energy level

### 3. Organize
- **Inbox**: Unprocessed ideas
- **Next Actions**: Single-step tasks by context
- **Projects**: Multi-step outcomes
- **Waiting For**: Delegated items
- **Someday/Maybe**: Future possibilities
- **Reference**: Support materials

### 4. Reflect
- Weekly Review workflow
- System health metrics
- Review all lists and projects
- Plan upcoming week

### 5. Engage
- Filter by current context
- Consider available time
- Match energy levels
- Trust your system

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Icons**: Lucide React
- **Build Tool**: Create React App
- **Deployment**: Railway-ready

## 🚂 Deployment

### Deploy to Railway

1. Fork this repository
2. Create account on [Railway](https://railway.app)
3. New Project → Deploy from GitHub repo
4. Select your forked repository
5. Railway auto-detects and deploys

### Manual Deployment

The app builds to static files and can be deployed anywhere:

```bash
npm run build
# Deploy the 'build' folder to any static host
```

## 📈 Performance

- **Virtual Scrolling**: Handles 200-300+ items smoothly
- **Lazy Loading**: Components load on demand
- **Optimized Bundle**: ~103KB gzipped
- **PWA Caching**: Instant subsequent loads

## 🔒 Privacy

- **Local Storage**: All data stored on your device
- **No Backend**: No servers, no accounts needed
- **No Tracking**: Complete privacy
- **Export/Import**: Full control of your data

## 🎯 GTD Principles

This app implements true GTD methodology:

- **Mind Like Water**: Achieve relaxed control
- **Trusted System**: Capture everything
- **Context-Based**: Work based on location/tools
- **Energy Matching**: Match tasks to energy levels
- **Regular Reviews**: Maintain system integrity

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for personal or commercial purposes.

## 🙏 Acknowledgments

- David Allen for creating the GTD methodology
- The React and TypeScript communities
- All contributors and users

---

Built with ❤️ for productivity enthusiasts who want to achieve Mind Like Water.