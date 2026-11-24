# SEO + GEO plan, globalworking.no (November 2026)

Date: 24-11-2026. Sources: Google Search Console (sc-domain:globalworking.no, read only), `npm run build` + audit of the HTML in `dist/`, and competitor research (WebSearch/WebFetch; WebSearch is not google.no, so the SERPs are indicative).

The goal behind every action: a Norwegian employer (kommune, sykehjem, helseforetak) must see a real, established recruitment company, not a vikarbyrå or bemanningsbyrå.

Confirmed facts that can be used: founded in 2014; CEO Pablo Lanza; 2500+ candidates trained and placed (historical total); Vågå and Sør-Fron as the named kommuner.

Must NOT be published without confirmation: authorization number 9900000462, ISO scope, org.nr., any other kommune by name.

---

## 1. Search Console: before vs after (titles, descriptions and schema changed on 17-11-2026)

Periods: **17-11 → 23-11-2026** vs **10-11 → 16-11-2026** (7 days vs 7 days).

**Warning:** the sample is very small (about 100 impressions a week). No change here is statistically significant. Repeat the comparison with 28 days on 15-12-2026.

### Totals

| Metric | 10–16 Nov | 17–23 Nov | Change |
|---|---|---|---|
| Clicks | 8 | 8 | = |
| Impressions | 112 | 96 | −14 % |
| CTR | 7.1 % | 8.3 % | +1.2 pp |
| Average position | 15.4 | 12.3 | +3.1 (better) |

### Pages

| Page | Impr. before → after | Clicks before → after | Pos. before → after |
|---|---|---|---|
| / | 53 → 54 | 7 → 8 | 4.7 → 7.6 (worse) |
| /helse | 15 → 22 | 0 → 0 | 26.3 → **14.1** |
| /om-oss | 25 → 19 | 0 → 0 | 9.0 → 4.4 |
| /kontakt | 18 → 17 | 0 → 0 | 12.3 → 5.6 |
| /spansk-i-alicante/helsenorsk | 10 → 15 | 0 → 0 | 14.1 → 18.2 |
| /spansk-i-alicante | 43 → 3 | 1 → 0 | 20.9 → 1.7 |
| /nyheter/rekrutteringspartner | 2 → 3 | 0 → 0 | 6.5 → 17.7 |
| /nyheter/kandidatportal-lansert | 1 → 1 | 0 | 17 → 10 |
| **/talentportalen** | **0 → 0** | 0 | — |
| **/vr-rekrutteringsmodell** | **0 → 0** | 0 | — |

Notes on the pages:
- /spansk-i-alicante dropped because it lost the "spanska alicante" and "lær spansk i alicante" queries. That matches the new positioning ("this is not a Spanish course") and does not affect the priority lines.
- /nyheter/evaluering-sprakniva and /nyheter/sor-fron-integrasjon still collect impressions. Both already have a 301 in `vercel.json`, so they are just Google's old URLs and will clear out on their own.

### Queries relevant to the business

| Query | Impr. before → after | Pos. before → after |
|---|---|---|
| global working | 12 → 13 (2 → 4 clicks) | 10.3 → 12.0 |
| norskkurs for helsepersonell | 0 → 4 | — → 16.8 |
| helsenorsk | 8 → 3 | 16.6 → 15.0 |
| rekruttering helsepersonell | 0 → 2 | — → 29.5 |
| sykepleier i utlandet | 3 → 1 | 13.3 → 45 |

- Brand queries make up most of the clicks.
- The only employer-intent query is "rekruttering helsepersonell", at position 29.5.
- There are **zero impressions for "rekruttering av sykepleiere", "sykepleiere fra Spania" and "kandidatportal"**.
- Danish candidate queries ("sygeplejerske job norge" and similar) disappeared after the change. That is fine for the goal.

### Indexing (Pages report)

- 25 indexed, 27 not indexed:
  - 16 page with redirect
  - 7 alternate page with proper canonical tag
  - 3 blocked by robots.txt
  - 1 redirect error (validation started)
- **What is missing from this report:** Chrome would not show the URL list behind each reason, because the drill-down never loaded. So I could not tell which 3 URLs are blocked or which one has the redirect error.
- URL inspection (read only):
  - `/talentportalen`: **indexed**, yet 0 impressions.
  - `/vr-rekrutteringsmodell`: **NOT indexed**. The reason shown starts with "Desc…", most likely "Discovered – currently not indexed". Google found it through the sitemap.

---

## 2. What the audit of `dist/` shows (built HTML, what a crawler sees without JavaScript)

