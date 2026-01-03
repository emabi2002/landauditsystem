# Data Entry Forms - Complete Guide

## 🎉 All Forms Successfully Built!

Three comprehensive data entry forms have been created and integrated into the Risk & Governance modules.

---

## ✅ Form 1: PSAP Assessment Form

**Location:** PSAP Scorecard page → "New Assessment" button

### Features:
- **Header Information:**
  - Organization Unit selection
  - Financial Year (2024-2026)
  - Quarter (Q1-Q4)
  - Assessment Date picker
  - Completed By (person selector)
  - Reviewed By (optional person selector)

- **20 PSAP Standards Scoring:**
  - All 20 standards displayed in scrollable table
  - Each standard shows:
    - Standard number and title
    - Description
    - Weighting (0.7 - 1.0)
    - Score input field (0-10)
    - Auto-calculated weighted score
  - **Real-time calculations:**
    - Overall Score = Σ(Raw Score × Weighting)
    - Overall Rating automatically determined:
      - 18.0-20.0: Full Compliance (green)
      - 15.0-17.9: Substantial Compliance (lime)
      - 12.0-14.9: Partial Compliance (yellow)
      - 9.0-11.9: Low Compliance (orange)
      - 0.0-8.9: Non-Compliance (red)

- **Comments Section:**
  - Overall assessment comments textarea

### How to Use:
1. Click "New Assessment" button
2. Select organization unit, year, and quarter
3. Choose completed by person
4. Scroll through 20 standards
5. Enter score (0-10) for each standard
6. Watch overall score calculate automatically
7. See rating badge update in real-time
8. Add comments if needed
9. Click "Create Assessment"

### Database Actions:
- Creates `psap_assessments` record
- Creates 20 `psap_assessment_scores` records
- Triggers auto-calculate weighted scores
- Triggers auto-determine overall rating

---

## ✅ Form 2: Risk Profile Form

**Location:** Risk Profiles page → "Create Risk Profile" button

### Features:
- **Organization Unit:** Dropdown of active org units
- **Project Name:** Optional text field for specific projects
- **Profile Date:** Date picker (defaults to today)
- **Overall Risk Level:** Optional dropdown (Low/Moderate/High/Extreme)
- **Prepared By:** Person selector (required)
- **Reviewed By:** Optional person selector
- **Remarks:** Textarea for general comments

- **Next Steps Guidance:**
  - Helpful instructions for what comes after creation
  - Explains matrix editor will be used to add risks

### How to Use:
1. Click "Create Risk Profile" button
2. Select organization unit
3. Optionally add project name
4. Select profile date
5. Choose who prepared it
6. Optionally select reviewer and overall level
7. Add remarks if needed
8. Click "Create Risk Profile"

### Database Actions:
- Creates `risk_profiles` record
- Ready for risk items to be added via matrix editor (Phase 2)

### Future Enhancement:
After creating a risk profile, you'll be able to:
- Add individual risks using the matrix editor
- Set likelihood (1-5) and impact (1-5) for each risk
- Auto-calculate risk scores and levels
- Assign risk owners and target dates

---

## ✅ Form 3: KRA Status Update Form

**Location:** KRA & Workplan page → "Update Status" button

### Features:
- **Header Selection:**
  - Financial Year (2024-2026)
  - Quarter (Q1-Q4)
  - Select KRA from dropdown

- **Activity Status Updates:**
  - Shows all activities for selected KRA
  - Each activity displays:
    - Activity code (a, b, c, etc.)
    - Description
    - Measure/indicator
  - **Status fields for each activity:**
    - Status dropdown:
      - Completed
      - Ongoing
      - Not Started
      - Delayed
      - Not Measurable
    - Narrative Status (textarea)
    - Challenges (textarea)
    - Revision for Next Year (textarea)

- **Progress Summary:**
  - Shows completed count vs. total activities
  - Displays completion percentage

### How to Use:
1. Click "Update Status" button
2. Select financial year and quarter
3. Choose a KRA from dropdown
4. All activities for that KRA will appear
5. For each activity:
   - Select status from dropdown
   - Enter narrative (e.g., "6 audits completed")
   - Document any challenges
   - Note revisions for next year
6. Watch completion percentage update
7. Click "Update Status" to save

### Database Actions:
- **Upserts** (creates or updates) `kra_activity_quarterly_status` records
- Updates all activities for selected KRA and quarter
- Preserves existing data if updating

---

## 🎯 Testing the Forms

### Test Data Setup:

**1. Test PSAP Assessment:**
```
Org Unit: Governance & Compliance Unit (GCU)
Year: 2025
Quarter: Q1
Try scoring all 20 standards with values 7-9
Watch overall score calculate to ~16-18 (Substantial Compliance)
```

