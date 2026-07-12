// Export utilities for Risk & Governance modules

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Handle values that contain commas or quotes
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportPSAPAssessmentToCSV(assessment: any, scores: any[]) {
  const data = scores.map(score => ({
    'Standard No': score.psap_standards?.standard_no,
    'Standard Title': score.psap_standards?.title,
    'Category': score.psap_standards?.category,
    'Weighting': score.psap_standards?.weighting,
    'Raw Score': score.raw_score,
    'Weighted Score': score.weighted_score,
    'Comments': score.comments || '',
  }))

  // Add summary row
  data.push({
    'Standard No': '',
    'Standard Title': 'OVERALL',
    'Category': '',
    'Weighting': '',
    'Raw Score': '',
    'Weighted Score': assessment.overall_score,
    'Comments': assessment.overall_rating,
  })

  exportToCSV(data, `PSAP_Assessment_${assessment.org_unit_id}_${assessment.financial_year}_Q${assessment.quarter}`)
}

export function exportRiskProfileToCSV(profile: any, riskItems: any[]) {
  const data = riskItems.map(item => ({
    'Context Category': item.context_category,
    'Resource Category': item.resource_category,
    'Risk Description': item.risk_description,
    'Likelihood (1-5)': item.likelihood_score,
    'Impact (1-5)': item.impact_score,
    'Risk Score': item.risk_score,
    'Risk Level': item.risk_level,
    'Existing Controls': item.existing_controls || '',
    'Additional Controls': item.additional_controls || '',
    'Risk Owner': item.risk_owner?.name || '',
    'Target Date': item.target_date || '',
    'Status': item.status,
  }))

  exportToCSV(data, `Risk_Profile_${profile.org_units?.code || 'Unknown'}_${profile.profile_date}`)
}

export function exportKRAStatusToCSV(kra: any, activities: any[], year: number, quarter: number) {
  const data = activities.map(activity => ({
    'Activity Code': activity.activity_code,
    'Description': activity.description,
    'Measure': activity.measure || '',
    'Annual Target': activity.annual_target || '',
    'Status': activity.status || 'Not Started',
    'Narrative Status': activity.narrative_status || '',
    'Challenges': activity.challenges || '',
    'Revision for Next Year': activity.revision_next_year || '',
  }))

  exportToCSV(data, `KRA_Status_${kra.kra_code}_${year}_Q${quarter}`)
}

// PDF export placeholder (requires additional library like jsPDF)
export function exportToPDF(data: any[], filename: string) {
  // TODO: Implement PDF export using jsPDF or similar library
  alert('PDF export coming soon! Use CSV export for now.')
}
