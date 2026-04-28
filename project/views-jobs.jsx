// Jobs list + Job detail + Change Orders

function JobsView() {
  const rows = [
    { id:'26-041', name:'Caldwell Clinic',          gc:'Engelmann',  pm:'G', val:312400, co:0,     dates:'May 18 → May 24', status:'Shop',       docs:12, act:'Geoff · 2h' },
    { id:'26-040', name:'Ada Co. Courthouse',       gc:'Turner',     pm:'P', val:648200, co:24800, dates:'Now → May 2',      status:'Installing', docs:28, act:'Pat · yest' },
    { id:'26-038', name:'Treasure Valley HS',       gc:'Hoffman',    pm:'J', val:184000, co:0,     dates:'Jun 3 → Jun 8',    status:'Ready',      docs:8,  act:'Joe · 3d' },
    { id:'26-035', name:'Nampa Library',            gc:'Engelmann',  pm:'G', val:194000, co:-3200, dates:'May 11 → May 14',  status:'Shop',       docs:14, act:'Pat · 1h' },
    { id:'26-031', name:'Boise Medical · Ph 2',     gc:'Turner',     pm:'P', val:412500, co:0,     dates:'TBD',              status:'Held',       docs:22, act:'last wk' },
    { id:'26-028', name:'Meridian Dental',          gc:'Hoffman',    pm:'J', val:88200,  co:0,     dates:'Apr 8 → Apr 10 ✓', status:'Installed',  docs:19, act:'closed' },
  ];
  const statusChip = (s) => {
    const m = { 'Shop':'warn', 'Installing':'accent', 'Ready':'', 'Held':'bad', 'Installed':'ok' };
    return <span className={`chip ${m[s]||''}`}>{s}</span>;
  };
  const fmt = n => '$'+Number(n).toLocaleString();

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <div className="page-title">Jobs</div>
          <div className="page-sub">18 active · <b>$2.4M backlog</b> · 6 installing ≤ 30d</div>
        </div>
        <div className="spacer"></div>
        <div className="actions">
          <span className="chip solid">All PMs</span>
          <span className="chip">Status · any</span>
          <span className="chip">Installing · 30d</span>
          <button className="btn ghost sm"><Icon.filter/> More</button>
        </div>
      </div>

      <div style={{padding:'16px 24px 40px'}}>
        <div className="g4 mb">
          <div className="card kpi"><div className="lbl">Contracted</div><div className="val tnum">$2.4M</div><div className="sub">18 active jobs</div></div>
          <div className="card kpi"><div className="lbl">Approved COs</div><div className="val tnum" style={{color:'var(--ok)'}}>+$86k</div><div className="sub">7 jobs affected</div></div>
          <div className="card kpi"><div className="lbl">Installing ≤ 30d</div><div className="val tnum">6 jobs</div><div className="sub">$1.22M value</div></div>
          <div className="card kpi"><div className="lbl">Crew capacity</div><div className="val tnum">72%</div><div className="sub"><div className="bar" style={{width:140}}><span style={{width:'72%'}}></span></div></div></div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Active jobs</h3>
            <span className="muted" style={{fontSize:11.5,marginLeft:6}}>sorted by install date</span>
            <div style={{flex:1}}></div>
            <button className="btn sm">Export</button>
          </div>
          <table className="wf">
            <thead><tr>
              <th style={{paddingLeft:16,width:80}}>Job #</th>
              <th>Project</th>
              <th style={{width:60}}>PM</th>
              <th style={{width:110}}>Status</th>
              <th className="num" style={{width:110}}>Value</th>
              <th className="num" style={{width:110}}>Net CO</th>
              <th style={{width:180}}>Install window</th>
              <th style={{width:60}} className="ctr">Docs</th>
              <th style={{width:110,paddingRight:16}}>Activity</th>
            </tr></thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i} style={{cursor:'pointer'}} onClick={()=>window.__go('job')}>
                  <td style={{paddingLeft:16}} className="tnum"><b>{r.id}</b></td>
                  <td>
                    <div style={{fontWeight:600}}>{r.name}</div>
                    <div className="muted" style={{fontSize:11.5}}>{r.gc}</div>
                  </td>
                  <td><span className={`pm ${r.pm.toLowerCase()}`}>{r.pm}</span></td>
                  <td>{statusChip(r.status)}</td>
                  <td className="num tnum" style={{fontWeight:600}}>{fmt(r.val)}</td>
                  <td className="num tnum" style={{color: r.co>0?'var(--ok)':r.co<0?'var(--bad)':'var(--ink-3)'}}>{r.co?(r.co>0?'+':'')+fmt(r.co):'—'}</td>
                  <td style={{fontSize:12}}>{r.dates}</td>
                  <td className="ctr"><span className="chip mono">{r.docs}</span></td>
                  <td className="muted" style={{fontSize:11.5,paddingRight:16}}>{r.act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="g2 mt">
          <div className="card pad has-annot">
            <div className="row" style={{alignItems:'center'}}>
              <h3 style={{margin:0,fontSize:13}}>Install capacity · May 2026</h3>
              <div style={{flex:1}}></div>
              <span className="chip">‹ Prev</span><span className="chip">Next ›</span>
            </div>
            <div className="cal mt-sm">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h=><div className="hd" key={h}>{h}</div>)}
              <div className="d om"><span className="n">26</span></div>
              <div className="d c1"><span className="n">27</span><span className="pill g">Nampa · prep</span></div>
              <div className="d c2"><span className="n">28</span><span className="pill g">Nampa · load</span></div>
              <div className="d om"><span className="n">29</span></div>
              <div className="d om"><span className="n">30</span></div>
              <div className="d c2"><span className="n">May 1</span><span className="pill p">Ada · day 6</span></div>
              <div className="d c2"><span className="n">2</span><span className="pill p">Ada · final</span></div>
              <div className="d om"><span className="n">3</span></div>
              <div className="d om"><span className="n">4</span></div>
              <div className="d om"><span className="n">5</span></div>
              <div className="d c3 today"><span className="n">6</span><span className="pill j">TVHS · mock</span><span className="pill g">Nampa</span></div>
              <div className="d c3"><span className="n">7</span><span className="pill j">TVHS</span><span className="pill g">Nampa</span></div>
              <div className="d c2"><span className="n">8</span><span className="pill j">TVHS</span></div>
              <div className="d c1"><span className="n">9</span></div>
              <div className="d c3"><span className="n">11</span><span className="pill g">Nampa · install</span></div>
              <div className="d c3"><span className="n">12</span><span className="pill g">Nampa</span></div>
              <div className="d c2"><span className="n">13</span><span className="pill g">Nampa</span></div>
              <div className="d c2"><span className="n">14</span><span className="pill g">Nampa</span></div>
              <div className="d om"><span className="n">15</span></div>
              <div className="d om"><span className="n">16</span></div>
              <div className="d om"><span className="n">17</span></div>
              <div className="d c4"><span className="n">18</span><span className="pill g">Caldwell</span></div>
              <div className="d c4"><span className="n">19</span><span className="pill g">Caldwell</span></div>
              <div className="d c3"><span className="n">20</span><span className="pill g">Caldwell</span></div>
              <div className="d c3"><span className="n">21</span><span className="pill g">Caldwell</span></div>
              <div className="d c2"><span className="n">22</span></div>
              <div className="d om"><span className="n">23</span></div>
              <div className="d om"><span className="n">24</span></div>
            </div>
            <span className="annot" style={{top:92,right:24}}>Watch week<br/>of May 18 —<br/>Caldwell + G<br/>stacked</span>
          </div>

          <div className="card pad">
            <h3 style={{margin:0,fontSize:13}}>Open risks</h3>
            <div className="muted" style={{fontSize:11.5,marginTop:2,marginBottom:10}}>Across active jobs</div>
            <div className="row-list"><div className="flex"><div className="title">Boise Medical · Ph 2 — held</div><div className="meta">Owner decision pending · 12d</div></div><span className="chip bad">HELD</span></div>
            <div className="row-list"><div className="flex"><div className="title">Ada Co. · CO-03 unsigned</div><div className="meta">Turner PM · 6d open</div></div><span className="chip warn">CO</span></div>
            <div className="row-list"><div className="flex"><div className="title">Nampa Library · ship −2d</div><div className="meta">Edge-band delayed · Geoff</div></div><span className="chip warn">SCHED</span></div>
            <div className="row-list"><div className="flex"><div className="title">TVHS · mockup approval late</div><div className="meta">Hoffman PM not responding</div></div><span className="chip">FLAG</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── JOB DETAIL ─────────────────────────────────────────
