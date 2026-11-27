[![competition](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/AsepXy10/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/AsepXy10/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

# DealHound — Real Black Friday Deals, Checked Today

A static Black Friday deal finder for [black-friday-deal-finder-01](https://make.fun/bounty/black-friday-deal-finder-01): 25 real deals from Amazon, Best Buy, Target and Walmart, each with its product, store, store link, sale price, usual price, discount and the time its price was checked — plus an honest verdict on whether it is really a deal.

## What it does

- **Search** deals by product, store or category text.
- **Filter** by category, store and discount size (20%+, 40%+, 50%+).
- **Sort** by biggest discount, biggest dollar saving, lowest price or name.
- **Verdicts**: NEW LOW (lowest price ever tracked), STRONG DEAL (a big genuine cut) or ROUTINE SALE (a small or first modest cut) — with the evidence for each.
- **Deal pages**: every deal opens its own page (`#/deal/<id>`) with the price math, how the price was checked, the source report and the store link.
- **Phone layout**: the grid, filters and detail page reflow for a phone screen.

## How the deals were checked

Every price was checked on **27 Nov 2026** from the store's own pages or a deals report that names the store (9to5Toys, 9to5Google, 9to5Mac, MacRumors, Digital Citizen, DealNews and others). Each deal card shows its source and check date; store links open the store's search for the exact product so the live price can be seen before buying. Prices move fast on Black Friday — the check date is on every deal.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no dependencies, no network requests at run time. The site is plain static files under `app/`; `main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/index.html` — the page shell: header, stats, filters, grid, detail view, method note
- `app/style.css` — the whole look, including the phone layout
- `app/deals.js` — the 25 checked deals and the price helpers
- `app/finder.js` — rendering, search, filters, sorting and the detail route
- `app/main.js` — boot module
- `screenshots/` — renders of the site running
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
