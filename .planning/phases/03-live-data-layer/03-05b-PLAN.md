---
phase: 03-live-data-layer
plan: 05b
type: execute
wave: 3
depends_on:
  - "03-05"
  - "03-01"
  - "03-02"
files_modified:
  - project/views-estimator.jsx
autonomous: true
requirements:
  - EST-06
  - EST-07
  - EST-08

must_haves:
  truths:
    - "EstimatorView has an 'Info' tab in the sidebar that opens the project info form in the center panel"
    - "Project info form shows all bid metadata fields: doc type, pricing mode, project name, GC, architect, bid docs, drawings dated, specs dated, addendums, estimator, PO number, terms, delivery date"
    - "All info fields save to Supabase on blur via window.dbHelpers.updateBidInfo(bidId, fields)"
    - "OH %, Delivery %, and Install % are editable inputs that save to bid.oh_pct/del_pct/ins_pct"
    - "Cost topbar recalculates immediately when OH/Del/Ins % values change"
    - "Alternates table: add/edit/delete rows stored in bid_alternates table"
    - "Alternates are listed separately — not included in base bid total"
  artifacts:
    - path: "project/views-estimator.jsx"
      provides: "Info panel + alternates panel added to EstimatorView"
      contains: "InfoPanel, AlternatesPanel, updateBidInfo"
  key_links:
    - from: "Info form fields"
      to: "window.dbHelpers.updateBidInfo"
      via: "onBlur handler"
      pattern: "updateBidInfo"
    - from: "OH/Del/Ins inputs"
      to: "setBid (local) + updateBidInfo (persist)"
      via: "onChange → optimistic + async save"
      pattern: "live-recalc"
---

<objective>
Add "Info" and "Alternates" panels to EstimatorView. The Info panel provides the full project info form matching the V2 estimator's Project Info view (20+ fields). The OH/Delivery/Install percentage inputs in the info form update bid.oh_pct/del_pct/ins_pct in Supabase and immediately recalculate the cost topbar. The Alternates panel provides add/edit/delete CRUD for bid_alternates rows, displayed separately from the base bid total.

Purpose: EST-06–08: complete project metadata capture; live-recalculating markup rates; alternates CRUD.
Output: views-estimator.jsx extended — InfoPanel and AlternatesPanel components added; sidebar gains "Info" and "Alternates" links; center area conditionally renders these panels when selected.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-live-data-layer/03-CONTEXT.md

<interfaces>
<!-- views-estimator.jsx already has: EstimatorView, calcBid, tree state, bid state, sidebar -->
<!-- This plan adds new sidebar nav items and new center-panel views -->

<!-- SIDEBAR EXTENSION: add nav links above the Areas section -->
<!-- "Info" link → sets centerView='info' -->
<!-- "Alternates" link → sets centerView='alternates' -->
<!-- Areas tree → sets centerView='grid' (existing behavior) -->
<!-- New state: const [centerView, setCenterView] = uS_est('grid'); -->

<!-- INFO FORM FIELDS (from V2 FS_Estimator_v2_1.html): -->
<!-- Row 1: Document Type (select: Proposal/Quote/Bid/Budget) | Pricing Mode (select: By Area/Lump Sum/Itemized) -->
<!-- Row 2: Project ID (text) | Bid Date (date) -->
<!-- Row 3: Client / Company (text, full width) -->
<!-- Row 4: Attention (text) | GC (text) -->
<!-- Row 5: Architect (text) | Bid Documents (text) -->
<!-- Row 6: Drawings Dated (date) | Specs Dated (date) -->
<!-- Row 7: Addendums (text) | Estimator (text, default "Evan Ramsey") -->
<!-- Row 8: P.O. Number (text) | Terms (text, default "Net 30") -->
<!-- Row 9: Delivery Date (date) | [blank] -->
<!-- Row 10: OH % | Del % | Ins % — three numeric inputs side by side -->
<!-- Scope / Notes: textarea (internal only, not on proposal) -->

<!-- OH/DEL/INS recalc pattern: -->
<!-- onChange updates bid state immediately (optimistic), debounces Supabase save by 800ms -->
<!-- Use useRef for debounce timer: const saveTimer = uR_est(null) -->
<!-- const handlePctChange = (field, value) => { -->
<!--   const n = parseFloat(value) || 0; -->
<!--   setBid(prev => ({ ...prev, [field]: n })); // triggers recalc via costs = uM_est(() => calcBid(tree, bid)) -->
<!--   clearTimeout(saveTimer.current); -->
<!--   saveTimer.current = setTimeout(() => window.dbHelpers.updateBidInfo(activeBidId, { [field]: n }), 800); -->
<!-- }; -->

