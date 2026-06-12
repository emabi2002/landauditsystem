# UI/UX Unification — Match landcasesystem

Goal: Adapt landcasesystem's font, spacing, and paddings across ALL landauditsystem pages.

## Design pattern (from landcasesystem)
- Sticky header bar: `sticky top-16 z-20 bg-white border-b border-slate-200 px-6 py-4`
  - inner: `max-w-7xl mx-auto flex items-center justify-between`
  - icon `h-5 w-5 text-slate-600` + divider `h-6 w-px bg-slate-300`
  - title `text-xl font-semibold text-slate-900`, subtitle `text-xs text-slate-500`
- Content container: `max-w-7xl mx-auto px-6 py-6`
- Primary action buttons: `bg-emerald-600 hover:bg-emerald-700`, `size="sm"`

## Tasks
- [x] Analyze landcasesystem design system
- [x] Create `PageHeader` component (with optional backHref)
- [x] Update `AppLayout` (remove p-4 md:p-6 wrapper)
- [x] Convert dashboard (reference)
- [x] Convert ALL pages: action-plans, admin, admin/users, admin/divisions, admin/groups, admin/modules, admin/auditors, compliance, engagements, fieldwork, findings, kra-workplan, psap-scorecard, recommendations, reports, risk-events, risk-profiles, risk-profiles/[id], risk-register
- [x] Verify production build (25/25 routes compiled, no errors)
- [ ] Final visual verification via screenshots

Note: api-docs left as-is (standalone public page outside the dashboard shell).
