# 🧪 Complete Testing Guide

## Test Data Created

### Sample Users (5 people):
- ✅ Sarah Johnson (Audit Admin)
- ✅ Michael Chen (Audit Manager)
- ✅ Emily Rodriguez (Auditor)
- ✅ David Thompson (Auditor)
- ✅ Lisa Anderson (Action Owner)

### PSAP Assessments (6 assessments):
- ✅ 2024 Q1, Q2, Q3, Q4
- ✅ 2025 Q1, Q2
- ✅ Each with scores for all 20 PSAP standards
- ✅ Shows trend of improvement over time

---

## 🎯 Testing Checklist

### 1. Test PSAP Scorecard Features

#### View Assessments Table
1. Go to http://localhost:3000/psap-scorecard
2. You should see 6 assessments in the table
3. Check the columns:
   - Org Unit: "Governance & Compliance Unit"
   - Year: 2024 or 2025
   - Quarter: Q1, Q2, Q3, Q4
   - Overall Score: (calculated)
   - Rating: (auto-determined)
   - Completed By: Names of sample users

#### View PSAP Trend Chart
1. Stay on `/psap-scorecard`
2. Click the **"Trends"** tab at the top
3. You should see:
   - Line chart showing scores over time
   - X-axis: "2024 Q1", "2024 Q2", etc.
   - Y-axis: Score from 0-20
   - Line showing upward trend
   - Reference legend at bottom (color-coded compliance levels)

#### Export PSAP Data
1. Go back to "Assessments" tab
2. Click the **"Export CSV"** button (top right)
3. A CSV file should download
4. Open it in Excel/Google Sheets
5. Verify it contains all assessment data

#### Create New PSAP Assessment
1. Click **"New Assessment"** button
2. Fill in the form:
   - Org Unit: Select "Governance & Compliance Unit"
   - Year: 2025
   - Quarter: Q3
   - Assessment Date: Pick today's date
   - Completed By: Select any person
3. Scroll through the 20 standards
4. Enter scores (try different values 0-10)
5. Watch the **Overall Score** update in real-time
6. Watch the **Rating badge** change colors
7. Try scoring high (8-9) for all → Should get "Full Compliance"
8. Try scoring low (5-6) for all → Should get "Partial Compliance"
9. Click "Create Assessment"
10. See success toast appear
11. See new assessment in table

---

### 2. Test Dashboard Widgets

#### View PSAP Widget
1. Go to http://localhost:3000/dashboard
2. Scroll down to **"Risk & Governance"** section
3. Find the **"PSAP Scorecard"** widget
4. Should show:
   - Average score
   - Latest 4 assessments with ratings
   - Color-coded badges
   - "View all assessments →" link
5. Click the link → Should navigate to PSAP page

---

### 3. Test Standards Reference

1. Go to `/psap-scorecard`
2. Click **"Standards Reference"** tab
3. You should see a table with 20 rows
4. Each standard shows:
   - Standard # (1-20)
   - Title and description
   - Category (Financial/Governance/Both)
   - Weighting (0.7 - 1.0)
5. Verify all 20 standards are visible

---

### 4. Test Rating Scales

1. Go to `/psap-scorecard`
2. Click **"Rating Scales"** tab
3. You should see 5 cards:
   - Full Compliance (green) - 18.0-20.0
   - Substantial Compliance (lime) - 15.0-17.9
   - Partial Compliance (yellow) - 12.0-14.9
   - Low Compliance (orange) - 9.0-11.9
   - Non-Compliance (red) - 0.0-8.9

---

### 5. Test PSAP Filters

1. Go to `/psap-scorecard` → Assessments tab
2. Use the **Year** dropdown:
   - Select 2024 → Should show only 2024 assessments
   - Select 2025 → Should show only 2025 assessments
3. Use the **Quarter** dropdown:
   - Select Q1 → Should filter to Q1 only
   - Select "All Quarters" → Should show all
4. Combine filters:
   - Year: 2024, Quarter: Q2 → Should show only 2024 Q2

---

## 🎨 What to Look For

