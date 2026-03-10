# DLPP Risk Register Integration

## Overview

The Risk Register is the **authoritative shared table** that governs the entire Audit & Compliance ecosystem. It serves as the "spine" of the system - all audit activities must be traced back to identified risks.

## Golden Rule

> **No audit object may exist without a Risk ID.**

This applies to:
- Audit Plans (AAAP)
- Audit Engagements
- Audit Findings
- Compliance Reviews
- Management Actions
- Dashboards & Reports

---

## Database Migration

Apply the migration file to your Supabase database:

```sql
-- Run this in Supabase SQL Editor
\i supabase/migrations/004_risk_register_integration.sql
```

Or copy and paste the contents of `supabase/migrations/004_risk_register_integration.sql` into the Supabase SQL Editor and execute.

---

## Tables Created

### Core Risk Register Tables

| Table | Description |
|-------|-------------|
| `risk_register` | Central authoritative risk register |
| `risk_legal_references` | Links risks to legal instruments |
| `risk_treatments` | Risk mitigation actions |
| `risk_incidents` | Risk events/incidents |
| `risk_indicators` | Key Risk Indicators (KRIs) |
| `risk_indicator_values` | KRI measurements |
| `risk_audit_log` | Immutable audit trail |

### Reference Tables

| Table | Description |
|-------|-------------|
| `legal_instruments` | Acts, Regulations, Policies |
| `divisions` | Organizational divisions |
| `sections` | Sections within divisions |
| `business_processes` | Business processes |

---

## Risk Register Schema

### Identity & Context
- `risk_code` - Unique identifier (e.g., DLPP-LT-001)
- `risk_title` - Short descriptive title
- `risk_description` - Detailed description
- `risk_category` - Strategic, Operational, Financial, Compliance, Reputational, Technology, Governance, External
- `risk_subcategory` - Further classification

### Organizational Anchoring
- `division_id` - Link to division
- `section_id` - Link to section
- `process_id` - Link to business process

### Risk Scoring (Inherent - Before Controls)
- `inherent_likelihood` (1-5)
- `inherent_impact` (1-5)
- `inherent_risk_score` (computed: likelihood x impact)
- `inherent_risk_rating` (computed: Extreme/High/Medium/Low)

### Control Assessment
- `control_effectiveness` - Effective, Partially Effective, Ineffective, Not Tested, No Controls
- `control_description` - Description of existing controls

### Risk Scoring (Residual - After Controls)
- `residual_likelihood` (1-5)
- `residual_impact` (1-5)
- `residual_risk_score` (computed)
- `residual_risk_rating` (computed)

### Ownership & Oversight
- `risk_owner_role` - Role title of risk owner
- `risk_owner_id` - Link to person
- `oversight_body` - Audit Committee, Secretary, Executive Management, Board, Division Head, Internal Audit

### Lifecycle
- `risk_status` - Active, Under Review, Mitigated, Accepted, Closed, Escalated
- `identified_date` - Date risk was identified
- `last_reviewed_at` - Last review timestamp
- `next_review_due` - Next review date
- `review_frequency` - Monthly, Quarterly, Bi-annually, Annually

### Treatment
- `risk_treatment` - Mitigate, Transfer, Accept, Avoid
- `treatment_plan` - Description of treatment strategy
- `target_risk_rating` - Target rating after treatment

---

## Legal References (CRITICAL)

Every risk MUST have at least one legal reference. This ensures:
1. **Legal defensibility** of audit activities
2. **Traceability** to specific legislation
3. **Compliance reporting** by Act/Regulation

### Seeded Legal Instruments

| Code | Title |
|------|-------|
| LA1996 | Land Act 1996 |
| LRA1981 | Land Registration Act 1981 |
| LGILRA2009 | Land Groups Incorporation (Amendment) Act 2009 |
| PPA1989 | Physical Planning Act 1989 |
| SM1969 | Survey Act 1969 |
| VA1967 | Valuation Act 1967 |
| PFMA1995 | Public Finances (Management) Act 1995 |
| PPSM | Public Service Management Act 2014 |
| AGA2015 | Audit Act 2015 |
| PROC2018 | Procurement Act 2018 |
| CISM | Central Information Systems Management Act |

---

## DLPP Divisions

