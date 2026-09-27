# Common Ground

A flat-hunting alignment tool for three friends. Each person fills in one private, zero-typing form. Once all three have submitted, the app shows up to three flats (**Option A / B / C**, never ranked) that pass everyone's dealbreakers, with exactly what each person gets and gives up.

## Deploy (Vercel + Neon Postgres)

1. In Vercel, **Add New → Project** and import this GitHub repo. Keep the default settings.
2. In the project, open **Storage → Create Database → Neon (Postgres)** and connect it to the project. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. **Redeploy.** The `vercel-build` script runs `prisma migrate deploy`, so the tables are created on the first deploy.
4. Open `/demo` on your deployed URL to create the example group.

## Local setup

Requires Node 20+ and a Postgres database. The easiest option is the same Neon database, or a separate Neon branch.

```bash
npm install
cp .env.example .env        # paste DATABASE_URL and DATABASE_URL_UNPOOLED from Vercel/Neon
npx prisma migrate deploy
npm run seed
npm run dev
```

Open http://localhost:3000. The home page is the whole first step: enter three names and tap **Start our group**. You'll get one invite per person to copy into WhatsApp, plus a group link where the results appear once all three have submitted.

> With npm 11+, approve the Prisma/esbuild install scripts if prompted (`npm install-scripts approve …`); they're already listed under `allowScripts` in `package.json`.

## Demo

- **http://localhost:3000/demo** resets the Riya / Meera / Kavita group with scenario answers (everyone submitted) and opens the results.
- Personal links for the demo: `/g/demo/p/demo-riya`, `/g/demo/p/demo-meera`, `/g/demo/p/demo-kavita`.
- In development, every personal form has **Fill as Riya / Meera / Kavita with demo answers** buttons.
- `npx tsx scripts/demo-report.ts` prints what the engine picks for the demo, plus close calls and exclusions.

## Reset the database

```bash
npm run db:reset   # drops, re-migrates and re-seeds
```

## Tests and checks

```bash
npm test           # Vitest suite for the matching engine
npm run typecheck
npm run lint
```

## How it's organised

```
app/                    routes (home = start a group, /demo, /g/[groupId], /g/[groupId]/p/[token], api/*)
components/ui           ThreeStateToggle, Chip/AreaChip, Slider, RevealUp, FloatingBadge, GlassNav, Button, ListingArt
components/form         questionnaire steps, autosave, review
components/results      OptionCard, PersonColumn, BalanceMeter, ExclusionPanel, DealbreakerStrip
lib/data/catalog.ts     ALL user-facing labels (areas, amenities, lifestyle, anchor types). Edit copy here.
lib/data/*              listing + commute loaders (the only place that reads data/*.json)
lib/matching/*          pure matching engine: no React, no DB
lib/db/*                repository layer (Prisma)
lib/group-view.ts       privacy rules: what each endpoint is allowed to reveal
lib/schema.ts           Zod schemas (validated on every write)
data/                   listings.json, commute.json (generated)
scripts/                data generator (listings-src.ts → listings.json, commute.ts → commute.json)
```

### Privacy

- `GET /api/groups/:id` returns only names and submitted/pending status until all three have submitted. Then it adds results and each person's edit link.
- `GET/PUT /api/groups/:id/people/:token` returns and accepts only that person's own answers.
- Group IDs (12 chars) and person tokens (21 chars) come from nanoid, so they can't be guessed.

### Matching, in short

1. **Hard rules**: budget, deposit, excluded areas, must-commutes, floor/lift, must amenities/rules, minimum bathrooms. Breaking any of these excludes a flat for everyone.
2. **Score**: counts nice-to-haves only (items ×1, commutes ×2 with linear decay to limit+20 min, preferred area ×2, under-budget ×1, bathrooms ×1).
3. **Room allocation**: tries all 6 person→room permutations. It picks the one with the fewest must-have breaks, then the highest minimum score.
4. **Fairness ranking**: sorts by min score, then mean score, then smallest spread.
5. **Diversified pick**: greedy MMR (0.7 × quality − 0.3 × similarity to options already picked).
6. **Near-misses**: if fewer than 3 flats are eligible, flats breaking exactly one must-have (then two) fill the gaps, clearly flagged.

## Swapping in real listing data

1. Produce listings that match the `Listing` type in `lib/data/types.ts`. Area IDs must be the ones in `lib/data/catalog.ts`, and amenity/lifestyle IDs must come from the same file.
2. Either replace `data/listings.json`, or change `getListings()` in `lib/data/listings.ts` to read from an API or DB table. Nothing else imports the JSON.
3. For real travel times, replace `getCommute()` in `lib/data/commute.ts` (e.g. with cached results from a routing API). It must return minutes for `(fromArea, toArea)`.
4. To edit the sample data instead, change `scripts/listings-src.ts` or `scripts/commute.ts`, then run `npm run gen:listings`. After that, `npm test` confirms the demo still produces three distinct options.

## Using Supabase instead of Neon

Set `DATABASE_URL` to Supabase's pooled connection string and `DATABASE_URL_UNPOOLED` to its direct connection string. All DB access goes through `lib/db/*`.
