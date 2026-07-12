/**
 * DLPP Internal Audit & Compliance System — Help & Training content.
 *
 * This is the single, data-driven source of truth for the entire Help &
 * Training Centre. Add new modules here without touching any component logic.
 *
 * Structure:
 *   - Roles          (who does what)
 *   - Categories     (how articles are grouped)
 *   - Articles       (full training content per module)
 *   - Route map      (which article opens for which URL)
 *   - Tooltips       (contextual "?" field help)
 *   - Guided tours   (React Joyride step definitions)
 *   - Quick start    (new-user onboarding)
 *   - Helpers        (search, lookups, route resolution)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HelpRoleId =
  | 'audit_admin'
  | 'audit_manager'
  | 'auditor'
  | 'action_owner'
  | 'read_only'
  | 'system_integrator'

export interface HelpRole {
  id: HelpRoleId
  name: string
  short: string
  color: string
  description: string
  responsibilities: string[]
  /** Article ids most relevant to this role. */
  focus: string[]
}

export type HelpCategoryId =
  | 'getting-started'
  | 'audit-workflow'
  | 'risk-governance'
  | 'compliance'
  | 'reporting'
  | 'administration'
  | 'integration'

export interface HelpCategory {
  id: HelpCategoryId
  name: string
  description: string
  icon: string
  color: string
}

export interface HelpFAQ {
  question: string
  answer: string
}

export interface HelpField {
  name: string
  description: string
  required: boolean
}

export interface HelpStep {
  title: string
  detail: string
}

export interface HelpArticle {
  id: string
  slug: string
  title: string
  /** lucide-react icon name (resolved in the UI). */
  icon: string
  category: HelpCategoryId
  /** Primary route this article documents (used for reverse lookup). */
  route?: string
  summary: string
  /** Roles for whom this article is most relevant. */
  roles: HelpRoleId[]
  estimatedReadMinutes: number
  purpose: string
  whoShouldUse: string
  businessProcess: string[]
  steps: HelpStep[]
  requiredFields: HelpField[]
  validationRules: string[]
  bestPractices: string[]
  commonMistakes: string[]
  /** Related article ids. */
  relatedModules: string[]
  whatHappensNext: string[]
  faqs: HelpFAQ[]
  /** Optional guided tour id to launch from the article. */
  tourId?: string
  keywords: string[]
  hasVideo?: boolean
}

export interface TourStep {
  target: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto'
  disableBeacon?: boolean
}

