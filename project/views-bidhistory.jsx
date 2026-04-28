// Bid History & Comparison — Insight module
// Search past bids, compare current pricing to historical, see price drift,
// and side-by-side compare bids head-to-head.

const { useState: uS_bh, useMemo: uM_bh } = React;

// ── sample data ──────────────────────────────────────
const BIDS = [
  { id:'B26-041', proj:'Caldwell Clinic',         gc:'Engelmann',  type:'Healthcare TI',  sf:8400,  total:312400, gsf:37.19, margin:23.1, date:'2026-04-12', result:'won',  est:'EP' },
  { id:'B26-038', proj:'Treasure Valley HS',      gc:'Hoffman',    type:'Education',      sf:6200,  total:184000, gsf:29.68, margin:21.4, date:'2026-04-02', result:'won',  est:'EP' },
  { id:'B26-035', proj:'Boise Medical · Ph 1',    gc:'Turner',     type:'Healthcare TI',  sf:11200, total:402600, gsf:35.95, margin:22.8, date:'2026-03-18', result:'won',  est:'EP' },
  { id:'B26-031', proj:'Meridian Library',        gc:'McAlvain',   type:'Civic',          sf:14000, total:478000, gsf:34.14, margin:24.2, date:'2026-02-28', result:'lost', est:'GR' },
  { id:'B26-029', proj:'St. Lukes IT MEP',        gc:'Hoffman',    type:'Healthcare TI',  sf:5400,  total:198400, gsf:36.74, margin:21.0, date:'2026-02-14', result:'lost', est:'EP' },
  { id:'B26-024', proj:'PSU Lab Renovation',      gc:'Turner',     type:'Education Lab',  sf:9800,  total:421000, gsf:42.96, margin:25.3, date:'2026-01-28', result:'won',  est:'GR' },
  { id:'B25-118', proj:'Foothills K-12 · Bldg A', gc:'Engelmann',  type:'Education',      sf:7200,  total:212000, gsf:29.44, margin:20.8, date:'2025-12-08', result:'won',  est:'EP' },
  { id:'B25-104', proj:'Ada Co. Courthouse · Lobby', gc:'Hoffman', type:'Civic',          sf:3400,  total:148200, gsf:43.58, margin:24.1, date:'2025-11-04', result:'won',  est:'GR' },
  { id:'B25-098', proj:'Saint Alphonsus ER',      gc:'Turner',     type:'Healthcare TI',  sf:9100,  total:308000, gsf:33.84, margin:21.6, date:'2025-10-22', result:'lost', est:'EP' },
  { id:'B25-090', proj:'Boise State · Math Bldg', gc:'McAlvain',   type:'Education Lab',  sf:12400, total:498000, gsf:40.16, margin:23.9, date:'2025-09-30', result:'won',  est:'GR' },
];

// per-item comparison: current bid line vs historical avg / last
const CUR_BID = { id:'B26-049', proj:'Denver Regional Lab', gc:'Turner', type:'Healthcare TI', sf:11400, total:418000, gsf:36.67, margin:24.8, date:'2026-04-30 (draft)' };

