# DLPP Internal Audit System - Process Workflow Guide

## Overview

This document explains the complete workflow of the DLPP (Department of Lands & Physical Planning) Internal Audit & Compliance System. The system follows a structured process from risk identification through audit completion and follow-up.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADMINISTRATION (Setup First)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Divisions  │  │   Groups    │  │   Modules   │  │    Users    │         │
│  │   (DLPP     │  │  (Roles &   │  │  (System    │  │  (Staff     │         │
│  │   Units)    │  │ Permissions)│  │  Features)  │  │  Accounts)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE MODULES                                    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        1. RISK REGISTER                               │   │
│  │            (Authoritative Source - The "Spine" of the System)         │   │
│  │                                                                        │   │
│  │    Contains all identified risks for DLPP divisions                   │   │
│  │    • Risk Code, Title, Description                                    │   │
│  │    • Risk Category (Operational, Financial, Compliance, Strategic)    │   │
│  │    • Owner Division                                                   │   │
│  │    • Inherent Risk Rating (Likelihood × Impact)                       │   │
│  │    • Control Effectiveness                                            │   │
│  │    • Residual Risk Rating                                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     2. RISK EVENTS (Gateway)                          │   │
│  │          ★ ALL AUDITS MUST ORIGINATE FROM A RISK EVENT ★              │   │
│  │                                                                        │   │
│  │    Three Sources:                                                      │   │
│  │    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │    │    AAAP     │  │  Secretary  │  │  Requests   │                  │   │
│  │    │  (Annual    │  │  Directives │  │ (External/  │                  │   │
│  │    │ Audit Plan) │  │  (Priority  │  │  Internal)  │                  │   │
│  │    │             │  │  Override)  │  │             │                  │   │
│  │    └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  │                                                                        │   │
│  │    Status Flow: Pending → Under Review → Approved → In Progress       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUDIT WORKFLOW                                     │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │     3.      │     │     4.      │     │     5.      │                    │
│  │ ENGAGEMENTS │ ──▶ │  FIELDWORK  │ ──▶ │  FINDINGS   │                    │
│  │             │     │             │     │             │                    │
│  │ Planning    │     │ Evidence    │     │ Condition   │                    │
│  │ Scoping     │     │ Collection  │     │ Criteria    │                    │
│  │ Team Assign │     │ Testing     │     │ Cause       │                    │
│  │             │     │ Interviews  │     │ Effect      │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                │                             │
│                                                ▼                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │     8.      │     │     7.      │     │     6.      │                    │
│  │   REPORTS   │ ◀── │ACTION PLANS │ ◀── │RECOMMENDATIONS                   │
│  │             │     │             │     │             │                    │
│  │ Final Audit │     │ Track       │     │ Suggested   │                    │
│  │ Report      │     │ Progress    │     │ Corrective  │                    │
│  │ Generation  │     │ Follow-up   │     │ Actions     │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RISK & GOVERNANCE                                     │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  RISK PROFILES  │  │ PSAP SCORECARD  │  │  KRA & WORKPLAN │              │
│  │                 │  │                 │  │                 │              │
│  │ Division-level  │  │ Performance     │  │ Key Result      │              │
│  │ risk assessment │  │ Assessment      │  │ Areas tracking  │              │
│  │                 │  │ Compliance      │  │ Work planning   │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1: INITIAL SETUP (Administrator)

### Step 1.1: Configure Divisions
**Path:** `/admin/divisions`
**Who:** System Administrator
**Purpose:** Set up DLPP organizational structure

```
Actions:
1. Click "Add Division"
2. Enter Division Code (e.g., "LTR")
3. Enter Division Name (e.g., "Land Title Registration")
4. Add Head Position (e.g., "Director")
5. Optionally add Sections within each Division
```

**Sample Divisions for DLPP:**
| Code | Division Name | Head Position |
|------|---------------|---------------|
| IAU | Internal Audit Unit | Chief Internal Auditor |
| LTR | Land Title Registration | Director |
| VAL | Valuation Division | Director |
| SUR | Survey Division | Director |
| PPD | Physical Planning Division | Director |
| LMD | Land Management Division | Director |

---