<!-- updateBidInfo(bidId, fields) is in window.dbHelpers from 03-02-PLAN -->
<!-- It does: window.sb.from('bids').update(fields).eq('id', bidId) -->

<!-- ALTERNATES STATE: -->
<!-- const [alts, setAlts] = uS_est(null); -->
<!-- Load: uE_est(() => { if (!activeBidId) return; window.dbHelpers.getAlternates(activeBidId).then(({data}) => setAlts(data||[])); }, [activeBidId]); -->
<!-- Add: window.dbHelpers.addAlternate(activeBidId, { description:'', qty:1, unit:'LS', price:0, sort_order: alts.length }) -->
<!-- Update: window.dbHelpers.updateAlternate(id, fields) — optimistic + async -->
<!-- Delete: window.dbHelpers.deleteAlternate(id) — confirm first -->

<!-- ALTERNATES TABLE COLUMNS: # | Description | Qty | Unit | Price $ | Total (read-only = qty×price) | × -->
<!-- Displayed BELOW the base bid total chip in the cost topbar -->
<!-- "Alternates Total" shown as a separate chip: alts total (additive, not part of base bid) -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Info panel and markup recalc to EstimatorView</name>
  <read_first>
    - project/views-estimator.jsx (full file)
  </read_first>
  <files>project/views-estimator.jsx</files>
  <action>
    Edit views-estimator.jsx to add Info panel and OH/Del/Ins recalc. Changes are additive — do not break existing tree/grid functionality.

    **1. Add centerView state and saveTimer ref near top of EstimatorView:**
    ```js
    const [centerView, setCenterView] = uS_est('grid'); // 'grid' | 'info' | 'alternates'
    const [alts, setAlts]             = uS_est(null);
    const saveTimer                   = uR_est(null);
    ```

    **2. Load alternates alongside bid load:**
    ```js
    uE_est(() => {
      if (!activeBidId) { setAlts([]); return; }
      window.dbHelpers.getAlternates(activeBidId).then(({ data }) => setAlts(data || []));
    }, [activeBidId]);
    ```

    **3. Add markup pct handler (optimistic + debounced persist):**
    ```js
    function handlePctChange(field, value) {
      const n = Math.max(0, Math.min(100, parseFloat(value) || 0));
      setBid(prev => ({ ...prev, [field]: n }));
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        window.dbHelpers.updateBidInfo(activeBidId, { [field]: n });
      }, 800);
    }
    ```

    **4. Add alternates handlers:**
    ```js
    async function handleAddAlt() {
      const { data, error } = await window.dbHelpers.addAlternate(activeBidId, {
        description: 'New alternate', qty: 1, unit: 'LS', price: 0, sort_order: (alts||[]).length,
      });
      if (!error && data) setAlts(prev => [...(prev||[]), data]);
    }
    async function handleUpdateAlt(id, field, value) {
      const parsed = (field==='qty'||field==='price') ? parseFloat(value)||0 : value;
      setAlts(prev => prev.map(a => a.id===id ? { ...a, [field]: parsed } : a));
      await window.dbHelpers.updateAlternate(id, { [field]: parsed });
    }
    async function handleDeleteAlt(id) {
      if (!confirm('Remove this alternate?')) return;
      const { error } = await window.dbHelpers.deleteAlternate(id);
      if (!error) setAlts(prev => prev.filter(a => a.id !== id));
    }
    ```

    **5. Update sidebar to add Info + Alternates links above Areas section:**
    ```jsx
    {/* Sidebar nav — add before Areas section */}
    {['info','alternates'].map(v => (
      <div key={v} onClick={() => { setCenterView(v); }}
        style={{ padding:'6px 10px', cursor:'pointer', fontSize:13, fontWeight: centerView===v ? 600 : 500,
          color: centerView===v ? 'var(--ink)' : 'var(--ink-2)',
          background: centerView===v ? 'var(--panel-3)' : 'transparent',
          boxShadow: centerView===v ? 'inset 2px 0 0 var(--accent)' : 'none',
          textTransform:'capitalize' }}>
        {v === 'info' ? 'Project Info' : 'Alternates'}
      </div>
    ))}
    {/* Divider */}
    <div style={{ height:1, background:'var(--line)', margin:'4px 0' }} />
    {/* "Grid" link to return to area tree */}
    <div onClick={() => setCenterView('grid')}
      style={{ padding:'6px 10px', cursor:'pointer', fontSize:13,
        fontWeight: centerView==='grid' ? 600 : 500, color: centerView==='grid' ? 'var(--ink)' : 'var(--ink-2)',
        background: centerView==='grid' ? 'var(--panel-3)' : 'transparent',
        boxShadow: centerView==='grid' ? 'inset 2px 0 0 var(--accent)' : 'none' }}>
      Estimate Grid
    </div>
    ```

    **6. Wrap existing center grid in `{centerView === 'grid' && ...}` and add Info and Alternates panels:**

    Info panel JSX (inside `{centerView === 'info' && <div>...</div>}`):
    ```jsx
    <div style={{ padding:'24px 28px', maxWidth:680 }}>
      <div className="page-title" style={{ marginBottom:20 }}>Project Info</div>
      {/* Helper: labeled row */}
      {/* Markup rates */}
      <div style={{ background:'var(--panel)', border:'1px solid var(--line)', borderRadius:'var(--r-lg)', padding:'14px 18px', marginBottom:18 }}>
        <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--mute)', marginBottom:10 }}>Markup Rates</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {[['oh_pct','Overhead %'],['del_pct','Delivery %'],['ins_pct','Install %']].map(([f,label]) => (
            <label key={f}>
              <div style={{ fontSize:11.5, color:'var(--ink-3)', marginBottom:3 }}>{label}</div>
              <input type="number" min="0" max="100" step="0.5"
                value={bid?.[f] ?? (f==='oh_pct'?15:f==='del_pct'?5:20)}
                onChange={e => handlePctChange(f, e.target.value)}
                style={{ width:'100%', border:'1px solid var(--line)', borderRadius:'var(--r-sm)', padding:'5px 8px', fontSize:13, fontFamily:'var(--mono)', background:'var(--bg)' }}/>
            </label>
          ))}
        </div>
      </div>
      {/* Bid fields grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          ['doc_type','Document Type','select',['Proposal','Quote','Bid','Budget','Change Order']],
          ['pricing_mode','Pricing Mode','select',['By Area','Lump Sum','Itemized']],
          ['project_id','Project ID','text',null],
          ['bid_date','Bid Date','date',null],
          ['gc_name','General Contractor','text',null],
          ['architect','Architect','text',null],
          ['bid_docs','Bid Documents','text',null],
          ['drawings_dated','Drawings Dated','date',null],
          ['specs_dated','Specs Dated','date',null],
          ['addendums','Addendums','text',null],
          ['estimator','Estimator','text',null],
          ['po_number','P.O. Number','text',null],
          ['terms','Terms','text',null],
          ['delivery_date','Delivery Date','date',null],
        ].map(([field, label, type, opts]) => (
          <label key={field}>
            <div style={{ fontSize:11.5, color:'var(--ink-3)', marginBottom:3 }}>{label}</div>
            {type==='select' ? (
              <select value={bid?.[field]||''} onChange={e => { setBid(p=>({...p,[field]:e.target.value})); window.dbHelpers.updateBidInfo(activeBidId,{[field]:e.target.value}); }}
                style={{ width:'100%', border:'1px solid var(--line)', borderRadius:'var(--r-sm)', padding:'5px 8px', fontSize:12.5, background:'var(--bg)' }}>
                <option value="">—</option>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            ) : (
              <input type={type} defaultValue={bid?.[field]||''}
                onBlur={e => { setBid(p=>({...p,[field]:e.target.value})); window.dbHelpers.updateBidInfo(activeBidId,{[field]:e.target.value}); }}
                style={{ width:'100%', border:'1px solid var(--line)', borderRadius:'var(--r-sm)', padding:'5px 8px', fontSize:12.5, background:'var(--bg)' }}/>
            )}
          </label>
        ))}
      </div>
      {/* Notes textarea */}
      <label style={{ display:'block', marginTop:12 }}>
        <div style={{ fontSize:11.5, color:'var(--ink-3)', marginBottom:3 }}>Scope / Notes (internal)</div>
        <textarea defaultValue={bid?.notes||''} rows={4}
          onBlur={e => { setBid(p=>({...p,notes:e.target.value})); window.dbHelpers.updateBidInfo(activeBidId,{notes:e.target.value}); }}
          style={{ width:'100%', border:'1px solid var(--line)', borderRadius:'var(--r-sm)', padding:'6px 8px', fontSize:12.5, background:'var(--bg)', resize:'vertical' }}/>
      </label>
    </div>
    ```

    Alternates panel JSX (inside `{centerView === 'alternates' && <div>...</div>}`):
    ```jsx
    <div style={{ padding:'24px 28px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <div className="page-title">Alternates</div>
        <button className="btn sm accent" onClick={handleAddAlt}>+ Add Alternate</button>
      </div>
      <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:12 }}>
        Alternates are listed separately and are not included in the Base Bid total.
      </div>
      <table className="wf">
        <thead>
          <tr>
            <th style={{ width:32, textAlign:'center' }}>#</th>
            <th>Description</th>
            <th style={{ width:70 }} className="num">Qty</th>
            <th style={{ width:60 }} className="ctr">Unit</th>
            <th style={{ width:100 }} className="num">Price $</th>
            <th style={{ width:110 }} className="num">Total</th>
            <th style={{ width:32 }}></th>
          </tr>
        </thead>
        <tbody>
          {(alts||[]).map((alt, i) => (
            <tr key={alt.id}>
              <td style={{ textAlign:'center', color:'var(--ink-3)', fontSize:12 }}>{i+1}</td>
              <td><input className="inline-inp" defaultValue={alt.description}
                onBlur={e=>handleUpdateAlt(alt.id,'description',e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
              <td className="num"><input className="inline-inp num tnum" defaultValue={alt.qty}
                onBlur={e=>handleUpdateAlt(alt.id,'qty',e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
              <td className="ctr">
                <select className="chip mono" value={alt.unit||'LS'} onChange={e=>handleUpdateAlt(alt.id,'unit',e.target.value)}
                  style={{ background:'transparent', border:'none', fontSize:11, fontFamily:'var(--mono)' }}>
                  {['EA','LF','SF','SY','LS','HR'].map(u=><option key={u}>{u}</option>)}
                </select>
              </td>
              <td className="num"><input className="inline-inp num tnum" defaultValue={alt.price}
                onBlur={e=>handleUpdateAlt(alt.id,'price',e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
              <td className="num tnum" style={{ fontWeight:600 }}>{fmt((alt.qty||0)*(alt.price||0))}</td>
              <td className="ctr">
                <button className="btn ghost xs" style={{ color:'var(--bad)' }} onClick={()=>handleDeleteAlt(alt.id)}>×</button>
              </td>
            </tr>
          ))}
          {(alts||[]).length === 0 && (
            <tr><td colSpan={7} style={{ padding:'20px', textAlign:'center', color:'var(--ink-3)', fontSize:12 }}>No alternates. Click "+ Add Alternate" to begin.</td></tr>
          )}
          {(alts||[]).length > 0 && (
            <tr style={{ background:'var(--panel-alt)' }}>
              <td colSpan={5} style={{ paddingLeft:14, fontSize:11.5, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--ink-3)' }}>Alternates Total</td>
              <td className="num tnum" style={{ fontWeight:700, color:'var(--accent)' }}>
                {fmt((alts||[]).reduce((s,a)=>s+(a.qty||0)*(a.price||0),0))}
              </td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    ```
  </action>
  <verify>
    grep "centerView\|handlePctChange\|updateBidInfo\|handleAddAlt\|alts\b" project/views-estimator.jsx
    grep "oh_pct\|del_pct\|ins_pct\|doc_type\|drawings_dated" project/views-estimator.jsx
  </verify>
  <done>
    - Sidebar has "Project Info", "Alternates", "Estimate Grid" nav links with active state styling
    - Info panel shows all 14 bid fields + 3 markup rate inputs + notes textarea
    - OH/Del/Ins inputs: optimistic bid state update → cost topbar recalculates immediately → debounced Supabase save
    - All text/date/select fields: save to Supabase on blur/change via updateBidInfo
    - Alternates panel: table with inline CRUD; total row shows alternates sum
    - Alternates total shown separately — NOT included in Base Bid
    - centerView defaults to 'grid' — no change to existing tree behavior
  </done>
</task>

</tasks>

<verification>
1. Click "Project Info" in sidebar → info panel renders in center
2. Edit "General Contractor" field, tab away → Supabase bids table updates
3. Change Overhead % to 20 → cost topbar OH chip updates instantly; reload → still 20%
4. Click "Alternates" → alternates panel; "+ Add Alternate" → new row; edit price → total row updates
5. Reload → alternates persist; base bid total unchanged by alternates
6. Click "Estimate Grid" → returns to area/section/item grid
</verification>

<success_criteria>
- OH/Del/Ins inputs recalculate cost topbar in real time without page reload
- All info fields persist to Supabase after blur/change
- Alternates total displayed separately from base bid total
- Switching between Info / Alternates / Grid views does not reset tree or cost state
</success_criteria>

<output>
After completion, update `.planning/phases/03-live-data-layer/03-05-SUMMARY.md` with 03-05b additions
</output>