const ITEM_COMPARE = [
  // section header rows are { sec: '...' }
  { sec:'Base cabinets · plastic laminate' },
  { code:'06-410.10', desc:'Base cab · 24" std',          uom:'EA',  cur:548,  hist:[ {p:512,d:'B26-038'},{p:498,d:'B25-118'},{p:524,d:'B25-090'} ], avg:511, lastWon:524, vsAvg:+7.2, vsLast:+4.6, used:38 },
  { code:'06-410.18', desc:'Base cab · 36" w/ drawer',    uom:'EA',  cur:712,  hist:[ {p:702,d:'B26-035'},{p:688,d:'B26-024'},{p:694,d:'B25-104'} ], avg:694, lastWon:702, vsAvg:+2.6, vsLast:+1.4, used:22, flag:false },
  { code:'06-410.32', desc:'Sink base · 30"',             uom:'EA',  cur:642,  hist:[ {p:610,d:'B26-035'},{p:598,d:'B25-118'} ], avg:604, lastWon:610, vsAvg:+6.3, vsLast:+5.2, used:6 },

  { sec:'Wall cabinets · plastic laminate' },
  { code:'06-420.10', desc:'Wall cab · 30"H 24"W',        uom:'EA',  cur:368,  hist:[ {p:362,d:'B26-038'},{p:355,d:'B25-118'} ], avg:358, lastWon:362, vsAvg:+2.8, vsLast:+1.7, used:24 },
  { code:'06-420.20', desc:'Wall cab · 30"H 36"W glass',  uom:'EA',  cur:498,  hist:[ {p:512,d:'B26-035'},{p:524,d:'B25-090'} ], avg:518, lastWon:512, vsAvg:-3.9, vsLast:-2.7, used:8 },

  { sec:'Countertops' },
  { code:'06-610.21', desc:'Solid surface · 1¼" eased',   uom:'SF',  cur:78,   hist:[ {p:68,d:'B26-038'},{p:64,d:'B25-118'},{p:72,d:'B26-024'} ], avg:68, lastWon:72, vsAvg:+14.7, vsLast:+8.3, used:184, flag:true },
  { code:'06-610.45', desc:'Quartz · 3cm w/ ogee edge',   uom:'SF',  cur:96,   hist:[ {p:92,d:'B26-035'},{p:88,d:'B25-090'} ], avg:90, lastWon:92, vsAvg:+6.7, vsLast:+4.3, used:62 },
  { code:'06-610.60', desc:'Epoxy lab top · 1" black',    uom:'SF',  cur:128,  hist:[ {p:118,d:'B26-024'},{p:122,d:'B25-090'} ], avg:120, lastWon:118, vsAvg:+6.7, vsLast:+8.5, used:48, flag:true },

  { sec:'Hardware & accessories' },
  { code:'06-710.04', desc:'Wire pull · 4" SS',           uom:'EA',  cur:7.20, hist:[ {p:6.80,d:'B26-038'},{p:6.40,d:'B25-118'} ], avg:6.60, lastWon:6.80, vsAvg:+9.1, vsLast:+5.9, used:182 },
  { code:'06-710.18', desc:'Soft-close hinge · concealed',uom:'EA',  cur:11.40,hist:[ {p:10.80,d:'B26-035'},{p:10.20,d:'B25-118'} ], avg:10.50, lastWon:10.80, vsAvg:+8.6, vsLast:+5.6, used:284 },
  { code:'06-710.30', desc:'Drawer slide · undermount 22"',uom:'EA', cur:24.80,hist:[ {p:22.50,d:'B26-035'},{p:21.80,d:'B26-024'} ], avg:22.10, lastWon:22.50, vsAvg:+12.2, vsLast:+10.2, used:88, flag:true },

  { sec:'Labor & install' },
  { code:'09-LAB.01', desc:'Shop fab · per cab equiv',    uom:'EA',  cur:185,  hist:[ {p:172,d:'B26-038'},{p:168,d:'B25-118'} ], avg:170, lastWon:172, vsAvg:+8.8, vsLast:+7.6, used:88 },
  { code:'09-LAB.20', desc:'Field install · per cab',     uom:'EA',  cur:142,  hist:[ {p:138,d:'B26-035'},{p:135,d:'B26-024'} ], avg:136, lastWon:138, vsAvg:+4.4, vsLast:+2.9, used:88 },
];

// price-history sparkline data for one chosen item (drill-in)
const DRILL_ITEM = '06-610.21';
const DRILL_HISTORY = [
  { d:'25-09', p:64,  bid:'B25-090', won:true  },
  { d:'25-11', p:66,  bid:'B25-104', won:true  },
  { d:'25-12', p:64,  bid:'B25-118', won:true  },
  { d:'26-01', p:70,  bid:'B26-024', won:true  },
  { d:'26-02', p:72,  bid:'B26-029', won:false },
  { d:'26-03', p:68,  bid:'B26-035', won:true  },
  { d:'26-04', p:78,  bid:'B26-049', won:null  }, // current
];