### Step 1.2: Configure Modules
**Path:** `/admin/modules`
**Who:** System Administrator
**Purpose:** Define system features that can have permissions

```
Actions:
1. Click "Seed Default Modules" to auto-create 17 standard modules
   OR
2. Manually create modules with:
   - Module Name
   - Module Key (lowercase_with_underscores)
   - Category (Core, Audit Workflow, Risk & Governance, Management, Administration)
```

---

### Step 1.3: Create Groups (Roles)
**Path:** `/admin/groups`
**Who:** System Administrator
**Purpose:** Define user roles with specific permissions

```
Actions:
1. Click "Quick Setup" to create default groups
2. Or manually create groups with names like:
   - Super Admin
   - Audit Manager
   - Senior Auditor
   - Auditor
   - Risk Officer
   - Action Owner
   - Viewer

3. For each group, configure Permission Matrix:
   - Can Create
   - Can Read
   - Can Update
   - Can Delete
   - Can Print
   - Can Approve
   - Can Export
```

---

### Step 1.4: Create Users
**Path:** `/admin/users`
**Who:** System Administrator
**Purpose:** Add staff members to the system

```
Actions:
1. Click "Create New User"
2. Enter:
   - Full Name
   - Email Address
   - Phone Number
   - Assign to Division
   - Assign to Group(s)
3. User can now access system based on their group permissions
```

---

## PHASE 2: RISK REGISTER SETUP (Risk Officer)

### Step 2.1: Populate Risk Register
**Path:** `/risk-register`
**Who:** Risk Officer, Audit Manager
**Purpose:** Document all known risks facing DLPP

```
For Each Risk:
1. Click "Add Risk"
2. Enter Risk Details:
   - Risk Code (e.g., "RISK-001")
   - Risk Title (e.g., "Delayed Land Title Processing")
   - Risk Description
   - Risk Category:
     □ Operational
     □ Financial
     □ Compliance
     □ Strategic
   - Owner Division (select from dropdown)

3. Assess Inherent Risk (before controls):
   - Likelihood (1-5)
   - Impact (1-5)
   - System calculates: Inherent Risk Score = L × I
   - Inherent Risk Level: Low/Medium/High/Extreme

4. Evaluate Controls:
   - Control Description
   - Control Effectiveness: Effective/Partially Effective/Ineffective

5. Calculate Residual Risk (after controls):
   - Residual Likelihood
   - Residual Impact
   - Residual Risk Rating
```

**Risk Rating Matrix:**
```
              │  Impact →
              │  1    2    3    4    5
    ──────────┼─────────────────────────
    L    5    │  5   10   15   20   25
    i    4    │  4    8   12   16   20
    k    3    │  3    6    9   12   15
    e    2    │  2    4    6    8   10
    l    1    │  1    2    3    4    5
    i         │
    h         │
    o         │
    o         │
    d         │

    1-4:   Low (Green)
    5-9:   Medium (Yellow)
    10-15: High (Orange)
    16-25: Extreme (Red)
```

---

## PHASE 3: RISK EVENT CREATION (Gateway to Audits)

### Step 3.1: Create Risk Event
**Path:** `/risk-events`
**Who:** Anyone can request, Audit Manager approves
**Purpose:** ★ ALL AUDITS MUST START HERE ★

```
Three Ways to Create Risk Events:

┌─────────────────────────────────────────────────────────────────┐
│ Source 1: AAAP (Annual Audit Plan)                              │
│ ─────────────────────────────────────────────────────────────── │
│ Based on Risk Register residual ratings, select high-risk       │
│ areas for planned audits during the year.                       │
│                                                                  │
│ Priority: Determined by risk rating                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Source 2: Secretary Directives                                  │
│ ─────────────────────────────────────────────────────────────── │
│ Priority directives from the Secretary that override            │
│ normal planning. These get immediate attention.                 │
│                                                                  │
│ Priority: Critical (Override)                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Source 3: Requests (External/Internal)                          │
│ ─────────────────────────────────────────────────────────────── │
│ - Division heads requesting audits                              │
│ - External stakeholder requests                                 │
│ - Whistle-blower reports                                        │
│ - Follow-up from previous findings                              │
│                                                                  │
│ Priority: Based on assessment                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3.2: Risk Event Workflow
```
┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌─────────────┐
│ PENDING  │───▶│ UNDER REVIEW │───▶│ APPROVED │───▶│ IN PROGRESS │
└──────────┘    └──────────────┘    └──────────┘    └─────────────┘
     │                 │                  │                │
     │                 │                  │                │
  Created         Audit Manager      Ready for        Engagement
  by User         reviewing         Engagement          Created
