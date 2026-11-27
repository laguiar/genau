# Genau Web App (`app/`)

Genau's browser app is a **zero-build static web app** built on native ES Modules (`<script type="module">`) and layered CSS (`@layer`). It runs directly on GitHub Pages (`.nojekyll`) with no bundler or `node_modules`.

## Local development

Start a local static server from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/`.

## Testing & linting

Run all unit and content checks with Node 22+:

```sh
node --test practice/model.test.js app/tests/*.test.js
```

Lint HTML, CSS, JS, and JSON with Biome:

```sh
npx -y @biomejs/biome lint --error-on-warnings index.html app practice
```

## Architecture map

```text
index.html                  ← Semantic HTML shell, FOUC-free color-scheme init, stylesheet links
app/
├── package.json            ← Scopes "type": "module" to app/ for Node tests
├── main.js                 ← Boot sequence, hash router, AbortController navigation, global listeners
├── store.js                ← State schema, validation, localStorage persistence, theme & cross-tab sync
├── data/
│   ├── assets.js           ← SVG icons, flags, contrast language metadata
│   └── course.js           ← 65-lesson syllabus catalog, lookup maps, status & case constants
├── lib/                    ← Pure, DOM-free logic (unit-tested in app/tests/)
│   ├── dates.js            ← Local calendar ISO date arithmetic & validation
│   ├── diagrams.js         ← Grammar bracket grids (Satzklammer) & gender paradigm tables
│   ├── diagnostic-model.js ← Diagnostic parser, German answer normalization & rule matching
│   ├── docs.js             ← Cached Markdown fetcher (AbortSignal.any + timeout) & card deck loader
│   ├── flashcards-model.js ← Flashcard Markdown parser, SRS interval ladder, queue builders
│   └── markdown.js         ← Editorial Markdown renderer, contrast boxes & lesson masthead
├── ui/                     ← Shared app chrome
│   ├── shell.js            ← Theme meta sync, toast, badges, language pills, popover helpers
│   └── sidebar.js          ← Collapsible course tree, search filter, mobile modal drawer
├── views/                  ← Route views
│   ├── home.js             ← Overview dashboard & first-run language chooser
│   ├── reader.js           ← Lesson & reference document view, toolbar, AI tutor prompt export
│   ├── diagnostic.js       ← Interactive one-at-a-time lesson diagnostic widget
│   ├── flashcards.js       ← Spaced-repetition & topic-practice flashcard studio
│   └── practice.js         ← Adapter mounting practice/view.js
├── styles/                 ← Layered CSS (@layer tokens, base, layout, components, views, responsive, print)
│   ├── tokens.css          ← color-scheme + light-dark() design tokens & typography variables
│   ├── base.css            ← Base typography, buttons, popovers, badges, toast, reduced motion
│   ├── layout.css          ← Topbar, CSS scroll-driven reading progress bar, sidebar & content grid
│   ├── home.css            ← Overview view styles
│   ├── reader.css          ← Reading sheet, tables, diagrams, contrast boxes & animated <details>
│   ├── diagnostic.css      ← Lesson diagnostic styles
│   ├── flashcards.css      ← Flashcards studio & practice panel styles
│   └── responsive.css      ← Breakpoints (<=1024px, <=720px, <=560px) & print styles
└── tests/                  ← Node built-in test runner suites (markdown, diagnostic, flashcards, store)
```