function JobView() {
  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Job 26-040 · Turner · Ada Co. Courthouse · Boise ID</div>
          <div className="page-title">Ada Co. Courthouse</div>
          <div className="page-sub">PM <span className="pm p" style={{marginLeft:4}}>P</span> Pat · <b>Installing · day 3/7</b> · ship date met</div>
        </div>
        <div className="spacer"></div>
        <div className="actions">
          <div className="bid-totals" style={{marginLeft:0}}>
            <div className="t"><span className="l">Contract</span><span className="v">$648,200</span></div>
            <div className="divider"></div>
            <div className="t"><span className="l">Net COs</span><span className="v" style={{color:'var(--ok)'}}>+$24,800</span></div>
            <div className="divider"></div>
            <div className="t main"><span className="l">Current</span><span className="v">$673,000</span></div>
          </div>
        </div>
      </div>

      <div style={{padding:'18px 24px 40px'}}>
        {/* stripe: contract evolution */}
        <div style={{position:'relative',marginBottom:22}}>
          <div className="stripe-wrap">
            <div className="seg base">Original $648.2k</div>
            <div className="seg add1">+CO-01</div>
            <div className="seg add2">+CO-02</div>
            <div className="seg ded1">−CO-03</div>
            <div className="seg draft">CO-04 draft</div>
          </div>
          <span className="annot" style={{top:-10,right:4}}>margin<br/>21.4 → 22.1%</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
          {/* left: timeline + scope */}
          <div className="stack" style={{gap:14}}>
            <div className="card pad">
              <h3 style={{margin:'0 0 10px',fontSize:13}}>Project timeline</h3>
              <div className="tl">
                <div className="tl-node done"><div className="when">Mar 20</div><div className="what">Awarded · contract signed</div><div className="detail">$648,200 · Turner LOI attached</div></div>
                <div className="tl-node done"><div className="when">Apr 1</div><div className="what">Shop start</div><div className="detail">Geoff released CNC files · material received Apr 3</div></div>
                <div className="tl-node done"><div className="when">Apr 8 · CO-01 approved</div><div className="what">Add (3) full-height file cabs, L2 corridor</div><div className="detail" style={{color:'var(--ok)'}}>+$8,420 · +1 day · owner request</div></div>
                <div className="tl-node done"><div className="when">Apr 15 · CO-02 approved</div><div className="what">Upgrade lab counters to epoxy resin</div><div className="detail" style={{color:'var(--ok)'}}>+$16,380 · spec ASI-03</div></div>
                <div className="tl-node done"><div className="when">Apr 18</div><div className="what">Install kickoff · day 1/7</div><div className="detail">Crew P · 3 techs + lead</div></div>
                <div className="tl-node now"><div className="when">Today · Apr 21</div><div className="what">Installing — L1 casework complete, starting L2</div><div className="detail">Photo log: 14 uploads · Pat</div></div>
                <div className="tl-node"><div className="when">Apr 25 (projected)</div><div className="what">Install complete · punch walk</div></div>
                <div className="tl-node"><div className="when">May 2</div><div className="what">Close &amp; final invoice</div></div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Scope &amp; line items</h3><span className="muted" style={{fontSize:11.5,marginLeft:6}}>contract + COs</span><div style={{flex:1}}></div><button className="btn sm">Open in estimator</button></div>
              <table className="wf">
                <thead><tr><th style={{paddingLeft:16}}>Area</th><th>Category</th><th className="num">Qty</th><th>UOM</th><th className="num" style={{paddingRight:16}}>Ext $</th></tr></thead>
                <tbody>
                  <tr className="sec"><td colSpan={5}>Base scope <span className="tot tnum">$648,200</span></td></tr>
                  <tr><td style={{paddingLeft:16}}>Lab L1</td><td>Casework</td><td className="num tnum">62</td><td>lf</td><td className="num tnum" style={{paddingRight:16}}>$84,120</td></tr>
                  <tr><td style={{paddingLeft:16}}>Lab L1</td><td>Counters</td><td className="num tnum">110</td><td>lf</td><td className="num tnum" style={{paddingRight:16}}>$22,460</td></tr>
                  <tr><td style={{paddingLeft:16}}>Lab L2</td><td>Casework</td><td className="num tnum">58</td><td>lf</td><td className="num tnum" style={{paddingRight:16}}>$81,200</td></tr>
                  <tr><td style={{paddingLeft:16}}>Offices</td><td>Millwork</td><td className="num tnum">1</td><td>LS</td><td className="num tnum" style={{paddingRight:16}}>$48,000</td></tr>
                  <tr className="sec"><td colSpan={5}>Change orders <span className="tot tnum">+$24,800</span></td></tr>
                  <tr><td style={{paddingLeft:16}}>L2 Corridor</td><td>FH File Cabs (CO-01)</td><td className="num tnum">3</td><td>ea</td><td className="num tnum" style={{paddingRight:16,color:'var(--ok)'}}>+$8,420</td></tr>
                  <tr><td style={{paddingLeft:16}}>Lab 214/215</td><td>Epoxy counters (CO-02)</td><td className="num tnum">46</td><td>lf</td><td className="num tnum" style={{paddingRight:16,color:'var(--ok)'}}>+$16,380</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* right: docs + activity + change orders summary */}
          <div className="stack" style={{gap:14}}>
            <div className="card pad">
              <div className="row" style={{alignItems:'center'}}><h3 style={{margin:0,fontSize:13}}>Change orders</h3><div style={{flex:1}}></div><button className="btn ghost sm" onClick={()=>window.__go('co')}>Open log →</button></div>
              <div className="row-list"><div className="flex"><div className="title">CO-01 · Add (3) FH file cabs L2</div><div className="meta">Owner · signed Apr 8</div></div><span className="chip ok">+$8,420</span></div>
              <div className="row-list"><div className="flex"><div className="title">CO-02 · Epoxy counter upgrade</div><div className="meta">Spec ASI-03 · signed Apr 15</div></div><span className="chip ok">+$16,380</span></div>
              <div className="row-list"><div className="flex"><div className="title">CO-03 · Delete break uppers (VE)</div><div className="meta">draft · awaiting sig · 6d</div></div><span className="chip warn">−$3,200</span></div>
              <div className="row-list"><div className="flex"><div className="title">CO-04 · Corner guards 201-208</div><div className="meta">Owner email Apr 20 · drafting</div></div><span className="chip">+$1,136</span></div>
              <button className="btn accent sm" style={{marginTop:8}} onClick={()=>window.__go('co')}>+ New change order</button>
            </div>

            <div className="card pad">
              <h3 style={{margin:'0 0 8px',fontSize:13}}>Documents <span className="muted" style={{fontWeight:500}}>· 28 files</span></h3>
              <div className="row-list"><div className="flex"><div className="title">📐 Plans_IFC_2026-04-18.pdf</div><div className="meta">Evan · yesterday</div></div></div>
              <div className="row-list"><div className="flex"><div className="title">📋 Spec_12-35-30.pdf</div><div className="meta">Evan · yesterday</div></div></div>
              <div className="row-list"><div className="flex"><div className="title">🧾 CO-02 signed.pdf</div><div className="meta">Pat · Apr 15</div></div></div>
              <div className="row-list"><div className="flex"><div className="title">📄 Contract + LOI.pdf</div><div className="meta">locked · Mar 20</div></div></div>
              <div className="row-list"><div className="flex"><div className="title">📷 Install photos (14)</div><div className="meta">Pat · today</div></div></div>
            </div>

            <div className="card pad">
              <h3 style={{margin:'0 0 8px',fontSize:13}}>Activity</h3>
              <div className="act"><div className="who" style={{background:'#f3e3c3',color:'#7a5514'}}>P</div><div className="body"><div><b>Pat</b> uploaded 4 photos · L1 casework complete.</div><div className="when">2h ago</div></div></div>
              <div className="act"><div className="who" style={{background:'#f3e3c3',color:'#7a5514'}}>P</div><div className="body"><div><b>Pat</b> started CO-03 draft (VE deduct).</div><div className="when">yesterday</div></div></div>
              <div className="act"><div className="who">EP</div><div className="body"><div><b>Evan</b> forwarded owner email → CO-04 draft created.</div><div className="when">yesterday</div></div></div>
              <div className="act"><div className="who">SYS</div><div className="body"><div>CO-02 PDF stamped &amp; countersigned.</div><div className="when">Apr 15</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CHANGE ORDERS ──────────────────────────────────────
