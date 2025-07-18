import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { LeftSidebar } from './components/Layout/LeftSidebar';
import { VirtualizedMainContent } from './components/Layout/VirtualizedMainContent';
import { RightSidebar } from './components/Layout/RightSidebar';
import { ResizablePanel } from './components/Layout/ResizablePanel';
import { QuickCapture } from './components/Capture/QuickCapture';
import { ClarificationWorkflow } from './components/Clarify/ClarificationWorkflow';
import { WeeklyReview } from './components/Review/WeeklyReview';
import { DataManager } from './components/Settings/DataManager';
import { EngageMode } from './components/Engage/EngageMode';
import { TodayDashboard } from './components/Today/TodayDashboard';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { KeyboardShortcuts } from './components/Shortcuts/KeyboardShortcuts';
import { useGTDStore } from './store/gtdStore';
import { useOnboardingStore } from './store/onboardingStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false);
  const [dataManagerOpen, setDataManagerOpen] = useState(false);
  const [engageModeOpen, setEngageModeOpen] = useState(false);
  const [todayDashboardOpen, setTodayDashboardOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // GTD Store
  const {
    activeView,
    selectedItem,
    isProcessing,
    dashboard,
    addItem,
    processItem,
    setActiveView,
    setSelectedItem,
    setProcessing
  } = useGTDStore();

  // Onboarding Store
  const {
    showOnboarding,
    isOnboardingCompleted,
    setShowOnboarding,
    completeOnboarding,
    markVisited
  } = useOnboardingStore();

  const handleQuickCapture = useCallback(() => {
    setQuickCaptureOpen(true);
  }, []);

  const handleStartReview = useCallback(() => {
    setWeeklyReviewOpen(true);
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    if (action === 'capture') {
      setQuickCaptureOpen(true);
    } else if (action === 'weekly-review') {
      setWeeklyReviewOpen(true);
    } else {
      console.log('Quick action:', action);
    }
  }, []);

  const handleCaptureItem = useCallback((content: string, metadata?: any) => {
    addItem(content, metadata);
  }, [addItem]);

  const handleStartProcessing = useCallback(() => {
    setProcessing(true);
  }, [setProcessing]);

  const handleProcessingDecision = useCallback((decision: any) => {
    processItem(decision);
  }, [processItem]);

  const handleCancelProcessing = useCallback(() => {
    setProcessing(false);
    setSelectedItem(null);
  }, [setProcessing, setSelectedItem]);

  const handleCompleteReview = useCallback(() => {
    console.log('Weekly review completed');
    // TODO: Update review history
  }, []);

  const handleOnboardingComplete = useCallback((progress: any) => {
    completeOnboarding(progress);
    markVisited();
    console.log('Onboarding completed:', progress);
  }, [completeOnboarding, markVisited]);

  const handleOpenOnboarding = useCallback(() => {
    setShowOnboarding(true);
  }, [setShowOnboarding]);

  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setLeftSidebarVisible(false);
        setRightSidebarVisible(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    switch (action) {
      case 'capture':
        setQuickCaptureOpen(true);
        break;
      case 'today':
        setTodayDashboardOpen(true);
        break;
      case 'engage':
        setEngageModeOpen(true);
        break;
    }
    
    // Clean up URL
    if (action) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onQuickCapture: handleQuickCapture,
    onOpenToday: () => setTodayDashboardOpen(true),
    onOpenEngage: () => setEngageModeOpen(true),
    onStartReview: handleStartReview,
    onShowShortcuts: () => setShortcutsOpen(true),
    onOpenSettings: () => setDataManagerOpen(true)
  });



  return (
    <div className="h-screen flex flex-col bg-cursor-bg text-cursor-text">
      {/* Header */}
      <Header
        leftSidebarVisible={leftSidebarVisible}
        rightSidebarVisible={rightSidebarVisible}
        onToggleLeftSidebar={() => {
          if (isMobile) {
            setMobileSidebarOpen(!mobileSidebarOpen);
          } else {
            setLeftSidebarVisible(!leftSidebarVisible);
          }
        }}
        onToggleRightSidebar={() => setRightSidebarVisible(!rightSidebarVisible)}
        onQuickCapture={handleQuickCapture}
        onStartReview={handleStartReview}
        onOpenSettings={() => setDataManagerOpen(true)}
        onOpenEngage={() => setEngageModeOpen(true)}
        onOpenToday={() => setTodayDashboardOpen(true)}
        onOpenOnboarding={handleOpenOnboarding}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        
        {/* Left Sidebar */}
        {isMobile ? (
          <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <LeftSidebar
              activeView={activeView}
              onViewChange={(view) => {
                setActiveView(view);
                setMobileSidebarOpen(false);
              }}
              inboxCount={dashboard.inboxCount}
              nextActionsCount={dashboard.nextActionsCount}
              projectsCount={dashboard.projectsCount}
              waitingForCount={dashboard.waitingForCount}
              somedayMaybeCount={dashboard.somedayMaybeCount}
            />
          </div>
        ) : (
          <ResizablePanel
            defaultWidth={leftSidebarWidth}
            minWidth={200}
            maxWidth={400}
            position="left"
            isVisible={leftSidebarVisible}
            onResize={setLeftSidebarWidth}
          >
            <LeftSidebar
              activeView={activeView}
              onViewChange={setActiveView}
              inboxCount={dashboard.inboxCount}
              nextActionsCount={dashboard.nextActionsCount}
              projectsCount={dashboard.projectsCount}
              waitingForCount={dashboard.waitingForCount}
              somedayMaybeCount={dashboard.somedayMaybeCount}
            />
          </ResizablePanel>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <VirtualizedMainContent
            activeView={activeView}
            onQuickCapture={handleQuickCapture}
            onStartProcessing={handleStartProcessing}
          />
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        {!isMobile && (
          <ResizablePanel
            defaultWidth={rightSidebarWidth}
            minWidth={250}
            maxWidth={450}
            position="right"
            isVisible={rightSidebarVisible}
            onResize={setRightSidebarWidth}
          >
            <RightSidebar
              todayActions={dashboard.todayActions}
              upcomingDeadlines={dashboard.upcomingDeadlines}
              recentlyCompleted={dashboard.recentlyCompleted}
              weeklyReviewDue={dashboard.weeklyReviewDue}
              onQuickAction={handleQuickAction}
            />
          </ResizablePanel>
        )}
      </div>

      {/* Quick Capture Modal */}
      <QuickCapture
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onCapture={handleCaptureItem}
      />

      {/* Clarification Workflow */}
      {isProcessing && selectedItem && (
        <ClarificationWorkflow
          item={selectedItem}
          onDecision={handleProcessingDecision}
          onCancel={handleCancelProcessing}
        />
      )}

      {/* Weekly Review */}
      <WeeklyReview
        isOpen={weeklyReviewOpen}
        onClose={() => setWeeklyReviewOpen(false)}
        onComplete={handleCompleteReview}
      />

      {/* Data Manager */}
      <DataManager
        isOpen={dataManagerOpen}
        onClose={() => setDataManagerOpen(false)}
      />

      {/* Engage Mode */}
      <EngageMode
        isOpen={engageModeOpen}
        onClose={() => setEngageModeOpen(false)}
      />

      {/* Today Dashboard */}
      <TodayDashboard
        isOpen={todayDashboardOpen}
        onClose={() => setTodayDashboardOpen(false)}
      />

      {/* Onboarding Flow */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        theme="professional"
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;