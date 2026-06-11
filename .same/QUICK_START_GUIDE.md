# DLPP Audit System - Quick Start Guide

## For New Users: Follow These Steps In Order

---

## STEP 1: Administrator Setup (Do This First!)

### 1.1 Create Divisions
Go to: **Admin Hub → Divisions** (`/admin/divisions`)

| Action | What to Enter |
|--------|--------------|
| Click "Add Division" | |
| Code | IAU (for Internal Audit Unit) |
| Name | Internal Audit Unit |
| Head Position | Chief Internal Auditor |
| Click "Create Division" | |

Repeat for other divisions: LTR, VAL, SUR, PPD, LMD

---

### 1.2 Seed Modules
Go to: **Admin Hub → Modules** (`/admin/modules`)

| Action | What to Do |
|--------|-----------|
| Click "Seed Default Modules" | Creates 17 standard modules automatically |
| Verify modules appear | Dashboard, Risk Register, Engagements, etc. |

---

### 1.3 Create Groups (Quick Setup)
Go to: **Admin Hub → Groups** (`/admin/groups`)

| Action | What to Do |
|--------|-----------|
| Click "Quick Setup" | |
| Select all group templates | Super Admin, Audit Manager, Senior Auditor, Auditor, Risk Officer, Action Owner, Viewer |
| Click "Create Groups" | |
| Click each group | |
| Configure permissions in matrix | Toggle switches for each permission |
| Click "Save Permissions" | |

---

### 1.4 Create Users
Go to: **Admin Hub → Users** (`/admin/users`)

| Action | What to Enter |
|--------|--------------|
| Click "Create New User" | |
| Full Name | John Doe |
| Email | john.doe@dlpp.gov.pg |
| Phone | +675 7123 4567 |
| Division | Internal Audit Unit |
| Group | Audit Manager |
| Click "Create User" | |

---

## STEP 2: Populate Risk Register

Go to: **Risk Register** (`/risk-register`)

### 2.1 Add Your First Risk

| Field | Example Entry |
|-------|--------------|
| Risk Code | RISK-001 |
| Risk Title | Delayed Land Title Processing |
| Description | Processing of land titles exceeds standard timeframes |
| Category | Operational |
| Owner Division | Land Title Registration |
| Inherent Likelihood | 4 (Likely) |
| Inherent Impact | 4 (Major) |
| Control Effectiveness | Partially Effective |
| Residual Likelihood | 3 |
| Residual Impact | 3 |

---

## STEP 3: Create Risk Event (Gateway to Audit)

Go to: **Risk Events** (`/risk-events`)

### 3.1 Add New Risk Event

| Field | Example Entry |
|-------|--------------|
| Event Title | Land Title Processing Delays Audit |
| Source | AAAP (Annual Audit Plan) |
| Priority | High |
| Link to Risk | RISK-001: Delayed Land Title Processing |
| Description | Audit of land title processing delays based on high residual risk rating |
| Requested By | Audit Manager |
| Date Received | Today's date |
| Target Date | 30 days from today |

### 3.2 Approve the Risk Event
1. Status changes: **Pending → Under Review → Approved**
2. Once approved, you can create an engagement

---

## STEP 4: Create Engagement

Go to: **Engagements** (`/engagements`)

### 4.1 Start New Engagement

| Field | Example Entry |
|-------|--------------|
| Select Risk Event | Land Title Processing Delays Audit (required!) |
| Engagement Title | LTR Processing Audit Q1 2026 |
| Engagement Type | Performance Audit |
| Scope | Review of all land title applications from Jan-Mar 2026 |
| Objectives | Assess compliance with 30-day processing standard |
| Lead Auditor | Select from dropdown |
| Planned Start | Next Monday |
| Planned End | 6 weeks later |

### 4.2 Move Through Stages
```
PLANNING → FIELDWORK → REPORTING → FOLLOW-UP → CLOSED
```

---

## STEP 5: Conduct Fieldwork

Go to: **Fieldwork** (`/fieldwork`)

Document your audit work:
- Upload working papers
- Record interviews
- Attach evidence
- Note observations

---

## STEP 6: Document Findings

Go to: **Findings** (`/findings`)

### 6.1 Add Finding

| Field | Example Entry |
|-------|--------------|
| Engagement | LTR Processing Audit Q1 2026 |
| Finding Title | Non-compliance with Processing Timeframes |
| **Condition** | 70% of applications exceeded 30-day standard |
| **Criteria** | Land Titles Act requires 30-day processing |
| **Cause** | Insufficient staff, no tracking system |
| **Effect** | Service delays, customer complaints |
| Risk Rating | High |

---

## STEP 7: Add Recommendations

Go to: **Recommendations** (`/recommendations`)

### 7.1 Add Recommendation

| Field | Example Entry |
|-------|--------------|
| Finding | Non-compliance with Processing Timeframes |
| Recommendation | Implement automated tracking system |
| Priority | High |
| Responsible Division | Land Title Registration |
| Target Date | 90 days from today |

---

## STEP 8: Track Action Plans

Go to: **Action Plans** (`/action-plans`)

The responsible division (Action Owner) will:
1. Accept the recommendation
2. Create implementation plan
3. Provide regular updates
4. Upload evidence when complete

---

## STEP 9: Generate Reports

Go to: **Reports** (`/reports`)

Generate:
- Draft Audit Report
- Final Audit Report
- Executive Summary
- Action Plan Status Report

---

## Summary: The Audit Flow

```
┌────────────────┐
│ 1. RISK        │ ← Document risks in Risk Register
│    REGISTER    │
└───────┬────────┘
        ↓
┌────────────────┐
│ 2. RISK        │ ← Create event (AAAP/Secretary/Request)
│    EVENT       │   ★ MANDATORY GATEWAY ★
└───────┬────────┘
        ↓
┌────────────────┐
│ 3. ENGAGEMENT  │ ← Plan the audit
└───────┬────────┘
        ↓
┌────────────────┐
│ 4. FIELDWORK   │ ← Conduct the audit
└───────┬────────┘
        ↓
┌────────────────┐
│ 5. FINDINGS    │ ← Document issues found
└───────┬────────┘
        ↓
┌────────────────┐
│ 6. RECOMMEND-  │ ← Suggest corrections
│    ATIONS      │
└───────┬────────┘
        ↓
┌────────────────┐
│ 7. ACTION      │ ← Track implementation
│    PLANS       │
└───────┬────────┘
        ↓
┌────────────────┐
│ 8. REPORTS     │ ← Formal deliverables
└────────────────┘
```

---

## Need Help?

- **Full Documentation:** See `PROCESS_WORKFLOW.md`
- **Technical Support:** support@same.new

---

*Last Updated: March 10, 2026*
