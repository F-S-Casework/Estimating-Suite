---
phase: 03-live-data-layer
plan: 05c
type: execute
wave: 3
depends_on:
  - "03-05"
  - "03-05b"
  - "03-01"
  - "03-02"
files_modified:
  - project/views-estimator.jsx
  - project/index.html
autonomous: true
requirements:
  - EST-09
  - EST-10
  - EST-11

must_haves:
  truths:
    - "Sidebar has 'Exclusions', 'Clarifications', and 'Terms' nav links"
    - "Exclusions panel: pre-populated with F&S defaults; each item has active toggle + editable text + delete"
    - "Clarifications panel: same structure as exclusions with F&S defaults"
    - "Terms panel: 5 sub-sections (General Terms, Warranty, Finish, Hardware, Fab Note) each with pre-populated defaults"
    - "All exclusions/clarifications/terms stored as JSONB on bids table (bid.exclusions, bid.clarifications, etc.)"
    - "XLSX CDN added to index.html for ZZTakeoff import"
    - "ZZTakeoff import button in estimator toolbar; uses window.showOpenFilePicker to open .xlsx"
    - "Import parses ZZTakeoff format A (priced) and format B (measured) and creates areas+sections+items in Supabase"
    - "Import shows a preview modal before committing: checkbox list of areas and items"
  artifacts:
    - path: "project/views-estimator.jsx"
      provides: "Exclusions/Clarifications/Terms panels + ZZTakeoff import in EstimatorView"
    - path: "project/index.html"
      provides: "XLSX CDN script tag added"
  key_links:
    - from: "ZZTakeoff button"
      to: "window.showOpenFilePicker → XLSX.read → parseZZTakeoff → preview modal → doZZImport"
      via: "handleZZImport async function"
      pattern: "zztakeoff-import"
    - from: "Exclusions/Terms toggles"
      to: "window.dbHelpers.updateBidInfo(bidId, { exclusions: [...] })"
      via: "handleTermsChange"
      pattern: "jsonb-update"
---

<objective>
Add ZZTakeoff XLSX import, Exclusions panel, Clarifications panel, and Terms panels to EstimatorView. All text panels use JSONB stored on bids. ZZTakeoff reads a .xlsx export from the on-screen takeoff tool, parses areas and items, shows a preview modal, then creates areas/sections/items in Supabase via the existing dbHelpers.

Purpose: EST-09–11: complete the V2 estimator feature set for pre-construction workflow.
Output: views-estimator.jsx extended with 3 new center panels + ZZTakeoff import flow; index.html gets XLSX CDN tag.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-live-data-layer/03-CONTEXT.md

<interfaces>
<!-- JSONB FIELDS ON BIDS (added in 03-01): -->
<!-- exclusions, clarifications, general_terms, warranty, finish_terms, hardware_terms, fab_note -->
<!-- Each is jsonb DEFAULT '[]' — stores array of { text: string, active: boolean, sub: boolean } -->
<!-- sub=true renders as indented sub-item in proposal PDF (Phase 4) -->

<!-- F&S DEFAULT EXCLUSIONS (10 items, active:true by default): -->
<!-- 'Demolition of existing casework or construction' -->
<!-- 'Preparation and finishing of drywall, painting' -->
<!-- 'Flooring (except as specified in casework design)' -->
<!-- 'Plumbing and electrical (rough and trim)' -->
<!-- 'Window treatments and hardware not integrated into casework' -->
<!-- 'Appliances and equipment (unless specified as included)' -->
<!-- 'Rubber base, cove base, or floor trim' -->
<!-- 'Corner guards' -->
<!-- 'Site finishing or patching of walls/ceilings' -->
<!-- 'FRP panels and glazing/glass' -->

<!-- F&S DEFAULT CLARIFICATIONS (8 items, active:true): -->
<!-- 'Blum 125° concealed hinges, satin nickel' -->
<!-- 'Brushed chrome pulls (standard hardware)' -->
<!-- 'Accuride 3832 drawer slides' -->
<!-- '5mm shelf pin system' -->
<!-- 'Dowel-and-screw joinery throughout' -->
<!-- 'Net 30 payment terms' -->
<!-- 'F&S standard construction methods' -->
<!-- 'Lead time per project schedule' -->

<!-- TERMS SECTIONS (each has its own bids column): -->
<!-- general_terms, warranty, finish_terms, hardware_terms, fab_note -->
<!-- Each has pre-populated boilerplate from V2 (executor should use V2 as reference) -->

