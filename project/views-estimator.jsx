// Estimator workbook — V2: areas → sections → items hierarchy
const { useState: uS_est, useMemo: uM_est, useEffect: uE_est, useRef: uR_est } = React;

// ── Default exclusions / clarifications ───────────────────────────────────────
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

// ── ZZTakeoff parser ──────────────────────────────────────────────────────────
function parseZZTakeoff(rows) {
  let hdrIdx = -1, cols = {};
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const r = rows[i].map(c => String(c).toLowerCase());
    if (r.some(c => c === 'name' || c === 'group')) { hdrIdx = i; break; }
  }
  if (hdrIdx < 0) return null;
  const hdr = rows[hdrIdx].map(c => String(c).toLowerCase());
  cols.name = hdr.findIndex(c => c === 'name' || c === 'group');
  cols.qty  = hdr.findIndex(c => c === 'qty' || c === 'measurement 1');
  cols.unit = hdr.findIndex(c => c === 'unit' || c === 'units 1');
  cols.cost = hdr.findIndex(c => c === 'cost each' || c === 'unit cost');
  const isFormatA = cols.cost >= 0;
  const areas = [];
  let cur = null;
  for (let i = hdrIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const name = String(r[cols.name] || '').trim();
    if (!name) continue;
    const unitVal = cols.unit >= 0 ? String(r[cols.unit] || '').trim() : '';
    const costVal = cols.cost >= 0 ? parseFloat(r[cols.cost]) : NaN;
    const isArea = isFormatA ? isNaN(costVal) : !unitVal;
    if (isArea) {
      cur = { name, checked: true, items: [] };
      areas.push(cur);
    } else if (cur) {
      cur.items.push({
        desc: name, checked: true,
        qty: parseFloat(r[cols.qty]) || 1,
        unit: unitVal || 'EA',
        unitCost: isNaN(costVal) ? 0 : costVal,
      });
    }
  }
  return areas.length ? areas : null;
}

// ── Reusable ItemListPanel ────────────────────────────────────────────────────
function ItemListPanel({ title, items, onSave }) {
  const [newText, setNewText] = uS_est('');
  return (
    <div style={{ padding: '24px 28px', maxWidth: 680 }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div className="page-title">{title}</div>
          <button className="btn sm ghost" style={{ marginLeft: 'auto' }}
            onClick={() => onSave(items.map(i => ({ ...i, active: true })))}>All On</button>
          <button className="btn sm ghost"
            onClick={() => onSave(items.map(i => ({ ...i, active: false })))}>All Off</button>
        </div>
      )}
      {!title && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 10 }}>
          <button className="btn sm ghost"
            onClick={() => onSave(items.map(i => ({ ...i, active: true })))}>All On</button>
          <button className="btn sm ghost"
            onClick={() => onSave(items.map(i => ({ ...i, active: false })))}>All Off</button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px',
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
            marginLeft: item.sub ? 24 : 0, opacity: item.active ? 1 : 0.5
          }}>
            <input type="checkbox" checked={!!item.active} style={{ marginTop: 3, flexShrink: 0 }}
              onChange={() => { const next = [...items]; next[idx] = { ...next[idx], active: !next[idx].active }; onSave(next); }} />
            <textarea value={item.text} rows={1}
              onChange={e => { const next = [...items]; next[idx] = { ...next[idx], text: e.target.value }; onSave(next); }}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12.5, resize: 'none',
                fontFamily: 'var(--sans)', color: item.active ? 'var(--ink)' : 'var(--ink-3)' }} />
            <button className="btn ghost xs" style={{ color: 'var(--bad)', flexShrink: 0 }}
              onClick={() => onSave(items.filter((_, i) => i !== idx))}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={newText} onChange={e => setNewText(e.target.value)}
          placeholder="Add item…"
          onKeyDown={e => { if (e.key === 'Enter' && newText.trim()) { onSave([...items, { text: newText.trim(), active: true, sub: false }]); setNewText(''); } }}
          style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '5px 8px', fontSize: 12.5, background: 'var(--bg)' }} />
        <button className="btn sm" onClick={() => { if (newText.trim()) { onSave([...items, { text: newText.trim(), active: true, sub: false }]); setNewText(''); } }}>Add</button>
      </div>
    </div>
  );
}

function fmt(n) { if (n == null || isNaN(n)) return '—'; return '$' + Number(n).toLocaleString(undefined, {maximumFractionDigits:0}); }

