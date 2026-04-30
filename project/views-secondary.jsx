// views-secondary.jsx — Calendar, Library, Contacts, Docs, Reports, Margin
const { useState, useMemo, useEffect, useRef } = React;

const fmt$ = n => '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
const fmtK = n => n >= 1000 ? '$' + (n/1000).toFixed(0) + 'k' : fmt$(n);

/* ─────────────────────────────────────────────────────────────
   CalendarView
───────────────────────────────────────────────────────────── */
const CAL_JOBS = [
  { id:1, name:'Ada County Courthouse', gc:'Turner',  color:'#b05028', start:new Date(2026,3,1),  end:new Date(2026,3,18) },
  { id:2, name:'St. Luke\'s MOB',       gc:'Hensel',  color:'#4a7c59', start:new Date(2026,3,7),  end:new Date(2026,3,25) },
  { id:3, name:'Boise High Renovation', gc:'Petra',   color:'#5b7fa6', start:new Date(2026,3,14), end:new Date(2026,3,30) },
  { id:4, name:'ParkCenter Office',     gc:'Longbow', color:'#8b6f47', start:new Date(2026,4,1),  end:new Date(2026,4,15) },
  { id:5, name:'Meridian Library',      gc:'Fisher',  color:'#7a5c8a', start:new Date(2026,3,21), end:new Date(2026,4,8)  },
];
const CREW_WEEKS = [
  { week:'Apr 1',  pct:72 }, { week:'Apr 8',  pct:85 },
  { week:'Apr 15', pct:91 }, { week:'Apr 22', pct:78 }, { week:'Apr 29', pct:65 },
];

