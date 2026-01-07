export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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

export interface Database {
  public: {
    Tables: {
      // =============================================
      // RISK REGISTER TABLES (Authoritative Spine)
      // =============================================

      audit_risk_register: {
        Row: {
          id: string
          risk_code: string
          risk_title: string
          risk_description: string
          risk_category: RiskCategory
          risk_subcategory: string | null
          division_id: string | null
          section_id: string | null
          process_id: string | null
          inherent_likelihood: number
          inherent_impact: number
          inherent_risk_score: number
          inherent_risk_rating: RiskRating
          control_effectiveness: ControlEffectiveness | null
          control_description: string | null
          residual_likelihood: number | null
          residual_impact: number | null
          residual_risk_score: number
          residual_risk_rating: RiskRating
          risk_owner_role: string | null
          risk_owner_id: string | null
          oversight_body: OversightBody | null
          risk_status: RiskStatus
          identified_date: string | null
          last_reviewed_at: string | null
          next_review_due: string | null
          review_frequency: ReviewFrequency | null
          risk_treatment: RiskTreatment | null
          treatment_plan: string | null
          target_risk_rating: RiskRating | null
          tags: string[] | null
          notes: string | null
          is_system_risk: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_code: string
          risk_title: string
          risk_description: string
          risk_category: RiskCategory
          risk_subcategory?: string | null
          division_id?: string | null
          section_id?: string | null
          process_id?: string | null
          inherent_likelihood: number
          inherent_impact: number
          control_effectiveness?: ControlEffectiveness | null
          control_description?: string | null
          residual_likelihood?: number | null
          residual_impact?: number | null
          risk_owner_role?: string | null
          risk_owner_id?: string | null
          oversight_body?: OversightBody | null
          risk_status?: RiskStatus
          identified_date?: string | null
          last_reviewed_at?: string | null
          next_review_due?: string | null
          review_frequency?: ReviewFrequency | null
          risk_treatment?: RiskTreatment | null
          treatment_plan?: string | null
          target_risk_rating?: RiskRating | null
          tags?: string[] | null
          notes?: string | null
          is_system_risk?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_code?: string
          risk_title?: string
          risk_description?: string
          risk_category?: RiskCategory
          risk_subcategory?: string | null
          division_id?: string | null
          section_id?: string | null
          process_id?: string | null
          inherent_likelihood?: number
          inherent_impact?: number
          control_effectiveness?: ControlEffectiveness | null
          control_description?: string | null
          residual_likelihood?: number | null
          residual_impact?: number | null
          risk_owner_role?: string | null
          risk_owner_id?: string | null
          oversight_body?: OversightBody | null
          risk_status?: RiskStatus
          identified_date?: string | null
          last_reviewed_at?: string | null
          next_review_due?: string | null
          review_frequency?: ReviewFrequency | null
          risk_treatment?: RiskTreatment | null
          treatment_plan?: string | null
          target_risk_rating?: RiskRating | null
          tags?: string[] | null
          notes?: string | null
          is_system_risk?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      audit_risk_legal_references: {
        Row: {
          id: string
          risk_id: string
          legal_instrument_id: string
          section_reference: string | null
          compliance_type: ComplianceType
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          legal_instrument_id: string
          section_reference?: string | null
          compliance_type: ComplianceType
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          legal_instrument_id?: string
          section_reference?: string | null
          compliance_type?: ComplianceType
          notes?: string | null
          created_at?: string
        }
      }

      audit_risk_treatments: {
        Row: {
          id: string
          risk_id: string
          treatment_type: string
          description: string
          owner_id: string | null
          target_date: string | null
          actual_completion_date: string | null
          status: 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
          effectiveness_rating: ControlEffectiveness | null
          evidence_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          treatment_type: string
          description: string
          owner_id?: string | null
          target_date?: string | null
          actual_completion_date?: string | null
          status?: 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
          effectiveness_rating?: ControlEffectiveness | null
          evidence_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          treatment_type?: string
          description?: string
          owner_id?: string | null
          target_date?: string | null
          actual_completion_date?: string | null
          status?: 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
          effectiveness_rating?: ControlEffectiveness | null
          evidence_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      audit_risk_incidents: {
        Row: {
          id: string
          risk_id: string
          incident_date: string
          description: string
          impact_description: string | null
          financial_impact: number | null
          response_actions: string | null
          lessons_learned: string | null
          reported_by: string | null
          status: 'Open' | 'Investigating' | 'Resolved' | 'Closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          incident_date: string
          description: string
          impact_description?: string | null
          financial_impact?: number | null
          response_actions?: string | null
          lessons_learned?: string | null
          reported_by?: string | null
          status?: 'Open' | 'Investigating' | 'Resolved' | 'Closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          incident_date?: string
          description?: string
          impact_description?: string | null
          financial_impact?: number | null
          response_actions?: string | null
          lessons_learned?: string | null
          reported_by?: string | null
          status?: 'Open' | 'Investigating' | 'Resolved' | 'Closed'
          created_at?: string
          updated_at?: string
        }
      }

      audit_risk_indicators: {
        Row: {
          id: string
          risk_id: string
          indicator_name: string
          indicator_type: 'Leading' | 'Lagging' | 'Predictive' | null
          measurement_unit: string | null
          threshold_green: number | null
          threshold_amber: number | null
          threshold_red: number | null
          measurement_frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | null
          data_source: string | null
          owner_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          indicator_name: string
          indicator_type?: 'Leading' | 'Lagging' | 'Predictive' | null
          measurement_unit?: string | null
          threshold_green?: number | null
          threshold_amber?: number | null
          threshold_red?: number | null
          measurement_frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | null
          data_source?: string | null
          owner_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          indicator_name?: string
          indicator_type?: 'Leading' | 'Lagging' | 'Predictive' | null
          measurement_unit?: string | null
          threshold_green?: number | null
          threshold_amber?: number | null
          threshold_red?: number | null
          measurement_frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | null
          data_source?: string | null
          owner_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // =============================================
      // CENTRAL RISK EVENT REPOSITORY TABLES
      // =============================================

      audit_categories: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          workflow_type: 'Standard' | 'Expedited' | 'Investigation' | 'Follow-up'
          requires_fieldwork: boolean
          requires_management_response: boolean
          typical_duration_days: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          workflow_type?: 'Standard' | 'Expedited' | 'Investigation' | 'Follow-up'
          requires_fieldwork?: boolean
          requires_management_response?: boolean
          typical_duration_days?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          workflow_type?: 'Standard' | 'Expedited' | 'Investigation' | 'Follow-up'
          requires_fieldwork?: boolean
          requires_management_response?: boolean
          typical_duration_days?: number
          is_active?: boolean
          created_at?: string
        }
      }

      audit_risk_events: {
        Row: {
          id: string
          event_code: string
          event_title: string
          event_description: string
          source_type: 'AAAP' | 'Secretary' | 'External' | 'Internal'
          directive_reference: string | null
          directive_date: string | null
          directive_issuer: string | null
          is_priority_override: boolean
          primary_risk_id: string
          audit_category_id: string | null
          response_type: 'Audit' | 'Review' | 'Investigation' | 'Information Request'
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          requested_start_date: string | null
          requested_completion_date: string | null
          target_division_id: string | null
          target_section_id: string | null
          requesting_division_id: string | null
          requesting_officer_id: string | null
          event_status: 'Pending' | 'Under Review' | 'Approved' | 'Allocated' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' | 'Rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          rejection_reason: string | null
          allocated_by: string | null
          allocated_at: string | null
          lead_auditor_id: string | null
          financial_year: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_code?: string
          event_title: string
          event_description: string
          source_type: 'AAAP' | 'Secretary' | 'External' | 'Internal'
          directive_reference?: string | null
          directive_date?: string | null
          directive_issuer?: string | null
          is_priority_override?: boolean
          primary_risk_id: string
          audit_category_id?: string | null
          response_type?: 'Audit' | 'Review' | 'Investigation' | 'Information Request'
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          requested_start_date?: string | null
          requested_completion_date?: string | null
          target_division_id?: string | null
          target_section_id?: string | null
          requesting_division_id?: string | null
          requesting_officer_id?: string | null
          event_status?: 'Pending' | 'Under Review' | 'Approved' | 'Allocated' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' | 'Rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          rejection_reason?: string | null
          allocated_by?: string | null
          allocated_at?: string | null
          lead_auditor_id?: string | null
          financial_year?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_code?: string
          event_title?: string
          event_description?: string
          source_type?: 'AAAP' | 'Secretary' | 'External' | 'Internal'
          directive_reference?: string | null
          directive_date?: string | null
          directive_issuer?: string | null
          is_priority_override?: boolean
          primary_risk_id?: string
          audit_category_id?: string | null
          response_type?: 'Audit' | 'Review' | 'Investigation' | 'Information Request'
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          requested_start_date?: string | null
          requested_completion_date?: string | null
          target_division_id?: string | null
          target_section_id?: string | null
          requesting_division_id?: string | null
          requesting_officer_id?: string | null
          event_status?: 'Pending' | 'Under Review' | 'Approved' | 'Allocated' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' | 'Rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          rejection_reason?: string | null
          allocated_by?: string | null
          allocated_at?: string | null
          lead_auditor_id?: string | null
          financial_year?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      audit_risk_event_risks: {
        Row: {
          id: string
          risk_event_id: string
          risk_id: string
          is_primary: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          risk_event_id: string
          risk_id: string
          is_primary?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          risk_event_id?: string
          risk_id?: string
          is_primary?: boolean
          notes?: string | null
          created_at?: string
        }
      }

      audit_risk_event_documents: {
        Row: {
          id: string
          risk_event_id: string
          document_type: 'Secretary Directive' | 'Formal Request' | 'Supporting Document' | 'Risk Assessment' | 'Approval Memo' | 'Other'
          title: string
          description: string | null
          file_path: string | null
          file_name: string | null
          file_type: string | null
          file_size: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          risk_event_id: string
          document_type: 'Secretary Directive' | 'Formal Request' | 'Supporting Document' | 'Risk Assessment' | 'Approval Memo' | 'Other'
          title: string
          description?: string | null
          file_path?: string | null
          file_name?: string | null
          file_type?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          risk_event_id?: string
          document_type?: 'Secretary Directive' | 'Formal Request' | 'Supporting Document' | 'Risk Assessment' | 'Approval Memo' | 'Other'
          title?: string
          description?: string | null
          file_path?: string | null
          file_name?: string | null
          file_type?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
      }

      audit_risk_event_milestones: {
        Row: {
          id: string
          risk_event_id: string
          milestone_name: string
          planned_date: string
          actual_date: string | null
          status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_event_id: string
          milestone_name: string
          planned_date: string
          actual_date?: string | null
          status?: 'Pending' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_event_id?: string
          milestone_name?: string
          planned_date?: string
          actual_date?: string | null
          status?: 'Pending' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      audit_risk_event_log: {
        Row: {
          id: string
          risk_event_id: string
          action_type: 'Created' | 'Updated' | 'Status Changed' | 'Reviewed' | 'Approved' | 'Rejected' | 'Allocated' | 'Document Added' | 'Milestone Updated' | 'Completed' | 'Cancelled' | 'Reopened'
          action_details: string | null
          old_status: string | null
          new_status: string | null
          performed_by: string | null
          performed_at: string
        }
        Insert: {
          id?: string
          risk_event_id: string
          action_type: 'Created' | 'Updated' | 'Status Changed' | 'Reviewed' | 'Approved' | 'Rejected' | 'Allocated' | 'Document Added' | 'Milestone Updated' | 'Completed' | 'Cancelled' | 'Reopened'
          action_details?: string | null
          old_status?: string | null
          new_status?: string | null
          performed_by?: string | null
          performed_at?: string
        }
        Update: {
          id?: string
          risk_event_id?: string
          action_type?: 'Created' | 'Updated' | 'Status Changed' | 'Reviewed' | 'Approved' | 'Rejected' | 'Allocated' | 'Document Added' | 'Milestone Updated' | 'Completed' | 'Cancelled' | 'Reopened'
          action_details?: string | null
          old_status?: string | null
          new_status?: string | null
          performed_by?: string | null
          performed_at?: string
        }
      }

      audit_information_requests: {
        Row: {
          id: string
          risk_event_id: string | null
          engagement_id: string | null
          request_code: string
          request_title: string
          request_description: string
          target_type: 'Internal Division' | 'Internal Section' | 'External Entity' | 'Auditor General'
          target_division_id: string | null
          target_section_id: string | null
          target_external_entity: string | null
          target_contact_name: string | null
          target_contact_email: string | null
          assigned_to: string | null
          request_date: string
          due_date: string
          reminder_date: string | null
          status: 'Draft' | 'Sent' | 'Pending' | 'Partially Received' | 'Received' | 'Overdue' | 'Cancelled'
          response_date: string | null
          response_notes: string | null
          requested_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_event_id?: string | null
          engagement_id?: string | null
          request_code?: string
          request_title: string
          request_description: string
          target_type: 'Internal Division' | 'Internal Section' | 'External Entity' | 'Auditor General'
          target_division_id?: string | null
          target_section_id?: string | null
          target_external_entity?: string | null
          target_contact_name?: string | null
          target_contact_email?: string | null
          assigned_to?: string | null
          request_date?: string
          due_date: string
          reminder_date?: string | null
          status?: 'Draft' | 'Sent' | 'Pending' | 'Partially Received' | 'Received' | 'Overdue' | 'Cancelled'
          response_date?: string | null
          response_notes?: string | null
          requested_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_event_id?: string | null
          engagement_id?: string | null
          request_code?: string
          request_title?: string
          request_description?: string
          target_type?: 'Internal Division' | 'Internal Section' | 'External Entity' | 'Auditor General'
          target_division_id?: string | null
          target_section_id?: string | null
          target_external_entity?: string | null
          target_contact_name?: string | null
          target_contact_email?: string | null
          assigned_to?: string | null
          request_date?: string
          due_date?: string
          reminder_date?: string | null
          status?: 'Draft' | 'Sent' | 'Pending' | 'Partially Received' | 'Received' | 'Overdue' | 'Cancelled'
          response_date?: string | null
          response_notes?: string | null
          requested_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      audit_tasks: {
        Row: {
          id: string
          risk_event_id: string | null
          engagement_id: string | null
          task_code: string | null
          task_title: string
          task_description: string | null
          assigned_to: string | null
          assigned_by: string | null
          assigned_at: string | null
          planned_start_date: string | null
          planned_end_date: string | null
          actual_start_date: string | null
          actual_end_date: string | null
          status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked' | 'Cancelled'
          progress_percentage: number
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          notes: string | null
          blockers: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_event_id?: string | null
          engagement_id?: string | null
          task_code?: string | null
          task_title: string
          task_description?: string | null
          assigned_to?: string | null
          assigned_by?: string | null
          assigned_at?: string | null
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          status?: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked' | 'Cancelled'
          progress_percentage?: number
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          notes?: string | null
          blockers?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_event_id?: string | null
          engagement_id?: string | null
          task_code?: string | null
          task_title?: string
          task_description?: string | null
          assigned_to?: string | null
          assigned_by?: string | null
          assigned_at?: string | null
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          status?: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked' | 'Cancelled'
          progress_percentage?: number
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          notes?: string | null
          blockers?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =============================================
      // REFERENCE TABLES
      // =============================================

      audit_legal_instruments: {
        Row: {
          id: string
          code: string
          title: string
          instrument_type: InstrumentType
          jurisdiction: string | null
          enacted_date: string | null
          effective_date: string | null
          description: string | null
          full_text_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          instrument_type: InstrumentType
          jurisdiction?: string | null
          enacted_date?: string | null
          effective_date?: string | null
          description?: string | null
          full_text_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          instrument_type?: InstrumentType
          jurisdiction?: string | null
          enacted_date?: string | null
          effective_date?: string | null
          description?: string | null
          full_text_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      audit_divisions: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          head_title: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          head_title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          head_title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
        }
        Insert: {
          id?: string
          division_id: string
          code: string
          name: string
          description?: string | null
          head_title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          division_id?: string
          code?: string
          name?: string
          description?: string | null
          head_title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      audit_business_processes: {
        Row: {
          id: string
          section_id: string | null
          code: string
          name: string
          description: string | null
          process_type: 'Core' | 'Support' | 'Management' | 'Regulatory' | null
          owner_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id?: string | null
          code: string
          name: string
          description?: string | null
          process_type?: 'Core' | 'Support' | 'Management' | 'Regulatory' | null
          owner_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string | null
          code?: string
          name?: string
          description?: string | null
          process_type?: 'Core' | 'Support' | 'Management' | 'Regulatory' | null
          owner_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      audit_risk_audit_log: {
        Row: {
          id: string
          risk_id: string
          action_type: string
          field_changed: string | null
          old_value: string | null
          new_value: string | null
          changed_by: string | null
          change_reason: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          action_type: string
          field_changed?: string | null
          old_value?: string | null
          new_value?: string | null
          changed_by?: string | null
          change_reason?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          action_type?: string
          field_changed?: string | null
          old_value?: string | null
          new_value?: string | null
          changed_by?: string | null
          change_reason?: string | null
          changed_at?: string
        }
      }

      // =============================================
      // AUDIT SYSTEM TABLES (with audit_ prefix)
      // =============================================

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
          risk_id: string | null
          risk_event_id: string | null
          audit_category_id: string | null
          lifecycle_stage: 'Planning' | 'Fieldwork' | 'Review' | 'Draft Report' | 'Management Response' | 'Final Report' | 'Closed' | null
          planning_completed_at: string | null
          fieldwork_started_at: string | null
          fieldwork_completed_at: string | null
          review_completed_at: string | null
          draft_issued_at: string | null
          response_received_at: string | null
          final_issued_at: string | null
          closed_at: string | null
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
          risk_id?: string | null
          risk_event_id?: string | null
          audit_category_id?: string | null
          lifecycle_stage?: 'Planning' | 'Fieldwork' | 'Review' | 'Draft Report' | 'Management Response' | 'Final Report' | 'Closed' | null
          planning_completed_at?: string | null
          fieldwork_started_at?: string | null
          fieldwork_completed_at?: string | null
          review_completed_at?: string | null
          draft_issued_at?: string | null
          response_received_at?: string | null
          final_issued_at?: string | null
          closed_at?: string | null
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
          risk_id?: string | null
          risk_event_id?: string | null
          audit_category_id?: string | null
          lifecycle_stage?: 'Planning' | 'Fieldwork' | 'Review' | 'Draft Report' | 'Management Response' | 'Final Report' | 'Closed' | null
          planning_completed_at?: string | null
          fieldwork_started_at?: string | null
          fieldwork_completed_at?: string | null
          review_completed_at?: string | null
          draft_issued_at?: string | null
          response_received_at?: string | null
          final_issued_at?: string | null
          closed_at?: string | null
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
          risk_id: string | null
          legal_instrument_id: string | null
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
          risk_id?: string | null
          legal_instrument_id?: string | null
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
          risk_id?: string | null
          legal_instrument_id?: string | null
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
          risk_id: string | null
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
          risk_id?: string | null
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
          risk_id?: string | null
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
