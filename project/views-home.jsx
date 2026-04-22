// Home + Pipeline views
const HomeView = () => {
  const kpis = [
    { l:'Active bids',      v:'12',      sub:'3 due this week', accent:true },
    { l:'Win rate (L90D)',  v:'38%',     delta:'+4 pts',   up:true },
    { l:'Avg gross margin', v:'22.4%',   delta:'−0.6 pts', up:false },
    { l:'Awarded backlog',  v:'$8.4M',   sub:'22 jobs'    },
  ];
  const dueSoon = [
    { co:'Ada County', name:'Courthouse HVAC retrofit', due:'Thu 11:00a', owner:'EP', val:'$1.24M', status:'accent', note:'RFI pending' },
    { co:'TriState Mechanical', name:'Denver Regional Lab', due:'Fri 2:00p', owner:'GR', val:'$2.80M', status:'warn', note:'Pricing open' },
    { co:'Sundial Dev.', name:'Fairfax Apartments — Ph.2', due:'Mon Dec 9', owner:'JM', val:'$640k', status:'ok', note:'Ready to review' },
    { co:'Boise School Dist.', name:'West Middle School — Reroof', due:'Tue Dec 10', owner:'PN', val:'$390k', status:'ok', note:'Submit package' },
  ];
  const activity = [
    { who:'GR', html:<><b>Gabe</b> changed unit price on <b>03-310 Conc. footing</b> (+6%) on Denver Regional Lab.</>, when:'12 min ago' },
    { who:'PN', html:<><b>Paula</b> added 2 addenda to <b>West Middle School</b> bid package.</>, when:'48 min ago' },
    { who:'EP', html:<><b>Evan</b> marked <b>Ada County Courthouse</b> as <i>awaiting RFI response</i>.</>, when:'2h ago' },
    { who:'JM', html:<><b>Jordan</b> converted <b>Fairfax Apts. — Ph.1</b> to an awarded job. Estimator → Jobs.</>, when:'Yesterday' },
    { who:'SYS', html:<>A pricing sync from <b>Ferguson</b> updated 412 items (avg +2.1%).</>, when:'Yesterday' },
  ];

  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Tue · Dec 3 · 2026 · 8:14 am MT</div>
          <div className="page-title">Morning, Evan.</div>
          <div className="page-sub">You have <b style={{color:'var(--accent)'}}>2 bids due before Friday</b> and 4 awarded jobs waiting for kickoff.</div>
        </div>
      </div>
      <div style={{padding:'18px 28px 40px'}}>

        {/* KPIs */}
        <div className="g4 mb-lg">
          {kpis.map((k,i)=>(
            <div className="card kpi" key={i} style={k.accent?{borderColor:'var(--accent)',boxShadow:'0 0 0 2px rgba(176,80,40,.08)'}:{}}>
              <div className="lbl">{k.l}</div>
              <div className="val tnum">{k.v}</div>
              <div className="sub">
                {k.delta && <span className={`delta ${k.up?'up':'dn'}`}>{k.delta}</span>}
                {k.sub}
              </div>
            </div>
          ))}
        </div>

        {/* row: due soon + activity */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
          <div className="card">
            <div className="card-head">
              <h3>Due this week</h3>
              <span className="chip accent">4 bids · $5.07M</span>
              <div style={{flex:1}}></div>
              <button className="btn ghost sm" onClick={()=>window.__go('pipeline')}>View pipeline →</button>
            </div>
            <table className="wf">
              <thead><tr>
                <th style={{paddingLeft:16}}>Project</th>
                <th>Owner</th>
                <th>Due</th>
                <th>Status</th>
                <th className="num" style={{paddingRight:16}}>Value</th>
              </tr></thead>
              <tbody>
                {dueSoon.map((r,i)=>(
                  <tr key={i} style={{cursor:'pointer'}} onClick={()=>window.__go('estimator')}>
                    <td style={{paddingLeft:16}}>
                      <div style={{fontWeight:600}}>{r.name}</div>
                      <div className="muted" style={{fontSize:11.5}}>{r.co} · <span>{r.note}</span></div>
                    </td>
                    <td><span className={`pm ${r.owner[0].toLowerCase()}`}>{r.owner}</span></td>
                    <td className="tnum" style={{fontSize:12}}>{r.due}</td>
                    <td><span className={`chip ${r.status}`}>{r.status==='accent'?'RFI open':r.status==='warn'?'Pricing':r.status==='ok'?'Ready':'—'}</span></td>
                    <td className="num tnum" style={{paddingRight:16,fontWeight:600}}>{r.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-head"><h3>Activity</h3><span className="muted" style={{fontSize:11.5,marginLeft:'auto'}}>last 24h</span></div>
            <div style={{padding:'4px 16px 10px'}}>
              {activity.map((a,i)=>(
                <div className="act" key={i}>
                  <div className="who">{a.who}</div>
                  <div className="body">
                    <div>{a.html}</div>
                    <div className="when">{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* row 2: capacity + win snapshot */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14,marginTop:14}}>
          <div className="card pad has-annot">
            <div className="row mb-sm" style={{alignItems:'center'}}>
              <div>
                <h3 style={{margin:0,fontSize:13}}>Estimator capacity · this week</h3>
                <div className="muted" style={{fontSize:11.5,marginTop:2}}>Hours planned vs. bid load. Hover cells for detail.</div>
              </div>
              <div style={{flex:1}}></div>
              <div className="row gap-sm">
                <span className="chip"><span className="dot" style={{background:'#f4ead7'}}></span>Light</span>
                <span className="chip"><span className="dot" style={{background:'#e2b079'}}></span>Heavy</span>
                <span className="chip bad"><span className="dot"></span>Overbooked</span>
              </div>
            </div>
            <div className="cal">
              {['Mon 12/1','Tue 12/2','Wed 12/3','Thu 12/4','Fri 12/5','Sat','Sun'].map(h=>(
                <div className="hd" key={h}>{h}</div>
              ))}
              {/* Row 1: Gabe */}
              <div className="d c2"><span className="n">GR</span><span className="pill g">Denver Lab · qty</span></div>
              <div className="d c3"><span className="n">GR</span><span className="pill g">Denver Lab · price</span></div>
              <div className="d today c4"><span className="n">3</span><span className="pill g">Denver Lab</span><span className="pill p">ITB review</span></div>
              <div className="d c3"><span className="n">4</span><span className="pill g">Denver Lab · QC</span></div>
              <div className="d c2"><span className="n">5</span><span className="pill g">Submit</span></div>
              <div className="d om"><span className="n">6</span></div>
              <div className="d om"><span className="n">7</span></div>

              {/* Row 2 */}
              <div className="d c1"><span className="n">PN</span><span className="pill p">W.Middle · plans</span></div>
              <div className="d c2"><span className="n">PN</span><span className="pill p">W.Middle · qty</span></div>
              <div className="d c3"><span className="n">PN</span><span className="pill p">W.Middle · price</span></div>
              <div className="d c2"><span className="n">PN</span><span className="pill p">W.Middle · QC</span></div>
              <div className="d c2"><span className="n">PN</span><span className="pill j">Ada Co · RFI</span></div>
              <div className="d om"></div><div className="d om"></div>

              {/* Row 3 */}
              <div className="d c3"><span className="n">JM</span><span className="pill j">Fairfax · review</span></div>
              <div className="d c2"><span className="n">JM</span><span className="pill j">Fairfax · QC</span></div>
              <div className="d c2"><span className="n">JM</span><span className="pill j">Submit</span></div>
              <div className="d c4"><span className="n">JM</span><span className="pill p">Linden MOB · qty</span></div>
              <div className="d c4"><span className="n">JM</span><span className="pill p">Linden MOB · qty</span></div>
              <div className="d om"></div><div className="d om"></div>
            </div>
            <span className="annot" style={{top:44,right:120}}>Paula is maxed<br/>Fri — shift Linden?</span>
          </div>

          <div className="card pad">
            <h3 style={{margin:0,fontSize:13}}>Win snapshot · by sector</h3>
            <div className="muted" style={{fontSize:11.5,marginTop:2,marginBottom:12}}>Last 90 days, by award $</div>
            {[
              { n:'Civic / Muni', pct:62, v:'$3.1M', cls:'ok' },
              { n:'Education',    pct:41, v:'$1.2M', cls:'accent' },
              { n:'Healthcare',   pct:33, v:'$0.9M', cls:'' },
              { n:'Multifamily',  pct:28, v:'$0.7M', cls:'warn' },
              { n:'Industrial',   pct:18, v:'$0.3M', cls:'' },
            ].map((s,i)=>(
              <div className="sbar" key={i}>
                <div className="n">{s.n}</div>
                <div className={`bar ${s.cls}`}><span style={{width:`${s.pct}%`}}></span></div>
                <div className="v">{s.v} <span className="muted">· {s.pct}%</span></div>
              </div>
            ))}
            <hr className="rule"/>
            <div className="row gap-sm" style={{fontSize:11.5}}>
              <span className="muted">Losses most often to:</span>
              <span className="chip">Mtn. West Builders · 6×</span>
              <span className="chip">Pacific Summit · 3×</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Pipeline kanban ───────────────────────────────────
const PipelineView = () => {
  const cols = [
    { id:'lead', t:'Lead / ITB received', items:[
      { c:'Garfield County', n:'Fleet wash bay — Rifle', m:'PW · Hard bid', d:'Due Dec 18', v:'$480k', pm:'JM', tags:['PW','Single-trade'] },
      { c:'Signal Peak Health', n:'Outpatient fit-out', m:'Negotiated', d:'Due Dec 22', v:'—', pm:'EP', tags:['Healthcare'] },
      { c:'Treasure Valley CC', n:'Welding lab expansion', m:'Design-build', d:'Due Jan 6', v:'~$1.4M', pm:'GR', tags:['Education','DB'] },
    ]},
    { id:'qty', t:'Quantities', items:[
      { c:'Boise School Dist.', n:'West Middle — Reroof', m:'Hard bid', d:'Due Dec 10', v:'$390k', pm:'PN', tags:['Education'], urgent:true },
      { c:'Sundial Dev.', n:'Fairfax Apts — Ph.2', m:'Negotiated', d:'Due Dec 9', v:'$640k', pm:'JM', tags:['Multifamily'] },
    ]},
    { id:'price', t:'Pricing', items:[
      { c:'TriState Mech.', n:'Denver Regional Lab', m:'CMAR · GMP', d:'Due Fri', v:'$2.80M', pm:'GR', tags:['Healthcare','GMP'], urgent:true },
      { c:'Ada County', n:'Courthouse HVAC retrofit', m:'Hard bid', d:'Due Thu 11a', v:'$1.24M', pm:'EP', tags:['Civic'], urgent:true },
    ]},
    { id:'qc', t:'Review / QC', items:[
      { c:'Linden Partners', n:'Linden MOB — Tenant fit', m:'Negotiated', d:'Submit Mon', v:'$870k', pm:'JM', tags:['Healthcare'] },
    ]},
    { id:'sent', t:'Submitted · awaiting', items:[
      { c:'City of Meridian', n:'Kleiner Park Shelter', m:'PW', d:'Opened 11/20', v:'$215k', pm:'PN', tags:['Parks'] },
      { c:'St. Luke’s', n:'IT Dept. MEP refresh', m:'Neg', d:'Opened 11/14', v:'$1.9M', pm:'EP', tags:['Healthcare'] },
      { c:'Valley Reg. Airport', n:'Hangar 4 re-deck', m:'Hard bid', d:'Opened 11/28', v:'$1.1M', pm:'GR', tags:['Aviation'] },
    ]},
  ];
  return (
    <div className="view active">
      <div className="page-head">
        <div>
          <div className="page-title">Pipeline</div>
          <div className="page-sub">22 active opportunities · <b style={{color:'var(--accent)'}}>3 urgent</b> · $11.8M weighted</div>
        </div>
        <div className="spacer"></div>
        <div className="actions">
          <div className="row gap-sm" style={{marginRight:8}}>
            <span className="chip solid">All owners</span>
            <span className="chip">Sector · any</span>
            <span className="chip">Due · next 14d</span>
            <button className="btn ghost sm"><Icon.filter/> More</button>
          </div>
          <button className="btn">Board</button>
          <button className="btn ghost">Table</button>
          <button className="btn accent"><Icon.plus/> New bid</button>
        </div>
      </div>

      <div style={{padding:'16px 20px 40px', overflowX:'auto'}}>
        <div className="kan">
          {cols.map(col => (
            <div className="col" key={col.id}>
              <div className="col-head"><span>{col.t}</span><span className="n">{col.items.length}</span></div>
              {col.items.map((it,i)=>(
                <div key={i} className={`card-lead ${it.urgent?'urgent':''}`} onClick={()=> col.id==='price' && window.__go('estimator')}>
                  <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{minWidth:0}}>
                      <div className="name">{it.n}</div>
                      <div className="meta">{it.c} · {it.m}</div>
                    </div>
                    <span className={`pm ${it.pm[0].toLowerCase()}`} title={it.pm}>{it.pm}</span>
                  </div>
                  <div className="row" style={{justifyContent:'space-between',marginTop:7}}>
                    <span className="muted" style={{fontSize:11.5}}>{it.d}</span>
                    <span className="money tnum" style={{fontSize:12.5}}>{it.v}</span>
                  </div>
                  <div className="row-tags">
                    {it.tags.map((t,j)=><span key={j} className="chip">{t}</span>)}
                    {it.urgent && <span className="chip bad"><span className="dot"></span>Urgent</span>}
                  </div>
                </div>
              ))}
              <div className="add-placeholder"><Icon.plus/> Add opportunity</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Views = Object.assign(window.Views || {}, { home: HomeView, pipeline: PipelineView });
