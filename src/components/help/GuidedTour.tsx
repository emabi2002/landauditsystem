'use client'

import * as React from 'react'
import Joyride, { STATUS, ACTIONS, type CallBackProps, type Step } from 'react-joyride'
import { getTourById } from '@/help/help-content'
import { useHelp } from './HelpProvider'

/**
 * Renders the active guided tour. The tour to run is controlled entirely by
 * the HelpProvider (`activeTourId`). Tours use `data-tour` selectors on shared
 * layout components, with `body` + center placement for descriptive steps.
 */
export function GuidedTour() {
  const { activeTourId, stopTour } = useHelp()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const tour = activeTourId ? getTourById(activeTourId) : undefined

  const steps: Step[] = React.useMemo(() => {
    if (!tour) return []
    return tour.steps.map((s) => ({
      target: s.target,
      title: s.title,
      content: s.content,
      placement: s.placement,
      disableBeacon: s.disableBeacon ?? true,
    }))
  }, [tour])

  const handleCallback = React.useCallback(
    (data: CallBackProps) => {
      const { status, action } = data
      const finished = ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)
      if (finished || action === ACTIONS.CLOSE) {
        stopTour()
      }
    },
    [stopTour]
  )

  if (!mounted || !tour) return null

  return (
    <Joyride
      key={tour.id}
      steps={steps}
      run
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrollParentFix
      callback={handleCallback}
      locale={{ back: 'Back', close: 'Close', last: 'Finish', next: 'Next', skip: 'Skip tour' }}
      styles={{
        options: {
          primaryColor: '#059669',
          textColor: '#0f172a',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          overlayColor: 'rgba(15, 23, 42, 0.55)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          fontSize: 14,
          padding: 20,
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 700,
          color: '#064e3b',
        },
        tooltipContent: {
          color: '#475569',
          padding: '8px 0',
        },
        buttonNext: {
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 14px',
        },
        buttonBack: {
          color: '#64748b',
          fontSize: 13,
          marginRight: 8,
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: 13,
        },
        spotlight: {
          borderRadius: 10,
        },
      }}
    />
  )
}
