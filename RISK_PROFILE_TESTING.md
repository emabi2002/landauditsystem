# 🎲 Risk Profile Testing Guide

## Test Data Created

### Risk Profiles (2 profiles):
- ✅ **IT Security Audit 2024** - High risk (7 risks)
  - 1 Extreme risk
  - 5 High risks
  - 1 Moderate risk
- ✅ **Financial Systems Review Q4 2024** - Moderate risk (5 risks)
  - 1 High risk
  - 4 Moderate risks

### Risk Items (12 total):
- Distributed across different categories
- Auto-calculated scores and levels
- Mix of statuses (Open, Mitigating, Closed)

---

## 🎯 Testing Checklist

### 1. View Risk Profiles List

#### Access the Page
1. Go to http://localhost:3000/risk-profiles
2. You should see 2 risk profiles in the table

#### Verify List Display
Check the table shows:
- ✅ Org Unit: "Governance & Compliance Unit"
- ✅ Project names: "IT Security Audit 2024" and "Financial Systems Review..."
- ✅ Profile dates
- ✅ Overall Level badges (High = orange, Moderate = yellow)
- ✅ Prepared by and Reviewed by names
- ✅ View button (eye icon)

#### Check Statistics Cards
At the top, verify the stats:
- ✅ Total Profiles: 2
- ✅ Extreme Risk: 1
- ✅ High Risk: 6 (5+1)
- ✅ Low Risk: 0

---

### 2. View Risk Profile Detail Page

#### Open Detail View
1. Click the **eye icon** on "IT Security Audit 2024"
2. You should see the risk profile detail page

#### Verify Profile Information Card
Check the profile info displays:
- ✅ Organization Unit
- ✅ Project Name
- ✅ Profile Date
- ✅ Overall Level badge (High - orange)
- ✅ Prepared By name
- ✅ Reviewed By name
- ✅ Remarks text

#### Check Risk Statistics Dashboard
Verify the 6 stat cards show:
- ✅ Total Risks: 7
- ✅ Extreme: 1 (red number)
- ✅ High: 5 (orange number)
- ✅ Moderate: 1 (yellow number)
- ✅ Low: 0 (green number)
- ✅ Open: (count of open risks)

---

### 3. Test Risk Matrix View

#### View the Matrix
Scroll down to the "Risk Matrix" card

#### Verify Matrix Structure
The matrix should show:
- ✅ **Rows (5):** Context categories
  - External Environment
  - Compliance
  - Organisational Culture
  - Business Processes
  - Education & Skills / People
- ✅ **Columns (4):** Resource categories
  - Human Resources
  - Financial Resources
  - Information Resources
  - Infrastructure & Physical Assets

#### Check Risk Items in Matrix Cells
Each cell with risks should show:
- ✅ Risk description (truncated)
- ✅ Color-coded badge (red/orange/yellow/green)
- ✅ Risk level label (Extreme/High/Moderate/Low)
- ✅ Risk score number (1-25)
- ✅ Likelihood × Impact values

#### Find Specific Risks
Look for these in the matrix:
1. **External Environment × Information Resources:**
   - Should have "Cyber attacks..." risk
   - Should be Extreme (red) with score 20

2. **Compliance × Information Resources:**
   - Should have "Non-compliance..." risk
   - Should be High (orange) with score 12

3. **Business Processes × Financial Resources:**
   - Should have "Inadequate budget..." risk
   - Should be High (orange) with score 12

---

### 4. View All Risks List

#### Scroll to "All Risk Items"
Below the matrix, find the detailed list

#### Verify Risk Item Details
Each risk should show:
- ✅ Risk level badge (color-coded)
- ✅ Risk description (full text)
- ✅ Context category
- ✅ Resource category
- ✅ Risk score (e.g., "20")
- ✅ Likelihood and Impact breakdown (e.g., "L:4 × I:5")
- ✅ Status (Open/Mitigating/Closed)
- ✅ Risk owner (if assigned)
- ✅ Target date (if set)
- ✅ Existing controls text

---

### 5. Test Add Risk Item

#### Open Add Risk Dialog
1. Click **"Add Risk Item"** button (top right)
2. Dialog should open

#### Fill in the Form
Try creating a new risk:
```
Context Category: Compliance
Resource Category: Human Resources
Risk Description: "Staff non-compliance with mandatory training requirements"
Likelihood Score: 3
Impact Score: 3
Existing Controls: "Annual training program"
Additional Controls: "Mandatory compliance tracking system"
Risk Owner: Select org unit
Target Date: Pick a future date
Status: Open
```