export interface TourDefinition {
  id: string
  name: string
  description: string
  /** Route where this tour is designed to run. */
  route?: string
  icon: string
  steps: TourStep[]
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const HELP_ROLES: HelpRole[] = [
  {
    id: 'audit_admin',
    name: 'Audit Admin',
    short: 'Admin',
    color: 'bg-red-100 text-red-700 border-red-200',
    description:
      'Owns the system configuration. Manages users, groups, modules, divisions and access, and can operate every module end to end.',
    responsibilities: [
      'Create and deactivate user accounts and assign them to groups',
      'Configure module permissions and role-based access',
      'Maintain organisation divisions and reference data',
      'Oversee the audit trail and API access keys',
    ],
    focus: ['admin', 'rbac', 'audit-trail', 'notifications', 'api-docs'],
  },
  {
    id: 'audit_manager',
    name: 'Audit Manager',
    short: 'Manager',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description:
      'Plans the annual audit programme, approves findings and recommendations, and monitors delivery across the division.',
    responsibilities: [
      'Create engagements and assign audit teams',
      'Review and approve findings and recommendations',
      'Publish recommendations to action owners and Legal',
      'Track KRAs, PSAP scores and the risk register',
    ],
    focus: ['engagements', 'findings', 'recommendations', 'risk-register', 'psap-scorecard', 'kra-workplan', 'reports'],
  },
  {
    id: 'auditor',
    name: 'Auditor',
    short: 'Auditor',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description:
      'Performs the fieldwork: documents workpapers, gathers evidence, raises findings and drafts recommendations.',
    responsibilities: [
      'Execute test procedures and document workpapers',
      'Upload evidence and cross-reference it to findings',
      'Raise findings with an appropriate risk rating',
      'Draft recommendations for manager review',
    ],
    focus: ['fieldwork', 'evidence', 'findings', 'recommendations', 'engagements'],
  },
  {
    id: 'action_owner',
    name: 'Action Owner',
    short: 'Owner',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description:
      'A division officer accountable for implementing an agreed recommendation and keeping its action plan up to date.',
    responsibilities: [
      'Review recommendations assigned to your division',
      'Update action-plan progress and target dates',
      'Attach implementation evidence',
      'Respond to overdue and follow-up notifications',
    ],
    focus: ['action-plans', 'recommendations', 'notifications', 'compliance'],
  },
  {
    id: 'read_only',
    name: 'Read-Only User',
    short: 'Viewer',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    description:
      'Management, external auditors or observers who need visibility of dashboards and reports but cannot change data.',
    responsibilities: [
      'View dashboards, KPIs and heat maps',
      'Open engagements, findings and recommendations read-only',
      'Export and print reports',
    ],
    focus: ['dashboard', 'reports', 'risk-register'],
  },
  {
    id: 'system_integrator',
    name: 'System Integrator',
    short: 'Integrator',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description:
      'A technical account (e.g. the Legal CMS) that consumes published recommendations through the read-only API.',
    responsibilities: [
      'Authenticate with a Supabase API key',
      'Query the published recommendations view',
      'Sync published recommendations into downstream systems',
    ],
    focus: ['api-docs', 'recommendations'],
  },
]

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Sign in, navigate the dashboard and stay on top of notifications.',
    icon: 'Rocket',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    id: 'audit-workflow',
    name: 'Audit Workflow',
    description: 'The end-to-end journey from engagement to closed action plan.',
    icon: 'Workflow',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'risk-governance',
    name: 'Risk & Governance',
    description: 'Risk register, risk profiles, PSAP scorecard and KRAs.',
    icon: 'ShieldCheck',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Obligations, controls and regulatory requirements.',
    icon: 'FileCheck',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    id: 'reporting',
    name: 'Reporting',
    description: 'Generate, export and print audit and governance reports.',
    icon: 'BarChart3',
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    id: 'administration',
    name: 'Administration',
    description: 'Users, roles, access control and the immutable audit trail.',
    icon: 'Settings',
    color: 'text-slate-600 bg-slate-100',
  },
  {
    id: 'integration',
    name: 'Integration',
    description: 'Read-only API for downstream systems such as the Legal CMS.',
    icon: 'Code',
    color: 'text-rose-600 bg-rose-50',
  },
]

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export const HELP_ARTICLES: HelpArticle[] = [
  // 1. LOGIN ---------------------------------------------------------------
  {
    id: 'login',
    slug: 'login',
    title: 'Signing In',
    icon: 'LogIn',
    category: 'getting-started',
    route: '/login',
    summary:
      'Access the Audit System using your single DLPP account shared across the Audit, Land Cases and Corporate systems.',
    roles: ['audit_admin', 'audit_manager', 'auditor', 'action_owner', 'read_only'],
    estimatedReadMinutes: 3,
    purpose:
      'The login page authenticates you against the shared DLPP identity directory and confirms that you have been granted access to the Audit System before any data is loaded.',
    whoShouldUse:
      'Every DLPP officer who needs the Audit & Compliance System. One account works across all DLPP systems (single sign-on).',
    businessProcess: [
      'DLPP issues one identity per officer in the shared directory.',
      'An administrator grants that identity access to the Audit System and assigns it to a group.',
      'The officer signs in and is routed to the dashboard for their role.',
    ],
    steps: [
      { title: 'Open the system', detail: 'Navigate to the Audit System URL. If you are not signed in you are redirected to the login screen automatically.' },
      { title: 'Enter your email', detail: 'Use your official DLPP email address (for example name@dlpp.gov.pg).' },
      { title: 'Enter your password', detail: 'Type the password you set for your DLPP account. Passwords are case-sensitive.' },
      { title: 'Select Sign In', detail: 'The system verifies your credentials and checks that your account is active and has Audit access.' },
      { title: 'Land on your dashboard', detail: 'On success you are taken to the dashboard. The sidebar shows only the modules your group can use.' },
    ],
    requiredFields: [
      { name: 'Email', description: 'Your official DLPP email address used as your username.', required: true },
      { name: 'Password', description: 'Your personal, confidential DLPP account password.', required: true },
    ],
    validationRules: [
      'Both email and password are mandatory.',
      'The account must exist in the shared DLPP directory and be marked active.',
      'The account must have been granted the "audit" system, or hold an administrator role.',
      'Deactivated accounts are signed out immediately with an explanatory message.',
    ],
    bestPractices: [
      'Never share your password — every action is written to the audit trail against your identity.',
      'Sign out on shared or public computers.',
      'Use the same account you use for Land Cases and Corporate; there is no separate audit login.',
    ],
    commonMistakes: [
      'Requesting a new account when you already have a DLPP identity — you only need Audit access added.',
      'Assuming you were denied for a wrong password when the real cause is that Audit access has not been granted yet.',
      'Using a personal email instead of your official DLPP address.',
    ],
    relatedModules: ['dashboard', 'rbac', 'notifications'],
    whatHappensNext: [
      'You are redirected to the dashboard tailored to your role.',
      'Your session is kept active until you sign out or it expires.',
      'The sidebar and every screen respect your group permissions.',
    ],
    faqs: [
      { question: 'I forgot my password — what do I do?', answer: 'Use the "Forgot password?" link on the login screen, or contact your system administrator to trigger a reset. Because sign-on is shared, this also resets access to the other DLPP systems.' },
      { question: 'It says I do not have access to the Audit System.', answer: 'Your account is valid but the Audit System has not been granted to you. Ask an Audit Admin to add the "audit" system and assign you to the correct group.' },
      { question: 'Do I need a different login for Land Cases?', answer: 'No. The same DLPP account signs you into the Audit, Land Cases and Corporate systems.' },
    ],
    keywords: ['login', 'sign in', 'password', 'sso', 'single sign-on', 'authentication', 'access', 'account'],
  },

  // 2. DASHBOARD -----------------------------------------------------------
  {
    id: 'dashboard',
    slug: 'dashboard',
    title: 'Dashboard Overview',
    icon: 'LayoutDashboard',
    category: 'getting-started',
    route: '/dashboard',
    summary:
      'Your command centre: real-time KPIs, findings by risk, engagement status and governance widgets in one place.',
    roles: ['audit_admin', 'audit_manager', 'auditor', 'read_only'],
    estimatedReadMinutes: 4,
    purpose:
      'The dashboard summarises the health of the audit function so you can see, at a glance, what needs attention today — open findings, overdue actions, engagement progress and governance scores.',
    whoShouldUse:
      'Everyone. Managers use it to monitor delivery; auditors use it to see their workload; management uses it for oversight.',
    businessProcess: [
      'Live data is aggregated from engagements, findings, recommendations, action plans and governance modules.',
      'KPI cards and charts refresh whenever you open the page.',
      'Cards link directly into the underlying module for drill-down.',
    ],
    steps: [
      { title: 'Read the KPI cards', detail: 'The top row shows headline numbers — active engagements, open findings, overdue actions and critical risks.' },
      { title: 'Scan the charts', detail: 'Findings-by-risk and engagements-by-status charts show where effort is concentrated.' },
      { title: 'Review governance widgets', detail: 'Risk profile, PSAP ratings, KRA completion and pending risk events summarise governance health.' },
      { title: 'Drill down', detail: 'Select any card, bar or "View all" link to open the full module filtered to that item.' },
    ],
    requiredFields: [],
    validationRules: [
      'The dashboard is read-only; no data is entered here.',
      'Figures reflect only records your permissions allow you to see.',
    ],
    bestPractices: [
      'Start every day on the dashboard to triage overdue actions and critical findings first.',
      'Use the charts to brief management rather than exporting raw tables.',
      'Treat the widgets as shortcuts — click through instead of navigating manually.',
    ],
    commonMistakes: [
      'Assuming a low number means no work — always confirm your filters and permissions.',
      'Trying to edit figures on the dashboard; changes are made in the source modules.',
    ],
    relatedModules: ['engagements', 'findings', 'risk-register', 'psap-scorecard', 'kra-workplan', 'reports'],
    whatHappensNext: [
      'Clicking a KPI opens the relevant module for action.',
      'Numbers update automatically as your team works through the pipeline.',
    ],
    faqs: [
      { question: 'Why are my numbers different from a colleague\'s?', answer: 'The dashboard respects role-based access. You only see records within your groups and divisions.' },
      { question: 'How often does it refresh?', answer: 'Data is fetched each time you open or reload the dashboard.' },
    ],
    tourId: 'dashboard-overview',
    keywords: ['dashboard', 'overview', 'kpi', 'metrics', 'charts', 'home', 'summary', 'analytics'],
    hasVideo: true,
  },

  // 3. ENGAGEMENTS ---------------------------------------------------------
  {
    id: 'engagements',
    slug: 'engagements',
    title: 'Audit Engagements',
    icon: 'Briefcase',
    category: 'audit-workflow',
    route: '/engagements',
    summary:
      'Plan and manage each audit from scope and team through fieldwork to reporting and closure.',
    roles: ['audit_manager', 'auditor', 'audit_admin'],
    estimatedReadMinutes: 6,
    purpose:
      'An engagement is the container for a single audit. It records the objective, scope, period, assigned auditee and team, and drives the status lifecycle that every finding and recommendation hangs off.',
    whoShouldUse:
      'Audit Managers create and scope engagements and assign teams. Auditors work within the engagements they are assigned to.',
    businessProcess: [
      'The annual audit plan identifies the areas to be audited.',
      'A manager creates an engagement, defines the objective and scope, and assigns the lead auditor and team.',
      'Fieldwork is performed under the engagement; findings and recommendations are linked to it.',
      'When testing is complete the engagement moves to reporting, then closure.',
    ],
    steps: [
      { title: 'Open Engagements', detail: 'Select Engagements under Audit Workflow in the sidebar.' },
      { title: 'Create a new engagement', detail: 'Choose "New Engagement" and complete the title, objective, scope, audited unit and audit period.' },
      { title: 'Assign the team', detail: 'Add the lead auditor and supporting auditors so they gain access to the engagement.' },
      { title: 'Set the status', detail: 'Move the engagement through Planned → In Progress as work begins.' },
      { title: 'Manage the work', detail: 'Open the engagement to reach its fieldwork, findings and recommendations.' },
      { title: 'Close it', detail: 'Once reporting is done and actions are agreed, set the status to Closed.' },
    ],
    requiredFields: [
      { name: 'Engagement Title', description: 'The official name of the audit engagement.', required: true },
      { name: 'Audit Objective', description: 'What the audit is intended to examine or confirm.', required: true },
      { name: 'Scope', description: 'The boundaries — processes, locations and period covered.', required: true },
      { name: 'Audited Unit / Division', description: 'The organisational area being audited.', required: true },
      { name: 'Audit Period', description: 'The date range the audit covers.', required: true },
      { name: 'Lead Auditor', description: 'The auditor accountable for delivery.', required: true },
      { name: 'Team Members', description: 'Additional auditors assigned to the engagement.', required: false },
    ],
    validationRules: [
      'Title, objective, scope and audited unit are mandatory.',
      'The audit period end date cannot be before the start date.',
      'An engagement must have a lead auditor before it can move to In Progress.',
      'Status changes follow the lifecycle Planned → In Progress → Reporting → Closed.',
    ],
    bestPractices: [
      'Write objectives that are specific and testable, not generic ("Confirm land-title fees are banked within 24 hours").',
      'Keep scope tight — a focused engagement produces stronger evidence.',
      'Assign the team early so auditors can start planning their workpapers.',
      'Update the status promptly; dashboards and reports rely on it.',
    ],
    commonMistakes: [
      'Leaving the scope vague, which makes findings hard to defend.',
      'Forgetting to assign team members, so they cannot see the engagement.',
      'Closing an engagement while recommendations are still unpublished.',
    ],
    relatedModules: ['fieldwork', 'findings', 'recommendations', 'action-plans', 'reports'],
    whatHappensNext: [
      'Assigned auditors can create workpapers and evidence under the engagement.',
      'Findings and recommendations raised will roll up to this engagement in reports.',
      'The dashboard reflects the engagement in the "engagements by status" chart.',
    ],
    faqs: [
      { question: 'Can I change scope after starting?', answer: 'Yes, but record why. Scope changes are captured in the audit trail and should be agreed with the audit manager.' },
      { question: 'Who can close an engagement?', answer: 'Typically the Audit Manager, once reporting is complete and recommendations have been published.' },
      { question: 'Can two engagements cover the same unit?', answer: 'Yes — for example a financial audit and a compliance audit of the same division in different periods.' },
    ],
    tourId: 'create-engagement',
    keywords: ['engagement', 'audit', 'plan', 'scope', 'objective', 'team', 'lead auditor', 'lifecycle'],
    hasVideo: true,
  },

  // 4. FIELDWORK -----------------------------------------------------------
  {
    id: 'fieldwork',
    slug: 'fieldwork',
    title: 'Fieldwork & Workpapers',
    icon: 'FolderOpen',
    category: 'audit-workflow',
    route: '/fieldwork',
    summary:
      'Document the tests you perform, the procedures followed and the conclusions reached — the evidence-grade record behind every finding.',
    roles: ['auditor', 'audit_manager'],
    estimatedReadMinutes: 6,
    purpose:
      'Fieldwork captures your workpapers: the objective of each test, the procedure performed, the sample examined, the result and your conclusion. It is the audit-quality backbone that supports your findings.',
    whoShouldUse:
      'Auditors executing test procedures. Managers review workpapers for quality and completeness.',
    businessProcess: [
      'Under an engagement, the auditor plans the tests needed to meet the objective.',
      'Each test is documented as a workpaper with a clear procedure and result.',
      'Evidence is attached and cross-referenced to the workpaper.',
      'Where a test reveals an issue, a finding is raised from the workpaper.',
    ],
    steps: [
      { title: 'Open Fieldwork', detail: 'Select Fieldwork under Audit Workflow and choose the engagement you are working on.' },
      { title: 'Create a workpaper', detail: 'Record the test objective, the procedure you will perform and the population or sample.' },
      { title: 'Perform the test', detail: 'Carry out the procedure and document exactly what you did and observed.' },
      { title: 'Record the result and conclusion', detail: 'State whether the control operated effectively and note any exceptions.' },
      { title: 'Attach evidence', detail: 'Upload supporting documents and reference them from the workpaper.' },
      { title: 'Raise a finding if needed', detail: 'Where the test fails, create a finding linked to this workpaper.' },
    ],
    requiredFields: [
      { name: 'Engagement', description: 'The engagement the workpaper belongs to.', required: true },
      { name: 'Test Objective', description: 'What the test is designed to confirm.', required: true },
      { name: 'Procedure Performed', description: 'The step-by-step work you carried out.', required: true },
      { name: 'Sample / Population', description: 'What was examined and how it was selected.', required: false },
      { name: 'Result', description: 'What the test showed, including any exceptions.', required: true },
      { name: 'Conclusion', description: 'Your professional conclusion on the control.', required: true },
    ],
    validationRules: [
      'A workpaper must belong to an engagement.',
      'Objective, procedure, result and conclusion are mandatory for a complete workpaper.',
      'Every conclusion of "ineffective" should be supported by at least one finding or a documented rationale.',
    ],
    bestPractices: [
      'Write so a reviewer who was not present could re-perform the test.',
      'Reference evidence precisely (document name, page, line) rather than "see attachment".',
      'Record the sample selection method to demonstrate objectivity.',
      'Complete workpapers as you go — never reconstruct them from memory later.',
    ],
    commonMistakes: [
      'Vague procedures such as "checked records" with no detail of what or how.',
      'Conclusions that do not follow from the recorded result.',
      'Uploading evidence without linking it to the workpaper it supports.',
    ],
    relatedModules: ['engagements', 'evidence', 'findings'],
    whatHappensNext: [
      'Completed workpapers form the audit file that supports your report.',
      'Findings raised from workpapers carry the evidence trail with them.',
      'Managers review the workpapers before findings are approved.',
    ],
    faqs: [
      { question: 'Can I edit a workpaper after review?', answer: 'Edits remain possible but are captured in the audit trail. Significant post-review changes should be re-reviewed.' },
      { question: 'How much detail is enough?', answer: 'Enough that an independent reviewer could reach the same conclusion from your workpaper and evidence alone.' },
    ],
    tourId: 'conduct-fieldwork',
    keywords: ['fieldwork', 'workpaper', 'test', 'procedure', 'sample', 'conclusion', 'audit file', 'evidence'],
  },

  // 5. EVIDENCE UPLOAD -----------------------------------------------------
  {
    id: 'evidence',
    slug: 'evidence-upload',
    title: 'Evidence Upload',
    icon: 'Upload',
    category: 'audit-workflow',
    route: '/fieldwork',
    summary:
      'Attach documents, photos, workpapers and supporting records, then cross-reference them to workpapers and findings.',
    roles: ['auditor', 'audit_manager', 'action_owner'],
    estimatedReadMinutes: 4,
    purpose:
      'Evidence is the proof behind your conclusions. Uploading and referencing it in the system creates an immutable, dated trail that stands up to review, quality assurance and, where relevant, legal scrutiny.',
    whoShouldUse:
      'Auditors attaching test evidence; action owners attaching implementation evidence to action plans.',
    businessProcess: [
      'Evidence is collected during fieldwork or implementation.',
      'It is uploaded to secure storage and linked to the relevant workpaper, finding or action plan.',
      'Reviewers open the evidence directly from the record it supports.',
    ],
    steps: [
      { title: 'Open the record', detail: 'Go to the workpaper, finding or action plan the evidence relates to.' },
      { title: 'Choose Upload / Attach evidence', detail: 'Select the evidence control and pick the file(s) to upload.' },
      { title: 'Describe the evidence', detail: 'Add a short description of what the document proves so reviewers understand it in context.' },
      { title: 'Save the reference', detail: 'The file is stored securely and linked to the record with a timestamp and your identity.' },
    ],
    requiredFields: [
      { name: 'File', description: 'The document, photo or record being attached.', required: true },
      { name: 'Description', description: 'What the evidence demonstrates and why it matters.', required: false },
      { name: 'Linked Record', description: 'The workpaper, finding or action plan the evidence supports.', required: true },
    ],
    validationRules: [
      'A file must be selected before it can be uploaded.',
      'Evidence must be attached to a parent record; orphan uploads are discouraged.',
      'File type and size limits apply — very large media may need to be compressed.',
    ],
    bestPractices: [
      'Use descriptive file names (e.g. "Bank-recon-Mar2026.pdf") rather than "scan001".',
      'Redact personal data that is not relevant to the test before uploading.',
      'Attach the source document, not a screenshot of it, wherever possible.',
      'One clear description per file makes review far faster.',
    ],
    commonMistakes: [
      'Uploading evidence but never linking it to a finding or workpaper.',
      'Blurry photos or partial scans that cannot be relied upon.',
      'Duplicate uploads that bloat the audit file.',
    ],
    relatedModules: ['fieldwork', 'findings', 'action-plans', 'audit-trail'],
    whatHappensNext: [
      'The evidence appears against its parent record for reviewers.',
      'The upload is written to the audit trail and cannot be silently altered.',
      'Published findings and action plans carry their evidence for follow-up.',
    ],
    faqs: [
      { question: 'Who can see my uploaded evidence?', answer: 'Users with permission on the parent record. Storage buckets are private and access-controlled.' },
      { question: 'Can I delete evidence I uploaded by mistake?', answer: 'Removal is controlled and logged. Contact your administrator if you need an item removed for a genuine reason.' },
    ],
    tourId: 'upload-evidence',
    keywords: ['evidence', 'upload', 'attachment', 'document', 'file', 'photo', 'proof', 'workpaper'],
  },

  // 6. FINDINGS ------------------------------------------------------------
  {
    id: 'findings',
    slug: 'findings',
    title: 'Findings',
    icon: 'AlertTriangle',
    category: 'audit-workflow',
    route: '/findings',
    summary:
      'Register issues identified during the audit with a clear condition, cause, effect and risk rating.',
    roles: ['auditor', 'audit_manager'],
    estimatedReadMinutes: 6,
    purpose:
      'A finding formally records a control weakness or instance of non-compliance. Structured as condition, criteria, cause and effect, it justifies the recommendation that follows and its assigned risk rating drives prioritisation.',
    whoShouldUse:
      'Auditors raise findings from their fieldwork. Managers review, challenge and approve them.',
    businessProcess: [
      'A test in fieldwork reveals an exception.',
      'The auditor raises a finding describing what is wrong (condition), what should be (criteria), why (cause) and the impact (effect).',
      'A risk rating is assigned based on likelihood and impact.',
      'The finding is reviewed and approved, then a recommendation is drafted from it.',
    ],
    steps: [
      { title: 'Open Findings', detail: 'Select Findings under Audit Workflow.' },
      { title: 'Create a finding', detail: 'Choose "New Finding" and link it to the engagement (and workpaper where relevant).' },
      { title: 'Describe the issue', detail: 'Complete the condition, criteria, cause and effect so the issue is fully explained.' },
      { title: 'Set the risk rating', detail: 'Select Low, Medium, High or Critical based on likelihood and impact.' },
      { title: 'Attach evidence', detail: 'Cross-reference the workpaper and evidence that support the finding.' },
      { title: 'Submit for review', detail: 'Send the finding to the manager, who approves it or returns it for rework.' },
    ],
    requiredFields: [
      { name: 'Finding Title', description: 'A concise summary of the issue.', required: true },
      { name: 'Engagement', description: 'The engagement the finding belongs to.', required: true },
      { name: 'Condition', description: 'What is actually happening — the issue observed.', required: true },
      { name: 'Criteria', description: 'The policy, law or standard that should be met.', required: true },
      { name: 'Cause', description: 'Why the issue occurred (root cause).', required: false },
      { name: 'Effect / Impact', description: 'The consequence or risk if not addressed.', required: true },
      { name: 'Risk Rating', description: 'Level of risk based on likelihood and impact.', required: true },
    ],
    validationRules: [
      'Title, engagement, condition, criteria, effect and risk rating are mandatory.',
      'Risk rating must be one of Low, Medium, High or Critical.',
      'A finding should reference at least one workpaper or evidence item before approval.',
      'Only approved findings can generate a published recommendation.',
    ],
    bestPractices: [
      'State the criteria explicitly — cite the exact regulation, PSAP standard or policy clause.',
      'Quantify the effect where possible (kina exposed, number of files, days delayed).',
      'Focus on the root cause, not the symptom, so the recommendation can be durable.',
      'Rate risk consistently with the risk register so heat maps stay meaningful.',
    ],
    commonMistakes: [
      'Merging several issues into one finding, making it hard to action.',
      'Assigning Critical to every finding, which dilutes prioritisation.',
      'Omitting criteria, leaving the finding as an unsupported opinion.',
    ],
    relatedModules: ['fieldwork', 'evidence', 'recommendations', 'risk-register', 'engagements'],
    whatHappensNext: [
      'Approved findings become the basis for recommendations.',
      'High and Critical findings surface on the dashboard and in the risk view.',
      'Findings roll up into the engagement report.',
    ],
    faqs: [
      { question: 'What is the difference between a finding and a recommendation?', answer: 'A finding describes the problem; a recommendation is the agreed action to fix it. Each recommendation traces back to a finding.' },
      { question: 'How do I choose a risk rating?', answer: 'Combine likelihood and impact. Use the same scale as the risk register so ratings are comparable across the organisation.' },
      { question: 'Can I raise a finding without a workpaper?', answer: 'You can create it, but it should be supported by evidence or a workpaper before it is approved.' },
    ],
    tourId: 'create-finding',
    keywords: ['finding', 'issue', 'condition', 'criteria', 'cause', 'effect', 'risk rating', 'exception', 'non-compliance'],
    hasVideo: true,
  },

  // 7. RECOMMENDATIONS -----------------------------------------------------
  {
    id: 'recommendations',
    slug: 'recommendations',
    title: 'Recommendations',
    icon: 'CheckCircle',
    category: 'audit-workflow',
    route: '/recommendations',
    summary:
      'Turn approved findings into clear, actionable recommendations, then publish them to action owners and Legal.',
    roles: ['audit_manager', 'auditor'],
    estimatedReadMinutes: 5,
    purpose:
      'A recommendation is the agreed corrective action for a finding. Publishing it locks the wording, assigns an owner and due date, and makes it available to downstream systems such as the Legal CMS.',
    whoShouldUse:
      'Auditors draft recommendations from their findings. Managers review, approve and publish them.',
    businessProcess: [
      'An approved finding requires corrective action.',
      'The auditor drafts a recommendation with a priority and proposed owner.',
      'The manager reviews and, once satisfied, publishes it.',
      'Publishing notifies the action owner and creates the action plan for tracking.',
    ],
    steps: [
      { title: 'Open Recommendations', detail: 'Select Recommendations under Audit Workflow.' },
      { title: 'Draft from a finding', detail: 'Create a recommendation and link it to the approved finding it addresses.' },
      { title: 'Write the action', detail: 'State clearly what should be done, by whom and the priority.' },
      { title: 'Assign owner and due date', detail: 'Nominate the responsible division/officer and a realistic target date.' },
      { title: 'Review', detail: 'The manager checks the recommendation is specific, measurable and achievable.' },
      { title: 'Publish', detail: 'Only publish after the recommendation has been reviewed and approved.' },
    ],
    requiredFields: [
      { name: 'Linked Finding', description: 'The approved finding this recommendation resolves.', required: true },
      { name: 'Recommendation Text', description: 'The specific corrective action to be taken.', required: true },
      { name: 'Priority', description: 'Critical, High, Medium or Low urgency.', required: true },
      { name: 'Action Owner', description: 'The division or officer accountable for implementation.', required: true },
      { name: 'Target Date', description: 'The agreed date for completion.', required: true },
    ],
    validationRules: [
      'A recommendation must be linked to an approved finding.',
      'Owner, priority and target date are required before publishing.',
      'Publishing is a controlled transition — drafts are not visible to the API or action owners.',
      'Published recommendations should not be edited; issue a revision if the action changes.',
    ],
    bestPractices: [
      'Make recommendations SMART — specific, measurable, achievable, relevant and time-bound.',
      'Agree the action with the owner before publishing to secure buy-in.',
      'Set target dates that reflect risk — Critical items should not sit for months.',
      'One recommendation per action so progress can be tracked cleanly.',
    ],
    commonMistakes: [
      'Publishing before the finding is approved or the owner has agreed.',
      'Vague wording ("improve controls") that cannot be verified as done.',
      'Bundling multiple actions into one recommendation.',
    ],
    relatedModules: ['findings', 'action-plans', 'api-docs', 'reports'],
    whatHappensNext: [
      'The action owner is notified and an action plan is opened for tracking.',
      'The recommendation becomes available to the Legal CMS via the published API view.',
      'Progress is monitored until the recommendation is implemented and verified.',
    ],
    faqs: [
      { question: 'What does "publish" actually do?', answer: 'It transitions the recommendation to Published, notifies the owner, opens the action plan and exposes it to the read-only API. It is a deliberate, logged step.' },
      { question: 'Can I unpublish a recommendation?', answer: 'Published records are intended to be permanent. If the action changes, record a revision rather than deleting history.' },
    ],
    tourId: 'create-recommendation',
    keywords: ['recommendation', 'action', 'publish', 'priority', 'owner', 'target date', 'smart', 'corrective action'],
  },

  // 8. ACTION PLANS --------------------------------------------------------
  {
    id: 'action-plans',
    slug: 'action-plans',
    title: 'Action Plans',
    icon: 'ClipboardList',
    category: 'audit-workflow',
    route: '/action-plans',
    summary:
      'Track implementation of published recommendations — progress, evidence, target dates and verification.',
    roles: ['action_owner', 'audit_manager', 'auditor'],
    estimatedReadMinutes: 5,
    purpose:
      'The action plan is where recommendations are followed through to completion. Owners update progress and attach evidence; auditors verify that the action truly closed the underlying risk.',
    whoShouldUse:
      'Action Owners update their plans. Managers and auditors monitor and verify closure.',
    businessProcess: [
      'Publishing a recommendation opens an action plan against it.',
      'The owner works the action and records progress with supporting evidence.',
      'When complete, the owner marks it done and the auditor verifies.',
      'Verified actions are closed; overdue ones are escalated.',
    ],
    steps: [
      { title: 'Open Action Plans', detail: 'Select Action Plans under Audit Workflow.' },
      { title: 'Find your action', detail: 'Filter to your division or the recommendation you are implementing.' },
      { title: 'Update progress', detail: 'Set the percentage complete and add a progress note describing what has changed.' },
      { title: 'Attach evidence', detail: 'Upload documents proving the action has been implemented.' },
      { title: 'Mark complete', detail: 'When finished, set the status to complete for auditor verification.' },
      { title: 'Verification', detail: 'The auditor reviews the evidence and either verifies (closes) or reopens the action.' },
    ],
    requiredFields: [
      { name: 'Progress %', description: 'The percentage of the action completed to date.', required: true },
      { name: 'Progress Note', description: 'A short update on what was done since the last update.', required: true },
      { name: 'Implementation Evidence', description: 'Documents proving the action was carried out.', required: false },
      { name: 'Revised Target Date', description: 'A new date if the original cannot be met (with justification).', required: false },
    ],
    validationRules: [
      'Progress must be between 0 and 100 percent.',
      'Marking an action complete requires supporting evidence in most cases.',
      'A revised target date should include a reason, which is captured in the audit trail.',
      'Only an auditor/manager can verify and close an action, not the owner.',
    ],
    bestPractices: [
      'Update progress regularly, not just at the due date, so trends are visible.',
      'Attach evidence as you go rather than at the end.',
      'If you will miss a date, revise it early with a clear reason.',
      'Close the risk, not just the task — verification confirms the finding no longer applies.',
    ],
    commonMistakes: [
      'Reporting 100% with no evidence attached.',
      'Silent slippage — letting an action go overdue without a revised date.',
      'Owners marking their own action "verified"; verification is independent.',
    ],
    relatedModules: ['recommendations', 'findings', 'evidence', 'compliance', 'notifications'],
    whatHappensNext: [
      'Verified actions close the loop on the originating finding.',
      'Overdue actions trigger notifications and appear on the dashboard.',
      'Closure status feeds follow-up reporting to management.',
    ],
    faqs: [
      { question: 'Who can update an action plan?', answer: 'The assigned action owner (and managers/auditors). Progress updates are attributed to you in the audit trail.' },
      { question: 'What happens when an action is overdue?', answer: 'It is flagged on the dashboard and the owner receives a notification. Managers can escalate.' },
      { question: 'Can I reopen a closed action?', answer: 'An auditor/manager can reopen an action if verification later proves the risk was not fully addressed.' },
    ],
    tourId: 'update-action-plan',
    keywords: ['action plan', 'progress', 'implementation', 'evidence', 'verification', 'overdue', 'follow-up', 'closure'],
  },

  // 9. COMPLIANCE ----------------------------------------------------------
  {
    id: 'compliance',
    slug: 'compliance',
    title: 'Compliance',
    icon: 'FileCheck',
    category: 'compliance',
    route: '/compliance',
    summary:
      'Track legal and regulatory obligations, the controls that satisfy them, and the current compliance status of each.',
    roles: ['audit_manager', 'auditor', 'action_owner', 'read_only'],
    estimatedReadMinutes: 5,
    purpose:
      'The compliance module registers the obligations DLPP must meet — under the Land Act, financial regulations, PSAP standards and internal policy — and maps them to the controls that provide assurance, so gaps are visible before they become findings.',
    whoShouldUse:
      'Managers maintain the obligations register; auditors test controls; action owners remediate gaps; management monitors overall status.',
    businessProcess: [
      'Obligations are captured from legislation, regulation, PSAP standards and policy.',
      'Each obligation is linked to one or more controls that demonstrate compliance.',
      'Controls are assessed and given a status (compliant, partial, non-compliant).',
      'Gaps drive findings, recommendations and action plans.',
    ],
    steps: [
      { title: 'Open Compliance', detail: 'Select Compliance under Governance in the sidebar.' },
      { title: 'Register an obligation', detail: 'Record the requirement, its source (Act, regulation, PSAP, policy) and the owning division.' },
      { title: 'Map controls', detail: 'Link the control(s) that satisfy the obligation.' },
      { title: 'Assess status', detail: 'Mark each obligation compliant, partially compliant or non-compliant with a note.' },
      { title: 'Remediate gaps', detail: 'Raise findings and action plans for non-compliant items.' },
    ],
    requiredFields: [
      { name: 'Obligation', description: 'The specific requirement to be met.', required: true },
      { name: 'Source / Authority', description: 'The Act, regulation, standard or policy it derives from.', required: true },
      { name: 'Owning Division', description: 'The area accountable for meeting the obligation.', required: true },
      { name: 'Linked Control(s)', description: 'The controls that provide assurance of compliance.', required: false },
      { name: 'Compliance Status', description: 'Compliant, partially compliant or non-compliant.', required: true },
    ],
    validationRules: [
      'Obligation, source and owning division are mandatory.',
      'Compliance status must be one of the defined values.',
      'A non-compliant obligation should have an associated finding or action plan.',
    ],
    bestPractices: [
      'Cite the exact clause or standard number so the obligation is traceable.',
      'Review the register at least quarterly, aligned with PSAP assessment.',
      'Keep obligations atomic — one requirement per record.',
      'Link controls so the same evidence supports both compliance and fieldwork.',
    ],
    commonMistakes: [
      'Listing broad legislation as a single obligation instead of specific requirements.',
      'Marking items compliant without a control or evidence to prove it.',
      'Letting the register go stale between audits.',
    ],
    relatedModules: ['psap-scorecard', 'findings', 'action-plans', 'risk-register', 'reports'],
    whatHappensNext: [
      'Non-compliance feeds findings and the risk register.',
      'Compliance status is reflected in governance reporting.',
      'Controls tested here support engagement fieldwork.',
    ],
    faqs: [
      { question: 'How does compliance relate to PSAP?', answer: 'PSAP standards are a key source of obligations. Many compliance obligations map directly to a PSAP standard and its quarterly score.' },
      { question: 'Who owns an obligation?', answer: 'The division responsible for the underlying process, not the audit team. Audit provides assurance, not ownership.' },
    ],
    tourId: 'compliance-tracking',
    keywords: ['compliance', 'obligation', 'control', 'regulation', 'legislation', 'policy', 'status', 'gap'],
  },

  // 10. RISK REGISTER ------------------------------------------------------
  {
    id: 'risk-register',
    slug: 'risk-register',
    title: 'Risk Register',
    icon: 'Shield',
    category: 'risk-governance',
    route: '/risk-register',
    summary:
      'The central inventory of organisational risks with likelihood, impact, scoring and a heat-map view.',
    roles: ['audit_manager', 'auditor', 'read_only', 'audit_admin'],
    estimatedReadMinutes: 6,
    purpose:
      'The risk register is the single source of truth for risks facing DLPP. Each risk is scored on likelihood and impact, assigned an owner and treatment, and visualised on a heat map that focuses attention on the highest exposures.',
    whoShouldUse:
      'Managers and risk officers maintain the register; auditors use it to plan risk-based engagements; management uses the heat map for oversight.',
    businessProcess: [
      'Risks are identified from audits, risk events, incidents and management input.',
      'Each risk is scored (likelihood × impact) to give an inherent rating.',
      'Controls and treatments are recorded, producing a residual rating.',
      'The register drives risk-based audit planning and the dashboard heat map.',
    ],
    steps: [
      { title: 'Open Risk Register', detail: 'Select Risk Register under Risk Foundation.' },
      { title: 'Add a risk', detail: 'Describe the risk, its category and the owner.' },
      { title: 'Score likelihood and impact', detail: 'Rate each on the defined scale to calculate the risk score.' },
      { title: 'Record treatment', detail: 'Capture existing controls and the treatment strategy (accept, mitigate, transfer, avoid).' },
      { title: 'Review the heat map', detail: 'Use the heat map to prioritise the highest-scoring risks.' },
    ],
    requiredFields: [
      { name: 'Risk Title', description: 'A short, clear statement of the risk.', required: true },
      { name: 'Category', description: 'The type of risk (financial, operational, compliance, strategic, etc.).', required: true },
      { name: 'Risk Owner', description: 'The person accountable for managing the risk.', required: true },
      { name: 'Likelihood', description: 'How likely the risk is to occur, on the defined scale.', required: true },
      { name: 'Impact', description: 'The severity of consequences if it occurs.', required: true },
      { name: 'Treatment Strategy', description: 'Accept, mitigate, transfer or avoid.', required: false },
    ],
    validationRules: [
      'Title, category, owner, likelihood and impact are mandatory.',
      'Likelihood and impact must use the defined organisational scale.',
      'The risk score is derived from likelihood × impact and cannot be entered manually.',
    ],
    bestPractices: [
      'Phrase risks as "cause → event → consequence" for clarity.',
      'Score consistently with finding risk ratings so the picture is coherent.',
      'Reassess residual risk after treatments, not just inherent risk.',
      'Assign a genuine owner with authority to act, not a placeholder.',
    ],
    commonMistakes: [
      'Confusing a risk (uncertain future event) with an issue (already occurred).',
      'Scoring optimistically to keep items off the heat map.',
      'Never revisiting scores after controls are implemented.',
    ],
    relatedModules: ['risk-events', 'risk-profiles', 'findings', 'compliance', 'psap-scorecard'],
    whatHappensNext: [
      'High-scoring risks inform the annual audit plan and engagements.',
      'The heat map and top risks appear on the dashboard.',
      'Risk events can be escalated into register entries.',
    ],
    faqs: [
      { question: 'What is the difference between the risk register and risk profiles?', answer: 'The register is the master list of individual risks; a risk profile is a structured assessment (matrix) that groups risks by context and resource categories for a specific area.' },
      { question: 'How is the risk score calculated?', answer: 'Likelihood multiplied by impact using the organisation\'s defined scale, producing the colour on the heat map.' },
    ],
    tourId: 'risk-register',
    keywords: ['risk', 'register', 'likelihood', 'impact', 'heat map', 'score', 'treatment', 'owner', 'residual'],
    hasVideo: true,
  },

  // 11. RISK PROFILES ------------------------------------------------------
  {
    id: 'risk-profiles',
    slug: 'risk-profiles',
    title: 'Risk Profiles',
    icon: 'Activity',
    category: 'risk-governance',
    route: '/risk-profiles',
    summary:
      'Structured risk assessment matrices that organise risks by context and resource categories for a division or theme.',
    roles: ['audit_manager', 'auditor', 'audit_admin'],
    estimatedReadMinutes: 5,
    purpose:
      'A risk profile builds a complete, matrix-based assessment for a specific area — capturing risk items across context and resource categories — so managers can see the shape of risk for a division, function or theme in one structured view.',
    whoShouldUse:
      'Managers and risk officers who need a formal, repeatable assessment; auditors who use profiles to scope engagements.',
    businessProcess: [
      'A profile is created for a division, function or theme.',
      'Risk items are added under context and resource categories.',
      'Each item is assessed and scored within the matrix.',
      'The completed profile informs engagements and the risk register.',
    ],
    steps: [
      { title: 'Open Risk Profiles', detail: 'Select Risk Profiles under Risk Foundation.' },
      { title: 'Create a profile', detail: 'Name the profile and set its context (the area being assessed).' },
      { title: 'Add risk items', detail: 'Add items under the relevant context and resource categories.' },
      { title: 'Assess each item', detail: 'Score likelihood and impact for every item within the matrix.' },
      { title: 'Open the profile detail', detail: 'Drill into a profile to review, edit items and see the aggregated matrix.' },
    ],
    requiredFields: [
      { name: 'Profile Name', description: 'The name of the assessment (e.g. "Titles Division 2026").', required: true },
      { name: 'Context', description: 'The area, function or theme the profile assesses.', required: true },
      { name: 'Risk Items', description: 'Individual risks assessed within the matrix.', required: true },
      { name: 'Category', description: 'The context or resource category each item belongs to.', required: true },
    ],
    validationRules: [
      'A profile must have a name and context before items can be added.',
      'Each risk item must be assigned a category and a score.',
      'Scores use the same scale as the risk register for consistency.',
    ],
    bestPractices: [
      'Reuse category definitions so profiles are comparable across divisions.',
      'Assess the same profile each cycle to track how risk evolves.',
      'Feed material items from the profile into the central risk register.',
    ],
    commonMistakes: [
      'Creating a profile but leaving items unscored.',
      'Duplicating the entire risk register inside a profile instead of focusing on the area.',
    ],
    relatedModules: ['risk-register', 'risk-events', 'psap-scorecard', 'engagements'],
    whatHappensNext: [
      'The profile summarises risk for the assessed area on the dashboard widget.',
      'Material risks are promoted to the risk register.',
      'Auditors use the profile to plan risk-based engagements.',
    ],
    faqs: [
      { question: 'How often should a profile be refreshed?', answer: 'At least annually, and after any major change to the area or a significant risk event.' },
      { question: 'Can I have several profiles for one division?', answer: 'Yes — for example separate profiles by function or by assessment period.' },
    ],
    tourId: 'risk-profile-creation',
    keywords: ['risk profile', 'assessment', 'matrix', 'context', 'resource', 'category', 'scoring'],
  },

  // 12. PSAP SCORECARD -----------------------------------------------------
  {
    id: 'psap-scorecard',
    slug: 'psap-scorecard',
    title: 'PSAP Scorecard',
    icon: 'TrendingUp',
    category: 'risk-governance',
    route: '/psap-scorecard',
    summary:
      'Quarterly self-assessment against the 20 PSAP Financial & Governance Standards, with scores, trends and evidence.',
    roles: ['audit_manager', 'auditor', 'read_only'],
    estimatedReadMinutes: 6,
    purpose:
      'The PSAP scorecard measures DLPP against the 20 Public Sector Accountability & Performance financial and governance standards each quarter, producing a score per standard, an overall rating and a trend that demonstrates improvement over time.',
    whoShouldUse:
      'Managers run the quarterly assessment; auditors validate scores against evidence; management reviews the trend.',
    businessProcess: [
      'Each quarter a new assessment cycle is opened.',
      'Every one of the 20 standards is scored against its criteria.',
      'Evidence and commentary justify each score.',
      'The overall rating and trend feed governance reporting and the dashboard.',
    ],
    steps: [
      { title: 'Open PSAP Scorecard', detail: 'Select PSAP Scorecard under Governance.' },
      { title: 'Create an assessment', detail: 'Start a new quarterly assessment cycle.' },
      { title: 'Score each standard', detail: 'Enter the score for each of the 20 governance/financial standards.' },
      { title: 'Add evidence and comments', detail: 'Justify each score with commentary and supporting evidence.' },
      { title: 'Review the trend', detail: 'Compare against previous quarters using the trend chart.' },
    ],
    requiredFields: [
      { name: 'Assessment Period', description: 'The quarter the assessment covers.', required: true },
      { name: 'Standard Score', description: 'The score for each governance or financial compliance standard.', required: true },
      { name: 'Commentary', description: 'The rationale supporting each score.', required: false },
      { name: 'Evidence', description: 'Documents that substantiate the score.', required: false },
    ],
    validationRules: [
      'An assessment is tied to a specific quarter.',
      'Each of the 20 standards must be scored within the allowed range for the assessment to be complete.',
      'Overall rating is calculated from the individual standard scores.',
    ],
    bestPractices: [
      'Score against the published PSAP criteria, not perception.',
      'Attach the same evidence used in compliance and fieldwork to avoid duplication.',
      'Have an independent reviewer validate scores before finalising.',
      'Use the trend, not a single quarter, to judge real progress.',
    ],
    commonMistakes: [
      'Inflating scores without evidence.',
      'Skipping standards, leaving the assessment incomplete.',
      'Treating PSAP as a one-off rather than a quarterly discipline.',
    ],
    relatedModules: ['compliance', 'kra-workplan', 'risk-register', 'reports'],
    whatHappensNext: [
      'The overall rating and per-standard scores appear on the dashboard widget.',
      'Low-scoring standards drive compliance obligations and action plans.',
      'Trends are included in governance reports to management.',
    ],
    faqs: [
      { question: 'What are the 20 PSAP standards?', answer: 'They are the Public Sector Accountability & Performance financial and governance standards that public entities self-assess against; each has defined criteria and a score.' },
      { question: 'How often is it assessed?', answer: 'Quarterly. Each cycle is retained so you can track the trend across periods.' },
    ],
    tourId: 'psap-assessment',
    keywords: ['psap', 'scorecard', 'governance', 'standard', 'quarterly', 'score', 'financial', 'assessment', 'trend'],
    hasVideo: true,
  },

  // 13. KRA & WORKPLAN -----------------------------------------------------
  {
    id: 'kra-workplan',
    slug: 'kra-workplan',
    title: 'KRA & Workplan',
    icon: 'Target',
    category: 'risk-governance',
    route: '/kra-workplan',
    summary:
      'Define Key Result Areas and track quarterly performance against the annual audit and governance workplan.',
    roles: ['audit_manager', 'auditor', 'read_only'],
    estimatedReadMinutes: 5,
    purpose:
      'KRAs translate the audit strategy into measurable outcomes. The workplan schedules the activities that deliver them, and quarterly status updates show how the function is performing against target.',
    whoShouldUse:
      'Managers set KRAs and the workplan; auditors update the status of activities they deliver; management tracks completion.',
    businessProcess: [
      'Annual KRAs are defined with targets and measures.',
      'Workplan activities are scheduled across the four quarters.',
      'Each quarter, progress and status are updated.',
      'Completion feeds the KRA completion widget and governance reporting.',
    ],
    steps: [
      { title: 'Open KRA & Workplan', detail: 'Select KRA & Workplan under Governance.' },
      { title: 'Define a KRA', detail: 'Record the result area, its target and how it is measured.' },
      { title: 'Schedule activities', detail: 'Add workplan activities and assign them to quarters and owners.' },
      { title: 'Update quarterly status', detail: 'Each quarter, update progress and mark activities on-track, at-risk or complete.' },
      { title: 'Review completion', detail: 'Track overall completion against target on the dashboard widget.' },
    ],
    requiredFields: [
      { name: 'KRA / Result Area', description: 'The measurable outcome the function is targeting.', required: true },
      { name: 'Target / Measure', description: 'How success is quantified.', required: true },
      { name: 'Quarter', description: 'The quarter an activity is scheduled for.', required: true },
      { name: 'Status', description: 'On-track, at-risk, delayed or complete.', required: true },
      { name: 'Owner', description: 'The officer accountable for the activity.', required: false },
    ],
    validationRules: [
      'A KRA must have a target/measure to be trackable.',
      'Each workplan activity must be assigned to a quarter.',
      'Status must be one of the defined values.',
    ],
    bestPractices: [
      'Make KRAs measurable — "80% of Critical actions closed within 90 days", not "improve follow-up".',
      'Update status every quarter, not just at year end.',
      'Link KRAs to PSAP standards where they reinforce each other.',
    ],
    commonMistakes: [
      'Vague KRAs with no numeric target.',
      'Front-loading everything into Q4.',
      'Never updating status, so completion looks static.',
    ],
    relatedModules: ['psap-scorecard', 'reports', 'engagements', 'compliance'],
    whatHappensNext: [
      'Quarterly status rolls up into the KRA completion widget on the dashboard.',
      'At-risk activities prompt management attention.',
      'Year-end performance feeds the annual governance report.',
    ],
    faqs: [
      { question: 'What is a KRA?', answer: 'A Key Result Area — a measurable outcome the audit and governance function commits to achieving over the year.' },
      { question: 'How is the workplan different from KRAs?', answer: 'KRAs are the outcomes; the workplan is the scheduled activities that deliver those outcomes across the quarters.' },
    ],
    tourId: 'kra-quarterly-update',
    keywords: ['kra', 'workplan', 'key result area', 'quarterly', 'target', 'performance', 'status', 'completion'],
  },

  // 14. REPORTS ------------------------------------------------------------
  {
    id: 'reports',
    slug: 'reports',
    title: 'Reports',
    icon: 'BarChart3',
    category: 'reporting',
    route: '/reports',
    summary:
      'Generate and export comprehensive audit, compliance and governance reports to CSV, Excel or PDF.',
    roles: ['audit_manager', 'read_only', 'auditor'],
    estimatedReadMinutes: 4,
    purpose:
      'Reports consolidate data across engagements, findings, recommendations, actions and governance into shareable, BI-ready outputs for management, oversight committees and external stakeholders.',
    whoShouldUse:
      'Managers produce reports for oversight; auditors export data for analysis; read-only users export approved reports.',
    businessProcess: [
      'Select the report type and reporting period.',
      'Apply filters (division, status, risk rating).',
      'Preview the results on screen.',
      'Export or print for distribution.',
    ],
    steps: [
      { title: 'Open Reports', detail: 'Select Reports in the sidebar.' },
      { title: 'Choose a report', detail: 'Pick the report type — engagements, findings, recommendations, actions or governance.' },
      { title: 'Set filters and period', detail: 'Narrow the data to the division, period and status you need.' },
      { title: 'Preview', detail: 'Review the on-screen results before exporting.' },
      { title: 'Export or print', detail: 'Export to CSV/Excel/PDF or print for the meeting pack.' },
    ],
    requiredFields: [
      { name: 'Report Type', description: 'The dataset the report is built from.', required: true },
      { name: 'Reporting Period', description: 'The date range covered by the report.', required: true },
      { name: 'Filters', description: 'Optional division, status or risk filters.', required: false },
    ],
    validationRules: [
      'A report type and period are required to generate output.',
      'Exports include only data your permissions allow.',
      'Very large exports may be paginated.',
    ],
    bestPractices: [
      'Use consistent periods (quarter/year) so reports are comparable.',
      'Export to CSV/Excel for further analysis; use PDF for distribution.',
      'Label the reporting period clearly in any pack you circulate.',
    ],
    commonMistakes: [
      'Exporting the whole dataset when a filtered view is what is needed.',
      'Circulating a PDF without stating the as-at date.',
    ],
    relatedModules: ['dashboard', 'findings', 'recommendations', 'action-plans', 'psap-scorecard', 'kra-workplan'],
    whatHappensNext: [
      'Exports are used in oversight and management reporting.',
      'Report generation is recorded in the audit trail.',
    ],
    faqs: [
      { question: 'Which formats can I export?', answer: 'CSV and Excel for data analysis, and PDF for formatted distribution.' },
      { question: 'Do reports respect my permissions?', answer: 'Yes. A report never includes records you would not be able to open directly.' },
    ],
    tourId: 'reports-generation',
    keywords: ['report', 'export', 'csv', 'excel', 'pdf', 'print', 'analytics', 'bi', 'period'],
  },

  // 15. ADMIN --------------------------------------------------------------
  {
    id: 'admin',
    slug: 'admin',
    title: 'Administration',
    icon: 'Settings',
    category: 'administration',
    route: '/admin',
    summary:
      'The control centre for users, groups, modules, divisions, auditor profiles and API access.',
    roles: ['audit_admin'],
    estimatedReadMinutes: 5,
    purpose:
      'Administration is where the system is configured and secured: creating users, defining groups and their permissions, maintaining modules and divisions, managing auditor profiles and controlling API access.',
    whoShouldUse:
      'Audit Admins only. This area is hidden from non-administrators.',
    businessProcess: [
      'An officer receives a DLPP identity and is granted Audit access.',
      'The admin assigns the user to a group whose permissions define what they can do.',
      'Modules, divisions and reference data are maintained to match the organisation.',
      'API keys and access are managed for downstream integrations.',
    ],
    steps: [
      { title: 'Open the Admin Hub', detail: 'Select Admin Hub under Administration (visible to admins only).' },
      { title: 'Manage users', detail: 'Create, edit and deactivate accounts and assign them to groups.' },
      { title: 'Configure groups', detail: 'Define groups and their module permissions (create/read/update/delete/approve/export/print).' },
      { title: 'Maintain modules & divisions', detail: 'Keep the module catalogue and organisational divisions current.' },
      { title: 'Manage auditor profiles', detail: 'Maintain auditor competencies and assignments.' },
    ],
    requiredFields: [
      { name: 'User Email', description: 'The DLPP email that identifies the account.', required: true },
      { name: 'Group', description: 'The group whose permissions the user inherits.', required: true },
      { name: 'Division', description: 'The user\'s organisational division.', required: false },
      { name: 'Active Status', description: 'Whether the account may sign in.', required: true },
    ],
    validationRules: [
      'Only administrators can access this area.',
      'A user must belong to at least one group to gain permissions.',
      'Deactivating a user blocks sign-in immediately across shared systems.',
      'Every administrative change is written to the audit trail.',
    ],
    bestPractices: [
      'Apply least privilege — grant the narrowest group that lets the user do their job.',
      'Use groups, not per-user tweaks, so permissions stay consistent.',
      'Deactivate leavers promptly; do not delete history.',
      'Review group membership periodically.',
    ],
    commonMistakes: [
      'Granting admin to users who only need to view reports.',
      'Creating duplicate users instead of granting Audit access to an existing identity.',
      'Editing permissions per user rather than adjusting the group.',
    ],
    relatedModules: ['rbac', 'audit-trail', 'api-docs', 'notifications'],
    whatHappensNext: [
      'New users can sign in and see exactly the modules their group allows.',
      'Permission changes take effect on the user\'s next action.',
      'All changes are recorded for later review in the audit trail.',
    ],
    faqs: [
      { question: 'Why can\'t a colleague see the Admin section?', answer: 'It is only visible to administrators. Non-admins never see the Administration group in the sidebar.' },
      { question: 'Should I delete a user who left?', answer: 'Deactivate rather than delete, so their historical actions remain attributable in the audit trail.' },
    ],
    tourId: 'admin-user-management',
    keywords: ['admin', 'administration', 'users', 'groups', 'modules', 'divisions', 'configuration', 'access'],
  },

  // 16. NOTIFICATIONS ------------------------------------------------------
  {
    id: 'notifications',
    slug: 'notifications',
    title: 'Notifications',
    icon: 'Bell',
    category: 'getting-started',
    route: '/notifications',
    summary:
      'Stay informed of assignments, approvals, due dates and overdue actions through the notifications bell.',
    roles: ['audit_admin', 'audit_manager', 'auditor', 'action_owner'],
    estimatedReadMinutes: 3,
    purpose:
      'Notifications keep the workflow moving by alerting you when something needs your attention — a recommendation to review, an action assigned to you, or an item that is now overdue.',
    whoShouldUse:
      'Everyone who acts in the workflow — auditors, managers and action owners in particular.',
    businessProcess: [
      'Workflow events (assignment, publication, due date, overdue) generate notifications.',
      'The bell in the header shows unread counts.',
      'Selecting a notification takes you to the relevant record.',
      'Notifications are marked read as you action them.',
    ],
    steps: [
      { title: 'Open the bell', detail: 'Select the notifications bell in the top header to see recent alerts.' },
      { title: 'Review alerts', detail: 'Scan assignments, approvals and due-date reminders.' },
      { title: 'Act on an item', detail: 'Select a notification to jump straight to the record it concerns.' },
      { title: 'Mark as read', detail: 'Clear items you have handled to keep the list focused.' },
    ],
    requiredFields: [],
    validationRules: [
      'You only receive notifications relevant to your role and assignments.',
      'Notifications link only to records you are permitted to open.',
    ],
    bestPractices: [
      'Check notifications at the start and end of each day.',
      'Action overdue alerts first.',
      'Use notifications as your to-do list rather than relying on memory.',
    ],
    commonMistakes: [
      'Ignoring overdue alerts until escalation.',
      'Treating the bell as the only place to find work — the dashboard and action plans are the fuller view.',
    ],
    relatedModules: ['action-plans', 'recommendations', 'dashboard'],
    whatHappensNext: [
      'Acting on a notification updates the underlying record and clears the alert.',
      'Unactioned overdue items may be escalated to your manager.',
    ],
    faqs: [
      { question: 'Why did I get a notification?', answer: 'Because a workflow event involved you — for example a recommendation was assigned to your division or one of your actions became overdue.' },
      { question: 'Can I get email notifications?', answer: 'In-app notifications are always available; email delivery depends on your organisation\'s configuration.' },
    ],
    keywords: ['notification', 'alert', 'bell', 'reminder', 'assignment', 'overdue', 'due date'],
  },

  // 17. API DOCUMENTATION --------------------------------------------------
  {
    id: 'api-docs',
    slug: 'api-documentation',
    title: 'API Documentation',
    icon: 'Code',
    category: 'integration',
    route: '/api-docs',
    summary:
      'The read-only API that lets downstream systems, such as the Legal CMS, consume published recommendations.',
    roles: ['system_integrator', 'audit_admin'],
    estimatedReadMinutes: 5,
    purpose:
      'The API exposes published recommendations to authorised systems so that, for example, the Legal CMS can pick up audit recommendations that require legal follow-up without manual re-entry.',
    whoShouldUse:
      'System integrators building downstream connections, and administrators who manage API access.',
    businessProcess: [
      'A recommendation is published in the audit workflow.',
      'It becomes available through the published recommendations view.',
      'An integrated system queries the API with an authorised key.',
      'The downstream system syncs and links the recommendation to its own records.',
    ],
    steps: [
      { title: 'Open API Docs', detail: 'Navigate to /api-docs for the full endpoint reference.' },
      { title: 'Obtain a key', detail: 'An administrator provides the Supabase API key for authentication.' },
      { title: 'Call the endpoint', detail: 'Query the published recommendations view over HTTPS with the key in the headers.' },
      { title: 'Filter results', detail: 'Use query parameters (status, priority, region, limit, offset) to narrow results.' },
      { title: 'Sync downstream', detail: 'Map the response into your system and store the recommendation reference.' },
    ],
    requiredFields: [
      { name: 'API Key', description: 'The Supabase key sent in the apikey and Authorization headers.', required: true },
      { name: 'Endpoint', description: 'The published recommendations view URL.', required: true },
      { name: 'Query Parameters', description: 'Optional filters such as status, priority and pagination.', required: false },
    ],
    validationRules: [
      'The API is read-only; it cannot create or modify audit data.',
      'Requests must include a valid API key or they are rejected.',
      'Only recommendations in the Published state are exposed.',
    ],
    bestPractices: [
      'Store keys securely (secrets manager), never in client-side code.',
      'Use pagination (limit/offset) for large result sets.',
      'Poll on a sensible schedule rather than continuously.',
      'Handle the Published-only contract — drafts will never appear.',
    ],
    commonMistakes: [
      'Expecting draft recommendations to be visible via the API.',
      'Hard-coding keys into a repository.',
      'Ignoring pagination and timing out on large pulls.',
    ],
    relatedModules: ['recommendations', 'admin', 'audit-trail'],
    whatHappensNext: [
      'Downstream systems keep in step with published audit recommendations.',
      'API usage can be reviewed for security assurance.',
    ],
    faqs: [
      { question: 'Can the API change audit records?', answer: 'No. It is strictly read-only and exposes only published recommendations.' },
      { question: 'Where do I get an API key?', answer: 'From an Audit Admin, who manages API access as part of Administration.' },
    ],
    keywords: ['api', 'integration', 'legal cms', 'endpoint', 'rest', 'key', 'published', 'read-only'],
  },

  // 18. AUDIT TRAIL --------------------------------------------------------
  {
    id: 'audit-trail',
    slug: 'audit-trail',
    title: 'Audit Trail',
    icon: 'History',
    category: 'administration',
    route: '/admin',
    summary:
      'The immutable, timestamped log of who did what and when across the system.',
    roles: ['audit_admin', 'audit_manager'],
    estimatedReadMinutes: 4,
    purpose:
      'The audit trail records every significant action — create, update, delete, print, export, approve — against the user who performed it and the exact time, providing evidence-grade accountability and supporting investigations and quality assurance.',
    whoShouldUse:
      'Administrators and managers who need to verify who changed a record, or to demonstrate control to reviewers.',
    businessProcess: [
      'Every action on a governed record writes an entry to the log.',
      'Entries capture the user, action, record, timestamp and context.',
      'The log is append-only — entries cannot be silently altered.',
      'Reviewers query the trail during QA, disputes or investigations.',
    ],
    steps: [
      { title: 'Open the audit trail', detail: 'Access it from Administration (admins) to review recent activity.' },
      { title: 'Filter the log', detail: 'Narrow by user, action type, record or date range.' },
      { title: 'Inspect an entry', detail: 'Open an entry to see exactly what changed and by whom.' },
      { title: 'Export for evidence', detail: 'Export the filtered trail where a formal record is required.' },
    ],
    requiredFields: [],
    validationRules: [
      'The log is append-only and cannot be edited or deleted through the app.',
      'Entries are attributed to the authenticated user who acted.',
      'Timestamps are recorded automatically and cannot be back-dated.',
    ],
    bestPractices: [
      'Use the trail to confirm facts before raising a concern about a change.',
      'Filter tightly (user + date) to find the relevant entries quickly.',
      'Rely on the trail — never on memory — when reconstructing what happened.',
    ],
    commonMistakes: [
      'Assuming a record was not changed because you did not see it happen — check the trail.',
      'Expecting to edit the log; it is deliberately immutable.',
    ],
    relatedModules: ['admin', 'rbac', 'evidence'],
    whatHappensNext: [
      'The trail provides the evidence base for quality assurance and investigations.',
      'It demonstrates control and accountability to internal and external reviewers.',
    ],
    faqs: [
      { question: 'Can anyone edit the audit trail?', answer: 'No. It is append-only by design so it can be relied upon as evidence.' },
      { question: 'What actions are logged?', answer: 'Create, read where relevant, update, delete, print, export and approve actions on governed records.' },
    ],
    keywords: ['audit trail', 'log', 'history', 'immutable', 'accountability', 'timestamp', 'evidence', 'activity'],
  },

  // 19. ROLE-BASED ACCESS --------------------------------------------------
  {
    id: 'rbac',
    slug: 'role-based-access',
    title: 'Role-Based Access',
    icon: 'KeyRound',
    category: 'administration',
    route: '/admin/groups',
    summary:
      'How groups, module permissions and roles control what each user can see and do.',
    roles: ['audit_admin', 'audit_manager'],
    estimatedReadMinutes: 5,
    purpose:
      'Role-Based Access Control (RBAC) ensures every user sees only the modules they are entitled to and can only perform the actions their group allows — enforced consistently across the interface and the database.',
    whoShouldUse:
      'Administrators who assign access, and managers who need to understand why a user can or cannot perform an action.',
    businessProcess: [
      'Permissions are defined on groups, not individuals.',
      'Each group is granted actions per module (create, read, update, delete, print, approve, export).',
      'Users are assigned to one or more groups and inherit the combined permissions.',
      'The interface and database both enforce the same permissions.',
    ],
    steps: [
      { title: 'Open Groups', detail: 'Go to Administration → Groups.' },
      { title: 'Create or choose a group', detail: 'Start from a template (Manager, Auditor, Viewer, etc.) or build a custom group.' },
      { title: 'Set module permissions', detail: 'For each module, enable the specific actions the group may perform.' },
      { title: 'Assign users', detail: 'Add users to the group so they inherit its permissions.' },
      { title: 'Verify', detail: 'Confirm the user now sees the right modules and actions.' },
    ],
    requiredFields: [
      { name: 'Group Name', description: 'The name of the permission group.', required: true },
      { name: 'Module Permissions', description: 'The actions the group may perform per module.', required: true },
      { name: 'User Assignment', description: 'The users who belong to the group.', required: false },
    ],
    validationRules: [
      'Permissions are enforced at both the interface and database layers.',
      'A user with no group has no module access.',
      'Multiple groups combine to the union of their permissions.',
      'Administrator role overrides and can access all modules.',
    ],
    bestPractices: [
      'Design a small set of clear, reusable groups aligned to real job roles.',
      'Follow least privilege — grant the minimum actions needed.',
      'Separate approval from creation so no one approves their own work.',
      'Review permissions when roles change or annually.',
    ],
    commonMistakes: [
      'Giving everyone broad access "to be safe".',
      'Managing permissions per user instead of via groups.',
      'Allowing the same person to create and approve, defeating segregation of duties.',
    ],
    relatedModules: ['admin', 'audit-trail', 'login'],
    whatHappensNext: [
      'Users immediately see and can act on exactly what their groups permit.',
      'Access decisions are recorded, supporting security reviews.',
    ],
    faqs: [
      { question: 'What are the main roles?', answer: 'Audit Admin, Audit Manager, Auditor, Action Owner, Read-Only User and System Integrator — each mapped to a group with appropriate permissions.' },
      { question: 'A user is missing a button — why?', answer: 'Their group lacks that action (e.g. approve or export) on that module. Adjust the group\'s permissions.' },
    ],
    keywords: ['rbac', 'role', 'permission', 'group', 'access control', 'security', 'least privilege', 'segregation of duties'],
  },
]

