# GTD Mind Sweep Feature

## Overview

The Mind Sweep is a foundational GTD activity that David Allen calls "Getting it all out of your head." This deep-dive audit externalizes every open loop—tasks, ideas, worries, projects, obligations—into a trusted system before processing and organizing them.

## Feature Components

### 1. GTD Audit Assistant (First-Time Setup)

#### Purpose
Help users externalize everything into a trusted inbox to:
- Relieve mental pressure
- Establish trust in the system
- Create a complete inventory of commitments

#### Implementation Phases

1. **Mind Sweep Phase**
   - Open-ended prompts: "What's grabbing your attention right now?"
   - Store all responses in the raw Inbox
   - Capture without judgment or organization

2. **Trigger List Prompts**
   Categories with example triggers:
   - **Work**: Projects, deadlines, team asks, meetings, admin tasks
   - **Home**: Repairs, family events, errands, hobbies
   - **Finances**: Bills, taxes, budgets, subscriptions
   - **Health**: Appointments, habits, medical paperwork
   - **Someday/Maybe**: Books to read, trips to plan, courses to take

### 2. Technical Implementation

#### Data Flow
1. Capture raw inputs into Inbox
2. Queue items for later clarification
3. Optional AI-assisted processing
4. Store in appropriate GTD containers

#### User Experience
- Empathetic, calming interface
- Progress indicators
- Clear next steps
- Option to pause and resume
- Completion celebration

## GTD Methodology Alignment

This feature directly implements Chapter 5: Collection – Corralling Your "Stuff" from David Allen's GTD methodology.

### Success Metrics
- Number of items captured
- Time to complete mind sweep
- User confidence rating
- System trust score
- Return usage patterns

## Future Enhancements

### AI Integration Possibilities
- Claude/GPT: "Is this actionable?"
- Gemini: "Can this be categorized?"
- OpenAI function calling: Assign due dates, priorities, or reference tags

## References

- GTD Book Chapter 5: Collection
- GTD Incompletion Trigger List
- GTDConnect Mind Sweep resources 