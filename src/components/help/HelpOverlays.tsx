'use client'

import { HelpDrawer } from './HelpDrawer'
import { GuidedTour } from './GuidedTour'

/**
 * Bundles the on-demand help UI (route-aware drawer + react-joyride tour engine)
 * into a single client-only chunk. The dashboard layout lazy-loads *this one*
 * component with `ssr: false`, which:
 *  - keeps react-joyride (browser-only) out of server rendering, and
 *  - collapses what used to be two separate dynamic chunks into one, reducing
 *    the chance of a dev-mode ChunkLoadError on either boundary.
 */
export function HelpOverlays() {
  return (
    <>
      <HelpDrawer />
      <GuidedTour />
    </>
  )
}
