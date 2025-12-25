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
      // Audit System Tables (with audit_ prefix)
      audit_engagements: {
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
      audit_findings: {
        Row: {
          id: string
          engagement_id: string
          title: string
          condition_found: string
          criteria: string | null
          cause: string | null
          effect: string | null
          risk_rating: 'Critical' | 'High' | 'Medium' | 'Low' | null
          status: 'Draft' | 'Under Review' | 'Verified' | 'Closed'
          org_unit_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          title: string
          condition_found: string
          criteria?: string | null
          cause?: string | null
          effect?: string | null
          risk_rating?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          status?: 'Draft' | 'Under Review' | 'Verified' | 'Closed'
          org_unit_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          title?: string
          condition_found?: string
          criteria?: string | null
          cause?: string | null
          effect?: string | null
          risk_rating?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          status?: 'Draft' | 'Under Review' | 'Verified' | 'Closed'
          org_unit_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_recommendations: {
        Row: {
          id: string
          finding_id: string
          recommendation_text: string
          priority: 'Critical' | 'High' | 'Medium' | 'Low' | null
          target_date: string | null
          status: 'Draft' | 'Published' | 'Accepted' | 'In Progress' | 'Completed' | 'Overdue'
          region_code: string | null
          kra_activity_id: string | null
          legal_case_linked: boolean
          legal_case_id: string | null
          created_by: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          finding_id: string
          recommendation_text: string
          priority?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          target_date?: string | null
          status?: 'Draft' | 'Published' | 'Accepted' | 'In Progress' | 'Completed' | 'Overdue'
          region_code?: string | null
          kra_activity_id?: string | null
          legal_case_linked?: boolean
          legal_case_id?: string | null
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          finding_id?: string
          recommendation_text?: string
          priority?: 'Critical' | 'High' | 'Medium' | 'Low' | null
          target_date?: string | null
          status?: 'Draft' | 'Published' | 'Accepted' | 'In Progress' | 'Completed' | 'Overdue'
          region_code?: string | null
          kra_activity_id?: string | null
          legal_case_linked?: boolean
          legal_case_id?: string | null
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_risk_profiles: {
        Row: {
          id: string
          org_unit_id: string | null
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
          org_unit_id?: string | null
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
          org_unit_id?: string | null
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
      audit_risk_profile_items: {
        Row: {
          id: string
          risk_profile_id: string
          context_category: string
          resource_category: string
          risk_description: string
          likelihood_score: number | null
          impact_score: number | null
          risk_score: number | null
          existing_controls: string | null
          additional_controls: string | null
          risk_owner_id: string | null
          target_date: string | null
          status: 'Open' | 'Mitigated' | 'Closed'
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
          existing_controls?: string | null
          additional_controls?: string | null
          risk_owner_id?: string | null
          target_date?: string | null
          status?: 'Open' | 'Mitigated' | 'Closed'
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
          existing_controls?: string | null
          additional_controls?: string | null
          risk_owner_id?: string | null
          target_date?: string | null
          status?: 'Open' | 'Mitigated' | 'Closed'
          created_at?: string
          updated_at?: string
        }
      }
      audit_psap_standards: {
        Row: {
          id: string
          standard_number: number
          title: string
          weight: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          standard_number: number
          title: string
          weight?: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          standard_number?: number
          title?: string
          weight?: number
          description?: string | null
          created_at?: string
        }
      }
      audit_psap_rating_scales: {
        Row: {
          id: string
          min_score: number
          max_score: number
          rating: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          min_score: number
          max_score: number
          rating: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          min_score?: number
          max_score?: number
          rating?: string
          description?: string | null
          created_at?: string
        }
      }
      audit_psap_assessments: {
        Row: {
          id: string
          org_unit_id: string | null
          financial_year: number
          quarter: number
          assessment_date: string
          completed_by: string
          reviewed_by: string | null
          overall_score: number | null
          overall_rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_unit_id?: string | null
          financial_year: number
          quarter: number
          assessment_date: string
          completed_by: string
          reviewed_by?: string | null
          overall_score?: number | null
          overall_rating?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_unit_id?: string | null
          financial_year?: number
          quarter?: number
          assessment_date?: string
          completed_by?: string
          reviewed_by?: string | null
          overall_score?: number | null
          overall_rating?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_psap_assessment_scores: {
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
      audit_strategic_kras: {
        Row: {
          id: string
          org_unit_id: string | null
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
          org_unit_id?: string | null
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
          org_unit_id?: string | null
          kra_code?: string
          kra_title?: string
          purpose?: string | null
          start_year?: number
          end_year?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_kra_activities: {
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
      audit_kra_activity_quarterly_status: {
        Row: {
          id: string
          kra_activity_id: string
          financial_year: number
          quarter: number
          status: 'Completed' | 'Ongoing' | 'Not Started' | 'Delayed' | 'Not Measurable'
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
          status: 'Completed' | 'Ongoing' | 'Not Started' | 'Delayed' | 'Not Measurable'
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
          status?: 'Completed' | 'Ongoing' | 'Not Started' | 'Delayed' | 'Not Measurable'
          narrative_status?: string | null
          challenges?: string | null
          revision_next_year?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Shared tables from case management (not prefixed)
      people: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          role: string
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
          role: string
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
          role?: string
          org_unit_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      org_units: {
        Row: {
          id: string
          name: string
          code: string
          parent_id: string | null
          unit_type: string | null
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
          unit_type?: string | null
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
          unit_type?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          case_number: string
          title: string
          description: string | null
          status: string
          priority: string | null
          assigned_to: string | null
          org_unit_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_number: string
          title: string
          description?: string | null
          status: string
          priority?: string | null
          assigned_to?: string | null
          org_unit_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_number?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string | null
          assigned_to?: string | null
          org_unit_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
