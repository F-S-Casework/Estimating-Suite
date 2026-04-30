// Estimator workbook — V2: areas → sections → items hierarchy
const { useState: uS_est, useMemo: uM_est, useEffect: uE_est, useRef: uR_est } = React;

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

        {/* Center — item grid or placeholder panels */}
        <div style={{overflowY:'auto',background:'var(--bg)'}}>
          {centerView !== 'grid' ? (
            <div style={{padding:'40px 24px',textAlign:'center',color:'var(--ink-3)',fontSize:13}}>
              <div style={{fontSize:15,fontWeight:600,color:'var(--ink-2)',marginBottom:8}}>
                {centerView.charAt(0).toUpperCase()+centerView.slice(1)}
              </div>
              Coming in the next plan (03-05b / 03-05c).
            </div>
          ) : (
            (tree||[]).filter(a => !activeAreaId || a.id === activeAreaId).map(area => (
              <div key={area.id}>
                <div style={{padding:'8px 14px',background:'var(--panel-alt)',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:8,position:'sticky',top:0,zIndex:3}}>
                  <span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--ink-2)'}}>{area.name}</span>
                  {(area.qty||1)>1 && <span style={{fontSize:11,color:'var(--accent)',fontFamily:'var(--mono)'}}>×{area.qty}</span>}
                  <button className="btn sm" style={{marginLeft:'auto'}} onClick={()=>handleAddSection(area.id)}>+ Section</button>
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
    </div>
  );
}

window.Views = Object.assign(window.Views || {}, { estimator: EstimatorView });