- Every page has one H1, a self-referencing canonical, `index, follow`, and a valid JSON-LD `@graph`. Titles are 41–74 characters.
- robots.txt allows GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and the other AI crawlers. Only /admin is blocked.
- llms.txt exists and is generated from the real sources.
- **The static body is a summary, not the page.** This is the main problem for AI crawlers and for indexing:

  | URL | Words in static HTML | Words in the source |
  |---|---|---|
  | /helse | 285 | process, numbers and cases only render with JS |
  | /vr-rekrutteringsmodell | 259 | 4 phases in a single paragraph |
  | /talentportalen | 192 | 1 paragraph |
  | /nyheter/sor-fron-intervju | 289 | 1737 in `src/content/news/2026-04-21-sor-fron-intervju.md` |
  | /nyheter/hvordan-lykkes | 335 | 1396 |
  | /nyheter/pablo-intervju | 341 | 1398 |
  | /nyheter/evaluere-norsk-spraak | 307 | 1310 |

  Every article has only one H2, "Les mer". Its internal structure is lost.
- **Pablo Lanza appears in no static HTML and in no schema.**
  - It exists in `src/data/siteContent.js` / `publishedContent.js` (team, quote) and in a single line of the Vågå article.
  - Organization has `foundingDate: 2014` but no `founder`.
  - Every Article has `author` = the Organization.
- **Unconfirmed facts are already published:**
  - `hasCertification.about: "Språkundervisning og internasjonal rekruttering"` in the Organization schema, and the same scope in llms.txt. That is the ISO scope, which is not confirmed.
  - "15+ fornøyde kommuner", "50+ ansatte" and "25 % psykologer".
  - "opptil 650 timer". The Kommunal Rapport advertorial says up to 600.
  - "B1, mot B2". A competitor demands B2.
- **Internal links:**
  - The main nav links /spansk-i-alicante/livet-som-student from 25 pages.
  - /spansk-i-alicante/helsenorsk, which has employer queries, gets 3 links.
  - Each news article gets 1–3 links.
  - No article links to /helse inside its body text.
- **/tutorial-talent-portal** is served as static HTML with no meta description, no canonical and no robots. Its title is "GlobalWorking Talent Portal – produktomvisning". It is used as an iframe on /talentportalen.
- `/nyheter/sommervikarer` (title "Sykepleiere til sommervikariat") is linked from /helse. It is the only content that matches the "vikar" vocabulary in a positive sense.

---

## 3. Competitors

The head queries ("rekruttering av sykepleiere fra utlandet", "internasjonal rekruttering helsepersonell", "rekruttere sykepleiere fra EU") are held by **helsedirektoratet.no** (authorization, WHO code), **sykepleien.no**, **altinget.no**, **tidsskriftet.no** and **oslomet.no**. Almost no vendor competes there. That is an open content gap.

**Dignus Medical**, https://www.dignusmedical.no/rekruttering-av-leger-og-sykepleiere-fra-europa/ (the only real direct competitor):
- A 6-step process and a 6-question FAQ for employers (competence, language, authorization before start, countries, timeline, guarantee).
- A stated timeline (6–12 months) and a 6-month guarantee.
- Helsedirektoratet named, plus ISO 9001/14001/45001.
- Named references: Sykehuset Telemark and Fyresdal kommune, at https://dignusmedical.no/rekruttering-og-bemanning-av-helsepersonell-til-din-bedrift/
- Separate pages per profession (/rekruttering-sykepleiere/, /rekruttering-lege/).
- Its weak point: it mixes "rekruttering og bemanning".

**PacuraMed / Reflekt helse**, https://pacuramed.no/aktuelt/medarbeidere/fra-europa-til-norge-som-helsepersonell/:
- A bemanningsbyrå that also recruits from Europe.
- Shows NHO Service og handel membership, Kiwa 9001, a parent group and named staff.
- Its content is aimed at candidates. It is the opposite of our positioning and appears next to us.

**Dedicare**, https://www.dedicare.no/ (/for-kunder/sykepleier/, /for-kunder/vanlige-sporsmal/):
- Customer pages per profession and a customer FAQ.
- "30 års erfaring", Revidert Arbeidsgiver.
- No international recruitment page for kommuner.

**Randstad Care**, https://www.randstad.no/care/:
- "Godkjent bemanningsforetak", ISO 9001/14001.
- References page at /kunde/kundereferanser/.

Where we are ahead:
- Our own language school.
- An explicit "ikke vikarbyrå, ingen arbeidsgiveransvar". No competitor says it this clearly.
- Cases with a named kommune and outcome.
- The 2500+ figure.
- Talentportalen, which no competitor has.

---

## 4. Ranked actions (impact ÷ effort)

