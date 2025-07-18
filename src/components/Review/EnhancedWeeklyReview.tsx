import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Brain,
  Calendar,
  BarChart3,
  Activity,
  Award,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useGTDStore } from '../../store/gtdStore';
import { WeeklyReviewData, WeeklyReviewMetrics, SystemHealthCheck } from '../../types/gtd';

interface EnhancedWeeklyReviewProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reviewData: WeeklyReviewData) => void;
}

type ReviewStep = 'health' | 'metrics' | 'review' | 'reflect' | 'plan' | 'complete';

export const EnhancedWeeklyReview: React.FC<EnhancedWeeklyReviewProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { ideas, projects, contexts } = useGTDStore();
  const [currentStep, setCurrentStep] = useState<ReviewStep>('health');
  const [startTime, setStartTime] = useState<Date>(new Date());
  
  // Review data state
  const [reviewData, setReviewData] = useState<Partial<WeeklyReviewData>>({
    wins: [],
    challenges: [],
    insights: [],
    nextWeekFocus: '',
    areasReviewed: {
      inbox: false,
      projects: false,
      waitingFor: false,
      somedayMaybe: false,
      calendar: false,
      contexts: false
    },
    notes: ''
  });

  // Calculate system health and metrics
  const systemHealth = useMemo((): SystemHealthCheck => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Inbox health
    const inboxIdeas = ideas.filter(idea => idea.type === 'inbox' && idea.status === 'active');
    const oldestInboxItem = inboxIdeas.length > 0 
      ? inboxIdeas.reduce((oldest, idea) => 
          idea.createdAt < oldest.createdAt ? idea : oldest
        ).createdAt 
      : null;
    
    const inboxScore = Math.max(0, 100 - (inboxIdeas.length * 5));
    
    // Project health
    const activeProjects = projects.filter(p => p.status === 'active');
    const projectsWithNextActions = activeProjects.filter(p => 
      ideas.some(idea => idea.projectId === p.id && idea.isNextAction && idea.status === 'active')
    );
    const stuckProjects = activeProjects.length - projectsWithNextActions.length;
    const completedProjects = projects.filter(p => p.status === 'completed' && p.completedDate && p.completedDate >= oneWeekAgo);
    
    const projectScore = activeProjects.length === 0 ? 100 : 
      Math.max(0, 100 - (stuckProjects * 20));
    
    // Action health
    const activeActions = ideas.filter(idea => 
      idea.status === 'active' && idea.isActionable && idea.type === 'action'
    );
    const overdueActions = activeActions.filter(idea => 
      idea.dueDate && new Date(idea.dueDate) < now
    );
    const completedActions = ideas.filter(idea => 
      idea.status === 'completed' && idea.completedDate && idea.completedDate >= oneWeekAgo
    );
    
    const averageAge = activeActions.length > 0 
      ? activeActions.reduce((sum, idea) => 
          sum + Math.floor((now.getTime() - idea.createdAt.getTime()) / (1000 * 60 * 60 * 24)), 0
        ) / activeActions.length 
      : 0;
    
    const actionScore = Math.max(0, 100 - (overdueActions.length * 10) - (averageAge * 2));
    
    // Review health
    const lastReview = null; // Would come from stored review history
    const daysSinceReview = 7; // Assume weekly
    const reviewScore = daysSinceReview <= 7 ? 100 : Math.max(0, 100 - (daysSinceReview * 5));
    
    // Overall health
    const overallScore = Math.round((inboxScore + projectScore + actionScore + reviewScore) / 4);
    const grade = overallScore >= 90 ? 'A' : 
                 overallScore >= 80 ? 'B' : 
                 overallScore >= 70 ? 'C' : 
                 overallScore >= 60 ? 'D' : 'F';
    
    const recommendations: string[] = [];
    if (inboxIdeas.length > 10) recommendations.push('Process inbox - too many unprocessed ideas');
    if (stuckProjects > 0) recommendations.push(`${stuckProjects} projects need next actions`);
    if (overdueActions.length > 0) recommendations.push(`${overdueActions.length} overdue actions need attention`);
    if (daysSinceReview > 7) recommendations.push('Weekly review is overdue');
    
    return {
      timestamp: now,
      inboxHealth: {
        count: inboxIdeas.length,
        oldestItem: oldestInboxItem,
        score: inboxScore
      },
      projectHealth: {
        total: activeProjects.length,
        withNextActions: projectsWithNextActions.length,
        stuck: stuckProjects,
        completed: completedProjects.length,
        score: projectScore
      },
      actionHealth: {
        total: activeActions.length,
        overdue: overdueActions.length,
        completed: completedActions.length,
        averageAge,
        score: actionScore
      },
      reviewHealth: {
        lastReview,
        daysSinceReview,
        onSchedule: daysSinceReview <= 7,
        score: reviewScore
      },
      overallHealth: {
        score: overallScore,
        grade,
        recommendations
      }
    };
  }, [ideas, projects]);

  const weeklyMetrics = useMemo((): WeeklyReviewMetrics => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Ideas captured this week
    const weeklyIdeas = ideas.filter(idea => idea.createdAt >= oneWeekAgo);
    const inboxIdeas = ideas.filter(idea => idea.type === 'inbox' && idea.status === 'active');
    const processedIdeas = ideas.filter(idea => 
      idea.createdAt >= oneWeekAgo && idea.type !== 'inbox'
    );
    
    // Actionable rate
    const actionableIdeas = processedIdeas.filter(idea => idea.isActionable);
    const actionableRate = processedIdeas.length > 0 ? 
      (actionableIdeas.length / processedIdeas.length) * 100 : 0;
    
    // Completed ideas this week
    const completedIdeas = ideas.filter(idea => 
      idea.status === 'completed' && 
      idea.completedDate && 
      idea.completedDate >= oneWeekAgo
    );
    
    // Context distribution
    const contextDistribution: Record<string, number> = {};
    contexts.forEach(context => {
      contextDistribution[context.name] = ideas.filter(idea => 
        idea.contextId === context.id && idea.status === 'active'
      ).length;
    });
    
    // Project metrics
    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => 
      p.status === 'completed' && p.completedDate && p.completedDate >= oneWeekAgo
    );
    const stuckProjects = activeProjects.filter(p => 
      !ideas.some(idea => idea.projectId === p.id && idea.isNextAction && idea.status === 'active')
    );
    
    // Calculate health factors
    const healthFactors = {
      inboxEmpty: inboxIdeas.length === 0,
      projectsHaveNextActions: stuckProjects.length === 0,
      lowOverdueItems: systemHealth.actionHealth.overdue < 5,
      regularReviews: systemHealth.reviewHealth.onSchedule
    };
    
    const healthScore = systemHealth.overallHealth.score;
    const systemHealthLevel = healthScore >= 90 ? 'excellent' : 
                             healthScore >= 75 ? 'good' : 
                             healthScore >= 60 ? 'fair' : 'poor';
    
    return {
      ideasCaptured: weeklyIdeas.length,
      inboxProcessed: processedIdeas.length,
      inboxProcessingRate: weeklyIdeas.length > 0 ? (processedIdeas.length / weeklyIdeas.length) * 100 : 0,
      ideasClarified: processedIdeas.length,
      actionableRate,
      avgProcessingTime: 5, // Placeholder - would track actual processing time
      projectsActive: activeProjects.length,
      projectsCompleted: completedProjects.length,
      projectsStuck: stuckProjects.length,
      contextDistribution,
      ideasCompleted: completedIdeas.length,
      completionRate: 85, // Placeholder - would calculate from planned vs completed
      avgTaskDuration: 30, // Placeholder - would calculate from timer data
      overdueItems: systemHealth.actionHealth.overdue,
      systemHealth: systemHealthLevel,
      healthScore,
      healthFactors
    };
  }, [ideas, projects, contexts, systemHealth]);

  const steps: Array<{ key: ReviewStep; title: string; description: string }> = [
    { key: 'health', title: 'System Health', description: 'Check overall GTD system health' },
    { key: 'metrics', title: 'Weekly Metrics', description: 'Review this week\'s productivity data' },
    { key: 'review', title: 'Review Areas', description: 'Go through each GTD area systematically' },
    { key: 'reflect', title: 'Reflect', description: 'Capture wins, challenges, and insights' },
    { key: 'plan', title: 'Plan Ahead', description: 'Set focus for the coming week' },
    { key: 'complete', title: 'Complete', description: 'Finish and save your review' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const canProceed = () => {
    switch (currentStep) {
      case 'review':
        return Object.values(reviewData.areasReviewed || {}).some(Boolean);
      case 'reflect':
        return (reviewData.wins?.length || 0) > 0 || (reviewData.challenges?.length || 0) > 0;
      case 'plan':
        return (reviewData.nextWeekFocus?.length || 0) > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleComplete = () => {
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const finalReviewData: WeeklyReviewData = {
      id: `review-${Date.now()}`,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      completedAt: endTime,
      metrics: weeklyMetrics,
      wins: reviewData.wins || [],
      challenges: reviewData.challenges || [],
      insights: reviewData.insights || [],
      nextWeekFocus: reviewData.nextWeekFocus || '',
      areasReviewed: reviewData.areasReviewed || {
        inbox: false,
        projects: false,
        waitingFor: false,
        somedayMaybe: false,
        calendar: false,
        contexts: false
      },
      notes: reviewData.notes || '',
      duration
    };
    
    onComplete(finalReviewData);
  };

  const updateReviewData = (updates: Partial<WeeklyReviewData>) => {
    setReviewData(prev => ({ ...prev, ...updates }));
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle size={20} className="text-green-400" />;
    if (score >= 60) return <AlertTriangle size={20} className="text-yellow-400" />;
    return <AlertTriangle size={20} className="text-red-400" />;
  };

  useEffect(() => {
    if (isOpen) {
      setStartTime(new Date());
      setCurrentStep('health');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="text-cursor-accent" />
            <div>
              <h2 className="text-xl font-semibold text-cursor-text">Weekly Review</h2>
              <p className="text-sm text-cursor-text-muted">
                {steps[currentStepIndex].title} - {steps[currentStepIndex].description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cursor-bg rounded-lg transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-b border-cursor-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cursor-text-muted">Progress</span>
            <span className="text-sm text-cursor-text">
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-cursor-bg rounded-full h-2">
            <div 
              className="bg-cursor-accent rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {currentStep === 'health' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getHealthColor(systemHealth.overallHealth.score)}`}>
                  {systemHealth.overallHealth.grade}
                </div>
                <p className="text-lg text-cursor-text mb-1">System Health Score</p>
                <p className="text-2xl font-semibold text-cursor-text">{systemHealth.overallHealth.score}/100</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.inboxHealth.score)}
                      <span className="font-medium text-cursor-text">Inbox Health</span>
                    </div>
                    <span className={`font-bold ${getHealthColor(systemHealth.inboxHealth.score)}`}>
                      {systemHealth.inboxHealth.score}
                    </span>
                  </div>
                  <p className="text-sm text-cursor-text-muted">
                    {systemHealth.inboxHealth.count} unprocessed ideas
                  </p>
                </div>

                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.projectHealth.score)}
                      <span className="font-medium text-cursor-text">Project Health</span>
                    </div>
                    <span className={`font-bold ${getHealthColor(systemHealth.projectHealth.score)}`}>
                      {systemHealth.projectHealth.score}
                    </span>
                  </div>
                  <p className="text-sm text-cursor-text-muted">
                    {systemHealth.projectHealth.stuck} projects need next actions
                  </p>
                </div>

                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.actionHealth.score)}
                      <span className="font-medium text-cursor-text">Action Health</span>
                    </div>
                    <span className={`font-bold ${getHealthColor(systemHealth.actionHealth.score)}`}>
                      {systemHealth.actionHealth.score}
                    </span>
                  </div>
                  <p className="text-sm text-cursor-text-muted">
                    {systemHealth.actionHealth.overdue} overdue actions
                  </p>
                </div>

                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.reviewHealth.score)}
                      <span className="font-medium text-cursor-text">Review Health</span>
                    </div>
                    <span className={`font-bold ${getHealthColor(systemHealth.reviewHealth.score)}`}>
                      {systemHealth.reviewHealth.score}
                    </span>
                  </div>
                  <p className="text-sm text-cursor-text-muted">
                    {systemHealth.reviewHealth.daysSinceReview} days since last review
                  </p>
                </div>
              </div>

              {systemHealth.overallHealth.recommendations.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Recommendations
                  </h3>
                  <ul className="space-y-1">
                    {systemHealth.overallHealth.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-cursor-text-muted">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {currentStep === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cursor-accent mb-1">
                    {weeklyMetrics.ideasCaptured}
                  </div>
                  <p className="text-sm text-cursor-text-muted">Ideas Captured</p>
                </div>
                
                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {weeklyMetrics.ideasCompleted}
                  </div>
                  <p className="text-sm text-cursor-text-muted">Ideas Completed</p>
                </div>
                
                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {weeklyMetrics.projectsActive}
                  </div>
                  <p className="text-sm text-cursor-text-muted">Active Projects</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-cursor-text mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-cursor-accent" />
                    Processing Efficiency
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-cursor-text-muted">Inbox Processing Rate</span>
                      <span className="text-cursor-text font-medium">
                        {Math.round(weeklyMetrics.inboxProcessingRate)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cursor-text-muted">Actionable Rate</span>
                      <span className="text-cursor-text font-medium">
                        {Math.round(weeklyMetrics.actionableRate)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cursor-text-muted">Completion Rate</span>
                      <span className="text-cursor-text font-medium">
                        {Math.round(weeklyMetrics.completionRate)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-cursor-text mb-4 flex items-center gap-2">
                    <Target size={20} className="text-cursor-accent" />
                    Context Distribution
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(weeklyMetrics.contextDistribution)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([context, count]) => (
                        <div key={context} className="flex items-center justify-between">
                          <span className="text-cursor-text-muted">{context}</span>
                          <span className="text-cursor-text font-medium">{count} ideas</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-cursor-text mb-3 flex items-center gap-2">
                  <Activity size={20} className="text-cursor-accent" />
                  Health Factors
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(weeklyMetrics.healthFactors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value ? 
                        <CheckCircle size={16} className="text-green-400" /> : 
                        <AlertTriangle size={16} className="text-yellow-400" />
                      }
                      <span className="text-sm text-cursor-text-muted">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-cursor-text mb-4">Review GTD Areas</h3>
              <div className="space-y-3">
                {[
                  { key: 'inbox', label: 'Ideas (Inbox)', description: 'Process all captured ideas to zero' },
                  { key: 'projects', label: 'Projects', description: 'Ensure each project has a next action' },
                  { key: 'waitingFor', label: 'Waiting For', description: 'Follow up on delegated items' },
                  { key: 'somedayMaybe', label: 'Someday/Maybe', description: 'Review for items to activate' },
                  { key: 'calendar', label: 'Calendar', description: 'Review upcoming events and commitments' },
                  { key: 'contexts', label: 'Contexts', description: 'Ensure contexts are still relevant' }
                ].map((area) => (
                  <label
                    key={area.key}
                    className="flex items-start gap-3 p-4 bg-cursor-bg rounded-lg cursor-pointer hover:bg-cursor-border transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={reviewData.areasReviewed?.[area.key as keyof typeof reviewData.areasReviewed] || false}
                      onChange={(e) => updateReviewData({
                        areasReviewed: {
                          inbox: false,
                          projects: false,
                          waitingFor: false,
                          somedayMaybe: false,
                          calendar: false,
                          contexts: false,
                          ...reviewData.areasReviewed,
                          [area.key]: e.target.checked
                        }
                      })}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-cursor-text">{area.label}</div>
                      <div className="text-sm text-cursor-text-muted">{area.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'reflect' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  <Award size={16} className="inline mr-1" />
                  What went well this week? (Wins)
                </label>
                <textarea
                  value={reviewData.wins?.join('\n') || ''}
                  onChange={(e) => updateReviewData({ wins: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="List your accomplishments and positive outcomes..."
                  className="w-full h-24 bg-cursor-bg border border-cursor-border rounded-md px-3 py-2 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  <AlertTriangle size={16} className="inline mr-1" />
                  What challenges did you face? (Challenges)
                </label>
                <textarea
                  value={reviewData.challenges?.join('\n') || ''}
                  onChange={(e) => updateReviewData({ challenges: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="Identify obstacles, bottlenecks, or areas for improvement..."
                  className="w-full h-24 bg-cursor-bg border border-cursor-border rounded-md px-3 py-2 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  <Brain size={16} className="inline mr-1" />
                  Key insights and learnings
                </label>
                <textarea
                  value={reviewData.insights?.join('\n') || ''}
                  onChange={(e) => updateReviewData({ insights: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="What did you learn? Any patterns or insights about your productivity?"
                  className="w-full h-24 bg-cursor-bg border border-cursor-border rounded-md px-3 py-2 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
                />
              </div>
            </div>
          )}

          {currentStep === 'plan' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  <Target size={16} className="inline mr-1" />
                  Primary focus for next week *
                </label>
                <textarea
                  value={reviewData.nextWeekFocus || ''}
                  onChange={(e) => updateReviewData({ nextWeekFocus: e.target.value })}
                  placeholder="What is your main priority or theme for the coming week?"
                  className="w-full h-24 bg-cursor-bg border border-cursor-border rounded-md px-3 py-2 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  Additional notes and plans
                </label>
                <textarea
                  value={reviewData.notes || ''}
                  onChange={(e) => updateReviewData({ notes: e.target.value })}
                  placeholder="Any other thoughts, plans, or reminders for next week..."
                  className="w-full h-32 bg-cursor-bg border border-cursor-border rounded-md px-3 py-2 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
                />
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-cursor-text mb-2">Review Complete!</h3>
                <p className="text-cursor-text-muted">
                  Your weekly review has been completed. System health and insights have been captured.
                </p>
              </div>
              <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                <h4 className="font-medium text-cursor-text mb-2">Review Summary</h4>
                <div className="text-sm text-cursor-text-muted space-y-1">
                  <p>• System Health: <span className={getHealthColor(systemHealth.overallHealth.score)}>
                    {systemHealth.overallHealth.grade} ({systemHealth.overallHealth.score}/100)
                  </span></p>
                  <p>• Areas Reviewed: {Object.values(reviewData.areasReviewed || {}).filter(Boolean).length}/6</p>
                  <p>• Duration: ~{Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60))} minutes</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-cursor-border">
          <button
            onClick={currentStep === 'health' ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
            disabled={currentStep === 'complete'}
          >
            <ArrowLeft size={16} />
            {currentStep === 'health' ? 'Cancel' : 'Back'}
          </button>
          
          {currentStep === 'complete' ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
            >
              <CheckCircle size={16} />
              Finish Review
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-cursor-accent text-white px-6 py-2 rounded hover:bg-cursor-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 'plan' ? 'Complete' : 'Next'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};