# Osmosis Dashboard: The Five Capability Buckets

*A reality-tempered proposal — wish-list ideation first, feasibility and platform constraints applied after, per the sandboxing process agreed across the dashboard sandbox sessions.*

## Why this document exists

Every discussion and every deliverable at Osmosis is required to start from a stated **intent** and an **outcome** — without them, "everything is wishy-washy. Everything is all over the place" and the work gets lost. This document applies that discipline to the five buckets that make up the User Dashboard: for each one, we state what the user is trying to do, what they walk away with, what we built, why it helps them make a real capability-building decision, and what we assumed to get there.

## Guiding principles carried through every bucket

- **Written from the user's seat, not a developer's.** Every "Intent" below is phrased as "I am the user; this is what I need" — not a feature list dressed up as empathy. Thinking *on behalf of* the user, instead of *as* the user, is the wrong page from the start.
- **Capability growth, not an LMS.** Osmosis is a capability-building platform, not a Learning Management System. Raw activity counts — logins, completion dates, assessment attempts — are, on their own, "raw data" that is "useless" to the user and to their future employer: training does not equal learning, and learning does not equal performance. This is also why assessment scores are deliberately kept to a minority weighting (15%) against qualitative, behavioural signals (85%) in how the platform judges real capability. Every bucket below is built to convert raw platform activity into an interpreted, actionable signal — never a bare data dump.
- **Dashboard = decision matrix, not a management console.** File uploads, form edits, and other admin actions stay off the dashboard's visual surface. The dashboard itself only shows the interpreted status, gaps, and next actions a user needs — the way a car dashboard shows fuel and temperature, not the engine underneath.
- **Personal Career Reflection (PCR) is the fixed term.** Bucket 1 is called **Personal Career Reflection** — not "Profile Capability Reflection," not "Dynamic Context." It is the single, merged output of the resume extraction and the Capability Building Form, and no other label is carried forward.
- **AI output shows up in a pop-up, not inline — plain black-and-white, matching the platform's existing style.** Both AI-driven pieces here (Bucket 2's verdict, Bucket 3's analysis) get built this way when implementation starts, not as a new visual language of their own; the platform already does this today, and that's the pattern to carry forward rather than reinvent.
- **Sequencing is open, except one thing.** The team's only locked sequencing decision is that Personal Career Reflection sits at the top of the dashboard. The order of the remaining four buckets is intentionally left undecided here — it will be set once the team and stakeholders vote after reacting to this sandbox.

---

## Bucket 1 — Personal Career Reflection

*(The platform's fixed term — not "Dynamic Context.")*

**Intent**
- The user wants one complete snapshot of their career, answering three questions in one place: *Where am I now? Where do I want to go? And where am I along that journey?*

**Outcome**
- The user gets a clear, side-by-side read of their current capabilities against their end goal — a comparison, not a guess.

**Current solution**
- The bucket opens with a **Current Capability** card — a short résumé-derived summary statement — immediately followed by the fuller Personal Career Reflection view. Current Capability is its own visible section, not merged into PCR's body, but it belongs to this bucket: together, the two sit right after the identity banner, so Bucket 1 as a whole is genuinely the first thing the user reaches on the dashboard.
- Current capability is split into hard skills and soft skills, each pulled from the source that describes it best: hard skills come from the résumé (experience, skills, interests); soft skills come from the Capability Building Form, the aspiration-and-profile document that captures where the user stands today.
- Achievements extracted from the résumé are **not** shown here — they surface at the top of Bucket 2 (Status & Progress) instead, as a feel-good, pride-factor trophy shelf, per Poh Moi Kau's direct request (see Bucket 2's Current solution). The verify-by-upload record behind each badge is part of the Bucket 2 also.
- Résumé extraction and the Capability Building Form are merged into one Personal Career Reflection, rather than kept as two separate outputs.
- Information is organised into selectable, collapsible views — a "map view vs. street view" model — instead of one long page, so the user opens only the view they want: current state, end goal, or the gap between them.

**How it helps the user take capability-building decisions**
- It answers the one question named as the top user decision: knowing the state of their own progress — on track, off track, or somewhere in between — before deciding what to do next.
- Because hard and soft skills are shown as one combined picture, the user isn't left to reconcile a résumé and a separate quiz score on their own.

**Assumptions**
- The user has already uploaded their résumé and completed the Capability Building Form; without both, the "complete snapshot" this bucket promises can't be shown.

---

## Bucket 2 — Status & Progress

**Intent**
- Based on the capabilities surfaced in Bucket 1, the user wants direction — a guide, a vision — for their field and end goal, not just a list of what they've done.