function CalendarView() {
  const [month, setMonth] = useState(new Date(2026, 3, 1));
  const yr = month.getFullYear(), mo = month.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const monthLabel = month.toLocaleDateString('en-US', { month:'long', year:'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMo; d++) cells.push(d);

  const jobsOn = d => {
    if (!d) return [];
    const dt = new Date(yr, mo, d);
    return CAL_JOBS.filter(j => dt >= j.start && dt <= j.end);
  };

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <h1 className="page-title">Install Calendar</h1>
          <div className="page-sub">{CAL_JOBS.length} active jobs on schedule</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="btn ghost sm" onClick={() => setMonth(new Date(yr, mo-1, 1))}>‹ Prev</button>
          <span style={{fontSize:13, fontWeight:600, minWidth:130, textAlign:'center'}}>{monthLabel}</span>
          <button className="btn ghost sm" onClick={() => setMonth(new Date(yr, mo+1, 1))}>Next ›</button>
        </div>
      </div>
      <div style={{display:'flex', gap:20, padding:20, alignItems:'flex-start'}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, marginBottom:2}}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{textAlign:'center', fontSize:10.5, color:'var(--ink-3)', fontWeight:700, padding:'4px 0', letterSpacing:'.04em'}}>{d}</div>
            ))}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1}}>
            {cells.map((d, i) => {
              const jobs = jobsOn(d);
              return (
                <div key={i} style={{background: d ? 'var(--paper-2)' : 'transparent', border: d ? '1px solid var(--line)' : 'none', borderRadius:4, minHeight:80, padding:'4px 5px'}}>
                  {d && <span style={{fontSize:11, color:'var(--ink-3)', fontWeight:500}}>{d}</span>}
                  {jobs.map(j => (
                    <div key={j.id} style={{background:j.color, color:'#fff', fontSize:9, borderRadius:2, padding:'1px 4px', marginTop:2, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}} title={j.name}>{j.name}</div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:14}}>
            {CAL_JOBS.map(j => (
              <div key={j.id} style={{display:'flex', alignItems:'center', gap:5, fontSize:11}}>
                <span style={{width:10, height:10, borderRadius:2, background:j.color, display:'inline-block', flexShrink:0}}/>
                <span style={{color:'var(--ink-2)'}}>{j.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{width:210, flexShrink:0}}>
          <div className="card pad">
            <div style={{fontWeight:700, fontSize:12.5, marginBottom:14, letterSpacing:'.04em', textTransform:'uppercase', color:'var(--mute)'}}>Crew Capacity</div>
            {CREW_WEEKS.map(w => (
              <div key={w.week} style={{marginBottom:10}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:11.5, marginBottom:4}}>
                  <span style={{color:'var(--ink-2)'}}>{w.week}</span>
                  <span className="tnum" style={{fontWeight:700, color: w.pct>88?'var(--bad)':w.pct>75?'var(--warn)':'var(--ok)'}}>{w.pct}%</span>
                </div>
                <div className={`bar ${w.pct>88?'bad':w.pct>75?'warn':'ok'}`}>
                  <span style={{width:`${w.pct}%`}}/>
                </div>
              </div>
            ))}
            <div style={{borderTop:'1px solid var(--line)', marginTop:14, paddingTop:12, display:'flex', justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:10.5, color:'var(--mute)', fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:4}}>Active Jobs</div>
                <div className="tnum" style={{fontSize:24, fontWeight:700}}>{CAL_JOBS.length}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:10.5, color:'var(--mute)', fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:4}}>Avg Load</div>
                <div className="tnum" style={{fontSize:24, fontWeight:700}}>{Math.round(CREW_WEEKS.reduce((a,w)=>a+w.pct,0)/CREW_WEEKS.length)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LibraryView — live data from Supabase + Fuse.js search
───────────────────────────────────────────────────────────── */
function LibraryView() {
  const [libItems, setLibItems] = useState(null);
  const [cat, setCat]           = useState('All');
  const [searchQ, setSearchQ]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);  // null = add mode, object = edit mode
  const [form, setForm]         = useState({ code:'', description:'', category:'', unit:'EA', material_cost:'', labor_cost:'' });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await window.dbHelpers.getLibraryItems();
      if (!cancelled) setLibItems(data || []);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    if (!libItems) return ['All'];
    const cats = [...new Set(libItems.map(r => r.category).filter(Boolean))].sort();
    return ['All', ...cats];
  }, [libItems]);

  const fuse = useMemo(() => {
    if (!libItems || !libItems.length || typeof window.Fuse !== 'function') return null;
    return new window.Fuse(libItems, { keys:['description','code','category'], threshold:0.3 });
  }, [libItems]);

  const rows = useMemo(() => {
    if (!libItems) return [];
    let base = cat === 'All' ? libItems : libItems.filter(r => r.category === cat);
    if (!searchQ || !fuse) return base;
    const fuseItems = fuse.search(searchQ).map(r => r.item);
    return cat === 'All' ? fuseItems : fuseItems.filter(r => r.category === cat);
  }, [libItems, cat, searchQ, fuse]);

  function openAdd() {
    setEditItem(null);
    setForm({ code:'', description:'', category: cat !== 'All' ? cat : '', unit:'EA', material_cost:'', labor_cost:'' });
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      code: item.code || '',
      description: item.description || '',
      category: item.category || '',
      unit: item.unit || 'EA',
      material_cost: item.material_cost != null ? String(item.material_cost) : '',
      labor_cost: item.labor_cost != null ? String(item.labor_cost) : '',
    });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.description) return;
    setSaving(true);
    const payload = {
      ...(editItem ? { id: editItem.id } : {}),
      code: form.code || null,
      description: form.description,
      category: form.category || null,
      unit: form.unit,
      material_cost: parseFloat(form.material_cost) || 0,
      labor_cost: parseFloat(form.labor_cost) || 0,
      unit_cost: (parseFloat(form.material_cost) || 0) + (parseFloat(form.labor_cost) || 0),
    };
    const { data: saved, error } = await window.dbHelpers.upsertLibraryItem(payload);
    setSaving(false);
    if (error) { alert('Error saving: ' + error.message); return; }
    if (saved) {
      setLibItems(prev => {
        if (editItem) return prev.map(r => r.id === saved.id ? saved : r);
        return [saved, ...prev];
      });
    }
    setShowForm(false);
    setEditItem(null);
  }

  if (libItems === null) return <window.Spinner />;

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pricing Library</h1>
          <div className="page-sub">{libItems.length} items</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <div style={{position:'relative', display:'flex', alignItems:'center'}}>
            <span style={{position:'absolute', left:8, opacity:.4, display:'flex', width:14, height:14}}><Icon.search/></span>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search items…"
              style={{paddingLeft:28, width:200, fontSize:12.5, border:'1px solid var(--line)', borderRadius:6, padding:'5px 10px 5px 28px', background:'var(--paper)', outline:'none'}}/>
          </div>
          <button className="btn accent sm" onClick={openAdd}><Icon.plus/> Add Item</button>
        </div>
      </div>

      <div style={{padding:'12px 20px 0'}}>
        <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap'}}>
          {categories.map(c => (
            <button key={c} onClick={()=>setCat(c)} className={`chip ${cat===c?'solid':''}`} style={{cursor:'pointer', fontWeight:cat===c?700:600}}>
              {c}{c!=='All' && <span style={{opacity:.65, marginLeft:3}}>{libItems.filter(r=>r.category===c).length}</span>}
            </button>
          ))}
        </div>

        {showForm && (
          <form className="card" style={{padding:'14px 16px', marginBottom:12, borderColor:'var(--accent)', borderWidth:1.5}} onSubmit={handleSave}>
            <div style={{display:'grid', gridTemplateColumns:'80px 1fr 120px 80px 90px 90px auto', gap:8, alignItems:'flex-end'}}>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:3}}>Code</div>
                <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="CW-101"
                  style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm)',padding:'5px 8px',fontSize:12,background:'var(--paper)'}}/>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:3}}>Description *</div>
                <input required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Base Cabinet — Full Height"
                  style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm)',padding:'5px 8px',fontSize:12,background:'var(--paper)'}}/>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:3}}>Category</div>
                <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Casework"
                  style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm)',padding:'5px 8px',fontSize:12,background:'var(--paper)'}}/>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:3}}>Unit</div>
                <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}
                  style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm)',padding:'5px 8px',fontSize:12,background:'var(--paper)'}}>
                  {['EA','LF','SF','SY','CY','LS','HR','TON'].map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:3}}>Material $</div>
                <input type="number" step="0.01" value={form.material_cost} onChange={e=>setForm(f=>({...f,material_cost:e.target.value}))} placeholder="0.00"
                  style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm)',padding:'5px 8px',fontSize:12,background:'var(--paper)'}}/>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:3}}>Labor $</div>
                <input type="number" step="0.01" value={form.labor_cost} onChange={e=>setForm(f=>({...f,labor_cost:e.target.value}))} placeholder="0.00"
                  style={{width:'100%',border:'1px solid var(--line)',borderRadius:'var(--r-sm)',padding:'5px 8px',fontSize:12,background:'var(--paper)'}}/>
              </div>
              <div style={{display:'flex',gap:4,paddingBottom:1}}>
                <button className="btn accent sm" type="submit" disabled={saving}>{saving?'Saving…':'Save'}</button>
                <button className="btn ghost sm" type="button" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </form>
        )}

        {libItems.length === 0 ? (
          <window.EmptyState
            heading="Pricing library is empty"
            body="Import items via the Supabase dashboard, or add items manually."
            action={{ label:'Add Item', onClick:openAdd }}
          />
        ) : rows.length === 0 ? (
          <div className="muted" style={{padding:'24px 0', textAlign:'center', fontSize:12}}>No items match your search.</div>
        ) : (
          <table className="wf">
            <thead><tr>
              <th style={{width:76}}>Code</th><th>Description</th><th style={{width:80}}>Category</th>
              <th style={{width:50}}>Unit</th>
              <th className="num" style={{width:86}}>Material</th><th className="num" style={{width:76}}>Labor</th>
              <th className="num" style={{width:86}}>Total</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{cursor:'pointer'}} onClick={() => openEdit(r)}>
                  <td style={{fontFamily:'var(--mono)', fontSize:11}}>{r.code || '—'}</td>
                  <td>{r.description}</td>
                  <td style={{color:'var(--ink-3)', fontSize:11.5}}>{r.category || '—'}</td>
                  <td style={{color:'var(--ink-3)'}}>{r.unit || '—'}</td>
                  <td className="num tnum">{fmt$(r.material_cost || 0)}</td>
                  <td className="num tnum">{fmt$(r.labor_cost || 0)}</td>
                  <td className="num tnum" style={{fontWeight:600}}>{fmt$((r.material_cost||0)+(r.labor_cost||0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ContactsView
───────────────────────────────────────────────────────────── */
const ALL_CONTACTS = [
  { name:'Mike Donovan',  co:'Turner Construction',    role:'gc',    phone:'(208) 555-0142', email:'m.donovan@turner.com',          last:'Ada County Courthouse' },
  { name:'Sara Wills',    co:'Hensel Phelps',          role:'gc',    phone:'(208) 555-0187', email:'swills@henselphelps.com',        last:'St. Luke\'s MOB' },
  { name:'Jim Chávez',    co:'Petra Inc.',             role:'gc',    phone:'(208) 555-0233', email:'jchavez@petra-inc.com',          last:'Boise High Renovation' },
  { name:'Renee Park',    co:'City of Boise',          role:'owner', phone:'(208) 555-0098', email:'rpark@cityofboise.org',          last:'Meridian Library' },
  { name:'Tom Aldridge',  co:'ParkCenter LLC',         role:'owner', phone:'(208) 555-0310', email:'taldridge@parkcenter.com',       last:'ParkCenter Office' },
  { name:'Dani Osei',     co:'Fisher Development',     role:'owner', phone:'(208) 555-0422', email:'dosei@fisherdevelopment.com',    last:'Meridian Library' },
  { name:'Kyle Martz',    co:'NW Glass & Glaze',       role:'sub',   phone:'(208) 555-0511', email:'kyle@nwglassglaze.com',          last:'St. Luke\'s MOB' },
  { name:'Amber Tran',    co:'Pacific Countertops',    role:'sub',   phone:'(503) 555-0178', email:'atran@pacificcountertops.com',   last:'Ada County Courthouse' },
  { name:'Brett Schulz',  co:'Commercial Electric',    role:'sub',   phone:'(208) 555-0639', email:'bschulz@commelec.com',           last:'Boise High Renovation' },
  { name:'Rosa Ibarra',   co:'F&S Field',              role:'field', phone:'(208) 555-0701', email:'ribarra@fs-millwork.com',        last:'Ada County Courthouse' },
  { name:'Derek Holt',    co:'F&S Field',              role:'field', phone:'(208) 555-0744', email:'dholt@fs-millwork.com',          last:'ParkCenter Office' },
  { name:'Nate Fowler',   co:'F&S Field',              role:'field', phone:'(208) 555-0792', email:'nfowler@fs-millwork.com',        last:'Meridian Library' },
];
const ROLE_LABEL = { gc:'GC', owner:'Owner', sub:'Sub', field:'Field' };
const ROLE_CHIP  = { gc:'accent', owner:'ok', sub:'warn', field:'' };
const fmtSz = b => b>=1048576 ? (b/1048576).toFixed(1)+'MB' : Math.round(b/1024)+'KB';

function ContactsView() {
  const [tab, setTab] = useState('All');
  const rows = tab==='All' ? ALL_CONTACTS : ALL_CONTACTS.filter(c => ROLE_LABEL[c.role] === tab || (tab==='GCs'&&c.role==='gc') || (tab==='Owners'&&c.role==='owner') || (tab==='Subs'&&c.role==='sub') || (tab==='Field'&&c.role==='field'));

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <h1 className="page-title">Contacts</h1>
          <div className="page-sub">{ALL_CONTACTS.length} contacts · GCs, owners, subs &amp; field</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="btn accent sm"><Icon.plus/> Add Contact</button>
        </div>
      </div>
      <div style={{padding:'12px 20px 0'}}>
        <div style={{display:'flex', gap:6, marginBottom:12}}>
          {['All','GCs','Owners','Subs','Field'].map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`chip ${tab===t?'solid':''}`} style={{cursor:'pointer'}}>{t}</button>
          ))}
        </div>
        <table className="wf">
          <thead><tr>
            <th>Name</th><th>Company</th><th style={{width:65}}>Role</th>
            <th style={{width:130}}>Phone</th><th>Email</th><th>Last Project</th>
          </tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.email}>
                <td style={{fontWeight:600}}>{c.name}</td>
                <td style={{color:'var(--ink-2)'}}>{c.co}</td>
                <td><span className={`chip ${ROLE_CHIP[c.role]}`}>{ROLE_LABEL[c.role]}</span></td>
                <td className="tnum" style={{fontSize:12}}>{c.phone}</td>
                <td style={{fontSize:12}}><a href={`mailto:${c.email}`} style={{color:'var(--accent)'}}>{c.email}</a></td>
                <td style={{fontSize:12, color:'var(--ink-3)'}}>{c.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DocsView
───────────────────────────────────────────────────────────── */
const DOC_TYPE_CHIP = { plans:'ok', specs:'accent', submittal:'warn', rfi:'bad', proposal:'' };
const ALL_DOCS = [
  { name:'Architectural Plans — Bid Set',      type:'plans',     job:'Ada County Courthouse', date:'Apr 14', size:18700000 },
  { name:'Specifications Division 06',         type:'specs',     job:'Ada County Courthouse', date:'Apr 14', size:2400000  },
  { name:'Casework Submittal — Rev 2',         type:'submittal', job:'Ada County Courthouse', date:'Apr 20', size:4200000  },
  { name:'Architectural Plans — 100% CD',      type:'plans',     job:'St. Luke\'s MOB',       date:'Mar 28', size:24100000 },
  { name:'Specifications Division 06 & 12',    type:'specs',     job:'St. Luke\'s MOB',       date:'Mar 28', size:3100000  },
  { name:'RFI #14 — Casework Blocking',        type:'rfi',       job:'St. Luke\'s MOB',       date:'Apr 18', size:148000   },
  { name:'RFI #15 — Hardware Schedule',        type:'rfi',       job:'St. Luke\'s MOB',       date:'Apr 22', size:92000    },
  { name:'Plans — Schematic Set',              type:'plans',     job:'Boise High Renovation', date:'Apr 1',  size:11200000 },
  { name:'Bid Proposal — v1',                  type:'proposal',  job:'Boise High Renovation', date:'Apr 10', size:880000   },
  { name:'Casework Submittal — Final',         type:'submittal', job:'ParkCenter Office',     date:'Apr 5',  size:3600000  },
  { name:'Bid Proposal — Final',               type:'proposal',  job:'ParkCenter Office',     date:'Mar 22', size:920000   },
];
const DOC_FILTERS = ['All','Plans','Specs','Submittals','RFIs','Proposals'];

function DocsView() {
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const docs = useMemo(() => ALL_DOCS.filter(d => {
    const typeMatch = filter==='All' || d.type===filter.toLowerCase().replace(/s$/,'') || (filter==='Plans'&&d.type==='plans') || (filter==='Specs'&&d.type==='specs') || (filter==='Submittals'&&d.type==='submittal') || (filter==='RFIs'&&d.type==='rfi') || (filter==='Proposals'&&d.type==='proposal');
    const qMatch = !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.job.toLowerCase().includes(q.toLowerCase());
    return typeMatch && qMatch;
  }), [filter, q]);

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <h1 className="page-title">Documents</h1>
          <div className="page-sub">{ALL_DOCS.length} files · Plans, specs, submittals &amp; RFIs</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <div style={{position:'relative', display:'flex', alignItems:'center'}}>
            <span style={{position:'absolute', left:8, opacity:.4, display:'flex', width:14, height:14}}><Icon.search/></span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search files…" style={{paddingLeft:28, width:190, fontSize:12.5, border:'1px solid var(--line)', borderRadius:6, padding:'5px 10px 5px 28px', background:'var(--paper)', outline:'none'}}/>
          </div>
          <button className="btn accent sm"><Icon.plus/> Upload</button>
        </div>
      </div>
      <div style={{padding:'12px 20px 0'}}>
        <div style={{display:'flex', gap:6, marginBottom:12}}>
          {DOC_FILTERS.map(f => (
            <button key={f} onClick={()=>setFilter(f)} className={`chip ${filter===f?'solid':''}`} style={{cursor:'pointer'}}>{f}</button>
          ))}
        </div>
        <table className="wf">
          <thead><tr>
            <th>File Name</th><th style={{width:90}}>Type</th><th>Job</th>
            <th style={{width:80}}>Date</th><th className="num" style={{width:70}}>Size</th>
            <th style={{width:40}}/>
          </tr></thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i}>
                <td style={{fontWeight:500}}>{d.name}</td>
                <td><span className={`chip ${DOC_TYPE_CHIP[d.type]||''}`} style={{textTransform:'capitalize'}}>{d.type}</span></td>
                <td style={{color:'var(--ink-2)', fontSize:12}}>{d.job}</td>
                <td style={{color:'var(--ink-3)', fontSize:12}}>{d.date}</td>
                <td className="num tnum" style={{fontSize:11, color:'var(--ink-3)'}}>{fmtSz(d.size)}</td>
                <td style={{textAlign:'center'}}><button className="btn ghost xs" title="Download"><Icon.dl/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ReportsView
───────────────────────────────────────────────────────────── */
const HIT_MONTHS = [
  {mo:'May',  sent:8,  won:3}, {mo:'Jun', sent:11, won:5}, {mo:'Jul',  sent:9,  won:2},
  {mo:'Aug',  sent:12, won:6}, {mo:'Sep', sent:10, won:4}, {mo:'Oct',  sent:14, won:7},
  {mo:'Nov',  sent:9,  won:3}, {mo:'Dec', sent:7,  won:3}, {mo:'Jan',  sent:11, won:5},
  {mo:'Feb',  sent:13, won:6}, {mo:'Mar', sent:10, won:5}, {mo:'Apr',  sent:8,  won:4},
];
const BACKLOG = [
  { job:'Ada County Courthouse',    val:1240000, status:'Installing',  gc:'Turner'  },
  { job:'St. Luke\'s MOB',          val:880000,  status:'Installing',  gc:'Hensel'  },
  { job:'Boise High Renovation',    val:620000,  status:'Fabricating', gc:'Petra'   },
  { job:'ParkCenter Office',        val:410000,  status:'Shop Dwgs',   gc:'Longbow' },
  { job:'Meridian Library',         val:755000,  status:'Awarded',     gc:'Fisher'  },
];
const STATUS_CHIP = { 'Installing':'ok', 'Fabricating':'accent', 'Shop Dwgs':'warn', 'Awarded':'' };
const maxSent = Math.max(...HIT_MONTHS.map(m=>m.sent));

function ReportsView() {
  const totalSent = HIT_MONTHS.reduce((a,m)=>a+m.sent,0);
  const totalWon  = HIT_MONTHS.reduce((a,m)=>a+m.won,0);
  const hitRate   = Math.round(totalWon/totalSent*100);
  const avgBid    = 524000;

  return (
    <div className="view active">
      <div className="page-head">
        <h1 className="page-title">Reports</h1>
        <div className="page-sub" style={{marginTop:2}}>Trailing 12 months · Apr 2025 – Apr 2026</div>
      </div>
      <div style={{padding:20}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24}}>
          {[
            { lbl:'Hit Rate',       val:`${hitRate}%`,                    sub:`${totalWon} won / ${totalSent} sent` },
            { lbl:'Bids Submitted', val:totalSent,                         sub:'trailing 12 months' },
            { lbl:'Awarded Value',  val:`$${(totalWon*avgBid/1000000).toFixed(1)}M`, sub:`${totalWon} jobs` },
            { lbl:'Avg Bid Size',   val:fmtK(avgBid),                     sub:'per submitted bid'  },
          ].map(k => (
            <div key={k.lbl} className="card kpi">
              <div className="lbl">{k.lbl}</div>
              <div className="val">{k.val}</div>
              <div className="sub">{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="card">
            <div className="card-head"><h3>Hit Rate by Month</h3></div>
            <div className="card-body" style={{paddingBottom:8}}>
              <div style={{display:'flex', alignItems:'flex-end', gap:5, height:100}}>
                {HIT_MONTHS.map(m => {
                  const h = Math.round((m.sent/maxSent)*90);
                  const wh = Math.round((m.won/maxSent)*90);
                  return (
                    <div key={m.mo} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2}}>
                      <div style={{width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', height:90, gap:1}}>
                        <div style={{background:'var(--accent)', borderRadius:'2px 2px 0 0', height:wh, minHeight:2}}/>
                        <div style={{background:'var(--paper-3)', borderRadius:'2px 2px 0 0', height:h-wh, minHeight:1, border:'1px solid var(--line)', borderBottom:'none'}}/>
                      </div>
                      <span style={{fontSize:9, color:'var(--ink-3)'}}>{m.mo}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex', gap:12, marginTop:10, fontSize:11}}>
                <span style={{display:'flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:2, background:'var(--accent)', display:'inline-block'}}/> Won</span>
                <span style={{display:'flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:2, background:'var(--paper-3)', border:'1px solid var(--line)', display:'inline-block'}}/> Sent</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Current Backlog</h3></div>
            <table className="wf">
              <thead><tr><th>Job</th><th>GC</th><th style={{width:80}}>Status</th><th className="num" style={{width:90}}>Value</th></tr></thead>
              <tbody>
                {BACKLOG.map(b => (
                  <tr key={b.job}>
                    <td style={{fontSize:12, fontWeight:500}}>{b.job}</td>
                    <td style={{fontSize:12, color:'var(--ink-3)'}}>{b.gc}</td>
                    <td><span className={`chip ${STATUS_CHIP[b.status]||''}`} style={{fontSize:10}}>{b.status}</span></td>
                    <td className="num tnum" style={{fontWeight:600}}>{fmtK(b.val)}</td>
                  </tr>
                ))}
                <tr style={{borderTop:'2px solid var(--line)'}}>
                  <td colSpan={3} style={{fontWeight:700, fontSize:12}}>Total Backlog</td>
                  <td className="num tnum" style={{fontWeight:700}}>{fmtK(BACKLOG.reduce((a,b)=>a+b.val,0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MarginView
───────────────────────────────────────────────────────────── */
const BY_GC = [
  { name:'Turner Construction', bids:18, win:39, margin:22.4 },
  { name:'Hensel Phelps',       bids:14, win:43, margin:24.1 },
  { name:'Petra Inc.',          bids:22, win:32, margin:19.8 },
  { name:'Longbow',             bids:11, win:45, margin:25.6 },
  { name:'Fisher Dev.',         bids:9,  win:56, margin:28.2 },
  { name:'Other GCs',           bids:48, win:27, margin:17.3 },
];
const BY_TYPE = [
  { name:'Healthcare',    bids:31, win:39, margin:26.1 },
  { name:'Education',     bids:28, win:36, margin:22.4 },
  { name:'Office',        bids:24, win:42, margin:21.8 },
  { name:'Hospitality',   bids:16, win:44, margin:24.7 },
  { name:'Government',    bids:18, win:33, margin:19.2 },
  { name:'Other',         bids:5,  win:20, margin:15.0 },
];
const BY_EST = [
  { name:'Jordan K.',  bids:47, win:40, margin:23.8 },
  { name:'Sam R.',     bids:39, win:33, margin:21.4 },
  { name:'Taylor M.',  bids:36, win:39, margin:24.2 },
];

function MarginPanel({ title, rows }) {
  return (
    <div className="card" style={{flex:1}}>
      <div className="card-head"><h3>{title}</h3></div>
      <table className="wf">
        <thead><tr>
          <th>{rows===BY_EST?'Estimator':'Name'}</th>
          <th className="num" style={{width:45}}>Bids</th>
          <th className="num" style={{width:52}}>Win %</th>
          <th className="num" style={{width:66}}>Avg GM%</th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name}>
              <td style={{fontSize:12, fontWeight:500}}>{r.name}</td>
              <td className="num tnum" style={{fontSize:12}}>{r.bids}</td>
              <td className="num tnum" style={{fontSize:12}}>{r.win}%</td>
              <td className="num tnum" style={{fontWeight:700, color: r.margin>=24?'var(--ok)':r.margin>=20?'var(--ink)':'var(--warn)'}}>{r.margin.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarginView() {
  const totalBids = BY_GC.reduce((a,r)=>a+r.bids,0);
  const totalWon  = BY_GC.reduce((a,r)=>a+Math.round(r.bids*r.win/100),0);
  const avgMargin = (BY_GC.reduce((a,r)=>a+r.margin*r.bids,0)/totalBids).toFixed(1);

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <h1 className="page-title">Margin Analysis</h1>
          <div className="page-sub">Trailing 12 months · {totalBids} bids · {totalWon} won · avg GM {avgMargin}%</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="btn ghost sm"><Icon.dl/> Export</button>
        </div>
      </div>
      <div style={{padding:20}}>
        <div style={{display:'flex', gap:14}}>
          <MarginPanel title="By General Contractor" rows={BY_GC}/>
          <MarginPanel title="By Project Type"       rows={BY_TYPE}/>
          <MarginPanel title="By Estimator"          rows={BY_EST}/>
        </div>
        <div className="card pad" style={{marginTop:14, display:'flex', gap:32, alignItems:'center'}}>
          <div>
            <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--mute)', marginBottom:4}}>Overall Win Rate</div>
            <div className="tnum" style={{fontSize:28, fontWeight:700}}>{Math.round(totalWon/totalBids*100)}%</div>
          </div>
          <div>
            <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--mute)', marginBottom:4}}>Portfolio Avg Margin</div>
            <div className="tnum" style={{fontSize:28, fontWeight:700}}>{avgMargin}%</div>
          </div>
          <div>
            <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--mute)', marginBottom:4}}>Best GC Relationship</div>
            <div style={{fontSize:18, fontWeight:700}}>Fisher Dev. <span className="tnum" style={{fontSize:14, color:'var(--ok)', fontWeight:600}}>28.2% GM · 56% win</span></div>
          </div>
          <div>
            <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--mute)', marginBottom:4}}>Highest Margin Type</div>
            <div style={{fontSize:18, fontWeight:700}}>Healthcare <span className="tnum" style={{fontSize:14, color:'var(--ok)', fontWeight:600}}>26.1% GM</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Register all 6 views
───────────────────────────────────────────────────────────── */
window.Views = Object.assign(window.Views || {}, {
  calendar: CalendarView,
  library:  LibraryView,
  contacts: ContactsView,
  docs:     DocsView,
  reports:  ReportsView,
  margin:   MarginView,
});