// head-to-head comparison set (current draft vs 2 closest historical)
const COMPARE_SET = [
  { ...CUR_BID, isCurrent:true },
  BIDS[2], // Boise Medical Ph 1
  BIDS[5], // PSU Lab
];

// ── helpers ──────────────────────────────────────────
function fmt$(n, frac=0){ if (n==null) return '—'; return '$'+Number(n).toLocaleString(undefined,{minimumFractionDigits:frac, maximumFractionDigits:frac}); }
function fmtPct(n){ if (n==null) return '—'; const s = (n>0?'+':'')+n.toFixed(1)+'%'; return s; }
function deltaCls(n){ if (n==null) return ''; if (n > 8) return 'bad'; if (n > 3) return 'warn'; if (n < -3) return 'ok'; return ''; }

// ── view ─────────────────────────────────────────────
function BidHistoryView() {
  const [tab, setTab] = uS_bh('compare');     // 'compare' | 'history' | 'h2h'
  const [filterType, setFilterType] = uS_bh('all');
  const [filterResult, setFilterResult] = uS_bh('all');
  const [drillCode, setDrillCode] = uS_bh(DRILL_ITEM);

  const filtered = uM_bh(()=> BIDS.filter(b =>
    (filterType==='all'   || b.type===filterType) &&
    (filterResult==='all' || b.result===filterResult)
  ), [filterType, filterResult]);

  const stats = uM_bh(()=> {
    const won = filtered.filter(b=>b.result==='won');
    const total = filtered.length;
    const winRate = total ? Math.round(won.length / total * 100) : 0;
    const avgGsf = won.length ? (won.reduce((s,b)=>s+b.gsf,0)/won.length) : 0;
    const avgMgn = won.length ? (won.reduce((s,b)=>s+b.margin,0)/won.length) : 0;
    return { total, won:won.length, winRate, avgGsf, avgMgn };
  }, [filtered]);

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Insight</div>
          <div className="page-title">Bid History &amp; Comparison</div>
          <div className="page-sub">
            Compare <b style={{color:'var(--accent)'}}>Denver Regional Lab</b> draft against {BIDS.length} prior bids ·
            spot drift, defend numbers, learn from losses.
          </div>
        </div>
        <div className="spacer"></div>
        <div className="actions">
          <button className="btn ghost sm">Export CSV</button>
          <button className="btn sm">Open current bid →</button>
        </div>
      </div>

      <div style={{padding:'16px 24px 40px'}}>

        {/* sub-tabs */}
        <div className="bh-tabs">
          <button className={`bh-tab ${tab==='compare'?'active':''}`} onClick={()=>setTab('compare')}>
            Item-by-item compare <span className="n">{ITEM_COMPARE.filter(r=>!r.sec).length}</span>
          </button>
          <button className={`bh-tab ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>
            Bid history <span className="n">{BIDS.length}</span>
          </button>
          <button className={`bh-tab ${tab==='h2h'?'active':''}`} onClick={()=>setTab('h2h')}>
            Head-to-head
          </button>
          <div style={{flex:1}}></div>
          {tab==='history' && (
            <div className="row gap-sm" style={{fontSize:12}}>
              <select className="bh-sel" value={filterType} onChange={e=>setFilterType(e.target.value)}>
                <option value="all">All types</option>
                <option>Healthcare TI</option><option>Education</option><option>Education Lab</option><option>Civic</option>
              </select>
              <select className="bh-sel" value={filterResult} onChange={e=>setFilterResult(e.target.value)}>
                <option value="all">Won + Lost</option>
                <option value="won">Won only</option>
                <option value="lost">Lost only</option>
              </select>
            </div>
          )}
        </div>

        {/* ── COMPARE TAB ─────────────────────────── */}
        {tab==='compare' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:14}}>
            <div className="card">
              <div className="card-head">
                <h3>Current bid · line items vs historical</h3>
                <span className="chip accent">{ITEM_COMPARE.filter(r=>!r.sec && r.flag).length} flagged</span>
                <div style={{flex:1}}></div>
                <span className="muted" style={{fontSize:11.5}}>vs avg of last 3 won bids w/ same item</span>
              </div>
              <table className="wf bh-tbl">
                <thead><tr>
                  <th style={{paddingLeft:16}}>Code</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th className="num">Used</th>
                  <th className="num">Current</th>
                  <th className="num">Avg won</th>
                  <th className="num">Last won</th>
                  <th className="num">vs avg</th>
                  <th className="num" style={{paddingRight:16}}>vs last</th>
                </tr></thead>
                <tbody>
                  {ITEM_COMPARE.map((r,i)=> r.sec ? (
                    <tr className="sec" key={'s'+i}><td colSpan={9}>{r.sec}</td></tr>
                  ) : (
                    <tr key={i} className={drillCode===r.code?'bh-row drilled':'bh-row'}
                        onClick={()=>setDrillCode(r.code)}
                        style={{cursor:'pointer'}}>
                      <td style={{paddingLeft:16}} className="tnum"><code style={{fontSize:11.5,color:'var(--ink-3)'}}>{r.code}</code></td>
                      <td>
                        <span style={{fontWeight:500}}>{r.desc}</span>
                        {r.flag && <span className="chip bad" style={{marginLeft:8,fontSize:10}}>!</span>}
                      </td>
                      <td className="muted" style={{fontSize:11.5}}>{r.uom}</td>
                      <td className="num tnum" style={{fontSize:11.5,color:'var(--ink-3)'}}>{r.used}</td>
                      <td className="num tnum" style={{fontWeight:600}}>{fmt$(r.cur, r.cur<20?2:0)}</td>
                      <td className="num tnum muted">{fmt$(r.avg, r.avg<20?2:0)}</td>
                      <td className="num tnum muted">{fmt$(r.lastWon, r.lastWon<20?2:0)}</td>
                      <td className="num tnum"><span className={`bh-delta ${deltaCls(r.vsAvg)}`}>{fmtPct(r.vsAvg)}</span></td>
                      <td className="num tnum" style={{paddingRight:16}}><span className={`bh-delta ${deltaCls(r.vsLast)}`}>{fmtPct(r.vsLast)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* drill-in panel */}
            <DrillPanel code={drillCode} />
          </div>
        )}

        {/* ── HISTORY TAB ─────────────────────────── */}
        {tab==='history' && (
          <>
            <div className="g4 mb">
              <Stat label="Bids in view"   v={stats.total}  sub={`${stats.won} won · ${stats.total-stats.won} lost`} />
              <Stat label="Win rate"       v={`${stats.winRate}%`}  sub="filter applied" accent />
              <Stat label="Avg won $/SF"   v={fmt$(stats.avgGsf, 2)} sub="weighted by job" />
              <Stat label="Avg won margin" v={`${stats.avgMgn.toFixed(1)}%`} sub="against goal 22%" />
            </div>

            <div className="card">
              <div className="card-head"><h3>All bids · sortable</h3>
                <div style={{flex:1}}></div>
                <span className="muted" style={{fontSize:11.5}}>click any row to load into compare</span>
              </div>
              <table className="wf">
                <thead><tr>
                  <th style={{paddingLeft:16}}>Bid #</th>
                  <th>Project</th>
                  <th>GC · type</th>
                  <th>Date</th>
                  <th className="num">SF</th>
                  <th className="num">Total</th>
                  <th className="num">$/SF</th>
                  <th className="num">Margin</th>
                  <th>Result</th>
                  <th style={{paddingRight:16}}></th>
                </tr></thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} style={{cursor:'pointer'}}>
                      <td style={{paddingLeft:16}} className="tnum"><code style={{fontSize:11.5,color:'var(--ink-3)'}}>{b.id}</code></td>
                      <td><span style={{fontWeight:600}}>{b.proj}</span></td>
                      <td className="muted" style={{fontSize:12}}>{b.gc} · {b.type}</td>
                      <td className="muted tnum" style={{fontSize:11.5}}>{b.date}</td>
                      <td className="num tnum">{b.sf.toLocaleString()}</td>
                      <td className="num tnum">{fmt$(b.total)}</td>
                      <td className="num tnum">{fmt$(b.gsf, 2)}</td>
                      <td className="num tnum">{b.margin.toFixed(1)}%</td>
                      <td><span className={`chip ${b.result==='won'?'ok':'bad'}`}><span className="dot"></span>{b.result==='won'?'Won':'Lost'}</span></td>
                      <td style={{paddingRight:16}}><span className={`pm ${b.est[0].toLowerCase()==='e'?'e':'g'}`}>{b.est}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── HEAD-TO-HEAD TAB ────────────────────── */}
        {tab==='h2h' && (
          <H2HCompare />
        )}
      </div>
    </div>
  );
}

// ── small components ─────────────────────────────────
function Stat({ label, v, sub, accent }) {
  return (
    <div className="card kpi" style={accent?{borderColor:'var(--accent)',boxShadow:'0 0 0 2px rgba(168,56,49,.08)'}:{}}>
      <div className="lbl">{label}</div>
      <div className="val tnum">{v}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}

function DrillPanel({ code }) {
  const item = ITEM_COMPARE.find(r=>!r.sec && r.code===code) || ITEM_COMPARE.find(r=>!r.sec);
  const hist = code===DRILL_ITEM ? DRILL_HISTORY : DRILL_HISTORY.map(h=>({...h, p: h.p * (item.cur/78) * (0.85+Math.random()*0.15)}));

  // sparkline geom
  const W = 296, H = 130, P = 14;
  const ps = hist.map(h=>h.p);
  const min = Math.min(...ps) * 0.94;
  const max = Math.max(...ps) * 1.06;
  const x = i => P + i * (W - 2*P) / (hist.length-1);
  const y = p => H - P - (p - min) / (max - min) * (H - 2*P);
  const path = hist.map((h,i)=>`${i===0?'M':'L'}${x(i).toFixed(1)},${y(h.p).toFixed(1)}`).join(' ');

  return (
    <div className="card" style={{position:'sticky',top:0,alignSelf:'flex-start'}}>
      <div className="card-head">
        <h3 style={{fontSize:12.5}}>Item drill · <code style={{fontFamily:'var(--mono)',fontSize:11.5,color:'var(--ink-3)'}}>{item.code}</code></h3>
      </div>
      <div style={{padding:14}}>
        <div style={{fontSize:14,fontWeight:600,letterSpacing:'-.01em'}}>{item.desc}</div>
        <div className="muted" style={{fontSize:11.5,marginTop:2}}>UOM {item.uom} · used in {item.used} units this bid</div>

        <div className="bh-pricerow mt">
          <div><div className="lbl">Current</div><div className="v" style={{color:'var(--accent)'}}>{fmt$(item.cur, item.cur<20?2:0)}</div></div>
          <div><div className="lbl">Avg won</div><div className="v">{fmt$(item.avg, item.avg<20?2:0)}</div></div>
          <div><div className="lbl">Last won</div><div className="v">{fmt$(item.lastWon, item.lastWon<20?2:0)}</div></div>
        </div>

        <div className="bh-spark mt">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
            {/* grid */}
            <line x1={P} x2={W-P} y1={H-P} y2={H-P} stroke="var(--line)" strokeWidth="1"/>
            <line x1={P} x2={W-P} y1={P}   y2={P}   stroke="var(--line)" strokeWidth="1" strokeDasharray="2,3" opacity="0.5"/>
            {/* path */}
            <path d={path} fill="none" stroke="var(--ink-2)" strokeWidth="1.6"/>
            {/* points */}
            {hist.map((h,i)=>(
              <g key={i}>
                <circle cx={x(i)} cy={y(h.p)} r={i===hist.length-1?5:3.5}
                  fill={h.won===null ? 'var(--accent)' : (h.won ? 'var(--ok)' : 'var(--bad)')}
                  stroke="var(--card)" strokeWidth="1.5"/>
                <text x={x(i)} y={H-2} fontSize="9" fill="var(--mute)" textAnchor="middle">{h.d}</text>
              </g>
            ))}
            {/* avg line */}
            <line x1={P} x2={W-P}
              y1={y(item.avg)} y2={y(item.avg)}
              stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="4,3" opacity="0.6"/>
            <text x={W-P} y={y(item.avg)-3} fontSize="9" fill="var(--ink-3)" textAnchor="end">avg won {fmt$(item.avg, item.avg<20?2:0)}</text>
          </svg>
        </div>

        <hr className="rule"/>
        <div className="eyebrow" style={{marginBottom:6}}>Where this came from</div>
        <div style={{display:'flex',flexDirection:'column',gap:5,fontSize:12}}>
          {item.hist.map((h,i)=>(
            <div key={i} className="row" style={{justifyContent:'space-between'}}>
              <span><code style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--ink-3)'}}>{h.d}</code></span>
              <span className="tnum" style={{fontWeight:500}}>{fmt$(h.p, h.p<20?2:0)}</span>
            </div>
          ))}
        </div>

        <hr className="rule"/>
        <div className="finding" style={{margin:0}}>
          <div className="t" style={{color:'var(--accent)'}}>Suggestion</div>
          <div className="txt">
            {item.vsAvg > 8
              ? <>Current is <b>{fmtPct(item.vsAvg)}</b> over recent avg. Verify the supplier quote and check if a recent vendor escalation explains the jump.</>
              : item.vsAvg < -3
              ? <>Coming in <b>{fmtPct(item.vsAvg)}</b> under recent avg — defensible, but confirm the takeoff didn't miss material.</>
              : <>Within ±3% of recent avg. Defensible.</>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function H2HCompare() {
  // pick top 5 codes that appear across all to compare
  const codes = ['06-410.18','06-610.21','06-610.45','06-710.18','09-LAB.20'];
  const ITEM_LOOKUP = Object.fromEntries(ITEM_COMPARE.filter(r=>!r.sec).map(r=>[r.code,r]));

  return (
    <div>
      <div className="g3 mb">
        {COMPARE_SET.map((b,i)=>(
          <div key={i} className="card pad" style={b.isCurrent?{borderColor:'var(--accent)',boxShadow:'0 0 0 2px rgba(168,56,49,.08)'}:{}}>
            <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div className="eyebrow" style={{color:b.isCurrent?'var(--accent)':'var(--mute)'}}>{b.isCurrent?'Current draft':'Historical'}</div>
                <div style={{fontSize:15,fontWeight:700,letterSpacing:'-.01em',marginTop:2}}>{b.proj}</div>
                <div className="muted" style={{fontSize:11.5,marginTop:1}}>{b.gc} · {b.type}</div>
              </div>
              {b.result && <span className={`chip ${b.result==='won'?'ok':'bad'}`}><span className="dot"></span>{b.result==='won'?'Won':'Lost'}</span>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginTop:14}}>
              <div><div className="lbl" style={{fontSize:9.5,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:700}}>SF</div><div className="tnum" style={{fontSize:14,fontWeight:600,marginTop:2}}>{b.sf.toLocaleString()}</div></div>
              <div><div className="lbl" style={{fontSize:9.5,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:700}}>Total</div><div className="tnum" style={{fontSize:14,fontWeight:600,marginTop:2}}>{fmt$(b.total)}</div></div>
              <div><div className="lbl" style={{fontSize:9.5,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:700}}>$/SF</div><div className="tnum" style={{fontSize:14,fontWeight:600,marginTop:2}}>{fmt$(b.gsf,2)}</div></div>
              <div><div className="lbl" style={{fontSize:9.5,color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:700}}>Margin</div><div className="tnum" style={{fontSize:14,fontWeight:600,marginTop:2,color:b.isCurrent?'var(--accent)':'var(--ink)'}}>{b.margin.toFixed(1)}%</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Common items · side-by-side</h3>
          <div style={{flex:1}}></div>
          <span className="muted" style={{fontSize:11.5}}>5 items shared across all 3 bids</span>
        </div>
        <table className="wf">
          <thead><tr>
            <th style={{paddingLeft:16}}>Code · description</th>
            <th className="num" style={{color:'var(--accent)'}}>Denver Reg. Lab<br/><span style={{fontSize:10,fontWeight:500,letterSpacing:0,textTransform:'none'}}>current draft</span></th>
            <th className="num">Boise Medical · Ph 1<br/><span style={{fontSize:10,fontWeight:500,letterSpacing:0,textTransform:'none'}}>won · Mar 18</span></th>
            <th className="num">PSU Lab Reno<br/><span style={{fontSize:10,fontWeight:500,letterSpacing:0,textTransform:'none'}}>won · Jan 28</span></th>
            <th className="num" style={{paddingRight:16}}>Spread</th>
          </tr></thead>
          <tbody>
            {codes.map(c => {
              const it = ITEM_LOOKUP[c];
              if (!it) return null;
              // synthesize per-bid prices from history
              const a = it.cur;
              const b = it.hist[0]?.p ?? it.avg;
              const cc = it.hist[1]?.p ?? it.avg;
              const min = Math.min(a,b,cc), max = Math.max(a,b,cc);
              const spread = ((max-min)/min*100);
              return (
                <tr key={c}>
                  <td style={{paddingLeft:16}}>
                    <code style={{fontFamily:'var(--mono)',fontSize:11.5,color:'var(--ink-3)'}}>{c}</code>
                    <div style={{fontWeight:500}}>{it.desc}</div>
                  </td>
                  <td className="num tnum" style={{fontWeight:600,color:'var(--accent)'}}>{fmt$(a, a<20?2:0)}</td>
                  <td className="num tnum">{fmt$(b, b<20?2:0)}</td>
                  <td className="num tnum">{fmt$(cc, cc<20?2:0)}</td>
                  <td className="num tnum" style={{paddingRight:16}}><span className={`bh-delta ${spread>10?'bad':spread>5?'warn':''}`}>{spread.toFixed(1)}%</span></td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td style={{paddingLeft:16}}>Total bid</td>
              <td className="num tnum" style={{color:'var(--accent)'}}>{fmt$(COMPARE_SET[0].total)}</td>
              <td className="num tnum">{fmt$(COMPARE_SET[1].total)}</td>
              <td className="num tnum">{fmt$(COMPARE_SET[2].total)}</td>
              <td className="num tnum" style={{paddingRight:16}}>—</td>
            </tr>
            <tr>
              <td style={{paddingLeft:16,color:'var(--ink-3)',fontSize:11.5}}>$/SF</td>
              <td className="num tnum muted">{fmt$(COMPARE_SET[0].gsf,2)}</td>
              <td className="num tnum muted">{fmt$(COMPARE_SET[1].gsf,2)}</td>
              <td className="num tnum muted">{fmt$(COMPARE_SET[2].gsf,2)}</td>
              <td className="num tnum muted" style={{paddingRight:16}}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.Views = Object.assign(window.Views || {}, { bidhistory: BidHistoryView });