// ---------------------------------------------------------------------------
// Route → article mapping
// ---------------------------------------------------------------------------

/** Exact route → article id. Longest-prefix match handles dynamic segments. */
export const ROUTE_HELP_MAP: Record<string, string> = {
  '/login': 'login',
  '/dashboard': 'dashboard',
  '/engagements': 'engagements',
  '/fieldwork': 'fieldwork',
  '/findings': 'findings',
  '/recommendations': 'recommendations',
  '/action-plans': 'action-plans',
  '/compliance': 'compliance',
  '/risk-register': 'risk-register',
  '/risk-events': 'risk-register',
  '/risk-profiles': 'risk-profiles',
  '/psap-scorecard': 'psap-scorecard',
  '/kra-workplan': 'kra-workplan',
  '/reports': 'reports',
  '/admin': 'admin',
  '/admin/users': 'admin',
  '/admin/groups': 'rbac',
  '/admin/modules': 'admin',
  '/admin/divisions': 'admin',
  '/admin/auditors': 'admin',
  '/notifications': 'notifications',
  '/api-docs': 'api-docs',
}

export function getArticleById(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.id === id)
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug)
}

/**
 * Resolve the best help article for a pathname.
 * Tries an exact match, then the longest matching route prefix so that
 * dynamic pages such as /engagements/123 resolve to the Engagements article.
 * Returns undefined for unknown routes (caller shows the Help Centre home).
 */
