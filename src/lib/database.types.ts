export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      org_units: {
        Row: {
          id: string
          name: string
          code: string
          parent_id: string | null
          description: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          parent_id?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          parent_id?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      people: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          role: 'Audit Admin' | 'Audit Manager' | 'Auditor' | 'Action Owner' | 'Read-Only' | 'System Integrator'
          org_unit_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          role: 'Audit Admin' | 'Audit Manager' | 'Auditor' | 'Action Owner' | 'Read-Only' | 'System Integrator'
          org_unit_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          role?: 'Audit Admin' | 'Audit Manager' | 'Auditor' | 'Action Owner' | 'Read-Only' | 'System Integrator'
          org_unit_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      engagements: {
        Row: {
          id: string
          title: string
          scope: string | null
          objectives: string | null
          lead_id: string | null
          start_date: string
          end_date: string | null
          status: 'Planning' | 'Fieldwork' | 'Reporting' | 'Follow-up' | 'Closed'
          org_unit_id: string | null
          risk_universe_ref: string | null
          risk_profile_id: string | null
          psap_assessment_id: string | null
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          scope?: string | null
          objectives?: string | null
          lead_id?: string | null
          start_date: string
          end_date?: string | null
          status?: 'Planning' | 'Fieldwork' | 'Reporting' | 'Follow-up' | 'Closed'
          org_unit_id?: string | null
          risk_universe_ref?: string | null
          risk_profile_id?: string | null
          psap_assessment_id?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          scope?: string | null
          objectives?: string | null
          lead_id?: string | null
          start_date?: string
          end_date?: string | null
          status?: 'Planning' | 'Fieldwork' | 'Reporting' | 'Follow-up' | 'Closed'
          org_unit_id?: string | null
          risk_universe_ref?: string | null
          risk_profile_id?: string | null
          psap_assessment_id?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      findings: {
        Row: {
          id: string
          engagement_id: string
          title: string
          statement: string
          cause: string | null
          effect: string | null
          criteria: string | null
          risk_rating: 'Critical' | 'High' | 'Medium' | 'Low' | null
          severity: 'Critical' | 'High' | 'Medium' | 'Low' | null
          likelihood: 'Almost Certain' | 'Likely' | 'Possible' | 'Unlikely' | 'Rare' | null
          impact_area: string | null
          status: 'Draft' | 'Review' | 'Approved' | 'Closed'
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          title: string
          statement: string
          cause?: string | null
          effect?: string | null
          criteria?: string | null
          risk_rating?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          severity?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          likelihood?: 'Almost Certain' | 'Likely' | 'Possible' | 'Unlikely' | 'Rare' | null
          impact_area?: string | null
          status?: 'Draft' | 'Review' | 'Approved' | 'Closed'
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          title?: string
          statement?: string
          cause?: string | null
          effect?: string | null
          criteria?: string | null
          risk_rating?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          severity?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          likelihood?: 'Almost Certain' | 'Likely' | 'Possible' | 'Unlikely' | 'Rare' | null
          impact_area?: string | null
          status?: 'Draft' | 'Review' | 'Approved' | 'Closed'
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          finding_id: string
          recommendation_text: string
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          owner_unit_id: string | null
          owner_person_id: string | null
          target_date: string | null
          status: 'Draft' | 'Manager Review' | 'Approved' | 'Published' | 'Implementing' | 'Verified' | 'Closed'
          approved_by: string | null
          approved_at: string | null
          published_at: string | null
          legal_case_linked: boolean
          legal_case_id: string | null
          region_code: string | null
          parcel_ref: string | null
          kra_activity_id: string | null
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          finding_id: string
          recommendation_text: string
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          owner_unit_id?: string | null
          owner_person_id?: string | null
          target_date?: string | null
          status?: 'Draft' | 'Manager Review' | 'Approved' | 'Published' | 'Implementing' | 'Verified' | 'Closed'
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          legal_case_linked?: boolean
          legal_case_id?: string | null
          region_code?: string | null
          parcel_ref?: string | null
          kra_activity_id?: string | null
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          finding_id?: string
          recommendation_text?: string
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          owner_unit_id?: string | null
          owner_person_id?: string | null
          target_date?: string | null
          status?: 'Draft' | 'Manager Review' | 'Approved' | 'Published' | 'Implementing' | 'Verified' | 'Closed'
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          legal_case_linked?: boolean
          legal_case_id?: string | null
          region_code?: string | null
          parcel_ref?: string | null
          kra_activity_id?: string | null
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      action_plans: {
        Row: {
          id: string
          recommendation_id: string
          action_text: string
          owner_person_id: string | null
          start_date: string | null
          target_date: string
          progress_pct: number
          status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Verified'
          notes: string | null
          last_update_at: string
          created_at: string
        }
        Insert: {
          id?: string
          recommendation_id: string
          action_text: string
          owner_person_id?: string | null
          start_date?: string | null
          target_date: string
          progress_pct?: number
          status?: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Verified'
          notes?: string | null
          last_update_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          recommendation_id?: string
          action_text?: string
          owner_person_id?: string | null
          start_date?: string | null
          target_date?: string
          progress_pct?: number
          status?: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Verified'
          notes?: string | null
          last_update_at?: string
          created_at?: string
        }
      }
      obligations: {
        Row: {
          id: string
          title: string
          ref_code: string
          source: string
          description: string | null
          level: string | null
          effective_date: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          ref_code: string
          source: string
          description?: string | null
          level?: string | null
          effective_date?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          ref_code?: string
          source?: string
          description?: string | null
          level?: string | null
          effective_date?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: string
          title: string
          message: string | null
          link: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          type: string
          title: string
          message?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          type?: string
          title?: string
          message?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      risk_profiles: {
        Row: {
          id: string
          org_unit_id: string
          project_name: string | null
          profile_date: string
          prepared_by: string
          reviewed_by: string | null
          overall_level: 'Low' | 'Moderate' | 'High' | 'Extreme' | null
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_unit_id: string
          project_name?: string | null
          profile_date: string
          prepared_by: string
          reviewed_by?: string | null
          overall_level?: 'Low' | 'Moderate' | 'High' | 'Extreme' | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_unit_id?: string
          project_name?: string | null
          profile_date?: string
          prepared_by?: string
          reviewed_by?: string | null
          overall_level?: 'Low' | 'Moderate' | 'High' | 'Extreme' | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      risk_profile_items: {
        Row: {
          id: string
          risk_profile_id: string
          context_category: string
          resource_category: string
          risk_description: string
          likelihood_score: number | null
          impact_score: number | null
          risk_score: number | null
          risk_level: 'Low' | 'Moderate' | 'High' | 'Extreme' | null
          existing_controls: string | null
          additional_controls: string | null
          risk_owner_id: string | null
          target_date: string | null
          status: 'Open' | 'Mitigating' | 'Closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_profile_id: string
          context_category: string
          resource_category: string
          risk_description: string
          likelihood_score?: number | null
          impact_score?: number | null
          risk_score?: number | null
          risk_level?: 'Low' | 'Moderate' | 'High' | 'Extreme' | null
          existing_controls?: string | null
          additional_controls?: string | null
          risk_owner_id?: string | null
          target_date?: string | null
          status?: 'Open' | 'Mitigating' | 'Closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_profile_id?: string
          context_category?: string
          resource_category?: string
          risk_description?: string
          likelihood_score?: number | null
          impact_score?: number | null
          risk_score?: number | null
          risk_level?: 'Low' | 'Moderate' | 'High' | 'Extreme' | null
          existing_controls?: string | null
          additional_controls?: string | null
          risk_owner_id?: string | null
          target_date?: string | null
          status?: 'Open' | 'Mitigating' | 'Closed'
          created_at?: string
          updated_at?: string
        }
      }
      psap_standards: {
        Row: {
          id: string
          standard_no: number
          title: string
          description: string
          weighting: number
          category: 'Financial' | 'Governance' | 'Both' | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          standard_no: number
          title: string
          description: string
          weighting: number
          category?: 'Financial' | 'Governance' | 'Both' | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          standard_no?: number
          title?: string
          description?: string
          weighting?: number
          category?: 'Financial' | 'Governance' | 'Both' | null
          is_active?: boolean
          created_at?: string
        }
      }
      psap_rating_scales: {
        Row: {
          id: string
          min_score: number
          max_score: number
          rating_label: string
          description: string | null
          color_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          min_score: number
          max_score: number
          rating_label: string
          description?: string | null
          color_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          min_score?: number
          max_score?: number
          rating_label?: string
          description?: string | null
          color_code?: string | null
          created_at?: string
        }
      }
      psap_assessments: {
        Row: {
          id: string
          org_unit_id: string
          financial_year: number
          quarter: number
          assessment_date: string
          completed_by: string
          reviewed_by: string | null
          overall_score: number | null
          overall_rating: string | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_unit_id: string
          financial_year: number
          quarter: number
          assessment_date: string
          completed_by: string
          reviewed_by?: string | null
          overall_score?: number | null
          overall_rating?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_unit_id?: string
          financial_year?: number
          quarter?: number
          assessment_date?: string
          completed_by?: string
          reviewed_by?: string | null
          overall_score?: number | null
          overall_rating?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      psap_assessment_scores: {
        Row: {
          id: string
          psap_assessment_id: string
          psap_standard_id: string
          raw_score: number
          weighted_score: number | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          psap_assessment_id: string
          psap_standard_id: string
          raw_score: number
          weighted_score?: number | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          psap_assessment_id?: string
          psap_standard_id?: string
          raw_score?: number
          weighted_score?: number | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      strategic_kras: {
        Row: {
          id: string
          org_unit_id: string
          kra_code: string
          kra_title: string
          purpose: string | null
          start_year: number
          end_year: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_unit_id: string
          kra_code: string
          kra_title: string
          purpose?: string | null
          start_year: number
          end_year?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_unit_id?: string
          kra_code?: string
          kra_title?: string
          purpose?: string | null
          start_year?: number
          end_year?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      kra_activities: {
        Row: {
          id: string
          strategic_kra_id: string
          activity_code: string | null
          description: string
          measure: string | null
          baseline: string | null
          annual_target: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          strategic_kra_id: string
          activity_code?: string | null
          description: string
          measure?: string | null
          baseline?: string | null
          annual_target?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          strategic_kra_id?: string
          activity_code?: string | null
          description?: string
          measure?: string | null
          baseline?: string | null
          annual_target?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      kra_activity_quarterly_status: {
        Row: {
          id: string
          kra_activity_id: string
          financial_year: number
          quarter: number
          status: 'Completed' | 'Ongoing' | 'Not Started' | 'Not Measurable' | 'Delayed'
          narrative_status: string | null
          challenges: string | null
          revision_next_year: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kra_activity_id: string
          financial_year: number
          quarter: number
          status: 'Completed' | 'Ongoing' | 'Not Started' | 'Not Measurable' | 'Delayed'
          narrative_status?: string | null
          challenges?: string | null
          revision_next_year?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kra_activity_id?: string
          financial_year?: number
          quarter?: number
          status?: 'Completed' | 'Ongoing' | 'Not Started' | 'Not Measurable' | 'Delayed'
          narrative_status?: string | null
          challenges?: string | null
          revision_next_year?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      published_recommendations_view: {
        Row: {
          recommendation_id: string
          finding_id: string
          engagement_id: string
          finding_title: string
          recommendation_text: string
          risk_rating: 'Critical' | 'High' | 'Medium' | 'Low' | null
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          owner_unit: string | null
          owner_unit_code: string | null
          owner_person: string | null
          target_date: string | null
          published_at: string | null
          legal_case_linked: boolean
          legal_case_id: string | null
          region_code: string | null
          parcel_ref: string | null
          tags: string[]
          engagement_title: string
          org_unit_id: string | null
          engagement_org_unit: string | null
          status: string
        }
      }
      v_current_risk_summary: {
        Row: {
          org_unit_code: string
          org_unit_name: string
          profile_date: string
          overall_level: 'Low' | 'Moderate' | 'High' | 'Extreme' | null
          total_risks: number
          extreme_risks: number
          high_risks: number
          moderate_risks: number
          low_risks: number
          open_risks: number
        }
      }
      v_latest_psap_ratings: {
        Row: {
          org_unit_code: string
          org_unit_name: string
          financial_year: number
          quarter: number
          assessment_date: string
          overall_score: number | null
          overall_rating: string | null
          completed_by: string
        }
      }
      v_kra_status_summary: {
        Row: {
          org_unit_code: string
          org_unit_name: string
          kra_code: string
          kra_title: string
          financial_year: number | null
          quarter: number | null
          total_activities: number
          completed: number
          ongoing: number
          delayed: number
          not_started: number
        }
      }
    }
    Functions: {
      publish_recommendation: {
        Args: { rec_id: string }
        Returns: boolean
      }
      link_to_legal: {
        Args: { rec_id: string; case_id: string }
        Returns: boolean
      }
      update_action_progress: {
        Args: { plan_id: string; progress: number; note?: string }
        Returns: boolean
      }
      update_psap_assessment_totals: {
        Args: { assessment_id: string }
        Returns: void
      }
    }
  }
}