function COView() {
  const [draftOpen, setDraftOpen] = useState(false);
  const cos = [
    { id:'CO-01', t:'Add (3) FH file cabs, L2 corridor', reason:'Owner request', status:'APV',   days:'+1d', amt:+8420,  margin:'24%' },
    { id:'CO-02', t:'Upgrade lab counters to epoxy resin', reason:'Spec ASI-03',  status:'APV',   days:'+2d', amt:+16380, margin:'18%' },
    { id:'CO-03', t:'Delete break-room uppers (VE)',       reason:'VE · RFI-11',  status:'DRAFT', days:'0d',  amt:-3200,  margin:'—' },
    { id:'CO-04', t:'Add corner guards, rooms 201-208',    reason:'Owner email',  status:'DRAFT', days:'+2d', amt:+1136,  margin:'31%' },
  ];
  const fmt = n => (n>=0?'+':'−')+'$'+Math.abs(n).toLocaleString();

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Job 26-040 · Ada Co. Courthouse</div>
          <div className="page-title">Change orders</div>
          <div className="page-sub">4 orders · 2 approved · 2 draft · <b>net +$22,736</b> open</div>
        </div>
        <div className="spacer"></div>
        <div className="actions">
          <button className="btn ghost sm" onClick={()=>window.__go('job')}><Icon.back/> Back to job</button>
          <button className="btn">From email</button>
          <button className="btn accent" onClick={()=>setDraftOpen(true)}><Icon.plus/> New CO</button>
        </div>
      </div>

      <div style={{padding:'18px 24px 40px'}}>
        <div className="g3 mb">
          <div className="card kpi"><div className="lbl">Original contract</div><div className="val tnum">$648,200</div><div className="sub">Turner · signed Mar 20</div></div>
          <div className="card kpi" style={{borderColor:'var(--ok)',background:'#f0f2e3'}}><div className="lbl">Net COs (open)</div><div className="val tnum" style={{color:'var(--ok)'}}>+$24,800</div><div className="sub">2 approved · 2 draft pending</div></div>
          <div className="card kpi" style={{borderColor:'var(--accent)'}}><div className="lbl">Current contract</div><div className="val tnum" style={{color:'var(--accent)'}}>$673,000</div><div className="sub">margin 21.4% → 22.1%</div></div>
        </div>

        <div className="card">
          <div className="card-head"><h3>CO log</h3><div style={{flex:1}}></div><span className="chip">by date</span><span className="chip">by status</span></div>
          <table className="wf">
            <thead><tr>
              <th style={{paddingLeft:16,width:70}}>#</th>
              <th>Description</th>
              <th style={{width:140}}>Reason</th>
              <th style={{width:100}}>Status</th>
              <th style={{width:70}} className="ctr">Days</th>
              <th style={{width:70}} className="ctr">Margin</th>
              <th className="num" style={{width:120,paddingRight:16}}>Amount</th>
            </tr></thead>
            <tbody>
              {cos.map((c,i)=>(
                <tr key={i} className={c.status==='DRAFT'?'':''} style={c.status==='DRAFT'?{background:'#fbf4df'}:{}}>
                  <td style={{paddingLeft:16}} className="tnum"><b>{c.id}</b></td>
                  <td><div style={{fontWeight:600}}>{c.t}</div></td>
                  <td className="muted" style={{fontSize:12}}>{c.reason}</td>
                  <td><span className={`chip ${c.status==='APV'?'ok':'warn'}`}>{c.status}</span></td>
                  <td className="ctr muted tnum" style={{fontSize:11.5}}>{c.days}</td>
                  <td className="ctr muted tnum" style={{fontSize:11.5}}>{c.margin}</td>
                  <td className="num tnum" style={{paddingRight:16,fontWeight:700,color:c.amt>=0?'var(--ok)':'var(--bad)'}}>{fmt(c.amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="g2 mt">
          <div className="card pad has-annot">
            <h3 style={{margin:'0 0 10px',fontSize:13}}>Draft CO-05 · quick entry</h3>
            <div className="stack">
              <div className="field"><label>Description</label><input defaultValue="Add power strips at 8 lab benches"/></div>
              <div className="g2">
                <div className="field"><label>Reason</label><input defaultValue="Owner add via RFI-12"/></div>
                <div className="field"><label>Schedule impact</label><input defaultValue="+0 days"/></div>
              </div>
              <div className="field"><label>Line items (from library)</label>
                <div className="card tight" style={{padding:'8px 10px'}}>
                  <div className="row" style={{justifyContent:'space-between'}}><span>Power strip, 6-outlet lab grade · 8 × $94</span><b className="tnum">$752</b></div>
                </div>
              </div>
              <div className="row gap-sm mt-sm">
                <button className="btn sm">Attach RFI-12</button>
                <button className="btn sm">Preview PDF</button>
                <div style={{flex:1}}></div>
                <button className="btn ghost sm">Save draft</button>
                <button className="btn accent sm">Send for signature</button>
              </div>
            </div>
            <span className="annot" style={{top:10,right:14}}>pulls from SAME<br/>pricing library</span>
          </div>

          <div className="card pad">
            <h3 style={{margin:'0 0 10px',fontSize:13}}>Impact if all drafts approve</h3>
            <div className="row-list"><div className="flex">Contract</div><div className="tnum">$648,200</div></div>
            <div className="row-list"><div className="flex" style={{color:'var(--ok)'}}>+ CO-01, CO-02 (approved)</div><div className="tnum" style={{color:'var(--ok)'}}>+$24,800</div></div>
            <div className="row-list"><div className="flex" style={{color:'var(--bad)'}}>+ CO-03 (draft, VE)</div><div className="tnum" style={{color:'var(--bad)'}}>−$3,200</div></div>
            <div className="row-list"><div className="flex" style={{color:'var(--ok)'}}>+ CO-04 (draft)</div><div className="tnum" style={{color:'var(--ok)'}}>+$1,136</div></div>
            <div className="row-list"><div className="flex"><b>If all sign</b></div><div className="tnum" style={{fontWeight:700,fontSize:14,color:'var(--accent)'}}>$670,936</div></div>
            <hr className="rule"/>
            <div className="muted" style={{fontSize:11.5}}>Schedule impact: +3 days total · crew P<br/>Margin on CO portfolio: 21.8% vs 22% target</div>
          </div>
        </div>
      </div>

      {/* Drawer stub — not fully wired, just shows on click */}
      <div className={`scrim ${draftOpen?'open':''}`} onClick={()=>setDraftOpen(false)}></div>
      <div className={`drawer ${draftOpen?'open':''}`}>
        <div className="drawer-head">
          <h2>New change order</h2>
          <div style={{flex:1}}></div>
          <button className="btn ghost sm" onClick={()=>setDraftOpen(false)}>✕</button>
        </div>
        <div className="drawer-body">
          <div className="stack" style={{gap:14}}>
            <div className="field"><label>Title</label><input placeholder="One-line description"/></div>
            <div className="g2">
              <div className="field"><label>Reason</label><select><option>Owner request</option><option>Spec revision</option><option>VE</option><option>Site condition</option></select></div>
              <div className="field"><label>Source</label><select><option>Email</option><option>RFI response</option><option>ASI</option><option>Verbal</option></select></div>
            </div>
            <div className="field"><label>Line items</label><textarea rows="4" placeholder="Type or paste from library…"></textarea></div>
            <div className="g2">
              <div className="field"><label>Schedule impact (days)</label><input type="number" defaultValue={0}/></div>
              <div className="field"><label>Attachments</label><input type="text" placeholder="📎 drop files…"/></div>
            </div>
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn" onClick={()=>setDraftOpen(false)}>Cancel</button>
          <button className="btn ghost">Save draft</button>
          <button className="btn accent">Create &amp; send for sig</button>
        </div>
      </div>
    </div>
  );
}

window.Views = Object.assign(window.Views || {}, { jobs: JobsView, job: JobView, co: COView });