export function getArticleForRoute(pathname: string | null | undefined): HelpArticle | undefined {
  if (!pathname) return undefined
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/'

  if (ROUTE_HELP_MAP[clean]) return getArticleById(ROUTE_HELP_MAP[clean])

  const prefixes = Object.keys(ROUTE_HELP_MAP).sort((a, b) => b.length - a.length)
  for (const prefix of prefixes) {
    if (clean === prefix || clean.startsWith(prefix + '/')) {
      return getArticleById(ROUTE_HELP_MAP[prefix])
    }
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Contextual tooltips ("?" field help)
// ---------------------------------------------------------------------------

export const HELP_TOOLTIPS: Record<string, string> = {
  // Engagements
  'engagement-title': 'Enter the official name of the audit engagement.',
  'audit-objective': 'Explain what the audit is intended to examine or confirm.',
  'engagement-scope': 'Define the boundaries of the audit — the processes, locations and period covered.',
  'audited-unit': 'Select the division or unit being audited.',
  'audit-period': 'Set the date range the audit covers. The end date cannot be before the start date.',
  'lead-auditor': 'Assign the auditor accountable for delivering this engagement.',
  // Fieldwork
  'test-objective': 'State what this test is designed to confirm.',
  'procedure-performed': 'Document the exact steps you carried out so the test can be re-performed.',
  'sample-population': 'Describe what was examined and how the sample was selected.',
  'conclusion': 'Give your professional conclusion on whether the control operated effectively.',
  // Findings
  'finding-condition': 'Describe what is actually happening — the issue you observed.',
  'finding-criteria': 'State the policy, law or standard that should be met.',
  'finding-cause': 'Explain why the issue occurred (the root cause).',
  'finding-effect': 'Describe the consequence or risk if the issue is not addressed.',
  'risk-rating': 'Select the level of risk based on likelihood and impact.',
  // Evidence
  'evidence-upload': 'Attach documents, photos, workpapers or supporting records.',
  'evidence-description': 'Briefly describe what this evidence proves so reviewers understand it in context.',
  // Recommendations
  'recommendation-text': 'State the specific corrective action to be taken (make it SMART).',
  'recommendation-priority': 'Set the urgency: Critical, High, Medium or Low.',
  'action-owner': 'Nominate the division or officer accountable for implementing this action.',
  'target-date': 'Set the agreed date for completion.',
  'publish-recommendation': 'Only publish after the recommendation has been reviewed and approved.',
  // Action plans
  'action-progress': 'Update the percentage completed and attach implementation evidence.',
  'progress-note': 'Summarise what has been done since your last update.',
  'revised-target-date': 'If the original date cannot be met, set a new date and give a reason.',
  // Compliance
  'compliance-obligation': 'Record the specific requirement to be met.',
  'compliance-source': 'Cite the Act, regulation, PSAP standard or policy the obligation derives from.',
  'compliance-status': 'Set whether the obligation is compliant, partially compliant or non-compliant.',
  // Risk register / profiles
  'risk-title': 'State the risk clearly as cause → event → consequence.',
  'risk-category': 'Classify the risk (financial, operational, compliance, strategic, etc.).',
  'likelihood': 'Rate how likely the risk is to occur on the defined scale.',
  'impact': 'Rate the severity of consequences if the risk occurs.',
  'risk-owner': 'Assign the person accountable for managing this risk.',
  'treatment-strategy': 'Choose how the risk is treated: accept, mitigate, transfer or avoid.',
  'profile-context': 'Define the area, function or theme this risk profile assesses.',
  // PSAP
  'psap-score': 'Enter the score for this governance or financial compliance standard.',
  'assessment-period': 'Select the quarter this assessment covers.',
  // KRA
  'kra-target': 'Define a measurable target so performance can be tracked.',
  'quarter-status': 'Set the current status: on-track, at-risk, delayed or complete.',
  // Admin / RBAC
  'user-group': 'Assign the group whose permissions this user will inherit.',
  'group-permissions': 'Enable the specific actions this group may perform per module.',
  'active-status': 'Deactivating an account blocks sign-in across all DLPP systems.',

  // -------------------------------------------------------------------------
  // Page-level controls (search, filters, tables, primary actions)
  // Referenced by the "?" HelpTooltip icons embedded in each module page.
  // -------------------------------------------------------------------------

  // Dashboard
  'dashboard-kpis': 'Headline figures that refresh whenever you open the page — active engagements, open findings, pending recommendations and overdue actions. Select a card to drill into the module.',
  'dashboard-charts': 'Findings-by-risk and engagements-by-status show where audit effort and exposure are concentrated.',
  'dashboard-governance': 'Risk profile, PSAP ratings and KRA completion summarise governance health at a glance.',

  // Engagements
  'engagements-search': 'Search engagements by title to find one quickly.',
  'engagements-new': 'Create a new audit engagement. It must originate from an approved Risk Event for traceability.',
  'engagements-table': 'Every engagement with its lifecycle status. Use the row actions to view, edit or delete.',
  'engagement-status': 'The lifecycle stage: Planning → Fieldwork → Reporting → Follow-up → Closed.',
  'engagement-risk-event': 'The approved Risk Event this engagement originates from — this preserves the audit trail from risk to finding.',

  // Fieldwork
  'fieldwork-search': 'Search workpapers by title, procedure or engagement.',
  'fieldwork-new': 'Create a workpaper: the objective, procedure, sample, result and conclusion for a test.',
  'fieldwork-filter': 'Filter workpapers by engagement or status.',
  'fieldwork-table': 'Your workpapers and their conclusions. Attach evidence and raise findings from here.',

  // Findings
  'findings-search': 'Search findings by title or reference.',
  'findings-new': 'Raise a finding: condition, criteria, cause, effect and a risk rating.',
  'findings-risk-filter': 'Filter findings by risk rating (Low, Medium, High, Critical).',
  'findings-status-filter': 'Filter findings by their review/approval status.',
  'findings-table': 'The findings register with risk ratings. Approved findings become the basis for recommendations.',

  // Recommendations
  'recommendations-search': 'Search recommendations by text, owner or reference.',
  'recommendations-new': 'Draft a recommendation from an approved finding. Make it SMART and assign an owner and target date.',
  'recommendations-status-filter': 'Filter by status — Draft, Published or Implemented.',
  'recommendations-priority-filter': 'Filter by priority — Critical, High, Medium or Low.',
  'recommendations-table': 'All recommendations. Publishing a recommendation notifies the owner and opens an action plan.',

  // Action plans
  'action-plans-search': 'Search action plans by recommendation, owner or division.',
  'action-plans-status-filter': 'Filter by progress or status (in progress, complete, overdue, verified).',
  'action-plans-table': 'Track implementation: update progress, attach evidence and record verification here.',

  // Compliance
  'compliance-search': 'Search obligations by requirement, source or division.',
  'compliance-new': 'Register a compliance obligation and the authority it derives from.',
  'compliance-status-filter': 'Filter by compliance status — compliant, partially compliant or non-compliant.',
  'compliance-table': 'The obligations register. Link controls and drive findings for any gaps.',

  // Risk register
  'risk-register-search': 'Search risks by title, category or owner.',
  'risk-register-new': 'Add a risk to the register, then score likelihood × impact.',
  'risk-register-heatmap': 'Visualise risks by likelihood and impact. Colour reflects the risk score — focus on the highest exposures.',
  'risk-register-tabs': 'Switch between the risk register list and the heat-map view.',
  'risk-category-filter': 'Filter risks by category (financial, operational, compliance, strategic, etc.).',
  'risk-register-table': 'All organisational risks with their scores and treatment status.',

  // Risk events
  'risk-events-search': 'Search risk events by code, title or source.',
  'risk-events-new': 'Log a risk event from the Annual Audit Plan, a Secretary directive or a request.',
  'risk-events-status-filter': 'Filter risk events by their approval/allocation status.',
  'risk-events-source': 'Filter risk events by their originating source (AAAP, Secretary, External, Internal).',
  'risk-events-status': 'Filter risk events by their approval/allocation status.',
  'risk-events-priority': 'Filter risk events by priority (Critical, High, Medium, Low).',
  'risk-events-table': 'Risk events awaiting review, approval or allocation into engagements.',

  // Risk profiles
  'risk-profiles-search': 'Search risk profiles by name or context.',
  'risk-profiles-new': 'Create a structured risk profile for a division, function or theme.',
  'risk-profiles-table': 'Your risk profiles. Open one to add and score risk items within the matrix.',

  // PSAP scorecard
  'psap-new': 'Start a new quarterly PSAP assessment cycle.',
  'psap-period-filter': 'Select the assessment period (quarter) to view or edit.',
  'psap-tabs': 'Switch between the current quarter’s scores and the trend across quarters.',
  'psap-table': 'The 20 PSAP standards with their scores, commentary and evidence.',

  // KRA & workplan
  'kra-new': 'Define a new Key Result Area with a measurable target.',
  'kra-quarter-filter': 'Filter workplan activities by quarter.',
  'kra-tabs': 'Switch between your KRAs and the quarterly workplan activities.',
  'kra-table': 'KRAs and workplan activities with their quarterly status.',

  // Reports
  'reports-type': 'Choose the dataset the report is built from (engagements, findings, recommendations, actions or governance).',
  'reports-period': 'Set the reporting period so reports are comparable over time.',
  'reports-filters': 'Narrow the report by division, status or risk rating.',
  'reports-export': 'Export to CSV/Excel for analysis, or PDF/print for distribution. Only data you may access is included.',
  'reports-preview': 'Review the on-screen results before exporting or printing.',

  // Admin
  'admin-users-search': 'Search users by name, email or group.',
  'admin-users-new': 'Grant an existing DLPP identity access to the Audit System and assign a group.',
  'admin-groups-new': 'Create a permission group and set the actions it may perform per module.',
  'admin-divisions-new': 'Add an organisational division used across the system.',
  'admin-modules-new': 'Maintain the module catalogue that groups are granted permissions on.',
  'admin-table': 'Configuration records. Changes here are written to the immutable audit trail.',
}

export function getTooltip(key: string): string | undefined {
  return HELP_TOOLTIPS[key]
}

// ---------------------------------------------------------------------------
// Roles & categories helpers
// ---------------------------------------------------------------------------

export function getRoleById(id: HelpRoleId): HelpRole | undefined {
  return HELP_ROLES.find((r) => r.id === id)
}

export function getCategoryById(id: HelpCategoryId): HelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.id === id)
}

