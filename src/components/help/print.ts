import type { HelpArticle } from '@/help/help-content'
import { HELP_ARTICLES, HELP_CATEGORIES, getCategoryById } from '@/help/help-content'

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function list(items: string[]): string {
  if (!items.length) return ''
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
}

function section(title: string, body: string): string {
  if (!body) return ''
  return `<section><h3>${esc(title)}</h3>${body}</section>`
}

/** Render a single article to printable HTML fragment. */
export function articleToPrintableHtml(article: HelpArticle): string {
  const category = getCategoryById(article.category)
  return `
    <article class="doc">
      <header class="doc-head">
        <p class="eyebrow">${esc(category?.name ?? 'Help')}</p>
        <h2>${esc(article.title)}</h2>
        <p class="summary">${esc(article.summary)}</p>
      </header>
      ${section('Purpose', `<p>${esc(article.purpose)}</p>`)}
      ${section('Who should use it', `<p>${esc(article.whoShouldUse)}</p>`)}
      ${section('Business process', list(article.businessProcess))}
      ${section(
        'Step-by-step instructions',
        `<ol>${article.steps
          .map((s) => `<li><strong>${esc(s.title)}.</strong> ${esc(s.detail)}</li>`)
          .join('')}</ol>`
      )}
      ${section(
        'Required fields',
        article.requiredFields.length
          ? `<table><thead><tr><th>Field</th><th>Description</th><th>Required</th></tr></thead><tbody>${article.requiredFields
              .map(
                (f) =>
                  `<tr><td>${esc(f.name)}</td><td>${esc(f.description)}</td><td>${
                    f.required ? 'Yes' : 'Optional'
                  }</td></tr>`
              )
              .join('')}</tbody></table>`
          : ''
      )}
      ${section('Validation rules', list(article.validationRules))}
      ${section('Best practice tips', list(article.bestPractices))}
      ${section('Common mistakes', list(article.commonMistakes))}
      ${section('What happens next', list(article.whatHappensNext))}
      ${section(
        'Frequently asked questions',
        article.faqs
          .map((f) => `<div class="faq"><p class="q">${esc(f.question)}</p><p class="a">${esc(f.answer)}</p></div>`)
          .join('')
      )}
    </article>
  `
}

const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; line-height: 1.55; }
  .cover { border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 28px; }
  .cover h1 { font-size: 26px; margin: 0 0 6px; color: #064e3b; }
  .cover p { margin: 2px 0; color: #475569; font-size: 13px; }
  .eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; font-weight: 700; color: #059669; margin: 0 0 4px; }
  .doc { page-break-after: always; margin-bottom: 32px; }
  .doc:last-child { page-break-after: auto; }
  .doc-head h2 { font-size: 20px; margin: 0 0 6px; color: #0f172a; }
  .doc-head .summary { color: #475569; font-size: 13px; margin: 0 0 8px; }
  section { margin: 14px 0; }
  h3 { font-size: 14px; color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 0 0 8px; }
  ul, ol { margin: 0; padding-left: 20px; }
  li { margin: 4px 0; font-size: 13px; }
  p { font-size: 13px; margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; }
  .faq { margin-bottom: 8px; }
  .faq .q { font-weight: 600; margin: 0; }
  .faq .a { color: #475569; margin: 2px 0 0; }
  @page { margin: 18mm; }
`

/** Print arbitrary help HTML using a hidden iframe (safe inside embedded previews). */
export function printHelpDocument(title: string, coverSubtitle: string, innerHtml: string): void {
  if (typeof document === 'undefined') return

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    iframe.remove()
    return
  }

  const generated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  doc.open()
  doc.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${esc(title)}</title><style>${PRINT_STYLES}</style></head>
    <body>
      <div class="cover">
        <p class="eyebrow">DLPP Internal Audit &amp; Compliance System</p>
        <h1>${esc(title)}</h1>
        <p>${esc(coverSubtitle)}</p>
        <p>Generated ${esc(generated)}</p>
      </div>
      ${innerHtml}
    </body></html>`)
  doc.close()

  const cleanup = () => window.setTimeout(() => iframe.remove(), 1000)
  iframe.contentWindow?.focus()
  // Give the iframe a tick to lay out before printing.
  window.setTimeout(() => {
    try {
      iframe.contentWindow?.print()
    } finally {
      cleanup()
    }
  }, 300)
}

/** Print a single article. */
export function printArticle(article: HelpArticle): void {
  printHelpDocument(article.title, article.summary, articleToPrintableHtml(article))
}

/** Print the full user guide (every article, grouped by category). */
export function printFullGuide(): void {
  const body = HELP_CATEGORIES.map((cat) => {
    const articles = HELP_ARTICLES.filter((a) => a.category === cat.id)
    if (!articles.length) return ''
    return articles.map(articleToPrintableHtml).join('')
  }).join('')

  printHelpDocument(
    'User Guide',
    'Complete training manual for all modules',
    body
  )
}
