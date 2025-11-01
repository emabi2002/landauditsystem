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
    }
  }
}
