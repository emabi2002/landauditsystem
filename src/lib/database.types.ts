// Custom type aliases used throughout the codebase
export type RiskCategory =
  | 'Strategic'
  | 'Operational'
  | 'Financial'
  | 'Compliance'
  | 'Reputational'
  | 'Technology'
  | 'Governance'
  | 'External'

export type RiskRating = 'Extreme' | 'High' | 'Medium' | 'Low'
export type RiskStatus = 'Active' | 'Under Review' | 'Mitigated' | 'Accepted' | 'Closed' | 'Escalated'
export type ControlEffectiveness = 'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Tested' | 'No Controls'
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
export type InstrumentType =
  | 'Act'
  | 'Regulation'
  | 'Policy'
  | 'Directive'
  | 'Circular'
  | 'Standard'
  | 'Guideline'
  | 'Contract'

// Generated types from Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accuracy_classes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          tolerance_mm: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tolerance_mm?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tolerance_mm?: number | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_project: {
        Row: {
          activity_id: number
          code: string
          created_at: string | null
          description: string | null
          is_active: boolean | null
          name: string
          program_id: number | null
          updated_at: string | null
        }
        Insert: {
          activity_id?: number
          code: string
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          name: string
          program_id?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: number
          code?: string
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          name?: string
          program_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_project_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program"
            referencedColumns: ["program_id"]
          },
        ]
      }
      application_documents: {
        Row: {
          application_id: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          application_id?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          application_id?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "development_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      application_reviews: {
        Row: {
          application_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          recommendations: string | null
          review_stage: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
        }
        Insert: {
          application_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          recommendations?: string | null
          review_stage: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status: string
        }
        Update: {
          application_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          recommendations?: string | null
          review_stage?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "development_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_action_plans: {
        Row: {
          action_owner_id: string | null
          actual_completion_date: string | null
          created_at: string
          evidence_url: string | null
          id: string
          notes: string | null
          planned_action: string
          progress_percentage: number
          recommendation_id: string
          risk_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action_owner_id?: string | null
          actual_completion_date?: string | null
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          planned_action: string
          progress_percentage?: number
          recommendation_id: string
          risk_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action_owner_id?: string | null
          actual_completion_date?: string | null
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          planned_action?: string
          progress_percentage?: number
          recommendation_id?: string
          risk_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_action_plans_action_owner_id_fkey"
            columns: ["action_owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_action_plans_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "audit_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_action_plans_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_action_plans_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_business_processes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string | null
          process_type: string | null
          section_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id?: string | null
          process_type?: string | null
          section_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string | null
          process_type?: string | null
          section_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_business_processes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_business_processes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "audit_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_fieldwork: boolean | null
          requires_management_response: boolean | null
          typical_duration_days: number | null
          workflow_type: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_fieldwork?: boolean | null
          requires_management_response?: boolean | null
          typical_duration_days?: number | null
          workflow_type?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_fieldwork?: boolean | null
          requires_management_response?: boolean | null
          typical_duration_days?: number | null
          workflow_type?: string | null
        }
        Relationships: []
      }
      audit_controls: {
        Row: {
          control_type: string | null
          created_at: string
          description: string | null
          effectiveness: string | null
          frequency: string | null
          id: string
          obligation_id: string | null
          owner_unit_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          control_type?: string | null
          created_at?: string
          description?: string | null
          effectiveness?: string | null
          frequency?: string | null
          id?: string
          obligation_id?: string | null
          owner_unit_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          control_type?: string | null
          created_at?: string
          description?: string | null
          effectiveness?: string | null
          frequency?: string | null
          id?: string
          obligation_id?: string | null
          owner_unit_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_controls_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "audit_obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_divisions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          head_title: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          head_title?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          head_title?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_engagement_team: {
        Row: {
          created_at: string
          engagement_id: string
          id: string
          person_id: string
          role: string
        }
        Insert: {
          created_at?: string
          engagement_id: string
          id?: string
          person_id: string
          role: string
        }
        Update: {
          created_at?: string
          engagement_id?: string
          id?: string
          person_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_engagement_team_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "audit_engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagement_team_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_engagements: {
        Row: {
          audit_category_id: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          draft_issued_at: string | null
          end_date: string | null
          fieldwork_completed_at: string | null
          fieldwork_started_at: string | null
          final_issued_at: string | null
          id: string
          lead_id: string | null
          lifecycle_stage: string | null
          metadata: Json
          objectives: string | null
          org_unit_id: string | null
          planning_completed_at: string | null
          psap_assessment_id: string | null
          response_received_at: string | null
          review_completed_at: string | null
          risk_event_id: string | null
          risk_id: string | null
          risk_profile_id: string | null
          risk_universe_ref: string | null
          scope: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audit_category_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          draft_issued_at?: string | null
          end_date?: string | null
          fieldwork_completed_at?: string | null
          fieldwork_started_at?: string | null
          final_issued_at?: string | null
          id?: string
          lead_id?: string | null
          lifecycle_stage?: string | null
          metadata?: Json
          objectives?: string | null
          org_unit_id?: string | null
          planning_completed_at?: string | null
          psap_assessment_id?: string | null
          response_received_at?: string | null
          review_completed_at?: string | null
          risk_event_id?: string | null
          risk_id?: string | null
          risk_profile_id?: string | null
          risk_universe_ref?: string | null
          scope?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audit_category_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          draft_issued_at?: string | null
          end_date?: string | null
          fieldwork_completed_at?: string | null
          fieldwork_started_at?: string | null
          final_issued_at?: string | null
          id?: string
          lead_id?: string | null
          lifecycle_stage?: string | null
          metadata?: Json
          objectives?: string | null
          org_unit_id?: string | null
          planning_completed_at?: string | null
          psap_assessment_id?: string | null
          response_received_at?: string | null
          review_completed_at?: string | null
          risk_event_id?: string | null
          risk_id?: string | null
          risk_profile_id?: string | null
          risk_universe_ref?: string | null
          scope?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_engagements_audit_category_id_fkey"
            columns: ["audit_category_id"]
            isOneToOne: false
            referencedRelation: "audit_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagements_psap_assessment_id_fkey"
            columns: ["psap_assessment_id"]
            isOneToOne: false
            referencedRelation: "audit_psap_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagements_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagements_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagements_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_engagements_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_engagements_risk_profile_id_fkey"
            columns: ["risk_profile_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_id: string | null
          changes: Json | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          timestamp: string
        }
        Insert: {
          actor_id?: string | null
          changes?: Json | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          timestamp?: string
        }
        Update: {
          actor_id?: string | null
          changes?: Json | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_evidence: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_by: string | null
          workpaper_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
          workpaper_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
          workpaper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_evidence_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_evidence_workpaper_id_fkey"
            columns: ["workpaper_id"]
            isOneToOne: false
            referencedRelation: "audit_workpapers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_findings: {
        Row: {
          cause: string | null
          condition_found: string
          created_at: string
          created_by: string | null
          criteria: string | null
          effect: string | null
          engagement_id: string
          id: string
          legal_instrument_id: string | null
          org_unit_id: string | null
          risk_id: string | null
          risk_rating: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          cause?: string | null
          condition_found: string
          created_at?: string
          created_by?: string | null
          criteria?: string | null
          effect?: string | null
          engagement_id: string
          id?: string
          legal_instrument_id?: string | null
          org_unit_id?: string | null
          risk_id?: string | null
          risk_rating?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          cause?: string | null
          condition_found?: string
          created_at?: string
          created_by?: string | null
          criteria?: string | null
          effect?: string | null
          engagement_id?: string
          id?: string
          legal_instrument_id?: string | null
          org_unit_id?: string | null
          risk_id?: string | null
          risk_rating?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "audit_engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_legal_instrument_id_fkey"
            columns: ["legal_instrument_id"]
            isOneToOne: false
            referencedRelation: "audit_legal_instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_findings_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_information_request_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          received_date: string | null
          request_id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          received_date?: string | null
          request_id: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          received_date?: string | null
          request_id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_information_request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "audit_information_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_information_request_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_information_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          due_date: string
          engagement_id: string | null
          id: string
          reminder_date: string | null
          request_code: string
          request_date: string | null
          request_description: string
          request_title: string
          requested_by: string | null
          response_date: string | null
          response_notes: string | null
          risk_event_id: string | null
          status: string
          target_contact_email: string | null
          target_contact_name: string | null
          target_division_id: string | null
          target_external_entity: string | null
          target_section_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          due_date: string
          engagement_id?: string | null
          id?: string
          reminder_date?: string | null
          request_code: string
          request_date?: string | null
          request_description: string
          request_title: string
          requested_by?: string | null
          response_date?: string | null
          response_notes?: string | null
          risk_event_id?: string | null
          status?: string
          target_contact_email?: string | null
          target_contact_name?: string | null
          target_division_id?: string | null
          target_external_entity?: string | null
          target_section_id?: string | null
          target_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string
          engagement_id?: string | null
          id?: string
          reminder_date?: string | null
          request_code?: string
          request_date?: string | null
          request_description?: string
          request_title?: string
          requested_by?: string | null
          response_date?: string | null
          response_notes?: string | null
          risk_event_id?: string | null
          status?: string
          target_contact_email?: string | null
          target_contact_name?: string | null
          target_division_id?: string | null
          target_external_entity?: string | null
          target_section_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_information_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_information_requests_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "audit_engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_information_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_information_requests_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_information_requests_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_information_requests_target_division_id_fkey"
            columns: ["target_division_id"]
            isOneToOne: false
            referencedRelation: "audit_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_information_requests_target_section_id_fkey"
            columns: ["target_section_id"]
            isOneToOne: false
            referencedRelation: "audit_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_kra_activities: {
        Row: {
          activity_code: string | null
          annual_target: string | null
          baseline: string | null
          created_at: string
          description: string
          id: string
          measure: string | null
          strategic_kra_id: string
          updated_at: string
        }
        Insert: {
          activity_code?: string | null
          annual_target?: string | null
          baseline?: string | null
          created_at?: string
          description: string
          id?: string
          measure?: string | null
          strategic_kra_id: string
          updated_at?: string
        }
        Update: {
          activity_code?: string | null
          annual_target?: string | null
          baseline?: string | null
          created_at?: string
          description?: string
          id?: string
          measure?: string | null
          strategic_kra_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_kra_activities_strategic_kra_id_fkey"
            columns: ["strategic_kra_id"]
            isOneToOne: false
            referencedRelation: "audit_strategic_kras"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_kra_activity_quarterly_status: {
        Row: {
          challenges: string | null
          created_at: string
          financial_year: number
          id: string
          kra_activity_id: string
          narrative_status: string | null
          quarter: number
          revision_next_year: string | null
          status: string
          updated_at: string
        }
        Insert: {
          challenges?: string | null
          created_at?: string
          financial_year: number
          id?: string
          kra_activity_id: string
          narrative_status?: string | null
          quarter: number
          revision_next_year?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          challenges?: string | null
          created_at?: string
          financial_year?: number
          id?: string
          kra_activity_id?: string
          narrative_status?: string | null
          quarter?: number
          revision_next_year?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_kra_activity_quarterly_status_kra_activity_id_fkey"
            columns: ["kra_activity_id"]
            isOneToOne: false
            referencedRelation: "audit_kra_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_legal_instruments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          effective_date: string | null
          enacted_date: string | null
          full_text_url: string | null
          id: string
          instrument_type: string
          is_active: boolean | null
          jurisdiction: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          effective_date?: string | null
          enacted_date?: string | null
          full_text_url?: string | null
          id?: string
          instrument_type: string
          is_active?: boolean | null
          jurisdiction?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          effective_date?: string | null
          enacted_date?: string | null
          full_text_url?: string | null
          id?: string
          instrument_type?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string
          after_state: Json | null
          before_state: Json | null
          entity_id: string
          entity_table: string
          id: string
          ip_address: unknown
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor: string
          after_state?: Json | null
          before_state?: Json | null
          entity_id: string
          entity_table: string
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor?: string
          after_state?: Json | null
          before_state?: Json | null
          entity_id?: string
          entity_table?: string
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: number | null
          entity_type: string
          id: number
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: number | null
          entity_type: string
          id?: number
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: number | null
          entity_type?: string
          id?: number
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_obligations: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          owner_unit_id: string | null
          source: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_unit_id?: string | null
          source: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_unit_id?: string | null
          source?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_psap_assessment_scores: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          psap_assessment_id: string
          psap_standard_id: string
          raw_score: number
          updated_at: string
          weighted_score: number | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          psap_assessment_id: string
          psap_standard_id: string
          raw_score: number
          updated_at?: string
          weighted_score?: number | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          psap_assessment_id?: string
          psap_standard_id?: string
          raw_score?: number
          updated_at?: string
          weighted_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_psap_assessment_scores_psap_assessment_id_fkey"
            columns: ["psap_assessment_id"]
            isOneToOne: false
            referencedRelation: "audit_psap_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_psap_assessment_scores_psap_standard_id_fkey"
            columns: ["psap_standard_id"]
            isOneToOne: false
            referencedRelation: "audit_psap_standards"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_psap_assessments: {
        Row: {
          assessment_date: string
          comments: string | null
          completed_by: string
          created_at: string
          financial_year: number
          id: string
          org_unit_id: string | null
          overall_rating: string | null
          overall_score: number | null
          quarter: number
          reviewed_by: string | null
          updated_at: string
        }
        Insert: {
          assessment_date: string
          comments?: string | null
          completed_by: string
          created_at?: string
          financial_year: number
          id?: string
          org_unit_id?: string | null
          overall_rating?: string | null
          overall_score?: number | null
          quarter: number
          reviewed_by?: string | null
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          comments?: string | null
          completed_by?: string
          created_at?: string
          financial_year?: number
          id?: string
          org_unit_id?: string | null
          overall_rating?: string | null
          overall_score?: number | null
          quarter?: number
          reviewed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_psap_assessments_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_psap_assessments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_psap_rating_scales: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_score: number
          min_score: number
          rating: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_score: number
          min_score: number
          rating: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number
          min_score?: number
          rating?: string
        }
        Relationships: []
      }
      audit_psap_standards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          standard_number: number
          title: string
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          standard_number: number
          title: string
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          standard_number?: number
          title?: string
          weight?: number
        }
        Relationships: []
      }
      audit_recommendations: {
        Row: {
          created_at: string
          created_by: string | null
          finding_id: string
          id: string
          kra_activity_id: string | null
          legal_case_id: string | null
          legal_case_linked: boolean
          priority: string | null
          published_at: string | null
          recommendation_text: string
          region_code: string | null
          risk_id: string | null
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          finding_id: string
          id?: string
          kra_activity_id?: string | null
          legal_case_id?: string | null
          legal_case_linked?: boolean
          priority?: string | null
          published_at?: string | null
          recommendation_text: string
          region_code?: string | null
          risk_id?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          finding_id?: string
          id?: string
          kra_activity_id?: string | null
          legal_case_id?: string | null
          legal_case_linked?: boolean
          priority?: string | null
          published_at?: string | null
          recommendation_text?: string
          region_code?: string | null
          risk_id?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_recommendations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_recommendations_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "audit_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_recommendations_kra_activity_id_fkey"
            columns: ["kra_activity_id"]
            isOneToOne: false
            referencedRelation: "audit_kra_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_recommendations_legal_case_id_fkey"
            columns: ["legal_case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_recommendations_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_recommendations_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_audit_log: {
        Row: {
          action_type: string
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          field_changed: string | null
          id: string
          new_value: string | null
          old_value: string | null
          risk_id: string
        }
        Insert: {
          action_type: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          field_changed?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          risk_id: string
        }
        Update: {
          action_type?: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          field_changed?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          risk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_audit_log_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_risk_audit_log_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_event_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          risk_event_id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          risk_event_id: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          risk_event_id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_event_documents_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_event_documents_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_event_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_event_log: {
        Row: {
          action_details: string | null
          action_type: string
          id: string
          new_status: string | null
          old_status: string | null
          performed_at: string
          performed_by: string | null
          risk_event_id: string
        }
        Insert: {
          action_details?: string | null
          action_type: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_at?: string
          performed_by?: string | null
          risk_event_id: string
        }
        Update: {
          action_details?: string | null
          action_type?: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_at?: string
          performed_by?: string | null
          risk_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_event_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_event_log_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_event_log_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_events"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_event_milestones: {
        Row: {
          actual_date: string | null
          created_at: string
          id: string
          milestone_name: string
          notes: string | null
          planned_date: string
          risk_event_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_date?: string | null
          created_at?: string
          id?: string
          milestone_name: string
          notes?: string | null
          planned_date: string
          risk_event_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_date?: string | null
          created_at?: string
          id?: string
          milestone_name?: string
          notes?: string | null
          planned_date?: string
          risk_event_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_event_milestones_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_event_milestones_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_events"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_event_risks: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          notes: string | null
          risk_event_id: string
          risk_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          risk_event_id: string
          risk_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          risk_event_id?: string
          risk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_event_risks_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_event_risks_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_event_risks_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_risk_event_risks_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_events: {
        Row: {
          allocated_at: string | null
          allocated_by: string | null
          audit_category_id: string | null
          created_at: string
          created_by: string | null
          directive_date: string | null
          directive_issuer: string | null
          directive_reference: string | null
          event_code: string
          event_description: string
          event_status: string
          event_title: string
          financial_year: number | null
          id: string
          is_priority_override: boolean | null
          lead_auditor_id: string | null
          primary_risk_id: string
          priority: string
          rejection_reason: string | null
          requested_completion_date: string | null
          requested_start_date: string | null
          requesting_division_id: string | null
          requesting_officer_id: string | null
          response_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_type: string
          target_division_id: string | null
          target_section_id: string | null
          updated_at: string
        }
        Insert: {
          allocated_at?: string | null
          allocated_by?: string | null
          audit_category_id?: string | null
          created_at?: string
          created_by?: string | null
          directive_date?: string | null
          directive_issuer?: string | null
          directive_reference?: string | null
          event_code: string
          event_description: string
          event_status?: string
          event_title: string
          financial_year?: number | null
          id?: string
          is_priority_override?: boolean | null
          lead_auditor_id?: string | null
          primary_risk_id: string
          priority?: string
          rejection_reason?: string | null
          requested_completion_date?: string | null
          requested_start_date?: string | null
          requesting_division_id?: string | null
          requesting_officer_id?: string | null
          response_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_type: string
          target_division_id?: string | null
          target_section_id?: string | null
          updated_at?: string
        }
        Update: {
          allocated_at?: string | null
          allocated_by?: string | null
          audit_category_id?: string | null
          created_at?: string
          created_by?: string | null
          directive_date?: string | null
          directive_issuer?: string | null
          directive_reference?: string | null
          event_code?: string
          event_description?: string
          event_status?: string
          event_title?: string
          financial_year?: number | null
          id?: string
          is_priority_override?: boolean | null
          lead_auditor_id?: string | null
          primary_risk_id?: string
          priority?: string
          rejection_reason?: string | null
          requested_completion_date?: string | null
          requested_start_date?: string | null
          requesting_division_id?: string | null
          requesting_officer_id?: string | null
          response_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_type?: string
          target_division_id?: string | null
          target_section_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_events_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_audit_category_id_fkey"
            columns: ["audit_category_id"]
            isOneToOne: false
            referencedRelation: "audit_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_lead_auditor_id_fkey"
            columns: ["lead_auditor_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_primary_risk_id_fkey"
            columns: ["primary_risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_risk_events_primary_risk_id_fkey"
            columns: ["primary_risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_requesting_division_id_fkey"
            columns: ["requesting_division_id"]
            isOneToOne: false
            referencedRelation: "audit_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_requesting_officer_id_fkey"
            columns: ["requesting_officer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_target_division_id_fkey"
            columns: ["target_division_id"]
            isOneToOne: false
            referencedRelation: "audit_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_events_target_section_id_fkey"
            columns: ["target_section_id"]
            isOneToOne: false
            referencedRelation: "audit_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_incidents: {
        Row: {
          created_at: string
          description: string
          financial_impact: number | null
          id: string
          impact_description: string | null
          incident_date: string
          lessons_learned: string | null
          reported_by: string | null
          response_actions: string | null
          risk_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          financial_impact?: number | null
          id?: string
          impact_description?: string | null
          incident_date: string
          lessons_learned?: string | null
          reported_by?: string | null
          response_actions?: string | null
          risk_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          financial_impact?: number | null
          id?: string
          impact_description?: string | null
          incident_date?: string
          lessons_learned?: string | null
          reported_by?: string | null
          response_actions?: string | null
          risk_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_incidents_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_risk_incidents_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_indicator_values: {
        Row: {
          created_at: string
          id: string
          indicator_id: string
          measurement_date: string
          notes: string | null
          recorded_by: string | null
          status: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          indicator_id: string
          measurement_date: string
          notes?: string | null
          recorded_by?: string | null
          status?: string | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          indicator_id?: string
          measurement_date?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_indicator_values_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_indicator_values_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_indicators: {
        Row: {
          created_at: string
          data_source: string | null
          id: string
          indicator_name: string
          indicator_type: string | null
          is_active: boolean | null
          measurement_frequency: string | null
          measurement_unit: string | null
          owner_id: string | null
          risk_id: string
          threshold_amber: number | null
          threshold_green: number | null
          threshold_red: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          id?: string
          indicator_name: string
          indicator_type?: string | null
          is_active?: boolean | null
          measurement_frequency?: string | null
          measurement_unit?: string | null
          owner_id?: string | null
          risk_id: string
          threshold_amber?: number | null
          threshold_green?: number | null
          threshold_red?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_source?: string | null
          id?: string
          indicator_name?: string
          indicator_type?: string | null
          is_active?: boolean | null
          measurement_frequency?: string | null
          measurement_unit?: string | null
          owner_id?: string | null
          risk_id?: string
          threshold_amber?: number | null
          threshold_green?: number | null
          threshold_red?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_indicators_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_indicators_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_risk_indicators_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_legal_references: {
        Row: {
          compliance_type: string
          created_at: string
          id: string
          legal_instrument_id: string
          notes: string | null
          risk_id: string
          section_reference: string | null
        }
        Insert: {
          compliance_type: string
          created_at?: string
          id?: string
          legal_instrument_id: string
          notes?: string | null
          risk_id: string
          section_reference?: string | null
        }
        Update: {
          compliance_type?: string
          created_at?: string
          id?: string
          legal_instrument_id?: string
          notes?: string | null
          risk_id?: string
          section_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_legal_references_legal_instrument_id_fkey"
            columns: ["legal_instrument_id"]
            isOneToOne: false
            referencedRelation: "audit_legal_instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_legal_references_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_risk_legal_references_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_profile_items: {
        Row: {
          additional_controls: string | null
          context_category: string
          created_at: string
          existing_controls: string | null
          id: string
          impact_score: number | null
          likelihood_score: number | null
          resource_category: string
          risk_description: string
          risk_owner_id: string | null
          risk_profile_id: string
          risk_score: number | null
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          additional_controls?: string | null
          context_category: string
          created_at?: string
          existing_controls?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          resource_category: string
          risk_description: string
          risk_owner_id?: string | null
          risk_profile_id: string
          risk_score?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          additional_controls?: string | null
          context_category?: string
          created_at?: string
          existing_controls?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          resource_category?: string
          risk_description?: string
          risk_owner_id?: string | null
          risk_profile_id?: string
          risk_score?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_profile_items_risk_owner_id_fkey"
            columns: ["risk_owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_profile_items_risk_profile_id_fkey"
            columns: ["risk_profile_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_profiles: {
        Row: {
          created_at: string
          id: string
          org_unit_id: string | null
          overall_level: string | null
          prepared_by: string
          profile_date: string
          project_name: string | null
          remarks: string | null
          reviewed_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_unit_id?: string | null
          overall_level?: string | null
          prepared_by: string
          profile_date: string
          project_name?: string | null
          remarks?: string | null
          reviewed_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_unit_id?: string | null
          overall_level?: string | null
          prepared_by?: string
          profile_date?: string
          project_name?: string | null
          remarks?: string | null
          reviewed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_profiles_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_profiles_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_register: {
        Row: {
          control_description: string | null
          control_effectiveness: string | null
          created_at: string
          created_by: string | null
          division_id: string | null
          id: string
          identified_date: string | null
          inherent_impact: number
          inherent_likelihood: number
          inherent_risk_rating: string | null
          inherent_risk_score: number | null
          is_system_risk: boolean | null
          last_reviewed_at: string | null
          next_review_due: string | null
          notes: string | null
          oversight_body: string | null
          process_id: string | null
          residual_impact: number | null
          residual_likelihood: number | null
          residual_risk_rating: string | null
          residual_risk_score: number | null
          review_frequency: string | null
          risk_category: string
          risk_code: string
          risk_description: string
          risk_owner_id: string | null
          risk_owner_role: string | null
          risk_status: string
          risk_subcategory: string | null
          risk_title: string
          risk_treatment: string | null
          section_id: string | null
          tags: string[] | null
          target_risk_rating: string | null
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          control_description?: string | null
          control_effectiveness?: string | null
          created_at?: string
          created_by?: string | null
          division_id?: string | null
          id?: string
          identified_date?: string | null
          inherent_impact: number
          inherent_likelihood: number
          inherent_risk_rating?: string | null
          inherent_risk_score?: number | null
          is_system_risk?: boolean | null
          last_reviewed_at?: string | null
          next_review_due?: string | null
          notes?: string | null
          oversight_body?: string | null
          process_id?: string | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          residual_risk_rating?: string | null
          residual_risk_score?: number | null
          review_frequency?: string | null
          risk_category: string
          risk_code: string
          risk_description: string
          risk_owner_id?: string | null
          risk_owner_role?: string | null
          risk_status?: string
          risk_subcategory?: string | null
          risk_title: string
          risk_treatment?: string | null
          section_id?: string | null
          tags?: string[] | null
          target_risk_rating?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          control_description?: string | null
          control_effectiveness?: string | null
          created_at?: string
          created_by?: string | null
          division_id?: string | null
          id?: string
          identified_date?: string | null
          inherent_impact?: number
          inherent_likelihood?: number
          inherent_risk_rating?: string | null
          inherent_risk_score?: number | null
          is_system_risk?: boolean | null
          last_reviewed_at?: string | null
          next_review_due?: string | null
          notes?: string | null
          oversight_body?: string | null
          process_id?: string | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          residual_risk_rating?: string | null
          residual_risk_score?: number | null
          review_frequency?: string | null
          risk_category?: string
          risk_code?: string
          risk_description?: string
          risk_owner_id?: string | null
          risk_owner_role?: string | null
          risk_status?: string
          risk_subcategory?: string | null
          risk_title?: string
          risk_treatment?: string | null
          section_id?: string | null
          tags?: string[] | null
          target_risk_rating?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_register_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_register_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "audit_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_register_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "audit_business_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_register_risk_owner_id_fkey"
            columns: ["risk_owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_register_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "audit_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_risk_treatments: {
        Row: {
          actual_completion_date: string | null
          created_at: string
          description: string
          effectiveness_rating: string | null
          evidence_url: string | null
          id: string
          notes: string | null
          owner_id: string | null
          risk_id: string
          status: string
          target_date: string | null
          treatment_type: string
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          created_at?: string
          description: string
          effectiveness_rating?: string | null
          evidence_url?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          risk_id: string
          status?: string
          target_date?: string | null
          treatment_type: string
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          created_at?: string
          description?: string
          effectiveness_rating?: string | null
          evidence_url?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          risk_id?: string
          status?: string
          target_date?: string | null
          treatment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_risk_treatments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_risk_treatments_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_engagement_summary"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "audit_risk_treatments_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_sections: {
        Row: {
          code: string
          created_at: string
          description: string | null
          division_id: string
          head_title: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          division_id: string
          head_title?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          division_id?: string
          head_title?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_sections_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "audit_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_strategic_kras: {
        Row: {
          created_at: string
          end_year: number | null
          id: string
          kra_code: string
          kra_title: string
          org_unit_id: string | null
          purpose: string | null
          start_year: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_year?: number | null
          id?: string
          kra_code: string
          kra_title: string
          org_unit_id?: string | null
          purpose?: string | null
          start_year: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_year?: number | null
          id?: string
          kra_code?: string
          kra_title?: string
          org_unit_id?: string | null
          purpose?: string | null
          start_year?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_tasks: {
        Row: {
          actual_end_date: string | null
          actual_start_date: string | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          blockers: string | null
          created_at: string
          created_by: string | null
          engagement_id: string | null
          id: string
          notes: string | null
          planned_end_date: string | null
          planned_start_date: string | null
          priority: string | null
          progress_percentage: number | null
          risk_event_id: string | null
          status: string
          task_code: string | null
          task_description: string | null
          task_title: string
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          blockers?: string | null
          created_at?: string
          created_by?: string | null
          engagement_id?: string | null
          id?: string
          notes?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: string | null
          progress_percentage?: number | null
          risk_event_id?: string | null
          status?: string
          task_code?: string | null
          task_description?: string | null
          task_title: string
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          blockers?: string | null
          created_at?: string
          created_by?: string | null
          engagement_id?: string | null
          id?: string
          notes?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: string | null
          progress_percentage?: number | null
          risk_event_id?: string | null
          status?: string
          task_code?: string | null
          task_description?: string | null
          task_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tasks_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "audit_engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tasks_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tasks_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "audit_risk_events"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_workpapers: {
        Row: {
          created_at: string
          created_by: string | null
          engagement_id: string
          id: string
          metadata: Json
          procedure: string | null
          sample_ref: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          engagement_id: string
          id?: string
          metadata?: Json
          procedure?: string | null
          sample_ref?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          engagement_id?: string
          id?: string
          metadata?: Json
          procedure?: string | null
          sample_ref?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_workpapers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_workpapers_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "audit_engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      case_amendments: {
        Row: {
          amendment_date: string
          amendment_reason: string
          amendment_type: string
          created_at: string | null
          created_by: string | null
          id: string
          inherit_all_documents: boolean | null
          inherit_land_parcels: boolean | null
          inherit_parties: boolean | null
          initiated_by: string | null
          is_active: boolean | null
          new_case_id: string
          new_court_reference_id: string
          notes: string | null
          original_case_id: string
          original_court_reference_id: string
          previous_amendment_id: string | null
        }
        Insert: {
          amendment_date: string
          amendment_reason: string
          amendment_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          inherit_all_documents?: boolean | null
          inherit_land_parcels?: boolean | null
          inherit_parties?: boolean | null
          initiated_by?: string | null
          is_active?: boolean | null
          new_case_id: string
          new_court_reference_id: string
          notes?: string | null
          original_case_id: string
          original_court_reference_id: string
          previous_amendment_id?: string | null
        }
        Update: {
          amendment_date?: string
          amendment_reason?: string
          amendment_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          inherit_all_documents?: boolean | null
          inherit_land_parcels?: boolean | null
          inherit_parties?: boolean | null
          initiated_by?: string | null
          is_active?: boolean | null
          new_case_id?: string
          new_court_reference_id?: string
          notes?: string | null
          original_case_id?: string
          original_court_reference_id?: string
          previous_amendment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_amendments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_amendments_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_amendments_new_court_reference_id_fkey"
            columns: ["new_court_reference_id"]
            isOneToOne: false
            referencedRelation: "court_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_amendments_original_court_reference_id_fkey"
            columns: ["original_court_reference_id"]
            isOneToOne: false
            referencedRelation: "court_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_amendments_previous_amendment_id_fkey"
            columns: ["previous_amendment_id"]
            isOneToOne: false
            referencedRelation: "case_amendments"
            referencedColumns: ["id"]
          },
        ]
      }
      case_closure: {
        Row: {
          case_id: string
          closing_officer_id: string | null
          closure_date: string
          closure_reason: string
          created_at: string | null
          id: string
          notes: string | null
          summary_of_findings: string | null
        }
        Insert: {
          case_id: string
          closing_officer_id?: string | null
          closure_date: string
          closure_reason: string
          created_at?: string | null
          id?: string
          notes?: string | null
          summary_of_findings?: string | null
        }
        Update: {
          case_id?: string
          closing_officer_id?: string | null
          closure_date?: string
          closure_reason?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          summary_of_findings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_closure_closing_officer_id_fkey"
            columns: ["closing_officer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_delegations: {
        Row: {
          case_id: string | null
          created_at: string | null
          delegated_by: string | null
          delegated_to: string
          delegation_date: string | null
          id: string
          instructions: string | null
          status: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          delegated_by?: string | null
          delegated_to: string
          delegation_date?: string | null
          id?: string
          instructions?: string | null
          status?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          delegated_by?: string | null
          delegated_to?: string
          delegation_date?: string | null
          id?: string
          instructions?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_delegations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_documents: {
        Row: {
          case_id: string
          created_at: string | null
          description: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_internal: boolean | null
          sent_to: string | null
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          description?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_internal?: boolean | null
          sent_to?: string | null
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          description?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_internal?: boolean | null
          sent_to?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_files: {
        Row: {
          case_id: string
          civil_matter_type: string | null
          court_file_number: string | null
          created_at: string | null
          created_by: string | null
          current_maintainer: string | null
          id: string
          land_file_number: string | null
          last_maintained_date: string | null
          titles_file_number: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          civil_matter_type?: string | null
          court_file_number?: string | null
          created_at?: string | null
          created_by?: string | null
          current_maintainer?: string | null
          id?: string
          land_file_number?: string | null
          last_maintained_date?: string | null
          titles_file_number?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          civil_matter_type?: string | null
          court_file_number?: string | null
          created_at?: string | null
          created_by?: string | null
          current_maintainer?: string | null
          id?: string
          land_file_number?: string | null
          last_maintained_date?: string | null
          titles_file_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_files_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_current_maintainer_fkey"
            columns: ["current_maintainer"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_filings: {
        Row: {
          associated_document_id: string | null
          case_id: string
          created_at: string | null
          created_by: string | null
          filed_by: string
          filed_date: string | null
          filing_type: string
          id: string
          notes: string | null
          reference_number: string | null
        }
        Insert: {
          associated_document_id?: string | null
          case_id: string
          created_at?: string | null
          created_by?: string | null
          filed_by: string
          filed_date?: string | null
          filing_type: string
          id?: string
          notes?: string | null
          reference_number?: string | null
        }
        Update: {
          associated_document_id?: string | null
          case_id?: string
          created_at?: string | null
          created_by?: string | null
          filed_by?: string
          filed_date?: string | null
          filing_type?: string
          id?: string
          notes?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_filings_associated_document_id_fkey"
            columns: ["associated_document_id"]
            isOneToOne: false
            referencedRelation: "case_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_filings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_filings_filed_by_fkey"
            columns: ["filed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_history: {
        Row: {
          action: string
          case_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_history_case_id_fkey1"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_intake_documents: {
        Row: {
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          intake_record_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          intake_record_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          intake_record_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_intake_documents_intake_record_id_fkey"
            columns: ["intake_record_id"]
            isOneToOne: false
            referencedRelation: "case_intake_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_intake_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_intake_records: {
        Row: {
          acknowledgement_number: string | null
          case_id: string
          created_at: string | null
          created_by: string | null
          document_type: string
          id: string
          notes: string | null
          received_by: string
          received_date: string | null
          source: string | null
        }
        Insert: {
          acknowledgement_number?: string | null
          case_id: string
          created_at?: string | null
          created_by?: string | null
          document_type: string
          id?: string
          notes?: string | null
          received_by: string
          received_date?: string | null
          source?: string | null
        }
        Update: {
          acknowledgement_number?: string | null
          case_id?: string
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          id?: string
          notes?: string | null
          received_by?: string
          received_date?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_intake_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_intake_records_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_parties: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          party_id: string
          role: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          party_id: string
          role: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          party_id?: string
          role?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          case_number: string
          case_type: string | null
          closed_date: string | null
          closure_notes: string | null
          closure_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          priority: string | null
          region: string | null
          status: string | null
          title: string
          updated_at: string | null
          workflow_status: string | null
        }
        Insert: {
          case_number: string
          case_type?: string | null
          closed_date?: string | null
          closure_notes?: string | null
          closure_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          region?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          workflow_status?: string | null
        }
        Update: {
          case_number?: string
          case_type?: string | null
          closed_date?: string | null
          closure_notes?: string | null
          closure_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          region?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          workflow_status?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          attachments: Json | null
          case_id: string
          communication_date: string
          communication_type: string | null
          content: string | null
          created_at: string | null
          direction: string
          handled_by: string | null
          id: string
          notes: string | null
          party_id: string | null
          party_name: string | null
          party_type: string | null
          priority: string | null
          recipient_role: string | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          response_deadline: string | null
          response_required: boolean | null
          response_status: string | null
          subject: string
        }
        Insert: {
          attachments?: Json | null
          case_id: string
          communication_date: string
          communication_type?: string | null
          content?: string | null
          created_at?: string | null
          direction: string
          handled_by?: string | null
          id?: string
          notes?: string | null
          party_id?: string | null
          party_name?: string | null
          party_type?: string | null
          priority?: string | null
          recipient_role?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_deadline?: string | null
          response_required?: boolean | null
          response_status?: string | null
          subject: string
        }
        Update: {
          attachments?: Json | null
          case_id?: string
          communication_date?: string
          communication_type?: string | null
          content?: string | null
          created_at?: string | null
          direction?: string
          handled_by?: string | null
          id?: string
          notes?: string | null
          party_id?: string | null
          party_name?: string | null
          party_type?: string | null
          priority?: string | null
          recipient_role?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_deadline?: string | null
          response_required?: boolean | null
          response_status?: string | null
          subject?: string
        }
        Relationships: []
      }
      compliance_actions: {
        Row: {
          action_date: string | null
          action_details: string | null
          action_type: string | null
          compliance_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          action_date?: string | null
          action_details?: string | null
          action_type?: string | null
          compliance_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          action_date?: string | null
          action_details?: string | null
          action_type?: string | null
          compliance_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_actions_compliance_id_fkey"
            columns: ["compliance_id"]
            isOneToOne: false
            referencedRelation: "compliance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_records: {
        Row: {
          case_number: string
          created_at: string | null
          enforcement_action: string | null
          id: string
          investigation_findings: string | null
          reported_by: string | null
          reported_date: string | null
          reporter_contact: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
          violation_description: string
          violation_type: string | null
        }
        Insert: {
          case_number: string
          created_at?: string | null
          enforcement_action?: string | null
          id?: string
          investigation_findings?: string | null
          reported_by?: string | null
          reported_date?: string | null
          reporter_contact?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          violation_description: string
          violation_type?: string | null
        }
        Update: {
          case_number?: string
          created_at?: string | null
          enforcement_action?: string | null
          id?: string
          investigation_findings?: string | null
          reported_by?: string | null
          reported_date?: string | null
          reporter_contact?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          violation_description?: string
          violation_type?: string | null
        }
        Relationships: []
      }
      compliance_tracking: {
        Row: {
          case_id: string | null
          compliance_deadline: string | null
          compliance_notes: string | null
          compliance_status: string | null
          court_order_description: string
          created_at: string | null
          id: string
          memo_sent_by: string | null
          memo_sent_date: string | null
          responsible_division: string
        }
        Insert: {
          case_id?: string | null
          compliance_deadline?: string | null
          compliance_notes?: string | null
          compliance_status?: string | null
          court_order_description: string
          created_at?: string | null
          id?: string
          memo_sent_by?: string | null
          memo_sent_date?: string | null
          responsible_division: string
        }
        Update: {
          case_id?: string | null
          compliance_deadline?: string | null
          compliance_notes?: string | null
          compliance_status?: string | null
          court_order_description?: string
          created_at?: string | null
          id?: string
          memo_sent_by?: string | null
          memo_sent_date?: string | null
          responsible_division?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_tracking_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      control_points: {
        Row: {
          accuracy_class_id: string | null
          code: string
          created_at: string | null
          datum: string
          description: string | null
          geom: unknown
          history: Json | null
          id: string
          installed_on: string | null
          metadata: Json | null
          monument_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accuracy_class_id?: string | null
          code: string
          created_at?: string | null
          datum: string
          description?: string | null
          geom: unknown
          history?: Json | null
          id?: string
          installed_on?: string | null
          metadata?: Json | null
          monument_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accuracy_class_id?: string | null
          code?: string
          created_at?: string | null
          datum?: string
          description?: string | null
          geom?: unknown
          history?: Json | null
          id?: string
          installed_on?: string | null
          metadata?: Json | null
          monument_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "control_points_accuracy_class_id_fkey"
            columns: ["accuracy_class_id"]
            isOneToOne: false
            referencedRelation: "accuracy_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_matter_documents: {
        Row: {
          doc_type: string | null
          file_size: number | null
          id: string
          matter_id: string | null
          mime_type: string | null
          storage_path: string
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          doc_type?: string | null
          file_size?: number | null
          id?: string
          matter_id?: string | null
          mime_type?: string | null
          storage_path: string
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          doc_type?: string | null
          file_size?: number | null
          id?: string
          matter_id?: string | null
          mime_type?: string | null
          storage_path?: string
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_matter_documents_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "corporate_matters"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_matter_tasks: {
        Row: {
          assigned_officer: string | null
          completed_at: string | null
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          matter_id: string | null
          status: string | null
          task_type: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_officer?: string | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          matter_id?: string | null
          status?: string | null
          task_type?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_officer?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          matter_id?: string | null
          status?: string | null
          task_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_matter_tasks_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "corporate_matters"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_matters: {
        Row: {
          assigned_date: string | null
          assigned_officer: string | null
          created_at: string | null
          created_by: string | null
          date_received: string
          date_requested: string
          due_date: string | null
          id: string
          land_description: string | null
          lease_commencement: string | null
          lease_expiry: string | null
          lease_type: string | null
          legal_issues: string | null
          matter_number: string | null
          organisation_responsible: string | null
          request_form: string
          request_type: string
          requester_name: string
          requester_position: string | null
          requesting_division: string | null
          status: string | null
          survey_plan_no: string | null
          type_of_matter: string
          updated_at: string | null
          zoning: string | null
        }
        Insert: {
          assigned_date?: string | null
          assigned_officer?: string | null
          created_at?: string | null
          created_by?: string | null
          date_received: string
          date_requested: string
          due_date?: string | null
          id?: string
          land_description?: string | null
          lease_commencement?: string | null
          lease_expiry?: string | null
          lease_type?: string | null
          legal_issues?: string | null
          matter_number?: string | null
          organisation_responsible?: string | null
          request_form: string
          request_type: string
          requester_name: string
          requester_position?: string | null
          requesting_division?: string | null
          status?: string | null
          survey_plan_no?: string | null
          type_of_matter: string
          updated_at?: string | null
          zoning?: string | null
        }
        Update: {
          assigned_date?: string | null
          assigned_officer?: string | null
          created_at?: string | null
          created_by?: string | null
          date_received?: string
          date_requested?: string
          due_date?: string | null
          id?: string
          land_description?: string | null
          lease_commencement?: string | null
          lease_expiry?: string | null
          lease_type?: string | null
          legal_issues?: string | null
          matter_number?: string | null
          organisation_responsible?: string | null
          request_form?: string
          request_type?: string
          requester_name?: string
          requester_position?: string | null
          requesting_division?: string | null
          status?: string | null
          survey_plan_no?: string | null
          type_of_matter?: string
          updated_at?: string | null
          zoning?: string | null
        }
        Relationships: []
      }
      court_orders: {
        Row: {
          case_id: string
          conclusion_grounds: string | null
          court_reference: string
          created_at: string | null
          document_url: string | null
          id: string
          order_date: string
          parties_to_proceeding: string | null
          terms: string
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          conclusion_grounds?: string | null
          court_reference: string
          created_at?: string | null
          document_url?: string | null
          id?: string
          order_date: string
          parties_to_proceeding?: string | null
          terms: string
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          conclusion_grounds?: string | null
          court_reference?: string
          created_at?: string | null
          document_url?: string | null
          id?: string
          order_date?: string
          parties_to_proceeding?: string | null
          terms?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      court_references: {
        Row: {
          amendment_id: string | null
          assigned_by: string | null
          assigned_date: string
          assignment_reason: string | null
          case_id: string
          court_reference: string
          court_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_amended_from_previous: boolean | null
          is_current: boolean | null
          notes: string | null
          parent_reference_id: string | null
          superseded_by_ref_id: string | null
          superseded_date: string | null
          superseded_reason: string | null
          updated_at: string | null
        }
        Insert: {
          amendment_id?: string | null
          assigned_by?: string | null
          assigned_date: string
          assignment_reason?: string | null
          case_id: string
          court_reference: string
          court_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_amended_from_previous?: boolean | null
          is_current?: boolean | null
          notes?: string | null
          parent_reference_id?: string | null
          superseded_by_ref_id?: string | null
          superseded_date?: string | null
          superseded_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          amendment_id?: string | null
          assigned_by?: string | null
          assigned_date?: string
          assignment_reason?: string | null
          case_id?: string
          court_reference?: string
          court_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_amended_from_previous?: boolean | null
          is_current?: boolean | null
          notes?: string | null
          parent_reference_id?: string | null
          superseded_by_ref_id?: string | null
          superseded_date?: string | null
          superseded_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "court_references_amendment_id_fkey"
            columns: ["amendment_id"]
            isOneToOne: false
            referencedRelation: "case_amendments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_references_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_references_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_references_parent_reference_id_fkey"
            columns: ["parent_reference_id"]
            isOneToOne: false
            referencedRelation: "court_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_references_superseded_by_ref_id_fkey"
            columns: ["superseded_by_ref_id"]
            isOneToOne: false
            referencedRelation: "court_references"
            referencedColumns: ["id"]
          },
        ]
      }
      crs_library: {
        Row: {
          active: boolean | null
          authority: string | null
          code: string
          created_at: string | null
          id: string
          name: string
          proj4text: string | null
          wkt: string | null
        }
        Insert: {
          active?: boolean | null
          authority?: string | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          proj4text?: string | null
          wkt?: string | null
        }
        Update: {
          active?: boolean | null
          authority?: string | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          proj4text?: string | null
          wkt?: string | null
        }
        Relationships: []
      }
      customer_submissions: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          customer_contact: string | null
          customer_email: string | null
          customer_name: string
          description: string | null
          id: string
          priority: string | null
          processed_at: string | null
          province: string | null
          request_category: string | null
          service_type: string | null
          sla_due_date: string | null
          status: string | null
          submission_number: string
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          customer_contact?: string | null
          customer_email?: string | null
          customer_name: string
          description?: string | null
          id?: string
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          request_category?: string | null
          service_type?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number: string
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          customer_contact?: string | null
          customer_email?: string | null
          customer_name?: string
          description?: string | null
          id?: string
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          request_category?: string | null
          service_type?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      department: {
        Row: {
          code: string
          created_at: string | null
          department_id: number
          description: string | null
          division_id: number | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          department_id?: number
          description?: string | null
          division_id?: number | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          department_id?: number
          description?: string | null
          division_id?: number | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      development_applications: {
        Row: {
          applicant_email: string | null
          applicant_name: string
          applicant_phone: string | null
          application_number: string
          application_type: string
          assigned_to: string | null
          created_at: string | null
          decision_date: string | null
          decision_notes: string | null
          estimated_cost: number | null
          id: string
          parcel_id: string | null
          priority: string | null
          project_description: string | null
          project_title: string
          proposed_use: string | null
          review_deadline: string | null
          status: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_email?: string | null
          applicant_name: string
          applicant_phone?: string | null
          application_number: string
          application_type: string
          assigned_to?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          estimated_cost?: number | null
          id?: string
          parcel_id?: string | null
          priority?: string | null
          project_description?: string | null
          project_title: string
          proposed_use?: string | null
          review_deadline?: string | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_email?: string | null
          applicant_name?: string
          applicant_phone?: string | null
          application_number?: string
          application_type?: string
          assigned_to?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          estimated_cost?: number | null
          id?: string
          parcel_id?: string | null
          priority?: string | null
          project_description?: string | null
          project_title?: string
          proposed_use?: string | null
          review_deadline?: string | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "development_applications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      development_plans: {
        Row: {
          applicant_contact: string | null
          applicant_email: string | null
          applicant_name: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          plan_name: string
          plan_number: string
          plan_type: string | null
          proposed_lots: number | null
          proposed_units: number | null
          review_comments: string | null
          status: string | null
          submitted_date: string | null
          total_area_sqm: number | null
          updated_at: string | null
        }
        Insert: {
          applicant_contact?: string | null
          applicant_email?: string | null
          applicant_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          plan_name: string
          plan_number: string
          plan_type?: string | null
          proposed_lots?: number | null
          proposed_units?: number | null
          review_comments?: string | null
          status?: string | null
          submitted_date?: string | null
          total_area_sqm?: number | null
          updated_at?: string | null
        }
        Update: {
          applicant_contact?: string | null
          applicant_email?: string | null
          applicant_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          plan_name?: string
          plan_number?: string
          plan_type?: string | null
          proposed_lots?: number | null
          proposed_units?: number | null
          review_comments?: string | null
          status?: string | null
          submitted_date?: string | null
          total_area_sqm?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      directions: {
        Row: {
          assigned_to: string | null
          case_id: string | null
          content: string
          created_at: string | null
          direction_number: string
          due_date: string | null
          id: string
          issued_by: string | null
          issued_date: string | null
          priority: string | null
          source: string
          status: string | null
          subject: string
        }
        Insert: {
          assigned_to?: string | null
          case_id?: string | null
          content: string
          created_at?: string | null
          direction_number: string
          due_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          priority?: string | null
          source: string
          status?: string | null
          subject: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string | null
          content?: string
          created_at?: string | null
          direction_number?: string
          due_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          priority?: string | null
          source?: string
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "directions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          bundle_url: string | null
          created_at: string | null
          escalated_by: string | null
          escalated_date: string | null
          id: string
          legal_case_id: string | null
          reason: string
          resolution_notes: string | null
          resolved_date: string | null
          status: string | null
          survey_job_id: string | null
          updated_at: string | null
        }
        Insert: {
          bundle_url?: string | null
          created_at?: string | null
          escalated_by?: string | null
          escalated_date?: string | null
          id?: string
          legal_case_id?: string | null
          reason: string
          resolution_notes?: string | null
          resolved_date?: string | null
          status?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bundle_url?: string | null
          created_at?: string | null
          escalated_by?: string | null
          escalated_date?: string | null
          id?: string
          legal_case_id?: string | null
          reason?: string
          resolution_notes?: string | null
          resolved_date?: string | null
          status?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_escalated_by_fkey"
            columns: ["escalated_by"]
            isOneToOne: false
            referencedRelation: "surveyors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_survey_job_id_fkey"
            columns: ["survey_job_id"]
            isOneToOne: false
            referencedRelation: "survey_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      division: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          division_id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          division_id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          division_id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      division_compliance_updates: {
        Row: {
          attachment_id: string | null
          created_at: string | null
          details: string
          id: string
          memo_id: string
          status: string
          update_date: string | null
          updated_by: string
        }
        Insert: {
          attachment_id?: string | null
          created_at?: string | null
          details: string
          id?: string
          memo_id: string
          status: string
          update_date?: string | null
          updated_by: string
        }
        Update: {
          attachment_id?: string | null
          created_at?: string | null
          details?: string
          id?: string
          memo_id?: string
          status?: string
          update_date?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "division_compliance_updates_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "case_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "division_compliance_updates_memo_id_fkey"
            columns: ["memo_id"]
            isOneToOne: false
            referencedRelation: "manager_memos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "division_compliance_updates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_inheritance: {
        Row: {
          amendment_id: string
          id: string
          inheritance_type: string | null
          inherited_at: string | null
          inherited_by: string | null
          new_case_id: string
          original_document_id: string
        }
        Insert: {
          amendment_id: string
          id?: string
          inheritance_type?: string | null
          inherited_at?: string | null
          inherited_by?: string | null
          new_case_id: string
          original_document_id: string
        }
        Update: {
          amendment_id?: string
          id?: string
          inheritance_type?: string | null
          inherited_at?: string | null
          inherited_by?: string | null
          new_case_id?: string
          original_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_inheritance_amendment_id_fkey"
            columns: ["amendment_id"]
            isOneToOne: false
            referencedRelation: "case_amendments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_inheritance_inherited_by_fkey"
            columns: ["inherited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_inheritance_original_document_id_fkey"
            columns: ["original_document_id"]
            isOneToOne: false
            referencedRelation: "case_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          created_at: string | null
          description: string | null
          file_path: string | null
          file_type: string | null
          id: string
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey1"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      engagements: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          case_id: string | null
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          title: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_case_id_fkey1"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          captured_at: string | null
          captured_by: string | null
          case_id: string
          description: string | null
          file_url: string
          gps_location: Json | null
          id: string
          media_type: string | null
          title: string
          uploaded_at: string | null
          workpaper_id: string | null
        }
        Insert: {
          captured_at?: string | null
          captured_by?: string | null
          case_id: string
          description?: string | null
          file_url: string
          gps_location?: Json | null
          id?: string
          media_type?: string | null
          title: string
          uploaded_at?: string | null
          workpaper_id?: string | null
        }
        Update: {
          captured_at?: string | null
          captured_by?: string | null
          case_id?: string
          description?: string | null
          file_url?: string
          gps_location?: Json | null
          id?: string
          media_type?: string | null
          title?: string
          uploaded_at?: string | null
          workpaper_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_workpaper_id_fkey"
            columns: ["workpaper_id"]
            isOneToOne: false
            referencedRelation: "workpapers"
            referencedColumns: ["id"]
          },
        ]
      }
      exec_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          id: string
          message: string
          severity: string | null
          source_division: string
          source_submission_id: string | null
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          severity?: string | null
          source_division: string
          source_submission_id?: string | null
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          severity?: string | null
          source_division?: string
          source_submission_id?: string | null
          title?: string
        }
        Relationships: []
      }
      exec_directives: {
        Row: {
          acknowledged_at: string | null
          completed_at: string | null
          created_at: string | null
          description: string
          directive_number: string
          due_date: string | null
          id: string
          issued_by: string
          notes: string | null
          priority: string | null
          status: string | null
          target_divisions: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          directive_number: string
          due_date?: string | null
          id?: string
          issued_by: string
          notes?: string | null
          priority?: string | null
          status?: string | null
          target_divisions: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          directive_number?: string
          due_date?: string | null
          id?: string
          issued_by?: string
          notes?: string | null
          priority?: string | null
          status?: string | null
          target_divisions?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exec_interdivision_requests: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          from_division: string
          id: string
          priority: string | null
          request_number: string
          request_type: string | null
          requested_by: string | null
          responded_at: string | null
          response_notes: string | null
          source_submission_id: string | null
          status: string | null
          title: string
          to_division: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          from_division: string
          id?: string
          priority?: string | null
          request_number: string
          request_type?: string | null
          requested_by?: string | null
          responded_at?: string | null
          response_notes?: string | null
          source_submission_id?: string | null
          status?: string | null
          title: string
          to_division: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          from_division?: string
          id?: string
          priority?: string | null
          request_number?: string
          request_type?: string | null
          requested_by?: string | null
          responded_at?: string | null
          response_notes?: string | null
          source_submission_id?: string | null
          status?: string | null
          title?: string
          to_division?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      external_lawyers: {
        Row: {
          active: boolean | null
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          lawyer_type: string
          name: string
          notes: string | null
          organization: string
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          lawyer_type: string
          name: string
          notes?: string | null
          organization: string
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          lawyer_type?: string
          name?: string
          notes?: string | null
          organization?: string
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      field_uploads: {
        Row: {
          checksum: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          metadata: Json | null
          status: string | null
          survey_job_id: string | null
          type: string
          uploaded_at: string | null
          uploaded_by: string | null
          validations: Json | null
        }
        Insert: {
          checksum?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          metadata?: Json | null
          status?: string | null
          survey_job_id?: string | null
          type: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          validations?: Json | null
        }
        Update: {
          checksum?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          survey_job_id?: string | null
          type?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          validations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "field_uploads_survey_job_id_fkey"
            columns: ["survey_job_id"]
            isOneToOne: false
            referencedRelation: "survey_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "surveyors"
            referencedColumns: ["id"]
          },
        ]
      }
      file_maintenance_log: {
        Row: {
          case_id: string
          changes_made: Json | null
          created_at: string | null
          description: string
          file_type: string | null
          id: string
          maintained_by: string
          maintenance_date: string | null
          maintenance_type: string
          notes: string | null
          previous_maintainer: string | null
        }
        Insert: {
          case_id: string
          changes_made?: Json | null
          created_at?: string | null
          description: string
          file_type?: string | null
          id?: string
          maintained_by: string
          maintenance_date?: string | null
          maintenance_type: string
          notes?: string | null
          previous_maintainer?: string | null
        }
        Update: {
          case_id?: string
          changes_made?: Json | null
          created_at?: string | null
          description?: string
          file_type?: string | null
          id?: string
          maintained_by?: string
          maintenance_date?: string | null
          maintenance_type?: string
          notes?: string | null
          previous_maintainer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_maintenance_log_maintained_by_fkey"
            columns: ["maintained_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_maintenance_log_previous_maintainer_fkey"
            columns: ["previous_maintainer"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      file_requests: {
        Row: {
          case_id: string
          created_at: string | null
          current_location: string | null
          custodian: string | null
          file_number: string | null
          file_type: string
          id: string
          notes: string | null
          received_date: string | null
          requested_by: string | null
          requested_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          current_location?: string | null
          custodian?: string | null
          file_number?: string | null
          file_type: string
          id?: string
          notes?: string | null
          received_date?: string | null
          requested_by?: string | null
          requested_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          current_location?: string | null
          custodian?: string | null
          file_number?: string | null
          file_type?: string
          id?: string
          notes?: string | null
          received_date?: string | null
          requested_by?: string | null
          requested_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      filings: {
        Row: {
          case_id: string | null
          created_at: string | null
          description: string | null
          filing_type: string
          id: string
          prepared_by: string | null
          prepared_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          filing_type: string
          id?: string
          prepared_by?: string | null
          prepared_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          filing_type?: string
          id?: string
          prepared_by?: string | null
          prepared_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "filings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ilg_submissions: {
        Row: {
          assigned_to: string | null
          clan_name: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          district: string | null
          group_name: string
          id: string
          llg: string | null
          priority: string | null
          processed_at: string | null
          province: string | null
          registration_type: string | null
          sla_due_date: string | null
          status: string | null
          submission_number: string
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          clan_name?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          group_name: string
          id?: string
          llg?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          registration_type?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number: string
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          clan_name?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          group_name?: string
          id?: string
          llg?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          registration_type?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      incoming_correspondence: {
        Row: {
          acknowledgement_date: string | null
          acknowledgement_number: string | null
          acknowledgement_sent: boolean | null
          case_id: string | null
          created_at: string | null
          description: string | null
          document_type: string | null
          file_url: string | null
          id: string
          received_by: string | null
          received_date: string
          reference_number: string
          source: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          acknowledgement_date?: string | null
          acknowledgement_number?: string | null
          acknowledgement_sent?: boolean | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          received_by?: string | null
          received_date: string
          reference_number: string
          source?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          acknowledgement_date?: string | null
          acknowledgement_number?: string | null
          acknowledgement_sent?: boolean | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          received_by?: string | null
          received_date?: string
          reference_number?: string
          source?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      instruments: {
        Row: {
          calibration_due: string | null
          created_at: string | null
          id: string
          make: string | null
          metadata: Json | null
          model: string | null
          serial_no: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          calibration_due?: string | null
          created_at?: string | null
          id?: string
          make?: string | null
          metadata?: Json | null
          model?: string | null
          serial_no: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          calibration_due?: string | null
          created_at?: string | null
          id?: string
          make?: string | null
          metadata?: Json | null
          model?: string | null
          serial_no?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_types: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          sla_days: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sla_days?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sla_days?: number | null
        }
        Relationships: []
      }
      land_parcels: {
        Row: {
          area: number | null
          case_id: string | null
          coordinates: Json | null
          created_at: string | null
          id: string
          location: string | null
          notes: string | null
          parcel_number: string
        }
        Insert: {
          area?: number | null
          case_id?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          parcel_number: string
        }
        Update: {
          area?: number | null
          case_id?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          parcel_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "land_parcels_case_id_fkey1"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_case_assignments: {
        Row: {
          acknowledged_at: string | null
          assigned_at: string | null
          assigned_by: string
          assigned_by_name: string | null
          assigned_to: string
          assigned_to_name: string | null
          assignment_type: string | null
          attached_documents: Json | null
          case_id: string
          completed_at: string | null
          director_guidance: string | null
          executive_commentary: string | null
          id: string
          instructions: string | null
          manager_instructions: string | null
          metadata: Json | null
          secretary_advice: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_at?: string | null
          assigned_by: string
          assigned_by_name?: string | null
          assigned_to: string
          assigned_to_name?: string | null
          assignment_type?: string | null
          attached_documents?: Json | null
          case_id: string
          completed_at?: string | null
          director_guidance?: string | null
          executive_commentary?: string | null
          id?: string
          instructions?: string | null
          manager_instructions?: string | null
          metadata?: Json | null
          secretary_advice?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          assigned_at?: string | null
          assigned_by?: string
          assigned_by_name?: string | null
          assigned_to?: string
          assigned_to_name?: string | null
          assignment_type?: string | null
          attached_documents?: Json | null
          case_id?: string
          completed_at?: string | null
          director_guidance?: string | null
          executive_commentary?: string | null
          id?: string
          instructions?: string | null
          manager_instructions?: string | null
          metadata?: Json | null
          secretary_advice?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_case_comments: {
        Row: {
          attachments: Json | null
          case_id: string
          comment: string
          comment_type: string | null
          created_at: string | null
          edited: boolean | null
          id: string
          is_private: boolean | null
          officer_role: string | null
          parent_comment_id: string | null
          requires_response: boolean | null
          responded_to: boolean | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
          workflow_stage: string | null
        }
        Insert: {
          attachments?: Json | null
          case_id: string
          comment: string
          comment_type?: string | null
          created_at?: string | null
          edited?: boolean | null
          id?: string
          is_private?: boolean | null
          officer_role?: string | null
          parent_comment_id?: string | null
          requires_response?: boolean | null
          responded_to?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
          workflow_stage?: string | null
        }
        Update: {
          attachments?: Json | null
          case_id?: string
          comment?: string
          comment_type?: string | null
          created_at?: string | null
          edited?: boolean | null
          id?: string
          is_private?: boolean | null
          officer_role?: string | null
          parent_comment_id?: string | null
          requires_response?: boolean | null
          responded_to?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "legal_case_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_case_history: {
        Row: {
          action: string
          case_id: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          case_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          case_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_cases: {
        Row: {
          allegations: string | null
          assigned_officer_id: string | null
          assignment_footnote: string | null
          case_number: string
          case_type: string | null
          court_documents_type: string | null
          court_file_number: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          division_responsible: string | null
          dlpp_action_officer: string | null
          dlpp_role: string | null
          documents_served_date: string | null
          id: string
          land_description: string | null
          lease_commencement_date: string | null
          lease_expiration_date: string | null
          lease_type: string | null
          matter_type: string | null
          officer_assigned_date: string | null
          opposing_lawyer_name: string | null
          parties_description: string | null
          priority: string | null
          proceeding_filed_date: string | null
          region: string | null
          reliefs_sought: string | null
          returnable_date: string | null
          returnable_type: string | null
          section5_notice: boolean | null
          sol_gen_officer: string | null
          status: string | null
          survey_plan_no: string | null
          title: string
          track_number: string | null
          updated_at: string | null
          zoning: string | null
        }
        Insert: {
          allegations?: string | null
          assigned_officer_id?: string | null
          assignment_footnote?: string | null
          case_number: string
          case_type?: string | null
          court_documents_type?: string | null
          court_file_number?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          division_responsible?: string | null
          dlpp_action_officer?: string | null
          dlpp_role?: string | null
          documents_served_date?: string | null
          id?: string
          land_description?: string | null
          lease_commencement_date?: string | null
          lease_expiration_date?: string | null
          lease_type?: string | null
          matter_type?: string | null
          officer_assigned_date?: string | null
          opposing_lawyer_name?: string | null
          parties_description?: string | null
          priority?: string | null
          proceeding_filed_date?: string | null
          region?: string | null
          reliefs_sought?: string | null
          returnable_date?: string | null
          returnable_type?: string | null
          section5_notice?: boolean | null
          sol_gen_officer?: string | null
          status?: string | null
          survey_plan_no?: string | null
          title: string
          track_number?: string | null
          updated_at?: string | null
          zoning?: string | null
        }
        Update: {
          allegations?: string | null
          assigned_officer_id?: string | null
          assignment_footnote?: string | null
          case_number?: string
          case_type?: string | null
          court_documents_type?: string | null
          court_file_number?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          division_responsible?: string | null
          dlpp_action_officer?: string | null
          dlpp_role?: string | null
          documents_served_date?: string | null
          id?: string
          land_description?: string | null
          lease_commencement_date?: string | null
          lease_expiration_date?: string | null
          lease_type?: string | null
          matter_type?: string | null
          officer_assigned_date?: string | null
          opposing_lawyer_name?: string | null
          parties_description?: string | null
          priority?: string | null
          proceeding_filed_date?: string | null
          region?: string | null
          reliefs_sought?: string | null
          returnable_date?: string | null
          returnable_type?: string | null
          section5_notice?: boolean | null
          sol_gen_officer?: string | null
          status?: string | null
          survey_plan_no?: string | null
          title?: string
          track_number?: string | null
          updated_at?: string | null
          zoning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_officer_id_fkey"
            columns: ["assigned_officer_id"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          case_id: string
          description: string | null
          document_type: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          case_id: string
          description?: string | null
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          case_id?: string
          description?: string | null
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_events: {
        Row: {
          auto_created: boolean | null
          case_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          reminder_sent: boolean | null
          title: string
        }
        Insert: {
          auto_created?: boolean | null
          case_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          reminder_sent?: boolean | null
          title: string
        }
        Update: {
          auto_created?: boolean | null
          case_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          reminder_sent?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_executive_workflow: {
        Row: {
          action_taken: string | null
          advice: string | null
          case_id: string
          case_summary: string | null
          commentary: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          instructions: string | null
          is_new_case: boolean | null
          metadata: Json | null
          officer_id: string | null
          officer_name: string | null
          officer_role: string
          recommendations: string | null
          stage: string
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          advice?: string | null
          case_id: string
          case_summary?: string | null
          commentary?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_new_case?: boolean | null
          metadata?: Json | null
          officer_id?: string | null
          officer_name?: string | null
          officer_role: string
          recommendations?: string | null
          stage: string
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          advice?: string | null
          case_id?: string
          case_summary?: string | null
          commentary?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_new_case?: boolean | null
          metadata?: Json | null
          officer_id?: string | null
          officer_name?: string | null
          officer_role?: string
          recommendations?: string | null
          stage?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_workflow_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_workflow_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_group_module_access: {
        Row: {
          can_admin: boolean | null
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          granted_at: string | null
          granted_by: string | null
          group_id: string
          id: string
          module_id: string
        }
        Insert: {
          can_admin?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          group_id: string
          id?: string
          module_id: string
        }
        Update: {
          can_admin?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          group_id?: string
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_module_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_module_access_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "legal_user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_module_access_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "legal_system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_land_parcels: {
        Row: {
          area_sqm: number | null
          case_id: string
          coordinates: Json | null
          created_at: string | null
          id: string
          location: string | null
          notes: string | null
          parcel_number: string
          survey_plan_url: string | null
        }
        Insert: {
          area_sqm?: number | null
          case_id: string
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          parcel_number: string
          survey_plan_url?: string | null
        }
        Update: {
          area_sqm?: number | null
          case_id?: string
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          parcel_number?: string
          survey_plan_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "land_parcels_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_notifications: {
        Row: {
          action_required: boolean | null
          action_url: string | null
          case_id: string | null
          case_summary: string | null
          case_type: string | null
          court_reference: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_new_case: boolean | null
          message: string
          metadata: Json | null
          officer_role: string | null
          priority: string | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
          workflow_stage: string | null
        }
        Insert: {
          action_required?: boolean | null
          action_url?: string | null
          case_id?: string | null
          case_summary?: string | null
          case_type?: string | null
          court_reference?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_new_case?: boolean | null
          message: string
          metadata?: Json | null
          officer_role?: string | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
          workflow_stage?: string | null
        }
        Update: {
          action_required?: boolean | null
          action_url?: string | null
          case_id?: string | null
          case_summary?: string | null
          case_type?: string | null
          court_reference?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_new_case?: boolean | null
          message?: string
          metadata?: Json | null
          officer_role?: string | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_parties: {
        Row: {
          case_id: string
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          party_type: string | null
          role: string | null
        }
        Insert: {
          case_id: string
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          party_type?: string | null
          role?: string | null
        }
        Update: {
          case_id?: string
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          party_type?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parties_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          permission_code: string
          permission_name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          permission_code: string
          permission_name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          permission_code?: string
          permission_name?: string
        }
        Relationships: []
      }
      legal_planning_requests: {
        Row: {
          application_id: string | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          completed_at: string | null
          contact_person_email: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          created_at: string | null
          days_remaining: number | null
          description: string | null
          direction: string | null
          division_reference: string | null
          due_date: string | null
          findings: string | null
          id: string
          is_overdue: boolean | null
          last_updated_by: string | null
          legal_case_id: string | null
          legal_case_number: string | null
          legal_division_ref: string | null
          legal_officer_email: string | null
          legal_officer_name: string | null
          legal_officer_phone: string | null
          parcel_id: string | null
          received_at: string | null
          receiving_division: string | null
          recommendations: string | null
          request_number: string
          request_type: string
          requesting_division: string | null
          response_summary: string | null
          sla_days: number | null
          status: string | null
          subject: string
          submitted_date: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          application_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          created_at?: string | null
          days_remaining?: number | null
          description?: string | null
          direction?: string | null
          division_reference?: string | null
          due_date?: string | null
          findings?: string | null
          id?: string
          is_overdue?: boolean | null
          last_updated_by?: string | null
          legal_case_id?: string | null
          legal_case_number?: string | null
          legal_division_ref?: string | null
          legal_officer_email?: string | null
          legal_officer_name?: string | null
          legal_officer_phone?: string | null
          parcel_id?: string | null
          received_at?: string | null
          receiving_division?: string | null
          recommendations?: string | null
          request_number: string
          request_type: string
          requesting_division?: string | null
          response_summary?: string | null
          sla_days?: number | null
          status?: string | null
          subject: string
          submitted_date?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          application_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          created_at?: string | null
          days_remaining?: number | null
          description?: string | null
          direction?: string | null
          division_reference?: string | null
          due_date?: string | null
          findings?: string | null
          id?: string
          is_overdue?: boolean | null
          last_updated_by?: string | null
          legal_case_id?: string | null
          legal_case_number?: string | null
          legal_division_ref?: string | null
          legal_officer_email?: string | null
          legal_officer_name?: string | null
          legal_officer_phone?: string | null
          parcel_id?: string | null
          received_at?: string | null
          receiving_division?: string | null
          recommendations?: string | null
          request_number?: string
          request_type?: string
          requesting_division?: string | null
          response_summary?: string | null
          sla_days?: number | null
          status?: string | null
          subject?: string
          submitted_date?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_planning_requests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "development_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_planning_requests_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_planning_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_planning_requests_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_rbac_audit_log: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rbac_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_request_activity: {
        Row: {
          activity_type: string
          comment: string | null
          created_at: string | null
          id: string
          new_value: string | null
          old_value: string | null
          request_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          comment?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          request_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          request_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_request_activity_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_planning_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_request_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_request_documents: {
        Row: {
          direction: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          request_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          direction?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          request_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          direction?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          request_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_planning_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_request_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_system_modules: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          module_code: string
          module_name: string
          module_url: string | null
          parent_module_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_code: string
          module_name: string
          module_url?: string | null
          parent_module_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_code?: string
          module_name?: string
          module_url?: string | null
          parent_module_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_modules_parent_module_id_fkey"
            columns: ["parent_module_id"]
            isOneToOne: false
            referencedRelation: "legal_system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_tasks: {
        Row: {
          assigned_to: string | null
          case_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_user_group_membership: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          group_id: string
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          group_id: string
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          group_id?: string
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_group_membership_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_group_membership_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "legal_user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_group_membership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_user_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          group_code: string
          group_name: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_code: string
          group_name: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_code?: string
          group_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_memos: {
        Row: {
          attached_order_id: string | null
          case_id: string
          content: string
          created_at: string | null
          due_date: string | null
          id: string
          issued_by: string
          issued_date: string | null
          issued_to_division: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          attached_order_id?: string | null
          case_id: string
          content: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          issued_by: string
          issued_date?: string | null
          issued_to_division: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          attached_order_id?: string | null
          case_id?: string
          content?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          issued_by?: string
          issued_date?: string | null
          issued_to_division?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_memos_attached_order_id_fkey"
            columns: ["attached_order_id"]
            isOneToOne: false
            referencedRelation: "case_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_memos_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_reassignments: {
        Row: {
          assigned_by: string | null
          assigned_to: string
          assignment_date: string
          case_id: string
          created_at: string | null
          created_by: string | null
          id: string
          is_current: boolean | null
          notes: string | null
          previous_officer: string | null
          reassignment_number: number
          reassignment_reason: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to: string
          assignment_date: string
          case_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          previous_officer?: string | null
          reassignment_number?: number
          reassignment_reason?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string
          assignment_date?: string
          case_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          previous_officer?: string | null
          reassignment_number?: number
          reassignment_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_reassignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_workload: {
        Row: {
          active_applications: number | null
          active_inspections: number | null
          active_requests: number | null
          avg_completion_days: number | null
          id: string
          is_available: boolean | null
          last_calculated_at: string | null
          max_concurrent_requests: number | null
          officer_id: string | null
          planning_area: string | null
          requests_completed_this_month: number | null
          requests_overdue: number | null
        }
        Insert: {
          active_applications?: number | null
          active_inspections?: number | null
          active_requests?: number | null
          avg_completion_days?: number | null
          id?: string
          is_available?: boolean | null
          last_calculated_at?: string | null
          max_concurrent_requests?: number | null
          officer_id?: string | null
          planning_area?: string | null
          requests_completed_this_month?: number | null
          requests_overdue?: number | null
        }
        Update: {
          active_applications?: number | null
          active_inspections?: number | null
          active_requests?: number | null
          avg_completion_days?: number | null
          id?: string
          is_available?: boolean | null
          last_calculated_at?: string | null
          max_concurrent_requests?: number | null
          officer_id?: string | null
          planning_area?: string | null
          requests_completed_this_month?: number | null
          requests_overdue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_workload_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parcel_fabric: {
        Row: {
          change_note: string | null
          change_type: string | null
          created_at: string | null
          effective_from: string
          effective_to: string | null
          geom: unknown
          id: string
          metadata: Json | null
          parcel_id: string
          source_plan_id: string | null
          version: number
        }
        Insert: {
          change_note?: string | null
          change_type?: string | null
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          geom: unknown
          id?: string
          metadata?: Json | null
          parcel_id: string
          source_plan_id?: string | null
          version: number
        }
        Update: {
          change_note?: string | null
          change_type?: string | null
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          geom?: unknown
          id?: string
          metadata?: Json | null
          parcel_id?: string
          source_plan_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcel_fabric_source_plan_id_fkey"
            columns: ["source_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          case_id: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          party_type: string
          role: string
        }
        Insert: {
          case_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          party_type: string
          role: string
        }
        Update: {
          case_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          party_type?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "parties_case_id_fkey1"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          org_unit_id: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          org_unit_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          org_unit_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      planning_submissions: {
        Row: {
          applicant_contact: string | null
          applicant_name: string
          application_type: string | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          district: string | null
          id: string
          land_use_category: string | null
          priority: string | null
          processed_at: string | null
          province: string | null
          sla_due_date: string | null
          status: string | null
          submission_number: string
          submitted_at: string | null
          title: string
          updated_at: string | null
          zoning_classification: string | null
        }
        Insert: {
          applicant_contact?: string | null
          applicant_name: string
          application_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          land_use_category?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number: string
          submitted_at?: string | null
          title: string
          updated_at?: string | null
          zoning_classification?: string | null
        }
        Update: {
          applicant_contact?: string | null
          applicant_name?: string
          application_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          land_use_category?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
          zoning_classification?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          digital_signature: string | null
          endorsed_by: string | null
          endorsement_date: string | null
          id: string
          is_immutable: boolean | null
          metadata: Json | null
          plan_no: string | null
          plan_pdf_url: string | null
          sheet_count: number | null
          status: string | null
          survey_job_id: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          digital_signature?: string | null
          endorsed_by?: string | null
          endorsement_date?: string | null
          id?: string
          is_immutable?: boolean | null
          metadata?: Json | null
          plan_no?: string | null
          plan_pdf_url?: string | null
          sheet_count?: number | null
          status?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          digital_signature?: string | null
          endorsed_by?: string | null
          endorsement_date?: string | null
          id?: string
          is_immutable?: boolean | null
          metadata?: Json | null
          plan_no?: string | null
          plan_pdf_url?: string | null
          sheet_count?: number | null
          status?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "surveyors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_endorsed_by_fkey"
            columns: ["endorsed_by"]
            isOneToOne: false
            referencedRelation: "surveyors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_survey_job_id_fkey"
            columns: ["survey_job_id"]
            isOneToOne: false
            referencedRelation: "survey_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_runs: {
        Row: {
          accuracy_class_id: string | null
          control_set: Json | null
          created_at: string | null
          created_by: string | null
          crs_id: string | null
          id: string
          qa_status: string | null
          report_url: string | null
          residuals: Json | null
          review_date: string | null
          review_notes: string | null
          reviewer_id: string | null
          survey_job_id: string | null
          updated_at: string | null
        }
        Insert: {
          accuracy_class_id?: string | null
          control_set?: Json | null
          created_at?: string | null
          created_by?: string | null
          crs_id?: string | null
          id?: string
          qa_status?: string | null
          report_url?: string | null
          residuals?: Json | null
          review_date?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accuracy_class_id?: string | null
          control_set?: Json | null
          created_at?: string | null
          created_by?: string | null
          crs_id?: string | null
          id?: string
          qa_status?: string | null
          report_url?: string | null
          residuals?: Json | null
          review_date?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_runs_accuracy_class_id_fkey"
            columns: ["accuracy_class_id"]
            isOneToOne: false
            referencedRelation: "accuracy_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_runs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "surveyors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_runs_crs_id_fkey"
            columns: ["crs_id"]
            isOneToOne: false
            referencedRelation: "crs_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_runs_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "surveyors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_runs_survey_job_id_fkey"
            columns: ["survey_job_id"]
            isOneToOne: false
            referencedRelation: "survey_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      program: {
        Row: {
          created_at: string | null
          description: string | null
          division_id: number | null
          is_active: boolean | null
          main_program_name: string
          program_id: number
          program_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          division_id?: number | null
          is_active?: boolean | null
          main_program_name: string
          program_id?: number
          program_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          division_id?: number | null
          is_active?: boolean | null
          main_program_name?: string
          program_id?: number
          program_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      site_inspections: {
        Row: {
          completed_date: string | null
          compliance_status: string | null
          created_at: string | null
          findings: string | null
          id: string
          inspection_number: string
          inspection_type: string | null
          purpose: string
          recommendations: string | null
          scheduled_date: string | null
          site_address: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          compliance_status?: string | null
          created_at?: string | null
          findings?: string | null
          id?: string
          inspection_number: string
          inspection_type?: string | null
          purpose: string
          recommendations?: string | null
          scheduled_date?: string | null
          site_address?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          compliance_status?: string | null
          created_at?: string | null
          findings?: string | null
          id?: string
          inspection_number?: string
          inspection_type?: string | null
          purpose?: string
          recommendations?: string | null
          scheduled_date?: string | null
          site_address?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solicitor_general_updates: {
        Row: {
          captured_by: string | null
          case_id: string
          created_at: string | null
          document_id: string | null
          id: string
          next_steps: string | null
          received_date: string | null
          received_from: string
          summary_of_advice: string
        }
        Insert: {
          captured_by?: string | null
          case_id: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          next_steps?: string | null
          received_date?: string | null
          received_from: string
          summary_of_advice: string
        }
        Update: {
          captured_by?: string | null
          case_id?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          next_steps?: string | null
          received_date?: string | null
          received_from?: string
          summary_of_advice?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitor_general_updates_captured_by_fkey"
            columns: ["captured_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitor_general_updates_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "case_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_evidence: {
        Row: {
          accuracy_meters: number | null
          captured_at: string | null
          captured_by: string | null
          created_at: string | null
          description: string | null
          device_info: Json | null
          evidence_type: string | null
          id: string
          inspection_id: string | null
          latitude: number | null
          longitude: number | null
          parcel_id: string | null
          photo_thumbnail_url: string | null
          photo_url: string | null
          request_id: string | null
        }
        Insert: {
          accuracy_meters?: number | null
          captured_at?: string | null
          captured_by?: string | null
          created_at?: string | null
          description?: string | null
          device_info?: Json | null
          evidence_type?: string | null
          id?: string
          inspection_id?: string | null
          latitude?: number | null
          longitude?: number | null
          parcel_id?: string | null
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          request_id?: string | null
        }
        Update: {
          accuracy_meters?: number | null
          captured_at?: string | null
          captured_by?: string | null
          created_at?: string | null
          description?: string | null
          device_info?: Json | null
          evidence_type?: string | null
          id?: string
          inspection_id?: string | null
          latitude?: number | null
          longitude?: number | null
          parcel_id?: string | null
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spatial_evidence_captured_by_fkey"
            columns: ["captured_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spatial_evidence_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_planning_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_layers: {
        Row: {
          created_at: string | null
          default_visible: boolean | null
          description: string | null
          display_order: number | null
          geojson_url: string | null
          id: string
          is_active: boolean | null
          layer_name: string
          layer_type: string | null
          style_config: Json | null
          tile_url: string | null
          updated_at: string | null
          wms_url: string | null
        }
        Insert: {
          created_at?: string | null
          default_visible?: boolean | null
          description?: string | null
          display_order?: number | null
          geojson_url?: string | null
          id?: string
          is_active?: boolean | null
          layer_name: string
          layer_type?: string | null
          style_config?: Json | null
          tile_url?: string | null
          updated_at?: string | null
          wms_url?: string | null
        }
        Update: {
          created_at?: string | null
          default_visible?: boolean | null
          description?: string | null
          display_order?: number | null
          geojson_url?: string | null
          id?: string
          is_active?: boolean | null
          layer_name?: string
          layer_type?: string | null
          style_config?: Json | null
          tile_url?: string | null
          updated_at?: string | null
          wms_url?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      state_submissions: {
        Row: {
          allotment_number: string | null
          applicant_contact: string | null
          applicant_name: string
          assigned_to: string | null
          created_at: string | null
          description: string | null
          district: string | null
          id: string
          land_portion: string | null
          lease_type: string | null
          priority: string | null
          processed_at: string | null
          province: string | null
          sla_due_date: string | null
          status: string | null
          submission_number: string
          submitted_at: string | null
          title: string
          transaction_type: string | null
          updated_at: string | null
        }
        Insert: {
          allotment_number?: string | null
          applicant_contact?: string | null
          applicant_name: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          land_portion?: string | null
          lease_type?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number: string
          submitted_at?: string | null
          title: string
          transaction_type?: string | null
          updated_at?: string | null
        }
        Update: {
          allotment_number?: string | null
          applicant_contact?: string | null
          applicant_name?: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          land_portion?: string | null
          lease_type?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number?: string
          submitted_at?: string | null
          title?: string
          transaction_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      survey_jobs: {
        Row: {
          assigned_date: string | null
          assigned_to: string | null
          case_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          job_number: string
          job_type_id: string | null
          location_description: string | null
          lrc_ref: string | null
          metadata: Json | null
          priority: string | null
          purpose: string
          request_source: string
          site_geom: unknown
          sla_due: string | null
          status: string | null
          title_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          assigned_to?: string | null
          case_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_number: string
          job_type_id?: string | null
          location_description?: string | null
          lrc_ref?: string | null
          metadata?: Json | null
          priority?: string | null
          purpose: string
          request_source: string
          site_geom?: unknown
          sla_due?: string | null
          status?: string | null
          title_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          assigned_to?: string | null
          case_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_number?: string
          job_type_id?: string | null
          location_description?: string | null
          lrc_ref?: string | null
          metadata?: Json | null
          priority?: string | null
          purpose?: string
          request_source?: string
          site_geom?: unknown
          sla_due?: string | null
          status?: string | null
          title_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "surveyors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_jobs_job_type_id_fkey"
            columns: ["job_type_id"]
            isOneToOne: false
            referencedRelation: "job_types"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_statuses: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      survey_submissions: {
        Row: {
          applicant_contact: string | null
          applicant_name: string
          assigned_to: string | null
          created_at: string | null
          description: string | null
          district: string | null
          id: string
          land_parcel_id: string | null
          priority: string | null
          processed_at: string | null
          province: string | null
          sla_due_date: string | null
          status: string | null
          submission_number: string
          submitted_at: string | null
          survey_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          applicant_contact?: string | null
          applicant_name: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          land_parcel_id?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number: string
          submitted_at?: string | null
          survey_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          applicant_contact?: string | null
          applicant_name?: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          land_parcel_id?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number?: string
          submitted_at?: string | null
          survey_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      surveyors: {
        Row: {
          company: string | null
          competencies: Json | null
          conflict_declarations: Json | null
          cpd_hours: number | null
          created_at: string | null
          email: string
          entra_id: string | null
          id: string
          license_expiry: string | null
          license_no: string | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          competencies?: Json | null
          conflict_declarations?: Json | null
          cpd_hours?: number | null
          created_at?: string | null
          email: string
          entra_id?: string | null
          id?: string
          license_expiry?: string | null
          license_no?: string | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          competencies?: Json | null
          conflict_declarations?: Json | null
          cpd_hours?: number | null
          created_at?: string | null
          email?: string
          entra_id?: string | null
          id?: string
          license_expiry?: string | null
          license_no?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      system_cleanup_tasks: {
        Row: {
          command: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          last_run: string | null
          name: string
          next_run: string | null
          schedule: string | null
          space_recovered: number | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          command?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          last_run?: string | null
          name: string
          next_run?: string | null
          schedule?: string | null
          space_recovered?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          command?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          last_run?: string | null
          name?: string
          next_run?: string | null
          schedule?: string | null
          space_recovered?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_maintenance_logs: {
        Row: {
          action: string
          created_at: string | null
          created_by: string | null
          details: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          space_recovered: number | null
          status: string
          task_id: string | null
          task_name: string
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          space_recovered?: number | null
          status: string
          task_id?: string | null
          task_name: string
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          space_recovered?: number | null
          status?: string
          task_id?: string | null
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_maintenance_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "system_cleanup_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      system_scheduled_tasks: {
        Row: {
          command: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_run: string | null
          last_status: string | null
          name: string
          next_run: string | null
          schedule: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          command: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_run?: string | null
          last_status?: string | null
          name: string
          next_run?: string | null
          schedule: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          command?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_run?: string | null
          last_status?: string | null
          name?: string
          next_run?: string | null
          schedule?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          key: string
          modified_by: string | null
          type: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key: string
          modified_by?: string | null
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key?: string
          modified_by?: string | null
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      system_submissions: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          request_type: string | null
          requester_department: string | null
          requester_name: string
          resolved_at: string | null
          sla_due_date: string | null
          status: string | null
          submitted_at: string | null
          system_affected: string | null
          ticket_number: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          request_type?: string | null
          requester_department?: string | null
          requester_name: string
          resolved_at?: string | null
          sla_due_date?: string | null
          status?: string | null
          submitted_at?: string | null
          system_affected?: string | null
          ticket_number: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          request_type?: string | null
          requester_department?: string | null
          requester_name?: string
          resolved_at?: string | null
          sla_due_date?: string | null
          status?: string | null
          submitted_at?: string | null
          system_affected?: string | null
          ticket_number?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event: string
          id: string
          payload: Json | null
          response_status: number | null
          response_time_ms: number | null
          success: boolean | null
          webhook_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event: string
          id?: string
          payload?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          success?: boolean | null
          webhook_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event?: string
          id?: string
          payload?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          success?: boolean | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "system_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      system_webhooks: {
        Row: {
          created_at: string | null
          created_by: string | null
          events: string[] | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_status: string | null
          last_triggered: string | null
          name: string
          retry_count: number | null
          retry_delay: number | null
          secret: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: string | null
          last_triggered?: string | null
          name: string
          retry_count?: number | null
          retry_delay?: number | null
          secret?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: string | null
          last_triggered?: string | null
          name?: string
          retry_count?: number | null
          retry_delay?: number | null
          secret?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          case_id: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_case_id_fkey1"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      titles_submissions: {
        Row: {
          applicant_contact: string | null
          applicant_name: string
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          instrument_type: string | null
          priority: string | null
          processed_at: string | null
          province: string | null
          registration_type: string | null
          sla_due_date: string | null
          status: string | null
          submission_number: string
          submitted_at: string | null
          title: string
          title_reference: string | null
          updated_at: string | null
          volume_folio: string | null
        }
        Insert: {
          applicant_contact?: string | null
          applicant_name: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instrument_type?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          registration_type?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number: string
          submitted_at?: string | null
          title: string
          title_reference?: string | null
          updated_at?: string | null
          volume_folio?: string | null
        }
        Update: {
          applicant_contact?: string | null
          applicant_name?: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instrument_type?: string | null
          priority?: string | null
          processed_at?: string | null
          province?: string | null
          registration_type?: string | null
          sla_due_date?: string | null
          status?: string | null
          submission_number?: string
          submitted_at?: string | null
          title?: string
          title_reference?: string | null
          updated_at?: string | null
          volume_folio?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approval_limit: number | null
          cost_centre_id: number | null
          created_at: string | null
          id: number
          is_active: boolean | null
          role_id: number
          user_id: string
        }
        Insert: {
          approval_limit?: number | null
          cost_centre_id?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          role_id: number
          user_id: string
        }
        Update: {
          approval_limit?: number | null
          cost_centre_id?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          role_id?: number
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          checklist: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          instruments: Json | null
          safety_notes: string | null
          schedule_end: string | null
          schedule_start: string | null
          scope: string
          site_access: string | null
          status: string | null
          survey_job_id: string | null
          updated_at: string | null
          vehicle: string | null
        }
        Insert: {
          checklist?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instruments?: Json | null
          safety_notes?: string | null
          schedule_end?: string | null
          schedule_start?: string | null
          scope: string
          site_access?: string | null
          status?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
          vehicle?: string | null
        }
        Update: {
          checklist?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instruments?: Json | null
          safety_notes?: string | null
          schedule_end?: string | null
          schedule_start?: string | null
          scope?: string
          site_access?: string | null
          status?: string | null
          survey_job_id?: string | null
          updated_at?: string | null
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_survey_job_id_fkey"
            columns: ["survey_job_id"]
            isOneToOne: false
            referencedRelation: "survey_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      workpapers: {
        Row: {
          created_at: string | null
          created_by: string | null
          engagement_id: string | null
          id: string
          metadata: Json | null
          procedure: string | null
          sample_ref: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          engagement_id?: string | null
          id?: string
          metadata?: Json | null
          procedure?: string | null
          sample_ref?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          engagement_id?: string | null
          id?: string
          metadata?: Json | null
          procedure?: string | null
          sample_ref?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workpapers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workpapers_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      zoning_districts: {
        Row: {
          area_sqm: number | null
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          geojson: Json | null
          id: string
          name: string
          regulations: Json | null
          updated_at: string | null
        }
        Insert: {
          area_sqm?: number | null
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          geojson?: Json | null
          id?: string
          name: string
          regulations?: Json | null
          updated_at?: string | null
        }
        Update: {
          area_sqm?: number | null
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          geojson?: Json | null
          id?: string
          name?: string
          regulations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_leases_summary: {
        Row: {
          annual_rent: number | null
          area_hectares: number | null
          effective_annual_rent: number | null
          end_date: string | null
          id: string | null
          lease_number: string | null
          lease_type:
            | "business_commercial"
            | "business_industrial"
            | "residential_high"
            | "residential_medium"
            | "residential_low"
            | "agricultural"
            | "pastoral"
            | "mission"
            | "special_purpose"
            | "urban_development"
            | "renewal"
            | "subdivision"
            | "consolidation"
            | "license"
            | "rent_reduction"
            | null
          parcel_name: string | null
          parcel_number: string | null
          province_name: string | null
          rent_reduction_percentage: number | null
          start_date: string | null
          status:
            | "active"
            | "expired"
            | "terminated"
            | "pending_renewal"
            | "forfeited"
            | null
          years_remaining: number | null
        }
        Relationships: []
      }
      application_summary: {
        Row: {
          applicant_name: string | null
          application_number: string | null
          application_type:
            | "business_commercial"
            | "business_industrial"
            | "residential_high"
            | "residential_medium"
            | "residential_low"
            | "agricultural"
            | "pastoral"
            | "mission"
            | "special_purpose"
            | "urban_development"
            | "renewal"
            | "subdivision"
            | "consolidation"
            | "license"
            | "rent_reduction"
            | null
          area_requested: number | null
          created_at: string | null
          email: string | null
          estimated_development_value: number | null
          id: string | null
          parcel_name: string | null
          parcel_number: string | null
          province_name: string | null
          status:
            | "draft"
            | "submitted"
            | "under_review"
            | "pending_land_board"
            | "approved"
            | "rejected"
            | "on_hold"
            | "requires_revision"
            | null
          submitted_at: string | null
        }
        Relationships: []
      }
      audit_risk_engagement_summary: {
        Row: {
          engagement_count: number | null
          finding_count: number | null
          last_audit_date: string | null
          residual_risk_rating: string | null
          risk_code: string | null
          risk_id: string | null
          risk_title: string | null
        }
        Relationships: []
      }
      audit_risk_event_summary: {
        Row: {
          category_code: string | null
          category_name: string | null
          created_at: string | null
          engagement_count: number | null
          event_code: string | null
          event_status: string | null
          event_title: string | null
          financial_year: number | null
          id: string | null
          lead_auditor: string | null
          priority: string | null
          residual_risk_rating: string | null
          response_type: string | null
          risk_code: string | null
          risk_title: string | null
          source_type: string | null
          target_division: string | null
          task_count: number | null
        }
        Relationships: []
      }
      case_assignment_status: {
        Row: {
          acknowledged_at: string | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_by_name: string | null
          assigned_to: string | null
          assigned_to_name: string | null
          assigned_to_role: string | null
          assignment_id: string | null
          assignment_type: string | null
          case_id: string | null
          case_number: string | null
          days_since_assignment: number | null
          status: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_statistics: {
        Row: {
          active_leases: number | null
          applications_this_month: number | null
          approved_applications: number | null
          available_parcels: number | null
          expiring_soon: number | null
          pending_review: number | null
          total_annual_revenue: number | null
          total_applications: number | null
        }
        Relationships: []
      }
      executive_workflow_summary: {
        Row: {
          case_id: string | null
          case_number: string | null
          completed_reviews: number | null
          court_file_number: string | null
          is_assigned: boolean | null
          is_new_case: boolean | null
          latest_activity: string | null
          pending_reviews: number | null
          title: string | null
          workflow_entries: number | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_workflow_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      land_parcels_view: {
        Row: {
          area_hectares: number | null
          area_sqm: number | null
          boundaries: unknown
          coordinates: unknown
          created_at: string | null
          district: string | null
          id: string | null
          last_survey_date: string | null
          location_description: string | null
          name: string | null
          notes: string | null
          parcel_number: string | null
          parcel_type:
            | "business_commercial"
            | "business_industrial"
            | "residential_high"
            | "residential_medium"
            | "residential_low"
            | "agricultural"
            | "pastoral"
            | "mission"
            | "special_purpose"
            | "urban_development"
            | "renewal"
            | "subdivision"
            | "consolidation"
            | "license"
            | "rent_reduction"
            | null
          province_id: number | null
          province_name: string | null
          status:
            | "available"
            | "leased"
            | "reserved"
            | "under_review"
            | "unavailable"
            | null
          updated_at: string | null
          valuation_amount: number | null
          valuation_date: string | null
        }
        Relationships: []
      }
      monthly_application_stats: {
        Row: {
          approved: number | null
          month: string | null
          pending: number | null
          rejected: number | null
          total_applications: number | null
          total_estimated_value: number | null
        }
        Relationships: []
      }
      pending_executive_reviews: {
        Row: {
          case_id: string | null
          case_number: string | null
          case_summary: string | null
          court_file_number: string | null
          created_at: string | null
          days_pending: number | null
          is_new_case: boolean | null
          officer_id: string | null
          officer_name: string | null
          officer_role: string | null
          stage: string | null
          title: string | null
          workflow_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_workflow_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_workflow_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "legal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces_view: {
        Row: {
          code: string | null
          created_at: string | null
          id: number | null
          name: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: number | null
          name?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: number | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      add_officer_reassignment: {
        Args: {
          p_assigned_by?: string
          p_assigned_to: string
          p_assignment_date: string
          p_case_id: string
          p_reassignment_reason?: string
        }
        Returns: string
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      check_returnable_date_alerts: {
        Args: never
        Returns: {
          case_id: string
          case_number: string
          days_until: number
          returnable_date: string
          title: string
        }[]
      }
      create_case_amendment: {
        Args: {
          p_amendment_reason: string
          p_amendment_type: string
          p_inherit_documents?: boolean
          p_inherit_land_parcels?: boolean
          p_inherit_parties?: boolean
          p_initiated_by: string
          p_new_court_reference: string
          p_new_court_type: string
          p_original_case_id: string
          p_original_court_ref_id: string
        }
        Returns: string
      }
      create_index_if_not_exists: {
        Args: {
          p_column_name: string
          p_index_name: string
          p_table_name: string
        }
        Returns: undefined
      }
      current_jwt_role: { Args: never; Returns: string }
      current_person: { Args: never; Returns: string }
      current_person_role: { Args: never; Returns: string }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_amendment_chain: {
        Args: { p_case_id: string }
        Returns: {
          amendment_date: string
          amendment_type: string
          case_id: string
          court_reference: string
          is_current: boolean
          level: number
        }[]
      }
      get_current_officer: { Args: { p_case_id: string }; Returns: string }
      get_executive_officers: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
          role: string
        }[]
      }
      get_inherited_documents: {
        Args: { p_case_id: string }
        Returns: {
          document_id: string
          document_title: string
          inheritance_type: string
          inherited_via_amendment_id: string
          original_case_id: string
          original_case_number: string
        }[]
      }
      get_land_parcels: {
        Args: never
        Returns: {
          area_hectares: number
          area_sqm: number
          boundaries: Json
          coordinates: Json
          created_at: string
          district: string
          id: string
          last_survey_date: string
          location_description: string
          name: string
          notes: string
          parcel_number: string
          parcel_type: string
          province_id: number
          status: string
          updated_at: string
          valuation_amount: number
          valuation_date: string
        }[]
      }
      get_reassignment_history: {
        Args: { p_case_id: string }
        Returns: {
          assigned_by: string
          assigned_to: string
          assignment_date: string
          is_current: boolean
          previous_officer: string
          reassignment_number: number
          reassignment_reason: string
        }[]
      }
      get_user_accessible_modules: {
        Args: { p_user_id: string }
        Returns: {
          can_admin: boolean
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          icon: string
          module_code: string
          module_id: string
          module_name: string
          module_url: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      initialize_executive_workflow: {
        Args: {
          p_case_id: string
          p_case_summary: string
          p_is_new_case: boolean
        }
        Returns: undefined
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      notify_executive_officers: {
        Args: {
          p_case_id: string
          p_case_number: string
          p_case_summary: string
          p_case_title: string
          p_court_reference: string
          p_created_by: string
          p_is_new_case: boolean
        }
        Returns: number
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      user_has_module_access: {
        Args: {
          p_module_code: string
          p_permission_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "error" | "critical"
      directive_status:
        | "issued"
        | "acknowledged"
        | "in_progress"
        | "completed"
        | "cancelled"
      priority_level: "low" | "medium" | "high" | "urgent" | "critical"
      submission_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "rejected"
        | "overdue"
        | "escalated"
        | "on_hold"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["info", "warning", "error", "critical"],
      directive_status: [
        "issued",
        "acknowledged",
        "in_progress",
        "completed",
        "cancelled",
      ],
      priority_level: ["low", "medium", "high", "urgent", "critical"],
      submission_status: [
        "pending",
        "in_progress",
        "completed",
        "rejected",
        "overdue",
        "escalated",
        "on_hold",
      ],
    },
  },
} as const