### PSAP Assessment Table
- ✅ Clean table layout
- ✅ Color-coded rating badges
- ✅ Sortable columns
- ✅ Clear data formatting

### Trend Chart
- ✅ Smooth line connecting points
- ✅ Readable axis labels
- ✅ Proper date formatting on X-axis
- ✅ Tooltip on hover
- ✅ Legend showing what the line represents

### Assessment Form
- ✅ All 20 standards visible in scrollable area
- ✅ Real-time calculation as you type
- ✅ Overall score updates instantly
- ✅ Rating badge changes color
- ✅ Form validation (required fields)
- ✅ Success toast after submission

### Dashboard Widget
- ✅ Shows average score prominently
- ✅ Lists recent assessments
- ✅ Compact, readable layout
- ✅ Click-through navigation works

---

## 🐛 Troubleshooting

### If you don't see any data:
```bash
# Re-run the seed script
cd landauditsystem
bun run scripts/seed-psap-data.ts
```

### If calculations seem wrong:
- The overall score should be between 0-20
- Ratings should match score ranges
- Check browser console for errors

### If chart doesn't appear:
- Make sure you're on the "Trends" tab
- Check if assessments exist in database
- Refresh the page

### If export doesn't download:
- Check browser's download settings
- Try a different browser
- Check browser console for errors

---

## 📊 Expected Results

### Overall Score Calculation
```
Example with 3 standards:
Standard 1: Score 8.0, Weight 1.0 → 8.0
Standard 2: Score 7.5, Weight 0.8 → 6.0
Standard 3: Score 9.0, Weight 1.0 → 9.0
Total: 23.0 / 20 possible (summing all weights)
```

### Rating Determination
Based on the overall score:
- 18.0 - 20.0 = Full Compliance (green)
- 15.0 - 17.9 = Substantial Compliance (lime)
- 12.0 - 14.9 = Partial Compliance (yellow)
- 9.0 - 11.9 = Low Compliance (orange)
- 0.0 - 8.9 = Non-Compliance (red)

### Trend Pattern
With seeded data, you should see:
- 2024 Q1: Lower score
- 2024 Q2: Slight improvement
- 2024 Q3: Continued improvement
- 2024 Q4: Further improvement
- 2025 Q1: Maintaining high score
- 2025 Q2: Highest score

---

## 🎯 Interactive Testing Scenarios

### Scenario 1: Low Performance
1. Create new assessment
2. Score all standards 4-5
3. Expected: "Low Compliance" or "Non-Compliance" rating
4. Overall score: ~8-10

### Scenario 2: Good Performance
1. Create new assessment
2. Score all standards 8-9
3. Expected: "Substantial Compliance" or "Full Compliance"
4. Overall score: ~16-18

### Scenario 3: Mixed Performance
1. Create new assessment
2. Score financial standards high (8-9)
3. Score governance standards low (5-6)
4. Expected: "Partial Compliance"
5. Overall score: ~13-15

---

## 📸 Screenshot Points

Take screenshots of:
1. ✅ Assessment table with 6 records
2. ✅ Trend chart showing upward line
3. ✅ Assessment form with real-time calculation
4. ✅ Dashboard PSAP widget
5. ✅ Exported CSV file in Excel
6. ✅ Rating scales reference page

---

## ✅ Success Criteria

You've successfully tested PSAP features if you can:
- [x] See 6 assessments in the table
- [x] View trend chart with multiple quarters
- [x] Create a new assessment and see calculations
- [x] Export data to CSV
- [x] See PSAP widget on dashboard
- [x] Filter assessments by year/quarter
- [x] View all 20 standards
- [x] Understand the rating scales

---

## 🔄 Next Steps After PSAP Testing

Once PSAP testing is complete, you can test:
1. **Risk Profiles** - Create risk assessments
2. **KRA & Workplan** - Update quarterly status
3. **Dashboard** - View all 3 widgets
4. **Exports** - Download CSV from all modules

---

**Happy Testing!** 🚀

If you encounter any issues, check the browser console (F12) for error messages.