**Outcome**
- The user understands their own method of progressing, gets insight into where it's taking them, and can act on decisions that actually serve their goal.

**Current solution**
- The bucket opens with a résumé-derived **Achievements** trophy shelf, above everything else in this bucket — one badge per credential, each marked Verified or Not Verified with an icon, plus a tile to add or manage more. This placement is Poh Moi Kau's own, named request: *"we have on the one hand what has been completed and then we have... you collect badges okay let's say badges collected... should be under that progress and status."* That direction was reaffirmed when Saranya relayed to the team that *"Poh Moi requested collecting certifications and badges within the status and progress section to give users a positive, feel-good factor,"* and Arpit agreed to move the layout accordingly.
- The bucket also draws on Learning Paths, Assessments, Assets, Self-Tests, and attended Events — the substrate needed to describe current status — but does not stop at listing them.
- AI reviews those items and produces a verdict: is the user rowing in the right direction, and what are the specific plus and minus points behind that verdict?
- This deliberately avoids becoming a raw "items completed" ledger — logins, completion dates, and attempt counts are exactly the kind of data called out as useless on its own, both to the user and to their future employer.

**How it helps the user take capability-building decisions**
- The AI verdict puts the steering back in the user's hands: instead of scrolling a history log, they see what's working and what isn't, and choose what to consume next.
- The user drills down only into what they choose to open — a drill-down "based on the user's desire," not everything shown at once.

**Assumptions**
- The user has already engaged with at least a few of these items — a path, an assessment, an asset, a self-test, or an event — otherwise there is nothing for the verdict to interpret.

---

## Bucket 3 — Predictive Recommendation

**Intent**
- The user wants the system to study their whole Dashboard snapshot and help them see adjacent end goals and the skill gaps standing between them and those goals — a need first raised by Giriraj.

**Outcome**
- The user isn't locked into one path — they can see more than one viable end goal and switch to whichever is closest to their interests.

**Current solution**
- AI analyses the complete dashboard snapshot and reports how close the user is to their current goal, which alternative goals they could pivot to, and exactly which skills they'd need to close that gap.

**How it helps the user take capability-building decisions**
- It turns "what should I learn next" into a comparison across real, adjacent options — with the specific skill gap named for each — rather than a single fixed recommendation the user has to take on faith.

**Assumptions**
- The user has already decided on an end goal and started building capability toward it; without a starting goal, there's nothing to compute "adjacent" against.

---

## Bucket 4 — Share Visibility

**Intent**
- The user wants a convenient way to show their Dashboard to others.

**Outcome**
- The user can share an enhanced version of their real capabilities — not the typical résumé, which is mostly hard skills with very little authenticity behind them.

**Current solution**
- The user can download a PDF snapshot of their Dashboard today. *(Future scope: a shareable public URL.)*

**How it helps the user take capability-building decisions**
- It gives the user something worth sharing beyond a résumé line item — a decision aid for whoever is evaluating them, not just a claim.

**Assumptions**
- The user has completed at least some part of their Dashboard before there's anything worth exporting.

---

## Bucket 5 — Authenticated Capability

**Intent**
- The user wants to show off their wins backed by a credible source and word of mouth — trust and proper visibility for what they claim, not just the claim itself.

**Outcome**
- The user can keep track of their authenticated creadibility with a real sense of trust in them, and this bucket doubles as a single storage area holding all of their records in one place.

**Current solution**
- Users can upload letters of recommendation.
- Certificates shown here are strictly course-completion credentials earned on the platform itself. (This section is not included in Bucket-2 as this is platform specific & much detailed information about it can be found on the user's course workspace area).
- Users can invite pod members to write testimonials for them — the word-of-mouth, external-verification layer.
- All of this feeds a weighted authentication matrix: qualitative signals (testimonials, verified proof, workplace verification) are weighted higher than quantitative ones (certificate counts) — because a certificate alone is a "feel-good factor" that "holds no actual value in proving real capability" by itself.

**How it helps the user take capability-building decisions**
- Certificates and badges stay visible for encouragement and pride, exactly as intended — but the *trust* signal a user (or anyone evaluating their profile) actually relies on comes from the proof documents and testimonials, not the certificate count.
- Having one place for achievements, letters, and certificates means the user isn't reconstructing their credibility from scratch every time someone asks for proof.

**Assumptions**
- The user has some creadibility already listed, and has earned at least one certificate on the platform.

---

## Where this leaves us

This is a sandbox for the next round of feedback, not a finished feature — each solution above is expected to iterate as the team and pilot users react to it. The only fixed decision is Personal Career Reflection at the top; everything else — sequence, depth, and what graduates from "coming soon" to shipped — gets decided by team and stakeholder vote after this round of sandboxing.