**2. Test Risk Profile:**
```
Org Unit: Governance & Compliance Unit
Project: "IT Security Audit 2025"
Profile Date: Today
Overall Level: High
Add remarks about the assessment scope
```

**3. Test KRA Status:**
```
Year: 2024
Quarter: Q4
KRA: "1: Management of Governance and Compliance Unit"
Update all 6 activities (a-f)
Mark some as "Completed", others as "Ongoing"
```

---

## 📊 What Happens When You Submit

### PSAP Assessment:
1. Form validates required fields
2. Creates assessment header record
3. Creates 20 score records (one per standard)
4. Database triggers calculate:
   - Each weighted score = raw_score × weighting
   - Overall score = sum of all weighted scores
   - Overall rating = based on rating scales table
5. Success toast appears
6. Dialog closes
7. Main page refreshes showing new assessment

### Risk Profile:
1. Form validates org unit and prepared by
2. Creates risk profile header record
3. Returns profile ID for future use
4. Success toast appears
5. Dialog closes
6. Main page refreshes showing new profile
7. Ready for risk items to be added

### KRA Status:
1. Form validates KRA selection
2. For each activity, creates or updates quarterly status
3. Uses UPSERT to handle updates gracefully
4. All activities saved in single transaction
5. Success toast appears
6. Dialog closes
7. Main page refreshes showing updated statistics

---

## 🔍 Validation & Error Handling

### All Forms Include:
- ✅ Required field validation
- ✅ Loading states during submission
- ✅ Error toast notifications
- ✅ Success confirmation messages
- ✅ Disabled buttons during save
- ✅ Cancel button to close without saving

### PSAP Specific:
- ✅ Score range validation (0-10)
- ✅ Duplicate assessment prevention (org + year + quarter)
- ✅ Real-time calculation updates

### KRA Specific:
- ✅ Activity existence check
- ✅ Prevents data loss on updates (upsert)
- ✅ Loads existing status if re-opening quarter

---

## 🎨 User Experience Features

### Real-Time Feedback:
- **PSAP:** Overall score and rating update as you type scores
- **KRA:** Completion percentage updates as you change statuses
- **All:** Loading spinners on submit buttons

### Smart Defaults:
- **PSAP:** Current year, Q1, today's date
- **Risk Profile:** Today's date
- **KRA:** Current year, Q1

### Helper Text:
- **PSAP:** Shows what each rating means
- **Risk Profile:** Explains next steps after creation
- **KRA:** Shows measure/indicator for each activity

---

## 📝 Form Components Created

### New Files:
```
src/components/dialogs/
├── CreatePSAPAssessmentDialog.tsx  (PSAP form)
├── CreateRiskProfileDialog.tsx     (Risk Profile form)
└── UpdateKRAStatusDialog.tsx       (KRA Status form)

src/components/ui/
└── label.tsx                       (Form label component)
```

### Updated Files:
```
src/app/(dashboard)/psap-scorecard/page.tsx  (integrated dialog)
src/app/(dashboard)/risk-profiles/page.tsx   (integrated dialog)
src/app/(dashboard)/kra-workplan/page.tsx    (integrated dialog)
```

---

## 🚀 Next Steps After Form Submission

### After Creating PSAP Assessment:
- View it in the Assessments tab
- See overall score and rating in table
- Track trends over quarters
- Export reports (Phase 2)

### After Creating Risk Profile:
- Add individual risks via matrix editor (Phase 2)
- Link to audit engagements
- Track risk mitigation progress
- Generate risk heat maps (Phase 2)

### After Updating KRA Status:
- View in Quarterly Status tab
- See completion statistics by KRA
- Link to audit recommendations (Phase 2)
- Export quarterly reports (Phase 2)

---

## ✅ Completion Checklist

- [x] PSAP Assessment form built
- [x] Risk Profile form built
- [x] KRA Status form built
- [x] All forms integrated into pages
- [x] Database connections working
- [x] Auto-calculations implemented
- [x] Validation & error handling added
- [x] Success/error notifications working
- [x] Loading states implemented
- [x] Forms tested with seed data

**Status:** ✅ All forms complete and ready to use!

---

## 🆘 Troubleshooting

### Form doesn't open:
- Check console for errors
- Ensure dev server is running
- Refresh the page

### Dropdown is empty:
- Verify database has org_units
- Verify database has people records
- Check Supabase connection

### Save fails:
- Check required fields are filled
- Look at toast error message
- Verify Supabase credentials
- Check browser console for details

### Calculations don't update:
- Ensure onChange handlers are working
- Check state updates in React DevTools
- Verify weighted score formula

---

**Forms Ready!** 🎉
You can now start entering data into your Risk & Governance modules!
