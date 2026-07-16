export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ---------------------------------------------------------------------------
// Shared helper shapes
// A "flexible" row keeps accurate columns where we have them while allowing
// any additional columns that exist in the live database. Insert/Update are
// intentionally permissive so Supabase's client never resolves writes to
// `never` (the previous catch-all index signature caused that).
// ---------------------------------------------------------------------------
type Writable = { [key: string]: any }

export interface Database {
  public: {
    Tables: {
      // ===== Core org structure =====
      audit_divisions: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          head_title: string | null
          head_position: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_sections: {
        Row: {
          id: string
          division_id: string
          code: string
          name: string
          description: string | null
          head_title: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_business_processes: {
        Row: { id: string; section_id: string | null; code: string; name: string; description: string | null; process_type: string | null; is_active: boolean; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_legal_instruments: {
        Row: {
          id: string
          code: string
          title: string
          instrument_type: string
          jurisdiction: string | null
          enacted_date: string | null
          effective_date: string | null
          description: string | null
          full_text_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Risk Register (the spine) =====
      audit_risk_register: {
        Row: {
          id: string
          risk_code: string
          risk_title: string
          risk_description: string
          risk_category: string
          risk_subcategory: string | null
          division_id: string | null
          section_id: string | null
          process_id: string | null
          inherent_likelihood: number
          inherent_impact: number
          inherent_risk_score: number
          inherent_risk_rating: RiskRating | null
          control_effectiveness: string | null
          control_description: string | null
          residual_likelihood: number | null
          residual_impact: number | null
          residual_risk_score: number
          residual_risk_rating: RiskRating | null
          risk_owner_role: string | null
          oversight_body: string | null
          risk_status: RiskStatus
          identified_date: string | null
          last_reviewed_at: string | null
          next_review_due: string | null
          review_frequency: string | null
          risk_treatment: string | null
          treatment_plan: string | null
          target_risk_rating: RiskRating | null
          tags: string[] | null
          notes: string | null
          is_system_risk: boolean
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_legal_references: {
        Row: { id: string; risk_id: string; legal_instrument_id: string | null; section_reference: string | null; compliance_type: string | null; notes: string | null; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_treatments: {
        Row: { id: string; risk_id: string; treatment_type: string | null; description: string; target_date: string | null; actual_completion_date: string | null; status: string | null; effectiveness: string | null; evidence_url: string | null; notes: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_incidents: {
        Row: { id: string; risk_id: string; incident_date: string; description: string; impact_description: string | null; financial_impact: number | null; response_actions: string | null; lessons_learned: string | null; status: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_audit_log: {
        Row: { id: string; risk_id: string | null; action: string; field_changed: string | null; old_value: string | null; new_value: string | null; change_reason: string | null; changed_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_indicators: {
        Row: { id: string; risk_id: string | null; indicator_name: string; indicator_type: string | null; measurement_unit: string | null; is_active: boolean; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_indicator_values: {
        Row: { id: string; indicator_id: string | null; measurement_date: string; value: number; notes: string | null; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Risk Events (the gateway) =====
      audit_categories: {
        Row: { id: string; code: string; name: string; description: string | null; workflow_type: string | null; requires_fieldwork: boolean; requires_management_response: boolean; typical_duration_days: number | null; is_active: boolean; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_events: {
        Row: {
          id: string
          event_code: string
          event_title: string
          event_description: string
          source_type: RiskEventSource
          directive_reference: string | null
          directive_date: string | null
          directive_issuer: string | null
          is_priority_override: boolean
          primary_risk_id: string
          audit_category_id: string | null
          response_type: ResponseType
          priority: Priority
          requested_start_date: string | null
          requested_completion_date: string | null
          target_division_id: string | null
          target_section_id: string | null
          requesting_division_id: string | null
          requesting_officer_id: string | null
          event_status: RiskEventStatus
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          rejection_reason: string | null
          allocated_to: string | null
          allocated_at: string | null
          financial_year: number | null
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_event_risks: {
        Row: { id: string; risk_event_id: string; risk_id: string; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_event_milestones: {
        Row: { id: string; risk_event_id: string; title: string; due_date: string | null; status: string | null; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_event_documents: {
        Row: { id: string; risk_event_id: string; title: string; file_path: string | null; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_event_log: {
        Row: { id: string; risk_event_id: string | null; action: string; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Audit workflow (created directly in DB; columns inferred from code) =====
      audit_engagements: {
        Row: {
          id: string
          engagement_number: string | null
          risk_event_id: string | null
          title: string
          engagement_type: string | null
          scope: string | null
          objectives: string | null
          lead_auditor_id: string | null
          status: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_tasks: {
        Row: { id: string; risk_event_id: string | null; engagement_id: string | null; task_code: string | null; task_title: string; task_description: string | null; assigned_to: string | null; status: string; progress_percentage: number | null; priority: string | null; planned_start_date: string | null; planned_end_date: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_workpapers: {
        // Real columns in the live DB. Rich fields (test_objective, result,
        // conclusion, conclusion_rating, status, prepared_by, wp_number) and the
        // evidence[] list are stored inside `metadata` (jsonb).
        Row: {
          id: string
          engagement_id: string
          title: string
          procedure: string | null
          sample_ref: string | null
          metadata: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_findings: {
        // Real live columns (database.types was previously stale: the title column
        // is `title` not `finding_title`, and the condition column is
        // `condition_found` not `condition`; there is no `finding_number`).
        Row: {
          id: string
          engagement_id: string
          title: string
          condition_found: string | null
          criteria: string | null
          cause: string | null
          effect: string | null
          risk_rating: string
          status: string
          org_unit_id: string | null
          risk_id: string | null
          legal_instrument_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_recommendations: {
        // Real live columns (no `recommendation_number` / `responsible_division_id`).
        Row: {
          id: string
          finding_id: string
          recommendation_text: string
          priority: string
          target_date: string | null
          status: string
          region_code: string | null
          kra_activity_id: string | null
          legal_case_linked: boolean | null
          legal_case_id: string | null
          risk_id: string | null
          published_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_action_plans: {
        // Implementation tracking for a recommendation. Owner references `people`.
        Row: {
          id: string
          recommendation_id: string
          action_owner_id: string | null
          planned_action: string
          progress_percentage: number
          actual_completion_date: string | null
          notes: string | null
          evidence_url: string | null
          status: string
          risk_id: string | null
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Governance: Risk Profiles =====
      audit_risk_profiles: {
        Row: { id: string; org_unit_id: string | null; project_name: string | null; profile_date: string | null; overall_score: number | null; overall_level: string | null; remarks: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_risk_profile_items: {
        Row: { id: string; risk_profile_id: string; context_category: string | null; resource_category: string | null; risk_description: string | null; likelihood_score: number | null; impact_score: number | null; risk_score: number | null; existing_controls: string | null; additional_controls: string | null; status: string | null; target_date: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Governance: PSAP =====
      audit_psap_standards: {
        Row: { id: string; standard_no: number | null; standard_number: string | null; title: string; description: string | null; weighting: number; weight: number; is_active: boolean; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_psap_rating_scales: {
        Row: { id: string; min_score: number; max_score: number; rating: string | null; rating_label: string | null; description: string | null; color_code: string | null; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_psap_assessments: {
        Row: { id: string; org_unit_id: string | null; financial_year: number; quarter: number | null; assessment_date: string; overall_score: number | null; overall_rating: string | null; comments: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_psap_assessment_scores: {
        Row: { id: string; psap_assessment_id: string; standard_id: string; raw_score: number | null; weighted_score: number | null; comments: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Governance: KRA =====
      audit_strategic_kras: {
        Row: { id: string; kra_code: string; kra_title: string; purpose: string | null; start_year: number; end_year: number | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_kra_activities: {
        Row: { id: string; kra_id: string; activity_code: string | null; description: string; measure: string | null; baseline: string | null; annual_target: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_kra_activity_quarterly_status: {
        Row: { id: string; activity_id: string; financial_year: number; quarter: number | null; status: string | null; narrative_status: string | null; challenges: string | null; revision_next_year: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Auditor profiles =====
      audit_auditor_profiles: {
        Row: { id: string; user_id: string | null; employee_id: string | null; position: string; grade_level: string | null; department: string | null; highest_qualification: string | null; qualification_field: string | null; university: string | null; graduation_year: number | null; certifications: Json; specializations: Json; years_of_experience: number; training_records: Json; max_concurrent_engagements: number; current_workload: number; availability_status: string; total_audits_completed: number; total_findings_identified: number; date_joined: string | null; skills_summary: string | null; notes: string | null; profile_status: string; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_certification_types: {
        Row: { id: string; code: string; name: string; issuing_body: string | null; description: string | null; validity_years: number | null; is_active: boolean; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_specialization_areas: {
        Row: { id: string; code: string; name: string; category: string | null; description: string | null; is_active: boolean; created_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Users / RBAC =====
      audit_users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          division_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      user_profiles: {
        Row: { id: string; full_name: string | null; phone: string | null; avatar_url: string | null; system_access: Json; is_active: boolean; is_verified: boolean; last_login_at: string | null; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_user_profiles: {
        Row: { id: string; user_id: string; division_id: string | null; section_id: string | null; employee_id: string | null; position: string | null; grade_level: string | null; department: string | null; availability_status: string; profile_status: string; created_at: string; updated_at: string; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          group_name: string
          description: string | null
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      modules: {
        Row: {
          id: string
          module_name: string
          module_key: string
          description: string | null
          category: string | null
          icon: string | null
          route: string | null
          created_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      group_module_permissions: {
        Row: {
          id: string
          group_id: string
          module_id: string
          can_create: boolean
          can_read: boolean
          can_update: boolean
          can_delete: boolean
          can_print: boolean
          can_approve: boolean
          can_export: boolean
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      user_groups: {
        Row: {
          id: string
          user_id: string
          group_id: string
          assigned_at: string
          assigned_by: string | null
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          module_id: string | null
          action: string
          record_id: string | null
          record_type: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          logged_at: string
          [key: string]: any
        }
        Insert: Writable
        Update: Writable
        Relationships: []
      }

      // ===== Legacy / shared lookup tables referenced by code =====
      people: {
        Row: { id: string; full_name: string | null; email: string | null; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
      org_units: {
        Row: { id: string; name: string | null; code: string | null; [key: string]: any }
        Insert: Writable
        Update: Writable
        Relationships: []
      }
    }
    Views: {
      v_kra_status_summary: {
        Row: { [key: string]: any }
        Relationships: []
      }
    }
    Functions: {
      publish_recommendation: {
        Args: { [key: string]: any }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ---------------------------------------------------------------------------
// Shared domain union types (sourced from SQL CHECK constraints)
// ---------------------------------------------------------------------------
export type RiskRating = 'Low' | 'Medium' | 'High' | 'Extreme'

export type RiskStatus =
  | 'Active'
  | 'Under Review'
  | 'Mitigated'
  | 'Accepted'
  | 'Closed'
  | 'Escalated'

export type RiskCategory =
  | 'Strategic'
  | 'Operational'
  | 'Financial'
  | 'Compliance'
  | 'Reputational'
  | 'Technology'
  | 'Governance'
  | 'External'

export type RiskTreatment = 'Mitigate' | 'Transfer' | 'Accept' | 'Avoid'

export type OversightBody =
  | 'Audit Committee'
  | 'Secretary'
  | 'Executive Management'
  | 'Board'
  | 'Division Head'
  | 'Internal Audit'

export type ReviewFrequency = 'Monthly' | 'Quarterly' | 'Bi-annually' | 'Annually'

export type ComplianceType = 'Mandatory' | 'Advisory' | 'Best Practice'

export type ControlEffectiveness =
  | 'Effective'
  | 'Partially Effective'
  | 'Ineffective'
  | 'Not Tested'
  | 'No Controls'

// Risk Event domain unions (mirror the SQL CHECK constraints in migration 005)
export type RiskEventSource = 'AAAP' | 'Secretary' | 'External' | 'Internal'

export type ResponseType = 'Audit' | 'Review' | 'Investigation' | 'Information Request'

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

export type RiskEventStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Allocated'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected'
