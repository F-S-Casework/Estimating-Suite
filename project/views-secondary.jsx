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
   LibraryView
───────────────────────────────────────────────────────────── */
const LIB_CATS = ['All','Casework','Hardware','Finishing','Glass','Install'];
const LIB_ROWS = [
  { code:'CW-101', desc:'Base Cabinet — Full Height',     cat:'Casework',  uom:'LF', mat:285,  labor:72,  upd:'Mar 12' },
  { code:'CW-102', desc:'Upper Cabinet — Standard',       cat:'Casework',  uom:'LF', mat:215,  labor:58,  upd:'Mar 12' },
  { code:'CW-103', desc:'Tall Cabinet — Pantry Style',    cat:'Casework',  uom:'EA', mat:420,  labor:95,  upd:'Jan 8'  },
  { code:'CW-104', desc:'Drawer Base Cabinet',            cat:'Casework',  uom:'EA', mat:310,  labor:65,  upd:'Mar 12' },
  { code:'HW-201', desc:'Blum Tandem Plus Undermount',    cat:'Hardware',  uom:'PR', mat:38,   labor:12,  upd:'Apr 2'  },
  { code:'HW-202', desc:'Grass Vionaro Undermount',       cat:'Hardware',  uom:'PR', mat:52,   labor:12,  upd:'Apr 2'  },
  { code:'HW-203', desc:'Sugatsune Heavy Duty Hinge',     cat:'Hardware',  uom:'EA', mat:14,   labor:4,   upd:'Feb 18' },
  { code:'HW-204', desc:'Rev-A-Shelf Pull-Out Organizer', cat:'Hardware',  uom:'EA', mat:68,   labor:18,  upd:'Mar 30' },
  { code:'FN-301', desc:'Lacquer — Opaque Full Coat',     cat:'Finishing', uom:'SF', mat:3.20, labor:2.80,upd:'Apr 1'  },
  { code:'FN-302', desc:'Veneer — Shop Applied',          cat:'Finishing', uom:'SF', mat:6.50, labor:3.50,upd:'Apr 1'  },
  { code:'GL-401', desc:'Tempered Glass — 1/4"',          cat:'Glass',     uom:'SF', mat:22,   labor:8,   upd:'Feb 5'  },
  { code:'GL-402', desc:'Laminated Safety Glass',         cat:'Glass',     uom:'SF', mat:38,   labor:10,  upd:'Feb 5'  },
  { code:'IN-501', desc:'Installation — Casework',        cat:'Install',   uom:'LF', mat:0,    labor:42,  upd:'Apr 10' },
  { code:'IN-502', desc:'Installation — Countertop',      cat:'Install',   uom:'LF', mat:0,    labor:28,  upd:'Apr 10' },
  { code:'IN-503', desc:'Touch-up & Punch List',          cat:'Install',   uom:'HR', mat:0,    labor:85,  upd:'Apr 10' },
];

function LibraryView() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const rows = useMemo(() => LIB_ROWS.filter(r => {
    if (cat !== 'All' && r.cat !== cat) return false;
    if (q) { const s = q.toLowerCase(); return r.desc.toLowerCase().includes(s) || r.code.toLowerCase().includes(s); }
    return true;
  }), [cat, q]);

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pricing Library</h1>
          <div className="page-sub">1,240 items · Last sync Apr 15, 2026</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <div style={{position:'relative', display:'flex', alignItems:'center'}}>
            <span style={{position:'absolute', left:8, opacity:.4, display:'flex', width:14, height:14}}><Icon.search/></span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search items…" style={{paddingLeft:28, width:200, fontSize:12.5, border:'1px solid var(--line)', borderRadius:6, padding:'5px 10px 5px 28px', background:'var(--paper)', outline:'none'}}/>
          </div>
          <button className="btn accent sm"><Icon.plus/> Add Item</button>
        </div>
      </div>
      <div style={{padding:'12px 20px 0'}}>
        <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap'}}>
          {LIB_CATS.map(c => (
            <button key={c} onClick={()=>setCat(c)} className={`chip ${cat===c?'solid':''}`} style={{cursor:'pointer', fontWeight:cat===c?700:600}}>
              {c}{c!=='All' && <span style={{opacity:.65, marginLeft:3}}>{LIB_ROWS.filter(r=>r.cat===c).length}</span>}
            </button>
          ))}
        </div>
        <table className="wf">
          <thead><tr>
            <th style={{width:76}}>Code</th><th>Description</th><th style={{width:50}}>Unit</th>
            <th className="num" style={{width:86}}>Material</th><th className="num" style={{width:76}}>Labor</th>
            <th className="num" style={{width:86}}>Total</th><th style={{width:70, color:'var(--mute)'}}>Updated</th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.code}>
                <td style={{fontFamily:'var(--mono)', fontSize:11}}>{r.code}</td>
                <td>{r.desc}</td>
                <td style={{color:'var(--ink-3)'}}>{r.uom}</td>
                <td className="num tnum">{fmt$(r.mat)}</td>
                <td className="num tnum">{fmt$(r.labor)}</td>
                <td className="num tnum" style={{fontWeight:600}}>{fmt$(r.mat+r.labor)}</td>
                <td style={{fontSize:11, color:'var(--ink-3)'}}>{r.upd}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