```

**Required Information:**
- Event Title
- Link to Risk Register (which risk does this relate to?)
- Event Source (AAAP/Secretary/Request)
- Priority Level (Critical/High/Medium/Low)
- Description
- Requested By
- Date Received
- Target Completion Date

---

## PHASE 4: AUDIT ENGAGEMENT (Audit Team)

### Step 4.1: Create Engagement from Risk Event
**Path:** `/engagements`
**Who:** Audit Manager, Lead Auditor
**Purpose:** Plan and execute the audit

```
Actions:
1. Click "New Engagement"
2. MUST select a Risk Event (mandatory gateway)
3. Enter Engagement Details:
   - Engagement Number (auto-generated)
   - Engagement Title
   - Engagement Type:
     □ Compliance Audit
     □ Performance Audit
     □ Financial Audit
     □ Special Investigation
     □ Follow-up Audit
   - Scope (what's included/excluded)
   - Objectives (what we're trying to achieve)
   - Lead Auditor
   - Team Members
   - Planned Start Date
   - Planned End Date
```

### Step 4.2: Engagement Status Flow
```
┌──────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌────────┐
│ PLANNING │───▶│ FIELDWORK │───▶│ REPORTING │───▶│ FOLLOW-UP │───▶│ CLOSED │
└──────────┘    └───────────┘    └───────────┘    └───────────┘    └────────┘
     │               │                 │                │              │
     │               │                 │                │              │
  Planning      Evidence          Draft Report    Tracking         Audit
  Phase         Collection        Review          Actions          Complete
```

---

## PHASE 5: FIELDWORK (Auditors)

### Step 5.1: Conduct Fieldwork
**Path:** `/fieldwork`
**Who:** Assigned Auditors
**Purpose:** Collect evidence and test controls

```
Fieldwork Activities:
├── Document Review
│   └── Policies, procedures, previous audits
│
├── Interviews
│   └── Staff, management, stakeholders
│
├── Walkthroughs
│   └── Observe actual processes
│
├── Testing
│   ├── Control Testing
│   ├── Substantive Testing
│   └── Sampling
│
├── Evidence Collection
│   └── Screenshots, documents, data extracts
│
└── Working Papers
    └── Document all work performed
```

---

## PHASE 6: FINDINGS (Lead Auditor)

### Step 6.1: Document Findings
**Path:** `/findings`
**Who:** Lead Auditor, Auditors
**Purpose:** Document issues discovered during audit

```
For Each Finding:
1. Click "Add Finding"
2. Link to Engagement
3. Enter Finding Details:

   CONDITION (What we found)
   ─────────────────────────
   "Our review of 50 land title applications revealed
   that 35 (70%) were not processed within the 30-day
   standard timeframe."

   CRITERIA (What should be)
   ─────────────────────────
   "According to the Land Titles Act 2020, all applications
   should be processed within 30 working days."

   CAUSE (Why it happened)
   ─────────────────────────
   "Insufficient staffing in the processing unit and
   lack of automated tracking system."

   EFFECT (Impact/Risk)
   ─────────────────────────
   "Delayed service delivery, customer complaints,
   potential revenue loss from pending transactions."

4. Assign Risk Rating:
   □ Critical
   □ High
   □ Medium
   □ Low
```

---

## PHASE 7: RECOMMENDATIONS (Lead Auditor)

### Step 7.1: Develop Recommendations
**Path:** `/recommendations`
**Who:** Lead Auditor
**Purpose:** Suggest corrective actions

```
For Each Finding, Create Recommendations:

1. Link to Finding
2. Enter Recommendation:

   "Management should:
   1. Hire additional processing officers (3 FTE)
   2. Implement automated tracking system
   3. Establish monthly monitoring reports"

3. Assign:
   - Responsible Division
   - Priority (High/Medium/Low)
   - Target Implementation Date

4. Status:
   □ Open
   □ In Progress
   □ Implemented
   □ Closed
```

---

## PHASE 8: ACTION PLANS (Action Owners)

### Step 8.1: Track Implementation
**Path:** `/action-plans`
**Who:** Division Managers (Action Owners)
**Purpose:** Track progress on recommendations

```
For Each Recommendation:

1. Action Owner accepts/agrees to recommendation
2. Creates Action Plan:
   - Specific actions to be taken
   - Resources required
   - Timeline/milestones
   - Evidence of completion

3. Regular Updates:
   - Progress percentage
   - Status notes
   - Challenges/blockers

4. Completion:
   - Upload evidence of implementation
   - Auditor verifies
   - Mark as complete
```

### Step 8.2: Follow-up Process
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ACCEPTED  │────▶│ IN PROGRESS │────▶│  COMPLETED  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   OVERDUE   │ (if past target date)
                    └─────────────┘
                           │
                           ▼
                    Escalation to
                    Management
```

---

## PHASE 9: REPORTING (Audit Manager)

### Step 9.1: Generate Reports
**Path:** `/reports`
**Who:** Audit Manager
**Purpose:** Formal audit deliverables

```
Report Types:
├── Draft Audit Report
│   └── Shared with auditee for response
│
├── Final Audit Report
│   └── Includes management responses
│
├── Executive Summary
│   └── For senior management
│
├── Action Plan Status Report
│   └── Monthly/Quarterly tracking
│
└── Annual Audit Report
    └── Summary of all audits for the year
```

---

## GOVERNANCE MODULES

### Risk Profiles (`/risk-profiles`)
**Purpose:** Division-level risk assessments

```
Each Division maintains:
- Risk profile document
- Risk heat map
- Top risks and mitigations
- Quarterly updates
```

### PSAP Scorecard (`/psap-scorecard`)
**Purpose:** Performance Standard Assessment Program

```
Quarterly Assessment:
- Compliance scoring (0-20)
- Performance indicators
- Trend analysis
- Improvement areas
```

### KRA & Workplan (`/kra-workplan`)
**Purpose:** Key Result Areas tracking

```
Annual Planning:
- Strategic KRAs
- Activities per KRA
- Quarterly status updates
- Completion tracking
```

---

## USER ROLES & RESPONSIBILITIES

| Role | Primary Responsibilities |
|------|-------------------------|
| **System Administrator** | Setup divisions, modules, groups, users |
| **Audit Manager** | Approve risk events, assign engagements, review reports |
| **Senior Auditor** | Lead audits, supervise team, write findings |
| **Auditor** | Conduct fieldwork, collect evidence, document findings |
| **Risk Officer** | Maintain risk register, update risk profiles |
| **Action Owner** | Implement recommendations, provide updates |
| **Viewer** | Read-only access to reports and dashboards |

---

## QUICK REFERENCE: COMPLETE AUDIT CYCLE

```
Week 1-2: PLANNING
├── Risk Event created/approved
├── Engagement created
├── Team assigned
├── Scope defined
└── Audit program prepared

Week 3-6: FIELDWORK
├── Entry meeting
├── Document review
├── Testing
├── Interviews
└── Evidence collection

Week 7-8: REPORTING
├── Draft findings
├── Exit meeting
├── Management responses
└── Final report

Ongoing: FOLLOW-UP
├── Action plan tracking
├── Progress monitoring
├── Verification testing
└── Closure
```

---

## DASHBOARD METRICS

The Dashboard (`/dashboard`) shows:

| Metric | Source | Meaning |
|--------|--------|---------|
| Active Engagements | audit_engagements | Audits currently in progress |
| Open Findings | audit_findings | Issues not yet resolved |
| Pending Recommendations | audit_recommendations | Actions awaiting implementation |
| Overdue Actions | audit_recommendations (target_date) | Past-due items needing attention |

---

## CONTACT & SUPPORT

For system issues or questions:
- **Technical Support:** support@same.new
- **System Documentation:** https://docs.same.new

---

*Document Version: 1.0*
*Last Updated: March 10, 2026*
*System Version: 28*