function calcBid(tree, bid) {
  const mat = (tree||[]).reduce((sum, area) => {
    if (area.ignore) return sum;
    const aQty = area.qty || 1;
    return sum + (area.sections||[]).reduce((s2, sec) => {
      if (sec.ignore) return s2;
      return s2 + (sec.items||[]).reduce((s3, it) => {
        if (it.ignore) return s3;
        return s3 + (it.qty||0)*(it.unit_cost||0)*aQty;
      }, 0);
    }, 0);
  }, 0);
  const ohPct  = (bid?.oh_pct  ?? 15) / 100;
  const delPct = (bid?.del_pct ??  5) / 100;
  const insPct = (bid?.ins_pct ?? 20) / 100;
  const oh = mat * ohPct;
  const matOh = mat + oh;
  const del = matOh * delPct;
  const ins = matOh * insPct;
  return { mat, oh, matOh, del, ins, total: matOh + del + ins };
}

function EstimatorView({ activeBidId }) {
  const [bid,             setBid]             = uS_est(null);
  const [tree,            setTree]            = uS_est(null);
  const [activeAreaId,    setActiveAreaId]    = uS_est(null);
  const [activeSectionId, setActiveSectionId] = uS_est(null);
  const [libItems,        setLibItems]        = uS_est(null);
  const [libQ,            setLibQ]            = uS_est('');
  const [libCat,          setLibCat]          = uS_est('');
  const [centerView,      setCenterView]      = uS_est('grid');
  const [alts,            setAlts]            = uS_est(null);
  const [termsTab,        setTermsTab]        = uS_est('general_terms');
  const [zzPreview,       setZZPreview]       = uS_est(null);
  const [zzImporting,     setZZImporting]     = uS_est(false);
  const saveTimer                             = uR_est(null);

  // Load bid metadata
  uE_est(() => {
    if (!activeBidId) { setBid(null); return; }
    window.dbHelpers.getBid(activeBidId).then(({ data }) => { if (data) setBid(data); });
  }, [activeBidId]);

  // Load tree: areas → sections → items, assemble client-side
  uE_est(() => {
    if (!activeBidId) { setTree([]); return; }
    setTree(null); // trigger spinner
    let cancelled = false;
    async function load() {
      const { data: areas } = await window.dbHelpers.getAreas(activeBidId);
      if (!areas || cancelled) return;
      const areaIds = areas.map(a => a.id);
      const [{ data: sections }, { data: items }] = await Promise.all([
        window.dbHelpers.getAllSections(areaIds),
        window.dbHelpers.getLineItems(activeBidId),
      ]);
      if (cancelled) return;
      const itemsBySec = {};
      for (const it of (items||[])) {
        if (!itemsBySec[it.section_id]) itemsBySec[it.section_id] = [];
        itemsBySec[it.section_id].push(it);
      }
      const secsByArea = {};
      for (const s of (sections||[])) {
        if (!secsByArea[s.area_id]) secsByArea[s.area_id] = [];
        secsByArea[s.area_id].push({ ...s, items: itemsBySec[s.id] || [] });
      }
      const assembled = areas.map(a => ({ ...a, sections: secsByArea[a.id] || [] }));
      setTree(assembled);
      if (assembled.length > 0) {
        setActiveAreaId(prev => prev || assembled[0].id);
        const firstSec = assembled[0].sections[0];
        if (firstSec) setActiveSectionId(prev => prev || firstSec.id);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeBidId]);

  // Load alternates when bid changes
  uE_est(() => {
    if (!activeBidId) { setAlts([]); return; }
    window.dbHelpers.getAlternates(activeBidId).then(({ data }) => setAlts(data || []));
  }, [activeBidId]);

  // Load library items once
  uE_est(() => {
    let cancelled = false;
    window.dbHelpers.getLibraryItems().then(({ data }) => {
      if (!cancelled) setLibItems(data || []);
    });
    return () => { cancelled = true; };
  }, []);

  const fuse = uM_est(() => {
    if (!libItems?.length) return null;
    return typeof window.Fuse === 'function'
      ? new window.Fuse(libItems, { keys:['description','code','category'], threshold:0.3 })
      : null;
  }, [libItems]);

  const libResults = uM_est(() => {
    let base = libItems || [];
    if (libCat) base = base.filter(l => l.category === libCat);
    if (!libQ || !fuse) return base;
    return fuse.search(libQ).map(r => r.item).filter(l => !libCat || l.category === libCat);
  }, [libQ, libCat, fuse, libItems]);

  const libCats = uM_est(() => {
    if (!libItems) return [];
    return [...new Set(libItems.map(l => l.category).filter(Boolean))].sort();
  }, [libItems]);

  const costs = uM_est(() => calcBid(tree, bid), [tree, bid]);

  const activeSectionName = uM_est(() => {
    if (!tree || !activeSectionId) return null;
    for (const a of tree) for (const s of a.sections) if (s.id === activeSectionId) return s.name;
    return null;
  }, [tree, activeSectionId]);

  // ── CRUD HANDLERS ──────────────────────────────────────────────

  async function handleAddArea() {
    const name = prompt('Area name:');
    if (!name?.trim()) return;
    const { data, error } = await window.dbHelpers.addArea(activeBidId, { name: name.trim(), qty: 1, sort_order: (tree||[]).length });
    if (!error && data) {
      const newArea = { ...data, sections: [] };
      setTree(prev => [...(prev||[]), newArea]);
      setActiveAreaId(data.id);
    }
  }

  async function handleAddSection(areaId) {
    const name = prompt('Section name:');
    if (!name?.trim()) return;
    const area = (tree||[]).find(a => a.id === areaId);
    const { data, error } = await window.dbHelpers.addSection(areaId, { name: name.trim(), sort_order: (area?.sections||[]).length });
    if (!error && data) {
      const newSec = { ...data, items: [] };
      setTree(prev => prev.map(a => a.id === areaId ? { ...a, sections: [...a.sections, newSec] } : a));
      setActiveSectionId(data.id);
    }
  }

  async function handleAddItem(areaId, sectionId) {
    const sec = (tree||[]).flatMap(a=>a.sections).find(s=>s.id===sectionId);
    const { data, error } = await window.dbHelpers.addLineItem({
      bid_id: activeBidId, area_id: areaId, section_id: sectionId,
      description: 'New item', qty: 1, unit: 'EA', unit_cost: 0,
      sort_order: (sec?.items||[]).length,
    });
    if (!error && data) {
      setTree(prev => prev.map(a => a.id === areaId
        ? { ...a, sections: a.sections.map(s => s.id === sectionId
            ? { ...s, items: [...s.items, data] } : s) } : a));
    }
  }

  async function handleUpdateItem(areaId, sectionId, itemId, field, value) {
    const parsed = (field==='qty'||field==='unit_cost') ? parseFloat(value)||0 : value;
    setTree(prev => prev.map(a => a.id === areaId
      ? { ...a, sections: a.sections.map(s => s.id === sectionId
          ? { ...s, items: s.items.map(it => it.id === itemId ? { ...it, [field]: parsed } : it) } : s) } : a));
    await window.dbHelpers.updateLineItem(itemId, { [field]: parsed });
  }

  async function handleToggleItemFlag(areaId, sectionId, itemId, flag) {
    const item = (tree||[]).flatMap(a=>a.sections).flatMap(s=>s.items).find(it=>it.id===itemId);
    if (!item) return;
    const next = !item[flag];
    setTree(prev => prev.map(a => a.id === areaId
      ? { ...a, sections: a.sections.map(s => s.id === sectionId
          ? { ...s, items: s.items.map(it => it.id === itemId ? { ...it, [flag]: next } : it) } : s) } : a));
    await window.dbHelpers.updateLineItem(itemId, { [flag]: next });
  }

  async function handleDeleteItem(areaId, sectionId, itemId) {
    if (!confirm('Delete this line item?')) return;
    const { error } = await window.dbHelpers.deleteLineItem(itemId);
    if (!error) setTree(prev => prev.map(a => a.id === areaId
      ? { ...a, sections: a.sections.map(s => s.id === sectionId
          ? { ...s, items: s.items.filter(it => it.id !== itemId) } : s) } : a));
  }

  async function handleDeleteSection(areaId, sectionId) {
    if (!confirm('Delete section and all its items?')) return;
    const { error } = await window.dbHelpers.deleteSection(sectionId);
    if (!error) {
      setTree(prev => prev.map(a => a.id === areaId
        ? { ...a, sections: a.sections.filter(s => s.id !== sectionId) } : a));
      if (activeSectionId === sectionId) setActiveSectionId(null);
    }
  }

  async function handleDeleteArea(areaId) {
    if (!confirm('Delete area and all its sections and items?')) return;
    const { error } = await window.dbHelpers.deleteArea(areaId);
    if (!error) {
      setTree(prev => prev.filter(a => a.id !== areaId));
      if (activeAreaId === areaId) { setActiveAreaId(null); setActiveSectionId(null); }
    }
  }

  async function handleInsertFromLibrary(lib) {
    if (!activeSectionId || !activeBidId) return;
    const area = (tree||[]).find(a => a.sections.some(s => s.id === activeSectionId));
    if (!area) return;
    const sec = area.sections.find(s => s.id === activeSectionId);
    const unit_cost = (lib.material_cost||0) + (lib.labor_cost||0);
    const { data, error } = await window.dbHelpers.addLineItem({
      bid_id: activeBidId, area_id: area.id, section_id: activeSectionId,
      description: lib.description, qty: 1, unit: lib.unit||'EA', unit_cost,
      sort_order: (sec?.items||[]).length,
    });
    if (!error && data) setTree(prev => prev.map(a => a.id === area.id
      ? { ...a, sections: a.sections.map(s => s.id === activeSectionId
          ? { ...s, items: [...s.items, data] } : s) } : a));
  }

  // ── MARKUP % HANDLER (optimistic + debounced persist) ────────────
  function handlePctChange(field, value) {
    const n = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setBid(prev => ({ ...prev, [field]: n }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      window.dbHelpers.updateBidInfo(activeBidId, { [field]: n });
    }, 800);
  }

  // ── ALTERNATES HANDLERS ───────────────────────────────────────────
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

  // ── TERMS / EXCLUSIONS / CLARIFICATIONS HELPERS ──────────────────
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

  // ── ZZTAKEOFF IMPORT ─────────────────────────────────────────────
  async function handleZZImport() {
    if (!window.showOpenFilePicker) { alert('File import requires Chrome or Edge.'); return; }
    try {
      const [fh] = await window.showOpenFilePicker({
        types: [{ description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls'] } }],
      });
      const file = await fh.getFile();
      const ab = await file.arrayBuffer();
      const wb = window.XLSX.read(ab, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const parsed = parseZZTakeoff(rows);
      if (!parsed) { alert('Could not parse ZZTakeoff format. Expected "Name" or "Group" header column.'); return; }
      setZZPreview(parsed);
    } catch (e) {
      if (e.name !== 'AbortError') console.error('ZZTakeoff import error:', e);
    }
  }

  async function doZZImport(areas) {
    setZZImporting(true);
    for (const area of areas.filter(a => a.checked && a.items.some(it => it.checked))) {
      const { data: areaRow } = await window.dbHelpers.addArea(activeBidId, {
        name: area.name, qty: 1, sort_order: (tree || []).length,
      });
      if (!areaRow) continue;
      const { data: secRow } = await window.dbHelpers.addSection(areaRow.id, { name: 'Casework', sort_order: 0 });
      if (!secRow) continue;
      for (const [idx, it] of area.items.filter(i => i.checked).entries()) {
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
    setActiveAreaId(null);
    setActiveSectionId(null);
  }

  // ── RENDER ──────────────────────────────────────────────────────

  if (!activeBidId) return (
    <div className="view active" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <window.EmptyState heading="No line items" body="Select a bid from the Pipeline to open its estimate." />
    </div>
  );

  if (tree === null) return <window.Spinner />;

  return (
    <div className="view active" style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

      {/* Cost topbar */}
      <div style={{padding:'8px 20px',borderBottom:'1px solid var(--line)',background:'var(--panel)',display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--ink-2)',marginRight:6}}>{bid?.name || '…'}</div>
        <div style={{marginLeft:'auto',display:'flex',gap:4,alignItems:'center'}}>
          {[
            { label:'Material', val: costs.mat },
            { label:'OH',       val: costs.oh  },
            { label:'Del',      val: costs.del },
            { label:'Ins',      val: costs.ins },
            { label:'Base Bid', val: costs.total, accent: true },
          ].map(c => (
            <div key={c.label} style={{background: c.accent ? 'var(--accent-soft)' : 'var(--panel-alt)',
              border:`1px solid ${c.accent ? 'var(--accent-line,#d4956e)' : 'var(--line)'}`,
              borderRadius:'var(--r-sm,4px)',padding:'3px 10px',textAlign:'center',minWidth:80}}>
              <div style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.06em',color: c.accent ? 'var(--accent-2)' : 'var(--ink-3)'}}>{c.label}</div>
              <div style={{fontSize:13,fontWeight:700,color: c.accent ? 'var(--accent)' : 'var(--ink)',fontFamily:'var(--mono)'}}>{fmt(c.val)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: sidebar + content + library */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'220px 1fr 280px',overflow:'hidden'}}>

        {/* Left sidebar — area/section tree */}
        <aside style={{background:'var(--panel-alt)',borderRight:'1px solid var(--line)',overflowY:'auto',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'8px 10px 4px',fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--mute)',fontWeight:600}}>Areas</div>
          {(tree||[]).map(area => (
            <div key={area.id}>
              <div onClick={() => { setActiveAreaId(area.id); setCenterView('grid'); if (area.sections[0]) setActiveSectionId(area.sections[0].id); }}
                style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',cursor:'pointer',
                  background: activeAreaId===area.id ? 'var(--panel-3,#EDE6D8)' : 'transparent',
                  boxShadow: activeAreaId===area.id ? 'inset 2px 0 0 var(--accent)' : 'none',
                  fontSize:13,fontWeight:activeAreaId===area.id ? 600 : 500,color:'var(--ink)'}}>
                <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{area.name}</span>
                {(area.qty||1)>1 && <span style={{fontSize:10,color:'var(--accent)',fontFamily:'var(--mono)',flexShrink:0}}>×{area.qty}</span>}
                <button className="btn ghost xs" style={{padding:'0 3px',opacity:.5,flexShrink:0}}
                  onClick={e=>{e.stopPropagation(); handleDeleteArea(area.id);}}>×</button>
              </div>
              {activeAreaId===area.id && (area.sections||[]).map(sec => (
                <div key={sec.id} onClick={() => { setActiveSectionId(sec.id); setCenterView('grid'); }}
                  style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px 4px 22px',cursor:'pointer',
                    background: activeSectionId===sec.id ? 'var(--panel-3,#EDE6D8)' : 'transparent',
                    boxShadow: activeSectionId===sec.id ? 'inset 2px 0 0 var(--accent)' : 'none',
                    fontSize:12,color: activeSectionId===sec.id ? 'var(--ink)' : 'var(--ink-3)'}}>
                  <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sec.name}</span>
                  <button className="btn ghost xs" style={{padding:'0 3px',opacity:.4,flexShrink:0}}
                    onClick={e=>{e.stopPropagation(); handleDeleteSection(area.id, sec.id);}}>×</button>
                </div>
              ))}
              {activeAreaId===area.id && (
                <div style={{padding:'3px 10px 4px 22px'}}>
                  <button className="btn ghost xs" style={{fontSize:11,color:'var(--ink-3)'}}
                    onClick={()=>handleAddSection(area.id)}>+ section</button>
                </div>
              )}
            </div>
          ))}
          <div style={{padding:'4px 10px',borderTop:'1px solid var(--line)',marginTop:8}}>
            <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--mute)',fontWeight:600,marginBottom:4,marginTop:4}}>Views</div>
            {[
              { id:'grid',          label:'Grid' },
              { id:'info',          label:'Info' },
              { id:'alternates',    label:'Alternates' },
              { id:'exclusions',    label:'Exclusions' },
              { id:'clarifications',label:'Clarifications' },
              { id:'terms',         label:'Terms' },
            ].map(v => (
              <div key={v.id} onClick={()=>setCenterView(v.id)}
                style={{padding:'4px 6px',cursor:'pointer',borderRadius:'var(--r-sm,4px)',fontSize:12,
                  background: centerView===v.id ? 'var(--panel-3,#EDE6D8)' : 'transparent',
                  boxShadow: centerView===v.id ? 'inset 2px 0 0 var(--accent)' : 'none',
                  fontWeight: centerView===v.id ? 600 : 400,
                  color: centerView===v.id ? 'var(--ink)' : 'var(--ink-3)'}}>
                {v.label}
              </div>
            ))}
          </div>
          <div style={{padding:'6px 10px',marginTop:'auto',borderTop:'1px solid var(--line)'}}>
            <button className="btn sm" style={{width:'100%'}} onClick={handleAddArea}>+ Add area</button>
          </div>
        </aside>

        {/* Center — item grid or info/alternates/placeholder panels */}
        <div style={{overflowY:'auto',background:'var(--bg)'}}>
          {centerView === 'info' ? (
            <div style={{padding:'24px 28px',maxWidth:700}}>
              <div className="page-title" style={{marginBottom:18}}>Project Info</div>
              {/* Markup rates */}
              <div style={{background:'var(--panel)',border:'1px solid var(--line)',borderRadius:'var(--r-lg,6px)',padding:'14px 18px',marginBottom:18}}>
                <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--mute)',fontWeight:600,marginBottom:10}}>Markup Rates</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                  {[['oh_pct','Overhead %',15],['del_pct','Delivery %',5],['ins_pct','Install %',20]].map(([f,label,def]) => (
                    <label key={f}>
                      <div style={{fontSize:11.5,color:'var(--ink-3)',marginBottom:3}}>{label}</div>
                      <input type="number" min="0" max="100" step="0.5"
                        value={bid?.[f] ?? def}
                        onChange={e=>handlePctChange(f, e.target.value)}
                        style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm,4px)',padding:'5px 8px',fontSize:13,fontFamily:'var(--mono)',background:'var(--bg)'}}/>
                    </label>
                  ))}
                </div>
              </div>
              {/* Bid metadata fields */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
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
                  ['attention','Attention','text',null],
                ].map(([field,label,type,opts]) => (
                  <label key={field}>
                    <div style={{fontSize:11.5,color:'var(--ink-3)',marginBottom:3}}>{label}</div>
                    {type==='select' ? (
                      <select value={bid?.[field]||''} onChange={e=>{setBid(p=>({...p,[field]:e.target.value}));window.dbHelpers.updateBidInfo(activeBidId,{[field]:e.target.value});}}
                        style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm,4px)',padding:'5px 8px',fontSize:12.5,background:'var(--bg)'}}>
                        <option value="">—</option>
                        {opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} defaultValue={bid?.[field]||''}
                        onBlur={e=>{setBid(p=>({...p,[field]:e.target.value}));window.dbHelpers.updateBidInfo(activeBidId,{[field]:e.target.value});}}
                        style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm,4px)',padding:'5px 8px',fontSize:12.5,background:'var(--bg)'}}/>
                    )}
                  </label>
                ))}
              </div>
              <label style={{display:'block',marginTop:12}}>
                <div style={{fontSize:11.5,color:'var(--ink-3)',marginBottom:3}}>Scope / Notes (internal)</div>
                <textarea defaultValue={bid?.notes||''} rows={4}
                  onBlur={e=>{setBid(p=>({...p,notes:e.target.value}));window.dbHelpers.updateBidInfo(activeBidId,{notes:e.target.value});}}
                  style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm,4px)',padding:'6px 8px',fontSize:12.5,background:'var(--bg)',resize:'vertical'}}/>
              </label>
            </div>
          ) : centerView === 'alternates' ? (
            <div style={{padding:'24px 28px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div className="page-title">Alternates</div>
                <button className="btn sm accent" onClick={handleAddAlt}>+ Add Alternate</button>
              </div>
              <div style={{fontSize:12,color:'var(--ink-3)',marginBottom:12}}>
                Alternates are listed separately and are not included in the Base Bid total.
              </div>
              {alts === null ? <window.Spinner /> : (
                <table className="wf">
                  <thead>
                    <tr>
                      <th style={{width:32,textAlign:'center'}}>#</th>
                      <th>Description</th>
                      <th style={{width:70}} className="num">Qty</th>
                      <th style={{width:60}} className="ctr">Unit</th>
                      <th style={{width:100}} className="num">Price $</th>
                      <th style={{width:110}} className="num">Total</th>
                      <th style={{width:32}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(alts||[]).map((alt,i) => (
                      <tr key={alt.id}>
                        <td style={{textAlign:'center',color:'var(--ink-3)',fontSize:12}}>{i+1}</td>
                        <td><input className="inline-inp" defaultValue={alt.description}
                          onBlur={e=>handleUpdateAlt(alt.id,'description',e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
                        <td className="num"><input className="inline-inp num tnum" defaultValue={alt.qty}
                          onBlur={e=>handleUpdateAlt(alt.id,'qty',e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
                        <td className="ctr">
                          <select value={alt.unit||'LS'} onChange={e=>handleUpdateAlt(alt.id,'unit',e.target.value)}
                            style={{background:'transparent',border:'none',fontSize:11,fontFamily:'var(--mono)'}}>
                            {['EA','LF','SF','SY','LS','HR'].map(u=><option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="num"><input className="inline-inp num tnum" defaultValue={alt.price}
                          onBlur={e=>handleUpdateAlt(alt.id,'price',e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
                        <td className="num tnum" style={{fontWeight:600}}>{fmt((alt.qty||0)*(alt.price||0))}</td>
                        <td className="ctr">
                          <button className="btn ghost xs" style={{color:'var(--bad)'}} onClick={()=>handleDeleteAlt(alt.id)}>×</button>
                        </td>
                      </tr>
                    ))}
                    {(alts||[]).length === 0 && (
                      <tr><td colSpan={7} style={{padding:'20px',textAlign:'center',color:'var(--ink-3)',fontSize:12}}>No alternates. Click "+ Add Alternate" to begin.</td></tr>
                    )}
                    {(alts||[]).length > 0 && (
                      <tr style={{background:'var(--panel-alt)'}}>
                        <td colSpan={5} style={{paddingLeft:14,fontSize:11.5,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--ink-3)'}}>Alternates Total</td>
                        <td className="num tnum" style={{fontWeight:700,color:'var(--accent)'}}>{fmt((alts||[]).reduce((s,a)=>s+(a.qty||0)*(a.price||0),0))}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ) : centerView === 'exclusions' ? (
            <ItemListPanel
              title="Exclusions"
              items={getItems('exclusions')}
              onSave={items => saveItems('exclusions', items)} />
          ) : centerView === 'clarifications' ? (
            <ItemListPanel
              title="Clarifications"
              items={getItems('clarifications')}
              onSave={items => saveItems('clarifications', items)} />
          ) : centerView === 'terms' ? (
            <div style={{ padding: '24px 28px', maxWidth: 680 }}>
              <div className="page-title" style={{ marginBottom: 14 }}>Proposal Terms</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  ['general_terms', 'General'],
                  ['warranty', 'Warranty'],
                  ['finish_terms', 'Finish'],
                  ['hardware_terms', 'Hardware'],
                  ['fab_note', 'Fab Note'],
                ].map(([f, label]) => (
                  <button key={f} className={`btn sm${termsTab === f ? ' accent' : ''}`}
                    onClick={() => setTermsTab(f)}>{label}</button>
                ))}
              </div>
              <ItemListPanel
                title=""
                items={getItems(termsTab)}
                onSave={items => saveItems(termsTab, items)} />
            </div>
          ) : (
            (tree||[]).filter(a => !activeAreaId || a.id === activeAreaId).map(area => (
              <div key={area.id}>
                <div style={{padding:'8px 14px',background:'var(--panel-alt)',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:8,position:'sticky',top:0,zIndex:3}}>
                  <span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--ink-2)'}}>{area.name}</span>
                  {(area.qty||1)>1 && <span style={{fontSize:11,color:'var(--accent)',fontFamily:'var(--mono)'}}>×{area.qty}</span>}
                  <button className="btn sm" style={{marginLeft:'auto'}} onClick={()=>handleAddSection(area.id)}>+ Section</button>
                  <button className="btn sm" onClick={handleZZImport} title="Import ZZTakeoff XLSX">↑ Import ZZTakeoff</button>
                </div>
                {(area.sections||[]).map(sec => (
                  <div key={sec.id}>
                    <div style={{padding:'5px 14px',background:'var(--panel)',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}
                      onClick={()=>setActiveSectionId(sec.id)}>
                      <span style={{flex:1,fontSize:12,fontWeight:600,color: activeSectionId===sec.id ? 'var(--accent)' : 'var(--ink-2)'}}>{sec.name}</span>
                      <span style={{fontSize:11,fontFamily:'var(--mono)',color:'var(--ink-3)'}}>
                        {fmt((sec.items||[]).reduce((s,it)=>s+(it.ignore?0:(it.qty||0)*(it.unit_cost||0)*(area.qty||1)),0))}
                      </span>
                      <button className="btn sm" onClick={e=>{e.stopPropagation();handleAddItem(area.id,sec.id);}}>+ Item</button>
                    </div>
                    <table className="wf" style={{tableLayout:'fixed'}}>
                      <colgroup>
                        <col style={{width:26}}/><col style={{width:26}}/><col/><col style={{width:70}}/>
                        <col style={{width:60}}/><col style={{width:58}}/><col style={{width:80}}/>
                        <col style={{width:90}}/><col style={{width:28}}/>
                      </colgroup>
                      <tbody>
                        {(sec.items||[]).map(it => {
                          const ext = (it.qty||0)*(it.unit_cost||0)*(area.qty||1);
                          return (
                            <tr key={it.id} style={{opacity: it.ignore ? .45 : 1}}
                              onMouseEnter={e=>{const b=e.currentTarget.querySelector('.del-btn'); if(b) b.style.opacity='1';}}
                              onMouseLeave={e=>{const b=e.currentTarget.querySelector('.del-btn'); if(b) b.style.opacity='0';}}>
                              <td className="ctr"><input type="checkbox" checked={!!it.ignore} onChange={()=>handleToggleItemFlag(area.id,sec.id,it.id,'ignore')} title="Ignore"/></td>
                              <td className="ctr"><input type="checkbox" checked={!!it.no_print} onChange={()=>handleToggleItemFlag(area.id,sec.id,it.id,'no_print')} title="No print"/></td>
                              <td style={{paddingLeft:6}}>
                                <input className="inline-inp" defaultValue={it.description}
                                  style={{textDecoration: it.ignore ? 'line-through' : 'none'}}
                                  onBlur={e=>handleUpdateItem(area.id,sec.id,it.id,'description',e.target.value)}
                                  onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/>
                              </td>
                              <td><input className="inline-inp mono" defaultValue={it.drawing_ref||''} placeholder="—"
                                onBlur={e=>handleUpdateItem(area.id,sec.id,it.id,'drawing_ref',e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
                              <td className="num"><input className="inline-inp num tnum" defaultValue={it.qty}
                                onBlur={e=>handleUpdateItem(area.id,sec.id,it.id,'qty',e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
                              <td className="ctr">
                                <select value={it.unit||'EA'} onChange={e=>handleUpdateItem(area.id,sec.id,it.id,'unit',e.target.value)}
                                  style={{background:'transparent',border:'none',fontSize:11,fontFamily:'var(--mono)',cursor:'pointer'}}>
                                  {['EA','LF','SF','SY','CY','LS','HR','TON'].map(u=><option key={u}>{u}</option>)}
                                </select>
                              </td>
                              <td className="num"><input className="inline-inp num tnum" defaultValue={it.unit_cost}
                                onBlur={e=>handleUpdateItem(area.id,sec.id,it.id,'unit_cost',e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&e.target.blur()}/></td>
                              <td className="num tnum" style={{fontWeight:600,color: it.ignore ? 'var(--ink-3)' : 'var(--ink)'}}>{fmt(ext)}</td>
                              <td className="ctr">
                                <button className="del-btn btn ghost xs" style={{opacity:0,color:'var(--bad)',transition:'opacity .15s'}}
                                  onClick={()=>handleDeleteItem(area.id,sec.id,it.id)}>×</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
                {(area.sections||[]).length === 0 && (
                  <div style={{padding:'20px 14px',color:'var(--ink-3)',fontSize:12}}>
                    No sections yet. Click "+ Section" to add one.
                  </div>
                )}
              </div>
            ))
          )}
          {centerView === 'grid' && (tree||[]).length === 0 && (
            <div style={{padding:'40px 20px',textAlign:'center',color:'var(--ink-3)',fontSize:13}}>
              No areas yet. Click "+ Add area" to begin.
            </div>
          )}
        </div>

        {/* Right — library panel */}
        <aside style={{borderLeft:'1px solid var(--line)',background:'var(--panel)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'8px 10px',borderBottom:'1px solid var(--line)',flexShrink:0}}>
            <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--mute)',fontWeight:600,marginBottom:5}}>Pricing Library</div>
            {activeSectionName && (
              <div style={{fontSize:11,color:'var(--ok)',marginBottom:5}}>Adding to: <b>{activeSectionName}</b></div>
            )}
            <input value={libQ} onChange={e=>setLibQ(e.target.value)} placeholder="Search library…"
              style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm,4px)',padding:'5px 8px',fontSize:12,background:'var(--bg)'}}/>
            {libCats.length > 0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:3,marginTop:5}}>
                <button className={`btn xs${!libCat?' accent':''}`} onClick={()=>setLibCat('')}>All</button>
                {libCats.map(c=>(
                  <button key={c} className={`btn xs${libCat===c?' accent':''}`} onClick={()=>setLibCat(c)}
                    style={{fontSize:10}}>{c}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{overflowY:'auto',flex:1}}>
            {libItems === null ? <window.Spinner /> : libResults.length === 0 ? (
              <div className="muted" style={{padding:'16px 12px',fontSize:12}}>No matching items.</div>
            ) : libResults.map((lib,i) => (
              <div key={lib.id||i} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',borderBottom:'1px solid var(--line)'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10.5,fontFamily:'var(--mono)',color:'var(--ink-3)'}}>{lib.code}</div>
                  <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lib.description}</div>
                  <div style={{fontSize:11,color:'var(--ink-3)'}}>{lib.unit} · <b style={{color:'var(--accent)'}}>{fmt((lib.material_cost||0)+(lib.labor_cost||0))}</b></div>
                </div>
                <button className="btn sm accent" onClick={()=>handleInsertFromLibrary(lib)}
                  disabled={!activeSectionId}>Insert</button>
              </div>
            ))}
          </div>
        </aside>

      </div>{/* /grid */}

      {/* ZZTakeoff import preview modal */}
      {zzPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--panel)', borderRadius: 'var(--r-lg)', padding: 24, width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>ZZTakeoff Import Preview</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Uncheck areas or items to exclude them from the import.</div>
            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
              {zzPreview.map((area, ai) => (
                <div key={ai}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--panel-alt)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={area.checked}
                      onChange={() => setZZPreview(prev => prev.map((a, i) => i === ai ? { ...a, checked: !a.checked } : a))} />
                    {area.name}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)', fontWeight: 400 }}>{area.items.length} items</span>
                  </label>
                  {area.items.map((it, ii) => (
                    <label key={ii} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 26px', fontSize: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={it.checked}
                        onChange={() => setZZPreview(prev => prev.map((a, i) => i === ai
                          ? { ...a, items: a.items.map((t, j) => j === ii ? { ...t, checked: !t.checked } : t) } : a))} />
                      <span style={{ flex: 1 }}>{it.desc}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>{it.qty} {it.unit} @ ${it.unitCost}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setZZPreview(null)} disabled={zzImporting}>Cancel</button>
              <button className="btn accent" onClick={() => doZZImport(zzPreview)} disabled={zzImporting}>
                {zzImporting ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

window.Views = Object.assign(window.Views || {}, { estimator: EstimatorView });
