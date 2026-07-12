'use client'

import * as React from 'react'
import {
  Check,
  X,
  Lightbulb,
  ListChecks,
  Info,
  Users,
  Clock,
  PlayCircle,
  Star,
  Printer,
  FileDown,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Workflow,
  ClipboardCheck,
  ShieldAlert,
  Video,
  HelpCircle,
} from 'lucide-react'
import type { HelpArticle } from '@/help/help-content'
import { getCategoryById, getRoleById } from '@/help/help-content'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useHelp } from './HelpProvider'
import { resolveIcon } from './icon-map'
import { RelatedTopics } from './RelatedTopics'
import { printArticle } from './print'
import { cn } from '@/lib/utils'

interface HelpArticleViewProps {
  article: HelpArticle
  onSelectRelated: (articleId: string) => void
  className?: string
}

function Section({
  icon: Icon,
  title,
  iconClass,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  iconClass?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className={cn('h-4 w-4', iconClass ?? 'text-emerald-600')} />
        {title}
      </h3>
      <div className="pl-6 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export function HelpArticleView({ article, onSelectRelated, className }: HelpArticleViewProps) {
  const {
    isFavourite,
    toggleFavourite,
    addRecent,
    voteHelpful,
    helpfulVotes,
    startTour,
  } = useHelp()

  React.useEffect(() => {
    addRecent(article.id)
  }, [article.id, addRecent])

  const category = getCategoryById(article.category)
  const Icon = resolveIcon(article.icon)
  const fav = isFavourite(article.id)
  const vote = helpfulVotes[article.id]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                  {category.name}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" /> {article.estimatedReadMinutes} min read
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{article.title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{article.summary}</p>
          </div>
        </div>

        {/* Roles */}
        {article.roles.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pl-14">
            <span className="text-[11px] font-medium text-slate-400">For:</span>
            {article.roles.map((roleId) => {
              const role = getRoleById(roleId)
              if (!role) return null
              return (
                <span
                  key={roleId}
                  className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', role.color)}
                >
                  {role.name}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        {article.tourId && (
          <button
            type="button"
            onClick={() => startTour(article.tourId as string)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <PlayCircle className="h-3.5 w-3.5" /> Start guided tour
          </button>
        )}
        <button
          type="button"
          onClick={() => toggleFavourite(article.id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            fav
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <Star className={cn('h-3.5 w-3.5', fav && 'fill-amber-400 text-amber-400')} />
          {fav ? 'Favourited' : 'Favourite'}
        </button>
        <button
          type="button"
          onClick={() => printArticle(article)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
        <button
          type="button"
          onClick={() => printArticle(article)}
          title="Use your browser's “Save as PDF” option in the print dialog"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <FileDown className="h-3.5 w-3.5" /> Download PDF
        </button>
      </div>

      {/* Video placeholder */}
      {article.hasVideo && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
            <Video className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700">Video training</p>
            <p className="text-xs text-slate-500">
              A short walkthrough video for “{article.title}” will appear here.
            </p>
          </div>
        </div>
      )}

      <div className="h-px bg-slate-100" />

      {/* Purpose */}
      <Section icon={Info} title="Purpose">
        <p>{article.purpose}</p>
      </Section>

      {/* Who should use */}
      <Section icon={Users} title="Who should use it">
        <p>{article.whoShouldUse}</p>
      </Section>

      {/* Business process */}
      <Section icon={Workflow} title="Business process">
        <ol className="space-y-1.5">
          {article.businessProcess.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Steps */}
      <Section icon={ListChecks} title="Step-by-step instructions">
        <ol className="space-y-3">
          {article.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{step.title}</p>
                <p className="text-slate-600">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        {/* Screenshot placeholder */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-400">
          <HelpCircle className="h-3.5 w-3.5" /> Annotated screenshots for these steps will be added here.
        </div>
      </Section>

      {/* Required fields */}
      {article.requiredFields.length > 0 && (
        <Section icon={ClipboardCheck} title="Required fields">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Field</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {article.requiredFields.map((field) => (
                  <tr key={field.name}>
                    <td className="px-3 py-2 font-medium text-slate-700">{field.name}</td>
                    <td className="px-3 py-2 text-slate-600">{field.description}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          field.required ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {field.required ? 'Required' : 'Optional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Validation rules */}
      {article.validationRules.length > 0 && (
        <Section icon={ShieldAlert} title="Validation rules" iconClass="text-blue-600">
          <ul className="space-y-1.5">
            {article.validationRules.map((rule, i) => (
              <li key={i} className="flex gap-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Best practices */}
      <Section icon={Lightbulb} title="Best practice tips" iconClass="text-emerald-600">
        <ul className="space-y-1.5">
          {article.bestPractices.map((tip, i) => (
            <li key={i} className="flex gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Common mistakes */}
      <Section icon={ShieldAlert} title="Common mistakes" iconClass="text-red-500">
        <ul className="space-y-1.5">
          {article.commonMistakes.map((mistake, i) => (
            <li key={i} className="flex gap-2">
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* What happens next */}
      <Section icon={ArrowRight} title="What happens next">
        <ul className="space-y-1.5">
          {article.whatHappensNext.map((item, i) => (
            <li key={i} className="flex gap-2">
              <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* FAQs */}
      {article.faqs.length > 0 && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            Frequently asked questions
          </h3>
          <Accordion type="single" collapsible className="rounded-lg border border-slate-200 px-3">
            {article.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className={i === article.faqs.length - 1 ? 'border-b-0' : ''}>
                <AccordionTrigger className="text-left text-sm">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Related topics */}
      {article.relatedModules.length > 0 && (
        <>
          <div className="h-px bg-slate-100" />
          <RelatedTopics articleIds={article.relatedModules} onSelect={onSelectRelated} />
        </>
      )}

      {/* Feedback */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        {vote ? (
          <p className="text-center text-sm text-slate-600">
            Thanks for your feedback{vote === 'up' ? ' — glad this helped!' : ' — we’ll keep improving this.'}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <span className="text-sm font-medium text-slate-700">Was this helpful?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => voteHelpful(article.id, 'up')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                <ThumbsUp className="h-3.5 w-3.5" /> Yes
              </button>
              <button
                type="button"
                onClick={() => voteHelpful(article.id, 'down')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-300 hover:text-red-600"
              >
                <ThumbsDown className="h-3.5 w-3.5" /> No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
