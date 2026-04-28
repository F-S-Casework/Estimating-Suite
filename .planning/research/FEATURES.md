# Feature Research: Construction Estimating & Pre-Con Management Tools

**Research date:** 2026-04-27
**Context:** F&S Estimating Suite — commercial casework/millwork, 4–10 users, full pre-con lifecycle

**Tools surveyed:** Procore Estimating, STACK CT, PlanSwift, Sage Estimating, BuildingConnected, Buildxact, Bid4Build/Estimator360, BidBoard, Buildrr, JobTread

---

## 1. Table Stakes
*Must-have for adoption. Users expect these to exist. Absence causes immediate rejection.*

### Bid Pipeline Tracking
- Kanban or list view of active bids by stage (Prospect → Bidding → Submitted → Won/Lost)
- Bid due dates visible at a glance; overdue bids surface without hunting
- Per-bid status log — who did what, when
- ITB source tracking (which GC sent it, which job site, addenda count)
- Win/loss recording with a reason field (price, scope, relationship, no-bid)

### Estimating Workbook
- Line-item cost entry with material, labor, and markup separated
- Division/CSI-style hierarchy for organizing scope (the "work breakdown structure")
- Subtotals at every level that roll up automatically
- Ability to mark items as alternates, exclusions, or allowances
- Running total visible at all times — gross cost, markup, bid price
- Copy/duplicate line items and entire sections (reuse is the daily workhorse)

### Pricing Library
- Searchable catalog of company-standard unit costs (materials + labor)
- Insert a library item into an estimate without retyping
- Edit library items in-place to update rates for a new market cycle
- Filter by category/trade/keyword
- Library edits do NOT retroactively change past estimates (snapshot at time of use)

### Proposal / PDF Output
- Generate a professional proposal PDF directly from the estimate
- Company branding: logo, address, license number, contact info
- Itemized or summary-only views (GCs often want summary; owners may want detail)
- Scope of work / exclusions section (freetext)
- Signature block / terms and conditions
- Consistent formatting — identical output every time, not "close enough"

### Job Handoff from Estimate
- Convert a won bid to an active job without re-entering data
- Retain the final estimate as the job's cost baseline
- Assign a PM and field crew at handoff
- Carry forward scope notes, drawings references, and GC contact

### Change Order Management
- Create a CO against a specific job with scope description and dollar amount
- Track CO status: Submitted → Approved → Rejected
- Running CO log per job showing original contract + all COs = revised contract value
- CO impacts reflected in the job's financial summary