Effort: S = under half a day, M = 1–3 days, L = more than 3 days. "Client" = needs a fact only the client can confirm.

### 1. Serve the full content in the static HTML

- **Page:** all of them; priority /, /helse, /vr-rekrutteringsmodell, /talentportalen and /nyheter/*.
- **Change:** in `scripts/prerender-meta.mjs`, inject the full article body (markdown → HTML with its H2/H3) instead of the summary. For the service pages, inject every section (process steps, numbers, cases, FAQ), either with `renderToString` of the real components or by generating it from the same data files. The visible text and the static text must be the same.
- **Evidence:**
  - sor-fron-intervju: 289 words static vs 1737 in source; hvordan-lykkes 335 vs 1396.
  - /helse: 285 words.
  - /vr-rekrutteringsmodell is not indexed. GPTBot, ClaudeBot and PerplexityBot do not run JS, so today they read about 20–30 % of each article.
- **Effort:** M–L.
- **Client:** no.

### 2. Remove or confirm the unconfirmed facts that are already published

- **Pages:** schema on every page (Organization), `public/llms.txt` / the llms.txt generator, /, /om-oss.
- **Change:**
  - Remove `hasCertification.about` (the ISO scope) from the schema and from llms.txt until the client confirms it. Keep "ISO 9001:2015, TÜV Nord" only if the client confirms it.
  - Put "15+ kommuner", "50+ ansatte" and "25 % psykologer" on hold until confirmed.
  - Align 650 vs 600 hours and B1 vs B2 with the client, and use one figure everywhere: web, llms.txt and advertorials.
- **Evidence:**
  - `dist/index.html` Organization node.
  - The "Kort om selskapet" section of `dist/llms.txt`.
  - The Kommunal Rapport advertorial says up to 600 hours.
  - An inconsistent figure is the first thing that makes a kommune buyer distrust a vendor, and LLMs quote the figure they find first.
- **Effort:** S.
- **Client:** YES (ISO scope, 15+, 50+, 25 %, hours, level).

### 3. /helse: an employer FAQ section and a "what we are not" answer block

- **Page:** /helse.
- **Change:** add a visible H2 "Spørsmål fra arbeidsgivere" with 6–8 H3 questions, each answered in 40–80 words:
  - How long from first contact to start date?
  - What Norwegian level do they arrive with?
  - Who applies for authorization with Helsedirektoratet, and when do they have an HPR number?
  - Who is the employer: is this vikar/bemanning?
  - How is pricing structured?
  - What happens if the nurse leaves during the trial period?
  - Which countries do they come from?
  - Do you recruit in line with the WHO code?

  Also add an opening block of 134–167 words that answers "what Global Working is" and states "rekrutteringsselskap siden 2014, 2500+ kandidater, arbeidsgiver ansetter direkte".

  Do not add new FAQPage markup for Google: it is a commercial site, so it brings no rich result. The value is for AI and for the user.
- **Evidence:**
  - Dignus has a 6-question FAQ, a 6–12 month timeline and a 6-month guarantee (URL in section 3).
  - /helse moved from position 26.3 to 14.1 and gets 22 impressions but 0 clicks.
- **Effort:** M.
- **Client:** YES (real timeline, pricing model, what happens if someone leaves, countries, guarantee if any).

### 4. Get /vr-rekrutteringsmodell indexed and stop it competing with /helse

- **Page:** /vr-rekrutteringsmodell.
- **Change:**
  - Give it its own intent: "how to recruit healthcare staff from abroad", a step-by-step guide for HR. /helse stays the commercial service page.
  - Expand it to 4 phases with one H2 each, and a table of phase | duration | who does what. Include the Helsedirektoratet steps (application, documentation, HPR) and link the official page.
  - Move it to a readable slug, `/rekruttere-helsepersonell-fra-utlandet`, with a 301 from the current one. It is not indexed, so the move costs nothing.
  - Update the sitemap, llms.txt and the nav.
- **Evidence:**
  - URL inspection: not indexed ("Desc…").
  - 0 impressions in both periods.
  - The query "rekruttering helsepersonell" sits at position 29.5.
  - Helsedirektoratet holds the head term with informational content, so the guide format is what ranks.
- **Effort:** M.
- **Client:** YES (duration per phase).

### 5. Pablo Lanza as an entity: Person + founder

- **Pages:** /om-oss (static body and schema), /, /nyheter/pablo-intervju.
- **Change:**
  - Add a `Person` node `#pablo-lanza` (name, jobTitle "CEO og grunnlegger", worksFor → #organization, image) and `founder: {@id: #pablo-lanza}` on the Organization.
  - Show "Pablo Lanza, CEO og grunnlegger" in the static HTML of /om-oss.
  - Set `author` of pablo-intervju to the right person (whoever wrote it).
  - Add `sameAs` with his LinkedIn only if the client provides the URL.
- **Evidence:**
  - No static HTML or schema in `dist/` mentions Pablo Lanza.
  - Dignus and PacuraMed show named people.
  - A company with a visible founder and a founding year reads as "established", not as a temp agency.
- **Effort:** S.
- **Client:** only the LinkedIn URL (optional).

### 6. Talentportalen: from a 1-paragraph page to a product page

- **Page:** /talentportalen.
- **Change:**
  - H2s:
    - "Hva ser du i en kandidatprofil" (fields: profession, Norwegian level and date of the test, availability, video).
    - "Hvem får tilgang og hvordan".
    - "Hva koster det".
    - "Fra profil til ansettelse", which links to /helse.
  - Add 3–4 FAQs.
  - Write a text summary of the tour that today lives only in the iframe.
  - In the schema, add a `Service` (`serviceType` "Kandidatportal for rekruttering av helsepersonell", provider → #organization) or a `WebApplication`.
  - In the title, keep "Talentportalen" first: "Talentportalen – kandidatportal for sykepleiere og helsefagarbeidere | Global Working".
- **Evidence:**
  - Indexed but 0 impressions in both periods.
  - 192 static words.
  - No competitor has a portal (the "kandidatportal sykepleiere" SERP shows only finn.no / karrierestart.no / indeed). That is an uncontested niche.
- **Effort:** M.
- **Client:** YES (access terms, price, how many candidates are usually available, if a number is to be shown).

### 7. Homepage title and lead: "rekrutteringsselskap since 2014"

- **Page:** /.
- **Change:**
  - Title: "Global Working – rekrutteringsselskap for helsepersonell siden 2014". It keeps the brand first and does not compete with /helse for "sykepleiere".
  - Move the "Rekrutteringsselskap, ikke vikarbyrå" block to straight after the H1, in the static HTML too.
- **Evidence:**
  - Home went from 4.7 to 7.6 in average position.
  - "global working" went from 10.3 to 12.0. A brand query outside the top 10 points to a weak entity.
  - The current title, "rekruttering med egen språkskole", leads with the school, not the business.
- **Effort:** S.
- **Client:** no.

### 8. Internal links toward the priority lines

- **Pages:** nav (Header), the news articles, /spansk-i-alicante/helsenorsk.
- **Change:**
  - Remove "Livet som student" from the main nav. It is linked from 25 pages and carries no employer intent; it can stay inside /spansk-i-alicante.
  - In vaga, sor-fron-intervju, hvordan-lykkes and rekrutteringspartner, add a contextual link inside the body text with a descriptive anchor ("rekruttering av sykepleiere til kommunen" → /helse; "kandidatportal" → /talentportalen; "slik fungerer prosessen" → the guide from action 4).
  - From /helse and the home page, link /spansk-i-alicante/helsenorsk.
- **Evidence:**
  - The inlink counts in section 2 (helsenorsk 3, articles 1–3).
  - Helsenorsk is the only page with a non-brand query that grew ("norskkurs for helsepersonell", 0 → 4, position 16.8).
- **Effort:** S.
- **Client:** no.

### 9. Remove the "vikar" signal from the /helse cluster

- **Pages:** /nyheter/sommervikarer and the "Les mer" list on /helse.
- **Change:**
  - Take the article out of the /helse list.
  - Reframe the title around direct hiring, for example "Sykepleiere til sommeren – ansatt direkte av kommunen, ikke via vikarbyrå", or confirm it with the client.
- **Evidence:**
  - The only positive "vikariat" content sits inside the main service page.
  - PacuraMed and Dedicare own the "vikar" vocabulary. Sharing it pushes the reader toward that category.
- **Effort:** S.
- **Client:** no (the tone of the article is the client's call).

### 10. Article structure and dates

- **Pages:** /nyheter/*.
- **Change:**
  - Keep the H2/H3 from the markdown in the static HTML (comes with action 1).
  - Add `dateModified`.
  - Add `author` as a Person where there is a real author, and `about` pointing to the Service on /helse.
  - Add an outbound link to the NRK source in the Vågå article (the quote from Thomas Ranstad Haugen) as a verifiable citation.
- **Evidence:**
  - The only H2 in the articles is "Les mer".
  - `author` = Organization in every Article in `dist/`.
  - LLMs favour content with a date, an author and a cited source.
- **Effort:** S (after action 1).
- **Client:** no (the authors per article are the team's to name).

### 11. A dedicated page for helsefagarbeidere

- **Page:** new, `/helse/helsefagarbeidere`, linked from /helse.
- **Change:**
  - An employer-facing page: what a helsefagarbeider from Southern Europe is, the authorization (Helsedirektoratet) and its differences from a sykepleier, the language level, and the process.
  - A Service schema with `serviceType` "Rekruttering av helsefagarbeidere".
- **Evidence:**
  - It is part of priority line 1, but today it appears only as a word on /helse.
  - Dedicare has /for-kunder/helsefagarbeider and Dignus has a page per profession.
- **Effort:** M.
- **Client:** YES (what is actually offered for helsefagarbeidere and the authorization route).

### 12. Ethics page: international recruitment and the WHO code

- **Page:** new, for example `/etisk-rekruttering`, linked from /helse and /om-oss.
- **Change:** explain where they recruit from, the WHO global code (link to helsedirektoratet.no), why candidates choose Norway, and that the employer hires directly.
- **Evidence:**
  - The head term "internasjonal rekruttering helsepersonell" is held by Helsedirektoratet (the WHO code) and by press pieces critical of agencies.
  - A kommune buyer looks this up before signing. No vendor answers it.
- **Effort:** M.
- **Client:** YES (source countries, and that they do not recruit from WHO safeguard-list countries).

### 13. Product tour without index noise

- **Page:** /tutorial-talent-portal.
- **Change:** add `<meta name="robots" content="noindex">` and a canonical to /talentportalen in `public/tutorial-talent-portal/index.html`. It is still allowed in the iframe.
- **Evidence:** the static HTML has no description, canonical or robots, and there are 7 "alternate page" plus 3 "blocked" URLs in GSC whose list could not be seen.
- **Effort:** S.
- **Client:** no.

### 14. Off-site entity: consistent profiles

- **Pages:** off-site, plus `sameAs` in the schema.
- **Change:**
  - Make LinkedIn, YouTube and Instagram descriptions say the same thing: "rekrutteringsselskap siden 2014, ikke vikarbyrå".
  - Consider a Google Business Profile for the Oslo office **only if the client gives a real address**.
  - Ask Vågå and Sør-Fron for a reference link from their own pages or news. That is earned, not bought.
  - Add Wikidata only when there is an independent source (NRK, Kommunal Rapport) to back it.
- **Evidence:**
  - "global working" at position 12.
  - The "global working sykepleiere" SERP shows unav.edu, hmu.gr and europeanjobdays.eu, not the company.
  - Brand mentions correlate with AI citations more than backlinks do.
- **Effort:** M (spread over time).
- **Client:** YES (Oslo address; contact with the kommuner).

### 15. Measure properly

- **Page:** GSC / Bing Webmaster Tools.
- **Change:**
  - Repeat this comparison with 28 days on 15-12-2026.
  - Open the drill-down of "Blocked by robots.txt" and "Redirect error" by hand to see which URLs they are.
  - Register the site in Bing Webmaster Tools (it feeds Copilot and ChatGPT search) and submit the sitemap.
- **Evidence:** about 100 impressions a week makes any before/after inconclusive, and the GSC drill-down did not load in this session.
- **Effort:** S.
- **Client:** no.

---

## 5. Facts only the client can confirm

1. ISO 9001:2015: is it still in force with TÜV Nord, and what is its **exact scope**? It is already published with a scope; remove it until confirmed.
2. "15+ fornøyde kommuner", "50+ ansatte" and "25 % av teamet er psykologer": are they true and current?
3. Norwegian hours: 650 or 600? Minimum level B1, and how often is B2 reached?
4. Real timeline from contract to start date, and the duration of each phase.
5. Pricing model (fixed fee, per candidate, success fee) and whether it can be published, even as a range.
6. What happens if the candidate leaves during the trial period: replacement, guarantee, or nothing?
7. Source countries (the site says Spain, Italy and France) and whether they follow the WHO code. Is there any recruitment outside the EU/EEA?
8. Talentportalen: who gets access, the cost, and the typical number of available candidates (only if it is to be shown).
9. What the offer for helsefagarbeidere covers and the authorization route.
10. Pablo Lanza's LinkedIn URL, and the authors of each article.
11. A real street address of the Oslo office (only for a Google Business Profile).
12. Retention figures, or the "a tenth of the price of a bemanningsbyrå" claim that appears only in the advertorial: is there data to back them, or are they kept off the site?
13. Membership of an industry body (NHO, Virke or similar), if any.

Not proposed for publication in this plan: the authorization number 9900000462, org.nr., or kommuner other than Vågå and Sør-Fron.