export function getArticlesByCategory(id: HelpCategoryId): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === id)
}

export function getArticlesByRole(id: HelpRoleId): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.roles.includes(id))
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  return article.relatedModules
    .map((id) => getArticleById(id))
    .filter((a): a is HelpArticle => Boolean(a))
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResult {
  article: HelpArticle
  score: number
  matchedOn: string
}

/**
 * Instant, weighted search across titles, summaries, keywords and body text.
 * Returns articles ordered by relevance.
 */
export function searchArticles(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return HELP_ARTICLES.map((article) => ({ article, score: 0, matchedOn: '' }))

  const terms = q.split(/\s+/).filter(Boolean)
  const results: SearchResult[] = []

  for (const article of HELP_ARTICLES) {
    let score = 0
    let matchedOn = ''

    const title = article.title.toLowerCase()
    const summary = article.summary.toLowerCase()
    const keywords = article.keywords.join(' ').toLowerCase()
    const body = [
      article.purpose,
      article.whoShouldUse,
      article.businessProcess.join(' '),
      article.steps.map((s) => `${s.title} ${s.detail}`).join(' '),
      article.bestPractices.join(' '),
      article.faqs.map((f) => `${f.question} ${f.answer}`).join(' '),
    ]
      .join(' ')
      .toLowerCase()

    for (const term of terms) {
      if (title.includes(term)) {
        score += 10
        if (!matchedOn) matchedOn = 'title'
      }
      if (keywords.includes(term)) {
        score += 6
        if (!matchedOn) matchedOn = 'keywords'
      }
      if (summary.includes(term)) {
        score += 4
        if (!matchedOn) matchedOn = 'summary'
      }
      if (body.includes(term)) {
        score += 1
        if (!matchedOn) matchedOn = 'content'
      }
    }

    if (score > 0) results.push({ article, score, matchedOn })
  }

  return results.sort((a, b) => b.score - a.score)
}

