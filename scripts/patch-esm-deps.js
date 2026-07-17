/**
 * Force react-joyride + react-floater to resolve to their CommonJS builds.
 *
 * WHY: react-floater's ESM (es/index.js) and react-joyride's ESM (dist/index.mjs)
 * do `import * as ReactDOM from 'react-dom'` and use the legacy
 * `unmountComponentAtNode` / `unstable_renderSubtreeIntoContainer` APIs. Webpack's
 * strict ESM named-export check rejects those (React 18 exposes them only on the
 * CJS module), failing the production build. A next.config webpack alias fixes it
 * locally, but @netlify/plugin-nextjs doesn't honour that alias, so the Netlify
 * client build still resolves the ESM entry via the `module` / `exports` fields.
 *
 * Removing the `module` (and `exports`) fields from the installed package.json
 * makes webpack fall back to `main` (CommonJS) in EVERY environment, which uses
 * the react-dom APIs at runtime instead of via a statically-checked ESM import.
 *
 * Runs as `postinstall` and again in the Netlify build command (idempotent).
 */
const fs = require('fs')
const path = require('path')

function forceCjs(pkg, removeExports) {
  try {
    const pkgJsonPath = path.join(__dirname, '..', 'node_modules', pkg, 'package.json')
    if (!fs.existsSync(pkgJsonPath)) {
      console.log(`[patch-esm-deps] ${pkg}: not installed, skipping`)
      return
    }
    const json = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
    let changed = false
    if (json.module) {
      delete json.module
      changed = true
    }
    if (removeExports && json.exports) {
      delete json.exports
      changed = true
    }
    if (changed) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(json, null, 2) + '\n')
      console.log(`[patch-esm-deps] ${pkg}: forced CommonJS (main=${json.main})`)
    } else {
      console.log(`[patch-esm-deps] ${pkg}: already CommonJS-only`)
    }
  } catch (e) {
    console.log(`[patch-esm-deps] ${pkg}: failed -`, e.message)
  }
}

forceCjs('react-floater', false)
forceCjs('react-joyride', true)