| Code | Division |
|------|----------|
| SEC | Secretary's Office |
| LTR | Land Titles Registry |
| PHPL | Physical Planning |
| SRV | Survey & Mapping |
| VAL | Valuation |
| LMD | Land Management |
| CLU | Customary Land |
| CS | Corporate Services |
| LEG | Legal Services |
| IAU | Internal Audit |

---

## Seeded System Risks (20+)

### Land Titles Registry (DLPP-LT-xxx)
- DLPP-LT-001: Duplicate Title Registration
- DLPP-LT-002: Fraudulent Title Registration
- DLPP-LT-003: Title Record Loss or Damage
- DLPP-LT-004: Unauthorized Access to Title Records

### Customary Land (DLPP-CL-xxx)
- DLPP-CL-001: Invalid ILG Registration
- DLPP-CL-002: Customary Land Boundary Disputes
- DLPP-CL-003: Customary Land Alienation

### Physical Planning (DLPP-PP-xxx)
- DLPP-PP-001: Non-compliant Development Approvals
- DLPP-PP-002: Outdated Physical Planning Schemes
- DLPP-PP-003: Illegal Structures and Settlements

### Survey & Valuation (DLPP-SV-xxx)
- DLPP-SV-001: Inaccurate Survey Data
- DLPP-SV-002: Valuation Manipulation

### Financial (DLPP-FN-xxx)
- DLPP-FN-001: Revenue Leakage - Land Rent
- DLPP-FN-002: Improper Fee Waivers
- DLPP-FN-003: Procurement Irregularities

### ICT & Data (DLPP-IT-xxx)
- DLPP-IT-001: Critical System Downtime
- DLPP-IT-002: Cyber Security Breach
- DLPP-IT-003: Data Integrity Compromise

### HR (DLPP-HR-xxx)
- DLPP-HR-001: Staff Capacity Gaps
- DLPP-HR-002: Payroll Irregularities

### Governance (DLPP-GV-xxx)
- DLPP-GV-001: Political Interference in Land Allocation
- DLPP-GV-002: Conflict of Interest - Staff

---

## UI Features

### Risk Register Page (`/risk-register`)

1. **Risk Table** - Filterable by category, status, rating, division
2. **Heat Map** - Visual likelihood x impact matrix
3. **By Division** - Risk counts per organizational unit
4. **By Category** - Risk counts per category
5. **Legal Compliance** - Risks mapped to legal instruments

### Create Risk Dialog
4-step wizard requiring:
1. Basic Information (code, title, description, category, division)
2. Risk Assessment (inherent & residual scoring)
3. Ownership & Treatment
4. Legal References (at least one required)

### Risk Detail Sheet
View complete risk information including:
- Scores and ratings
- Key information
- Treatment actions
- Incidents
- Legal references
- Audit history

---

## Access Model

| Operation | Access Level |
|-----------|--------------|
| Read | All authenticated users |
| Create | Audit / Risk Admin |
| Update | Risk Owner / Audit Admin |
| Delete | Prohibited for system risks |

System risks (`is_system_risk = true`) cannot be deleted. They can only be closed.

---

## Integration with Existing Modules

### Audit Engagements
```sql
-- New column added
ALTER TABLE audit_engagements ADD COLUMN risk_id UUID REFERENCES risk_register(id);
```

### Audit Findings
```sql
-- New columns added
ALTER TABLE audit_findings ADD COLUMN risk_id UUID REFERENCES risk_register(id);
ALTER TABLE audit_findings ADD COLUMN legal_instrument_id UUID REFERENCES legal_instruments(id);
```

### Audit Recommendations
```sql
-- New column added
ALTER TABLE audit_recommendations ADD COLUMN risk_id UUID REFERENCES risk_register(id);
```

---

## Immutability & Safeguards

1. **System risks cannot be deleted** - Trigger prevents deletion
2. **All changes logged** - `risk_audit_log` table tracks all modifications
3. **Rating change tracking** - Specific logging for rating changes
4. **Status change tracking** - Specific logging for status changes

---

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Test the Risk Register UI** at `/risk-register`
3. **Review seeded risks** and add any missing DLPP-specific risks
4. **Train users** on the new risk-based audit approach
5. **Update audit engagement workflow** to require risk selection

---

## Support

For issues or questions, contact the Internal Audit team or system administrator.

**Version**: 10.0
**Last Updated**: December 2024
