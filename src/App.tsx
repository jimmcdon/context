import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { LeftSidebar } from './components/Layout/LeftSidebar';
import { MainContent } from './components/Layout/MainContent';
import { RightSidebar } from './components/Layout/RightSidebar';
import { ResizablePanel } from './components/Layout/ResizablePanel';
import { QuickCapture } from './components/Capture/QuickCapture';
import { ClarificationWorkflow } from './components/Clarify/ClarificationWorkflow';
import { WeeklyReview } from './components/Review/WeeklyReview';
import { DataManager } from './components/Settings/DataManager';
import { EngageMode } from './components/Engage/EngageMode';
import { TodayDashboard } from './components/Today/TodayDashboard';
import { useGTDStore } from './store/gtdStore';

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

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setQuickCaptureOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);


  return (
    <div className="h-screen flex flex-col bg-cursor-bg text-cursor-text">
      {/* Header */}
      <Header
        leftSidebarVisible={leftSidebarVisible}
        rightSidebarVisible={rightSidebarVisible}
        onToggleLeftSidebar={() => setLeftSidebarVisible(!leftSidebarVisible)}
        onToggleRightSidebar={() => setRightSidebarVisible(!rightSidebarVisible)}
        onQuickCapture={handleQuickCapture}
        onStartReview={handleStartReview}
        onOpenSettings={() => setDataManagerOpen(true)}
        onOpenEngage={() => setEngageModeOpen(true)}
        onOpenToday={() => setTodayDashboardOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
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

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <MainContent
            activeView={activeView}
            onQuickCapture={handleQuickCapture}
            onStartProcessing={handleStartProcessing}
          />
        </div>

        {/* Right Sidebar */}
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
    </div>
  );
}

export default App;