#### Watch Auto-Calculations
As you enter scores, watch:
- ✅ **Risk Score** updates: 3 × 3 = 9
- ✅ **Risk Level** badge changes to: "Moderate" (yellow)
- ✅ Calculation formula shown: "= Likelihood (3) × Impact (3)"

#### Test Different Score Combinations
Try changing scores to see different levels:
- Likelihood: 5, Impact: 5 → Score: 25 → **Extreme** (red)
- Likelihood: 4, Impact: 4 → Score: 16 → **Extreme** (red)
- Likelihood: 3, Impact: 4 → Score: 12 → **High** (orange)
- Likelihood: 2, Impact: 3 → Score: 6 → **Moderate** (yellow)
- Likelihood: 1, Impact: 2 → Score: 2 → **Low** (green)

#### Save the Risk
1. Set Likelihood: 3, Impact: 3
2. Click "Add Risk Item"
3. Success toast should appear
4. Dialog should close
5. New risk should appear in the matrix
6. New risk should appear in the all risks list
7. Statistics should update (Total: 8, Moderate +1)

---

### 6. Test Export to CSV

#### Export Risk Data
1. On the risk profile detail page
2. Click **"Export CSV"** button (top right)
3. File should download

#### Verify CSV Content
Open the downloaded CSV in Excel:
- ✅ Column headers: Context Category, Resource Category, Risk Description, etc.
- ✅ All 7-8 risk items listed
- ✅ All fields populated
- ✅ Scores and levels correct
- ✅ Filename format: `Risk_Profile_GCU_2024-09-15.csv`

---

### 7. Test Dashboard Widget

#### View Dashboard
1. Go to http://localhost:3000/dashboard
2. Scroll to "Risk & Governance" section

#### Check Risk Profile Widget
Verify the widget shows:
- ✅ Total Risks: 12 (across both profiles)
- ✅ Extreme: 1
- ✅ High: 6
- ✅ Open: (count)
- ✅ List of org units with risk counts
- ✅ Color-coded numbers
- ✅ "View all risk profiles →" link

#### Test Widget Navigation
1. Click "View all risk profiles →"
2. Should navigate to `/risk-profiles`

---

### 8. Test Create New Risk Profile

#### Open Create Form
1. Go to `/risk-profiles`
2. Click **"Create Risk Profile"** button

#### Fill in the Form
Create a new profile:
```
Organization Unit: Governance & Compliance Unit
Project Name: "HR Compliance Assessment 2025"
Profile Date: Today's date
Overall Risk Level: Moderate
Prepared By: Select any person
Reviewed By: Select another person (optional)
Remarks: "Quarterly HR compliance risk assessment"
```

#### Save and Verify
1. Click "Create Risk Profile"
2. Success toast appears
3. Dialog closes
4. New profile appears in list (Total: 3)
5. Click "View" on the new profile
6. Should open detail page
7. Should show 0 risks
8. Should show message: "No risks added yet..."

#### Add First Risk to New Profile
1. Click "Add Risk Item"
2. Fill in any risk details
3. Save
4. Should appear in matrix
5. Should update statistics

---

## 🎨 Visual Elements to Verify

### Color Coding
- ✅ **Extreme (Red):** bg-red-500 badge
- ✅ **High (Orange):** bg-orange-500 badge
- ✅ **Moderate (Yellow):** bg-yellow-500 badge
- ✅ **Low (Green):** bg-green-500 badge

### Matrix Layout
- ✅ Clean grid structure
- ✅ Clear row/column headers
- ✅ Cells with borders
- ✅ Responsive on different screen sizes
- ✅ Scrollable if needed

### Statistics Dashboard
- ✅ 6 cards in a row
- ✅ Large numbers (2xl font)
- ✅ Color-coded values
- ✅ Clear labels

### Risk Item Cards
- ✅ Expandable/readable descriptions
- ✅ All metadata visible
- ✅ Organized layout
- ✅ Hover effects

---

## 📊 Risk Score Calculation Examples

### Understanding the Auto-Calculation

**Formula:** Risk Score = Likelihood × Impact

**Likelihood Scale (1-5):**
- 1 = Rare (unlikely to occur)
- 2 = Unlikely (could occur occasionally)
- 3 = Possible (might occur)
- 4 = Likely (probably will occur)
- 5 = Almost Certain (expected to occur)