### Contact Directory
- GC, owner, and field contact records
- At minimum: name, company, phone, email, role
- Link contacts to bids and jobs (who is the PM on this GC's side?)

---

## 2. Differentiators
*Not universal. When done well, these create daily delight and become reasons users stay.*

### Pricing Library Intelligence
- Usage history: see how often an item has been used and in what context
- Flag items that haven't been updated in 90+ days (stale rate warning)
- Alternate units — enter once as board-feet, display as LF or SF
- Assembly bundles: group related items (e.g., "Upper Cabinet - Standard" = box + hardware + install labor) so estimators drag one item not five

### Bid-Hit Analytics
- Win rate by GC, project type, project size, and estimator
- Average margin on won work vs. bid margin (identifies systematic underbidding)
- Backlog chart: contracted revenue by install month — answers "are we full?"
- Bid volume trend: bids submitted per month over time
- Revenue per estimating hour: how much contracted work each estimator generates

### Margin Analysis (Post-Award)
- Variance tracking: estimated margin vs. actual margin (requires cost inputs or integrations)
- By GC: which GC relationships produce healthy margin vs. race-to-bottom?
- By project type: healthcare vs. education vs. office vs. hospitality
- Seasonality: are Q4 bids priced differently than Q2?

### Smart Bid Calendar / Capacity Planning
- Calendar view of bid due dates overlaid with install schedule
- Crew capacity gauge: how many install-weeks are already booked vs. available?
- "Do we have capacity to take this on?" is answerable from one screen

### Proposal Customization Without Manual Work
- Conditional sections: if the bid includes field labor, add the warranty section; if not, omit it
- Cover page with job-specific rendering or project type image
- Version history: Proposal v1, v2, revised after VE — all preserved, not overwritten

### ITB Intelligence
- Track which GCs send ITBs regularly and which are one-off (GC relationship score)
- Addenda tracker: mark each addendum as reviewed and note scope impact
- No-bid decision log: when you pass on an ITB, record why — this data becomes a filter for future opportunity selection

### Document Context at Estimate Time
- Attach drawings, specs, and RFIs to the bid record
- View spec section alongside the estimating workbook (no tab-switching to PDF viewer)
- Flag spec conflicts or questions directly on the record

### Activity Feed / Audit Trail
- Every state change logged with user and timestamp
- Comments on bids and jobs (replace email threads about a specific job)
- Notifications when a bid moves stage or a CO is approved

---

## 3. Anti-Features
*Complexity traps. Common in enterprise tools. Actively harmful for a 4–10 person shop.*

### Multi-Level Approval Workflows
- Enterprise tools route every CO or estimate through configurable approval chains
- For a 4–10 person team where the estimator IS the decision-maker, this creates friction with no benefit
- **Trap:** If the tool requires formal approvals to save work, estimators will work around it

### Role-Based Permissions and Access Control (v1)
- ACL matrices, role hierarchies, and "view-only" modes add configuration overhead
- At 4–10 users who all know each other, the trust model is flat
- **Trap:** Time spent configuring who can see what is time not estimating

### Real-Time Collaboration / Presence
- Google Docs-style cursors, locking, and conflict resolution are complex infrastructure
- At this team size, two people rarely edit the same estimate simultaneously
- **Trap:** The cost of building and maintaining this feature vastly exceeds its use frequency

### Mobile-First or Offline Mode
- Estimating is a desk job requiring large screens and keyboard-heavy data entry
- Field-friendly mobile apps require a completely different UX paradigm
- **Trap:** Building mobile-parity doubles UI work without serving the actual users

### ERP / Accounting Integration (v1)
- QuickBooks sync, GL coding, invoice generation, and AP/AR are legitimate needs
- But they require a stable data model and operational discipline before integration adds value
- **Trap:** Building integration before the core workflow is stable creates fragile plumbing

### Takeoff / Quantity Surveying from Plans
- PDF measurement tools (linear feet, area from drawings) are powerful but trade-specific
- For casework/millwork, quantities come from shop drawings and specifications, not field takeoff
- **Trap:** A generic takeoff tool adds learning curve without fitting the millwork workflow

### Subcontractor Bid Solicitation
- Procore and BuildingConnected manage sending ITBs to subs, tracking their responses
- F&S IS the sub — they receive ITBs, not send them
- **Trap:** Features for managing downstream vendors don't apply here

### AI-Generated Estimates / Auto-Takeoff
- AI quantity extraction from drawings is early-stage and trade-specific
- Estimators in custom millwork apply judgment that cannot be automated (spec reading, shop constraints, GC relationship pricing)
- **Trap:** Flashy AI features that don't reflect the actual workflow erode trust in the tool

### Gantt Chart Project Scheduling
- Full MS Project-style CPM scheduling with predecessors and float
- For a casework sub, scheduling is "when do we install, and do we have crew available"
- **Trap:** A complex scheduler tool when what's needed is a calendar with job bars

---

## 4. Feature Dependencies
*What must exist before what. Violating this order creates rework.*

### Tier 0 — Foundation (Nothing works without these)
1. **Data model**: Bids, Jobs, Contacts, Line Items, Pricing Library items as distinct entities
2. **Authentication**: Users have identity — required before audit trails or assignments mean anything
3. **Navigation / App shell**: Users must be able to move between views

### Tier 1 — Core Estimating Loop (Primary value delivery)
Depends on Tier 0.
1. **Pricing Library** — must exist before Estimator Workbook (workbook pulls from it)
2. **Estimator Workbook** — must be functional before any proposal can be generated
3. **Proposal PDF** — depends on a completed, finalized estimate
4. **Pipeline / Bid tracking** — can start simple (status + due date), but must link to estimates

### Tier 2 — Job Lifecycle (Post-award value)
Depends on Tier 1.
1. **Job Handoff** — requires a finalized bid to convert from
2. **Change Order Management** — requires an active job with a contracted value baseline
3. **Install Calendar / Crew Scheduling** — requires jobs with dates assigned at handoff
4. **Contact Directory** — can be populated in parallel but becomes valuable once jobs exist

### Tier 3 — Analysis & Intelligence (Retrospective value)
Depends on Tier 2 and sufficient data volume (typically 6–12 months of real usage).
1. **Bid-hit rate reporting** — requires 20+ closed bids with win/loss recorded
2. **Margin analysis** — requires actual job cost data or manual entry after job close
3. **Backlog chart** — requires contracted jobs with install dates
4. **GC relationship scoring** — requires bid history tagged by GC over time

### Tier 4 — Workflow Polish (Adoption accelerators)
Can be layered on top of Tier 1–2 without blocking them.
1. **Activity feed / audit trail** — adds value immediately but is not blocking
2. **Document management** — improves context but estimates work without it
3. **Addenda tracking** — useful daily but not structurally required
4. **Email/notification integration** — convenience layer, not core

---

## 5. Casework/Millwork-Specific Considerations
*How this trade differs from general construction estimating*

### Unit of measure is specific
- Cabinet casework is priced per linear foot of run, per unit, or by room — not per square foot of building
- Labor is typically shop fabrication hours + install hours, billed separately
- Hardware (hinges, slides, pulls) is often priced as a separate line or percentage allowance

### AWI Standards matter
- Bids often reference AWI (Architectural Woodwork Institute) grades: Economy, Custom, Premium
- The grade affects material specs and finish, which affects price significantly
- Proposals should reference the grade being bid

### Project type drives pricing assumptions
- Healthcare: stainless steel, antimicrobial finishes, specific hardware standards → premium
- Education: high durability, budget-conscious → volume efficiency
- Office / corporate: appearance-driven, brand standards → custom finish work
- Hospitality: highest finish quality, often international hardware → premium + complexity

### Scope definitions are critical
- What's included in "install": blocking, backing in walls? demolition of existing? paint touch-up?
- Exclusions list is as important as inclusions — GCs read the fine print
- AWI installation standards reference should be explicit in proposals

### The estimate-to-proposal gap is the key friction point
- Industry pain: estimators build estimates in spreadsheets, then manually reformat for proposals
- This is exactly the gap F&S is solving — the proposal should be a rendering of the estimate, not a separate document

---

## Summary: Priority Lens for F&S

Given a 4–10 person commercial casework company at pre-con stage:

**Build first (Tier 1):** Pricing Library → Estimating Workbook → PDF Proposal → Pipeline Board

**Build second (Tier 2):** Job Handoff → Change Orders → Install Calendar → Contacts

**Build third (Tier 3):** Reports (hit rate, backlog, margin)

**Skip or defer:** Takeoff tools, mobile, real-time collab, AI auto-estimate, approval workflows, ERP integration, subcontractor solicitation

**Differentiators worth building early:** Assembly bundles in Pricing Library, activity feed, stale-rate warnings, bid-hit analytics (simple version once data exists)