<!-- TERMS PANEL UI: -->
<!-- Tab bar at top: General | Warranty | Finish | Hardware | Fab Note -->
<!-- Each tab shows its items list: checkbox (active) + textarea + delete button -->
<!-- "All On" / "All Off" / Reset buttons per tab -->
<!-- Add new item: input at bottom + "Add" button + sub-item checkbox -->

<!-- ZZTAKEOFF IMPORT: -->
<!-- 1. Add XLSX CDN to index.html (before closing </body>): -->
<!--    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script> -->
<!-- 2. Button in estimator toolbar (top of center panel when centerView==='grid'): "Import ZZTakeoff" -->
<!-- 3. handleZZImport(): -->
<!--    a. const [fh] = await window.showOpenFilePicker({ types:[{accept:{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':[]}}] }) -->
<!--    b. const file = await fh.getFile(); const ab = await file.arrayBuffer(); -->
<!--    c. const wb = window.XLSX.read(ab, { type:'array' }); -->
<!--    d. const ws = wb.Sheets[wb.SheetNames[0]]; -->
<!--    e. const rows = window.XLSX.utils.sheet_to_json(ws, { header:1, defval:'' }); -->
<!--    f. parseZZTakeoff(rows) → { areas: [{name, items:[{desc,qty,unit,unitCost}]}] } -->
<!--    g. show preview modal (setZZPreview(parsed)) -->
<!-- 4. parseZZTakeoff(rows): -->
<!--    - Find header row: scan first 10 rows for 'Name'/'Group' column -->
<!--    - Detect Format A (has 'Cost Each') vs Format B (has 'Measurement 1') -->
<!--    - Format A: rows without cost = new area; rows with cost = items under current area -->
<!--    - Format B: rows without Units 1 = new area; rows with Units 1 = items -->
<!--    - Return array of { name:string, items:[{desc,qty,unit,unitCost}] } -->
<!-- 5. Preview modal: checklist of areas+items, confirm button → doZZImport(selected) -->
<!-- 6. doZZImport(areas): for each area → addArea → addSection('Casework') → addLineItem per item -->
<!--    After all done: reload tree (call load() again) and setZZPreview(null) -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add XLSX CDN to index.html</name>
  <read_first>
    - project/index.html (find closing body tag)
  </read_first>
  <files>project/index.html</files>
  <action>
    Add XLSX script tag before `</body>`:
    ```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    ```
  </action>
  <verify>grep "xlsx" project/index.html</verify>
  <done>XLSX CDN loads before app scripts</done>
</task>

<task type="auto">
  <name>Task 2: Add ZZTakeoff import to EstimatorView</name>
  <read_first>
    - project/views-estimator.jsx (full file — understand existing state and handlers)
  </read_first>
  <files>project/views-estimator.jsx</files>
  <action>
    Add ZZTakeoff state, parser, and modal. Edit views-estimator.jsx:

    **1. Add state near top of EstimatorView:**
    ```js
    const [zzPreview, setZZPreview] = uS_est(null); // null | { areas: [{name, checked, items:[{desc,qty,unit,unitCost,checked}]}] }
    const [zzImporting, setZZImporting] = uS_est(false);
    ```

    **2. Add parseZZTakeoff helper (outside component, before EstimatorView):**
    ```js
    function parseZZTakeoff(rows) {
      // Find header row
      let hdrIdx = -1, cols = {};
      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const r = rows[i].map(c => String(c).toLowerCase());
        if (r.some(c => c==='name' || c==='group')) { hdrIdx = i; break; }
      }
      if (hdrIdx < 0) return null;
      const hdr = rows[hdrIdx].map(c => String(c).toLowerCase());
      cols.name = hdr.findIndex(c => c==='name'||c==='group');
      cols.qty  = hdr.findIndex(c => c==='qty'||c==='measurement 1');
      cols.unit = hdr.findIndex(c => c==='unit'||c==='units 1');
      cols.cost = hdr.findIndex(c => c==='cost each'||c==='unit cost');
      const isFormatA = cols.cost >= 0;
      const areas = [];
      let cur = null;
      for (let i = hdrIdx + 1; i < rows.length; i++) {
        const r = rows[i];
        const name = String(r[cols.name] || '').trim();
        if (!name) continue;
        const unitVal = cols.unit >= 0 ? String(r[cols.unit]||'').trim() : '';
        const costVal = cols.cost >= 0 ? parseFloat(r[cols.cost]) : NaN;
        const isArea = isFormatA ? isNaN(costVal) : !unitVal;
        if (isArea) {
          cur = { name, checked: true, items: [] };
          areas.push(cur);
        } else if (cur) {
          cur.items.push({
            desc: name, checked: true,
            qty: parseFloat(r[cols.qty])||1,
            unit: unitVal || 'EA',
            unitCost: isNaN(costVal) ? 0 : costVal,
          });
        }
      }
      return areas.length ? areas : null;
    }
    ```

    **3. Add handleZZImport handler inside EstimatorView:**
    ```js
    async function handleZZImport() {
      if (!window.showOpenFilePicker) { alert('File picker not supported in this browser.'); return; }
      try {
        const [fh] = await window.showOpenFilePicker({
          types: [{ description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx','.xls'] } }],
        });
        const file = await fh.getFile();
        const ab = await file.arrayBuffer();
        const wb = window.XLSX.read(ab, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const parsed = parseZZTakeoff(rows);
        if (!parsed) { alert('Could not parse ZZTakeoff format. Expected "Name"/"Group" header column.'); return; }
        setZZPreview(parsed);
      } catch (e) {
        if (e.name !== 'AbortError') console.error('ZZTakeoff import error:', e);
      }
    }

    async function doZZImport(areas) {
      setZZImporting(true);
      for (const area of areas.filter(a => a.checked && a.items.some(it=>it.checked))) {
        const { data: areaRow } = await window.dbHelpers.addArea(activeBidId, {
          name: area.name, qty: 1, sort_order: (tree||[]).length,
        });
        if (!areaRow) continue;
        const { data: secRow } = await window.dbHelpers.addSection(areaRow.id, { name: 'Casework', sort_order: 0 });
        if (!secRow) continue;
        for (const [idx, it] of area.items.filter(i=>i.checked).entries()) {
          await window.dbHelpers.addLineItem({
            bid_id: activeBidId, area_id: areaRow.id, section_id: secRow.id,
            description: it.desc, qty: it.qty, unit: it.unit, unit_cost: it.unitCost, sort_order: idx,
          });
        }
      }
      setZZPreview(null);
      setZZImporting(false);
      // Reload tree
      setTree(null);
      setActiveAreaId(null); setActiveSectionId(null);
    }
    ```

    **4. Add ZZTakeoff button to the grid toolbar (inside center panel, top of grid view):**
    ```jsx
    <button className="btn sm" onClick={handleZZImport} style={{ marginLeft: 8 }}>
      ↑ Import ZZTakeoff
    </button>
    ```

    **5. Add preview modal (render after the main return div, before closing):**
    ```jsx
    {zzPreview && (
      <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ background:'var(--panel)',borderRadius:'var(--r-lg)',padding:24,width:520,maxHeight:'80vh',display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ fontWeight:700,fontSize:15 }}>ZZTakeoff Import Preview</div>
          <div style={{ fontSize:12,color:'var(--ink-3)' }}>Uncheck areas or items to exclude them.</div>
          <div style={{ overflowY:'auto',flex:1,border:'1px solid var(--line)',borderRadius:'var(--r-sm)' }}>
            {zzPreview.map((area, ai) => (
              <div key={ai}>
                <label style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:'var(--panel-alt)',fontWeight:600,fontSize:13,cursor:'pointer' }}>
                  <input type="checkbox" checked={area.checked} onChange={() => setZZPreview(prev => prev.map((a,i)=>i===ai?{...a,checked:!a.checked}:a))}/>
                  {area.name}
                  <span style={{ marginLeft:'auto',fontSize:11,color:'var(--ink-3)',fontWeight:400 }}>{area.items.length} items</span>
                </label>
                {area.items.map((it, ii) => (
                  <label key={ii} style={{ display:'flex',alignItems:'center',gap:8,padding:'4px 10px 4px 26px',fontSize:12,cursor:'pointer' }}>
                    <input type="checkbox" checked={it.checked} onChange={() => setZZPreview(prev => prev.map((a,i)=>i===ai?{...a,items:a.items.map((t,j)=>j===ii?{...t,checked:!t.checked}:t)}:a))}/>
                    <span style={{ flex:1 }}>{it.desc}</span>
                    <span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--ink-3)' }}>{it.qty} {it.unit} @ ${it.unitCost}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
            <button className="btn" onClick={()=>setZZPreview(null)} disabled={zzImporting}>Cancel</button>
            <button className="btn accent" onClick={()=>doZZImport(zzPreview)} disabled={zzImporting}>
              {zzImporting ? 'Importing…' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    )}
    ```
  </action>
  <verify>
    grep "parseZZTakeoff\|handleZZImport\|doZZImport\|zzPreview" project/views-estimator.jsx
    grep "xlsx" project/index.html
  </verify>
  <done>
    - XLSX CDN in index.html
    - Import ZZTakeoff button visible in grid toolbar
    - handleZZImport opens file picker, reads xlsx, calls parseZZTakeoff
    - parseZZTakeoff detects Format A (priced) and Format B (measured)
    - Preview modal shows area/item checklist with counts
    - doZZImport creates areas + Casework section + line items in Supabase, then reloads tree
  </done>
</task>

<task type="auto">
  <name>Task 3: Add Exclusions, Clarifications, and Terms panels</name>
  <read_first>
    - project/views-estimator.jsx (full file)
  </read_first>
  <files>project/views-estimator.jsx</files>
  <action>
    Add Exclusions, Clarifications, and Terms center panels. All data stored as JSONB on bids.

    **1. Default arrays (define outside component):**
    ```js
    const DEFAULT_EXCLUSIONS = [
      'Demolition of existing casework or construction',
      'Preparation and finishing of drywall, painting',
      'Flooring (except as specified in casework design)',
      'Plumbing and electrical (rough and trim)',
      'Window treatments and hardware not integrated into casework',
      'Appliances and equipment (unless specified as included)',
      'Rubber base, cove base, or floor trim',
      'Corner guards',
      'Site finishing or patching of walls/ceilings',
      'FRP panels and glazing/glass',
    ].map(text => ({ text, active: true, sub: false }));

    const DEFAULT_CLARIFICATIONS = [
      'Blum 125° concealed hinges, satin nickel',
      'Brushed chrome pulls (standard hardware)',
      'Accuride 3832 drawer slides',
      '5mm shelf pin system',
      'Dowel-and-screw joinery throughout',
      'Net 30 payment terms',
      'F&S standard construction methods',
      'Lead time per project schedule',
    ].map(text => ({ text, active: true, sub: false }));
    ```

    **2. Add sidebar nav links** (in the sidebar, after Alternates link already added in 03-05b):
    Add 'Exclusions', 'Clarifications', 'Terms' to the nav links array.

    **3. Add state for terms tab:**
    ```js
    const [termsTab, setTermsTab] = uS_est('general_terms');
    ```

    **4. Generic terms-panel helper function (inside component):**
    ```js
    function getItems(field) {
      const raw = bid?.[field];
      if (!raw || !raw.length) {
        if (field === 'exclusions') return DEFAULT_EXCLUSIONS;
        if (field === 'clarifications') return DEFAULT_CLARIFICATIONS;
        return [];
      }
      return raw;
    }

    async function saveItems(field, items) {
      setBid(prev => ({ ...prev, [field]: items }));
      await window.dbHelpers.updateBidInfo(activeBidId, { [field]: items });
    }
    ```

    **5. Reusable ItemListPanel component (define outside EstimatorView):**
    ```jsx
    function ItemListPanel({ title, items, onSave }) {
      const [newText, setNewText] = uS_est('');
      return (
        <div style={{ padding:'24px 28px', maxWidth:680 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div className="page-title">{title}</div>
            <button className="btn sm ghost" style={{ marginLeft:'auto' }}
              onClick={() => onSave(items.map(i => ({ ...i, active: true })))}>All On</button>
            <button className="btn sm ghost"
              onClick={() => onSave(items.map(i => ({ ...i, active: false })))}>All Off</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'6px 10px',
                background:'var(--panel)', border:'1px solid var(--line)', borderRadius:'var(--r-sm)',
                marginLeft: item.sub ? 24 : 0, opacity: item.active ? 1 : .5 }}>
                <input type="checkbox" checked={!!item.active} style={{ marginTop:3, flexShrink:0 }}
                  onChange={() => { const next=[...items]; next[idx]={...next[idx],active:!next[idx].active}; onSave(next); }}/>
                <textarea value={item.text} rows={1}
                  onChange={e => { const next=[...items]; next[idx]={...next[idx],text:e.target.value}; onSave(next); }}
                  style={{ flex:1, border:'none', background:'transparent', fontSize:12.5, resize:'none',
                    fontFamily:'var(--sans)', color: item.active ? 'var(--ink)' : 'var(--ink-3)' }}/>
                <button className="btn ghost xs" style={{ color:'var(--bad)', flexShrink:0 }}
                  onClick={() => onSave(items.filter((_,i)=>i!==idx))}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <input value={newText} onChange={e=>setNewText(e.target.value)}
              placeholder="Add item…" onKeyDown={e=>{if(e.key==='Enter'&&newText.trim()){onSave([...items,{text:newText.trim(),active:true,sub:false}]);setNewText('');}}}
              style={{ flex:1, border:'1px solid var(--line)', borderRadius:'var(--r-sm)', padding:'5px 8px', fontSize:12.5, background:'var(--bg)' }}/>
            <button className="btn sm" onClick={() => { if(newText.trim()){onSave([...items,{text:newText.trim(),active:true,sub:false}]);setNewText('');} }}>Add</button>
          </div>
        </div>
      );
    }
    ```

    **6. Wire panels in center panel conditional rendering:**
    ```jsx
    {centerView === 'exclusions' && (
      <ItemListPanel title="Exclusions"
        items={getItems('exclusions')}
        onSave={items => saveItems('exclusions', items)} />
    )}
    {centerView === 'clarifications' && (
      <ItemListPanel title="Clarifications"
        items={getItems('clarifications')}
        onSave={items => saveItems('clarifications', items)} />
    )}
    {centerView === 'terms' && (
      <div style={{ padding:'24px 28px', maxWidth:680 }}>
        <div className="page-title" style={{ marginBottom:14 }}>Proposal Terms</div>
        <div style={{ display:'flex', gap:4, marginBottom:16, flexWrap:'wrap' }}>
          {[['general_terms','General'],['warranty','Warranty'],['finish_terms','Finish'],['hardware_terms','Hardware'],['fab_note','Fab Note']].map(([f,label]) => (
            <button key={f} className={`btn sm ${termsTab===f?'accent':''}`} onClick={() => setTermsTab(f)}>{label}</button>
          ))}
        </div>
        <ItemListPanel title="" items={getItems(termsTab)} onSave={items => saveItems(termsTab, items)} />
      </div>
    )}
    ```
  </action>
  <verify>
    grep "DEFAULT_EXCLUSIONS\|DEFAULT_CLARIFICATIONS\|ItemListPanel\|getItems\|saveItems\|termsTab" project/views-estimator.jsx
    grep "exclusions\|clarifications\|general_terms\|warranty\|finish_terms" project/views-estimator.jsx
  </verify>
  <done>
    - DEFAULT_EXCLUSIONS (10 items) and DEFAULT_CLARIFICATIONS (8 items) defined outside component
    - Sidebar has Exclusions, Clarifications, Terms nav links
    - Each panel uses reusable ItemListPanel: checkboxes, editable text, delete, add-new input
    - All On / All Off buttons toggle all items in a panel
    - Terms panel has 5-tab sub-nav: General | Warranty | Finish | Hardware | Fab Note
    - All changes persist to Supabase via updateBidInfo JSONB columns
    - First load: if bid.exclusions is empty, defaults to DEFAULT_EXCLUSIONS (pre-populated for new bids)
  </done>
</task>

</tasks>

<verification>
1. Open an estimate → toolbar shows "Import ZZTakeoff" button
2. Click Import ZZTakeoff → file picker opens; select a .xlsx export from ZZTakeoff
3. Preview modal shows areas + items with checkboxes; uncheck one → it's excluded
4. Click Import → areas/sections/items appear in sidebar and grid; reload → still present
5. Click "Exclusions" in sidebar → panel shows 10 pre-populated items, all checked
6. Uncheck one → it grays out and saves (reload → still unchecked)
7. Edit text inline → saves on change; add a new item → appears immediately
8. Click "Terms" → 5 tabs; each tab shows pre-populated boilerplate
9. Click "Clarifications" → 8 items pre-populated
</verification>

<success_criteria>
- ZZTakeoff import handles both Format A (priced) and Format B (measured)
- Preview modal allows per-item exclusion before import
- Import creates proper area→section→item hierarchy in Supabase
- Exclusions/clarifications panels pre-populate with F&S defaults on first open
- All text changes persist to bids JSONB columns via updateBidInfo
- Terms panel has 5 sub-sections navigable via tab bar
</success_criteria>

<output>
After completion, update `.planning/phases/03-live-data-layer/03-05-SUMMARY.md` with 03-05c additions
</output>