// ---------------------------------------------------------------------------
// Guided tours (React Joyride step definitions)
// ---------------------------------------------------------------------------
//
// Targets use `data-tour` attributes on shared layout elements so tours run
// reliably on any page. Content-only steps target `body` with center
// placement. Add new `data-tour` hooks to components as needed.

export const NEW_USER_TOUR_ID = 'new-user'

export const GUIDED_TOURS: TourDefinition[] = [
  {
    id: NEW_USER_TOUR_ID,
    name: 'New User Tour',
    description: 'A quick orientation to the whole system for first-time users.',
    icon: 'Sparkles',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Welcome to the DLPP Audit System', content: 'This short tour introduces the main areas. You can stop any time and restart it later from the Help Centre.' },
      { target: '[data-tour="sidebar"]', placement: 'right', title: 'Main navigation', content: 'Everything is grouped here — Risk Foundation, Audit Workflow, Governance, Reports and (for admins) Administration.' },
      { target: '[data-tour="global-search"]', placement: 'bottom', title: 'Global search', content: 'Jump to any engagement, finding or recommendation quickly from here.' },
      { target: '[data-tour="notifications"]', placement: 'bottom', title: 'Notifications', content: 'Assignments, approvals and overdue reminders appear here. Treat it as your to-do list.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'Help is always here', content: 'Select the floating Help button on any page for guidance on exactly where you are, plus guided tours.' },
      { target: '[data-tour="user-menu"]', placement: 'bottom', title: 'Your account', content: 'Manage your profile and sign out from here. Your single DLPP account works across all systems.' },
    ],
  },
  {
    id: 'dashboard-overview',
    name: 'Dashboard Overview',
    description: 'Understand your KPIs, charts and governance widgets.',
    route: '/dashboard',
    icon: 'LayoutDashboard',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Your dashboard', content: 'This is your command centre. Let us walk through the key areas on this page.' },
      { target: '[data-tour="page-header"]', placement: 'bottom', title: 'Where you are', content: 'Every page has this header showing the module name and quick actions.' },
      { target: '[data-tour="kpi-cards"]', placement: 'bottom', title: 'KPI cards', content: 'These cards show active engagements, open findings, pending recommendations and overdue actions. Select any card to drill in.' },
      { target: '[data-tour="charts"]', placement: 'top', title: 'Charts', content: 'Findings-by-risk and engagements-by-status show where effort and exposure are concentrated.' },
      { target: '[data-tour="governance-widgets"]', placement: 'top', title: 'Governance widgets', content: 'Risk profile, PSAP ratings and KRA completion summarise governance health at a glance.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'Need detail?', content: 'Open Help any time for the full Dashboard article and related topics.' },
    ],
  },
  {
    id: 'create-engagement',
    name: 'Create an Audit Engagement',
    description: 'Plan a new engagement, set scope and assign the team.',
    route: '/engagements',
    icon: 'Briefcase',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Engagements', content: 'An engagement is the container for a single audit — its objective, scope, team and lifecycle.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Start a new engagement', content: 'Use the New Engagement action to open the creation form, where you set the objective, scope and dates.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Find engagements fast', content: 'Search and filter the list to locate an engagement quickly.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'The engagement list', content: 'Every engagement appears here with its status. Use the row actions to view, edit or manage its lifecycle (Planning → Fieldwork → Reporting → Closed).' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Engagements guide, required fields and best practice.' },
    ],
  },
  {
    id: 'conduct-fieldwork',
    name: 'Conduct Fieldwork',
    description: 'Document workpapers, procedures and conclusions.',
    route: '/fieldwork',
    icon: 'FolderOpen',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Fieldwork', content: 'Workpapers are the evidence-grade record behind every finding.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Create a workpaper', content: 'Start a workpaper against the engagement you are testing — record the objective, procedure, result and conclusion.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Filter your workpapers', content: 'Narrow to the engagement or status you are working on.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Workpapers & evidence', content: 'Your workpapers appear here. Attach evidence and, where a test fails, raise a finding linked to the workpaper.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Fieldwork & Workpapers guide.' },
    ],
  },
  {
    id: 'upload-evidence',
    name: 'Upload Evidence',
    description: 'Attach and cross-reference supporting records.',
    route: '/fieldwork',
    icon: 'Upload',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Evidence', content: 'Evidence proves your conclusions and creates an immutable, dated trail.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Open the record', content: 'Go to the workpaper, finding or action plan the evidence supports, then use its evidence control.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Attach the file', content: 'Upload documents, photos or workpapers with clear file names, and describe what each proves.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Evidence Upload guide.' },
    ],
  },
  {
    id: 'create-finding',
    name: 'Create a Finding',
    description: 'Raise an issue with condition, criteria, cause, effect and rating.',
    route: '/findings',
    icon: 'AlertTriangle',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Findings', content: 'A finding formally records a control weakness or non-compliance.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'New finding', content: 'Create a finding and link it to its engagement. Complete condition, criteria, cause and effect.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Filter findings', content: 'Find findings by risk rating, status or engagement.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'The findings register', content: 'Findings appear here with their risk rating. Approved findings become the basis for published recommendations.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Findings guide and how to rate risk consistently.' },
    ],
  },
  {
    id: 'create-recommendation',
    name: 'Create a Recommendation',
    description: 'Draft, review and publish a corrective action.',
    route: '/recommendations',
    icon: 'CheckCircle',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Recommendations', content: 'A recommendation is the agreed corrective action for a finding.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Draft from a finding', content: 'Create a recommendation linked to the approved finding it resolves. Make it SMART and assign an owner, priority and target date.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Filter recommendations', content: 'Find recommendations by status, priority or owner.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Publish & track', content: 'Recommendations appear here. Only publish after review — publishing notifies the owner and opens the action plan.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Recommendations guide.' },
    ],
  },
  {
    id: 'update-action-plan',
    name: 'Update an Action Plan',
    description: 'Record progress, evidence and completion.',
    route: '/action-plans',
    icon: 'ClipboardList',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Action plans', content: 'This is where published recommendations are followed through to closure.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Find your action', content: 'Filter to your division or the recommendation you are implementing.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Update progress', content: 'Set percentage complete, add a progress note and attach evidence. Mark complete when done — an auditor independently verifies and closes it.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Action Plans guide.' },
    ],
  },
  {
    id: 'compliance-tracking',
    name: 'Compliance Tracking',
    description: 'Register obligations and assess compliance status.',
    route: '/compliance',
    icon: 'FileCheck',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Compliance', content: 'Track legal and regulatory obligations and the controls that satisfy them.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Register an obligation', content: 'Record the requirement, its source authority and the owning division.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Filter obligations', content: 'Narrow by source, division or compliance status.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Assess & remediate', content: 'Obligations appear here with their status. Link controls and drive findings and action plans for non-compliant items.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Compliance guide.' },
    ],
  },
  {
    id: 'risk-register',
    name: 'Risk Register',
    description: 'Add and score risks and read the heat map.',
    route: '/risk-register',
    icon: 'Shield',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Risk register', content: 'The central inventory of organisational risks.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Add a risk', content: 'Describe the risk as cause → event → consequence, assign an owner and score likelihood × impact.' },
      { target: '[data-tour="tabs"]', placement: 'bottom', title: 'Register & heat map', content: 'Switch between the register list and the heat-map view of exposures.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Prioritise by score', content: 'Risks appear here with their score. Use the highest exposures to inform risk-based audit planning.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Risk Register guide.' },
    ],
  },
  {
    id: 'risk-profile-creation',
    name: 'Create a Risk Profile',
    description: 'Build a structured risk assessment matrix.',
    route: '/risk-profiles',
    icon: 'Activity',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Risk profiles', content: 'A structured, matrix-based assessment for a division, function or theme.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Create a profile', content: 'Name the profile and set its context — the area being assessed.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Find a profile', content: 'Search or filter to the profile you want to work on.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Assess & review', content: 'Profiles appear here. Open one to add risk items under each category, score them and review the aggregated matrix.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Risk Profiles guide.' },
    ],
  },
  {
    id: 'psap-assessment',
    name: 'PSAP Assessment',
    description: 'Run a quarterly PSAP scorecard assessment.',
    route: '/psap-scorecard',
    icon: 'TrendingUp',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'PSAP scorecard', content: 'Quarterly self-assessment against the 20 PSAP financial & governance standards.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'New assessment', content: 'Open a new quarterly cycle, then score each of the 20 standards with commentary and evidence.' },
      { target: '[data-tour="tabs"]', placement: 'bottom', title: 'Scores & trend', content: 'Switch between the current scores and the trend across previous quarters.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Standards & ratings', content: 'The standards and their scores appear here. Low-scoring standards drive compliance obligations and action plans.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full PSAP Scorecard guide.' },
    ],
  },
  {
    id: 'kra-quarterly-update',
    name: 'KRA Quarterly Update',
    description: 'Update workplan status against your KRAs.',
    route: '/kra-workplan',
    icon: 'Target',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'KRA & workplan', content: 'Key Result Areas and the quarterly activities that deliver them.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Define / open a KRA', content: 'Set measurable targets and schedule workplan activities across the quarters.' },
      { target: '[data-tour="tabs"]', placement: 'bottom', title: 'KRAs & workplan', content: 'Switch between your KRAs and the quarterly workplan activities.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Update status', content: 'Each quarter set activities on-track, at-risk, delayed or complete. Overall completion appears on the dashboard KRA widget.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full KRA & Workplan guide.' },
    ],
  },
  {
    id: 'reports-generation',
    name: 'Generate Reports',
    description: 'Build, filter and export reports.',
    route: '/reports',
    icon: 'BarChart3',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'Reports', content: 'Consolidate data into shareable, BI-ready outputs.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Choose type & period', content: 'Pick the report type and reporting period, then apply division, status or risk filters.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Preview & export', content: 'Review the on-screen results, then export to CSV/Excel for analysis or PDF/print for distribution.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Reports guide.' },
    ],
  },
  {
    id: 'admin-user-management',
    name: 'Admin: User Management',
    description: 'Create users and manage group permissions.',
    route: '/admin/users',
    icon: 'Users',
    steps: [
      { target: 'body', placement: 'center', disableBeacon: true, title: 'User management', content: 'Administrators create accounts and control access through groups.' },
      { target: '[data-tour="page-actions"]', placement: 'bottom', title: 'Add a user', content: 'Grant an existing DLPP identity access to the Audit System and assign a group.' },
      { target: '[data-tour="filters"]', placement: 'bottom', title: 'Find a user', content: 'Search for a user by name, email or group.' },
      { target: '[data-tour="table"]', placement: 'top', title: 'Manage access', content: 'Users appear here. Apply least privilege and deactivate leavers rather than deleting them, so the audit trail stays intact.' },
      { target: '[data-tour="help-button"]', placement: 'left', title: 'More detail', content: 'Open Help for the full Administration and Role-Based Access guides.' },
    ],
  },
]