**Impact Scale (1-5):**
- 1 = Insignificant (minimal impact)
- 2 = Minor (small impact)
- 3 = Moderate (noticeable impact)
- 4 = Major (significant impact)
- 5 = Catastrophic (severe impact)

**Risk Level Determination:**
- Score 15-25 = **Extreme** (requires immediate action)
- Score 10-14 = **High** (requires senior management attention)
- Score 5-9 = **Moderate** (requires management attention)
- Score 1-4 = **Low** (manage by routine procedures)

### Example Calculations

1. **Cyber Attack Risk:**
   - Likelihood: 4 (Likely)
   - Impact: 5 (Catastrophic)
   - Score: 4 × 5 = **20**
   - Level: **Extreme** (red)

2. **Compliance Risk:**
   - Likelihood: 3 (Possible)
   - Impact: 4 (Major)
   - Score: 3 × 4 = **12**
   - Level: **High** (orange)

3. **Training Risk:**
   - Likelihood: 3 (Possible)
   - Impact: 3 (Moderate)
   - Score: 3 × 3 = **9**
   - Level: **Moderate** (yellow)

4. **Physical Security:**
   - Likelihood: 2 (Unlikely)
   - Impact: 5 (Catastrophic)
   - Score: 2 × 5 = **10**
   - Level: **High** (orange)

---

## 🔍 Expected Matrix Distribution

### IT Security Profile
You should see risks in these cells:

| Context \ Resource | Human | Financial | Information | Infrastructure |
|-------------------|-------|-----------|-------------|----------------|
| External Environment | - | - | ✅ Cyber (20-E) | ✅ Physical (10-H) |
| Compliance | - | - | ✅ GDPR (12-H) | - |
| Organisational Culture | ✅ Resistance (9-M) | - | - | - |
| Business Processes | - | ✅ Budget (12-H) | ✅ Downtime (12-H) | - |
| Education & Skills | ✅ Awareness (12-H) | - | - | - |

Legend: E=Extreme, H=High, M=Moderate, L=Low

---

## ✅ Success Criteria

You've successfully tested Risk Profile features if you can:
- [x] See 2 risk profiles in the list
- [x] Open detail page with matrix view
- [x] See risks organized in 5×4 matrix
- [x] View risk statistics dashboard
- [x] Add a new risk item
- [x] Watch risk score calculate automatically
- [x] See risk level badge change colors
- [x] Export risk data to CSV
- [x] See risk widget on dashboard
- [x] Create a new risk profile
- [x] Navigate between list and detail views

---

## 🐛 Troubleshooting

### If matrix is empty:
- Check if risks were created
- Verify correct profile ID
- Refresh the page

### If calculations seem wrong:
- Score should be Likelihood × Impact
- Level should match score ranges
- Check browser console for errors

### If export doesn't work:
- Check browser download settings
- Verify risks exist for the profile
- Check browser console

---

## 📸 Screenshot Points

Take screenshots of:
1. ✅ Risk profiles list with 2 profiles
2. ✅ Risk matrix 5×4 grid with colored risks
3. ✅ Risk statistics dashboard
4. ✅ Add risk item dialog with auto-calculation
5. ✅ All risks list with full details
6. ✅ Dashboard risk widget
7. ✅ Exported CSV in Excel

---

## 🎯 Interactive Testing Scenarios

### Scenario 1: High Risk Assessment
1. Create new risk profile
2. Add 3-4 risks with high scores (12-20)
3. Verify overall level becomes "High"
4. Check statistics show correct counts

### Scenario 2: Matrix Distribution
1. Add risks to different cells
2. Create one risk in each row
3. Verify matrix displays all correctly
4. Check cells without risks show "No risks"

### Scenario 3: Risk Mitigation Tracking
1. Find a risk with status "Open"
2. Edit it (future feature) to "Mitigating"
3. Add existing controls
4. Track progress over time

---

## 🚀 Next Steps

After testing Risk Profiles, continue with:
1. **KRA & Workplan** - Test quarterly status tracking
2. **All Dashboard Widgets** - Verify all 3 widgets together
3. **Export All Data** - Download CSV from all modules
4. **End-to-End Flow** - Create data in all 3 modules

---

**Happy Testing!** 🎲

All features are working and ready to demonstrate!