export function getTourById(id: string): TourDefinition | undefined {
  return GUIDED_TOURS.find((t) => t.id === id)
}

export function getTourForRoute(pathname: string | null | undefined): TourDefinition | undefined {
  if (!pathname) return undefined
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/'
  const exact = GUIDED_TOURS.find((t) => t.route === clean)
  if (exact) return exact
  const article = getArticleForRoute(clean)
  return article?.tourId ? getTourById(article.tourId) : undefined
}

// ---------------------------------------------------------------------------
// Quick start guide (new-user onboarding checklist)
// ---------------------------------------------------------------------------

export interface QuickStartItem {
  title: string
  description: string
  icon: string
  articleId: string
}

export const QUICK_START_GUIDE: QuickStartItem[] = [
  { title: 'Sign in with your DLPP account', description: 'One account works across Audit, Land Cases and Corporate. No separate audit login is needed.', icon: 'LogIn', articleId: 'login' },
  { title: 'Get oriented on the dashboard', description: 'Read your KPIs, charts and governance widgets to see what needs attention today.', icon: 'LayoutDashboard', articleId: 'dashboard' },
  { title: 'Understand the audit workflow', description: 'Engagement → Fieldwork → Findings → Recommendations → Action Plans. Each step builds on the last.', icon: 'Workflow', articleId: 'engagements' },
  { title: 'Know how evidence works', description: 'Attach and cross-reference documents so every conclusion has an immutable, dated trail.', icon: 'Upload', articleId: 'evidence' },
  { title: 'See the governance modules', description: 'Risk register, risk profiles, PSAP scorecard and KRAs keep governance measurable.', icon: 'ShieldCheck', articleId: 'risk-register' },
  { title: 'Learn your access', description: 'What you can see and do depends on your role and group. Ask an admin if something is missing.', icon: 'KeyRound', articleId: 'rbac' },
]
