// Estimator workbook — tree + grid + side panel
const { useState: uS_est, useMemo: uM_est } = React;

const estRows = [
  { sec:'01 · General Conditions' },
  { code:'01-510', desc:'Mobilization / demob', uom:'LS', qty:1,    unit:28500, waste:0,   sub:'—',           note:'Per bid form §2' },
  { code:'01-520', desc:'Temporary facilities (office, storage)', uom:'MO', qty:9, unit:1850, waste:0, sub:'Self', note:'' },
  { code:'01-540', desc:'Field office supervision', uom:'WK', qty:38, unit:3200, waste:0, sub:'Self', note:'' },

  { sec:'03 · Concrete' },
  { code:'03-310', desc:'4000 psi concrete, footings', uom:'CY', qty:214, unit:298, waste:.05, sub:'Ready-Mix NW', note:'Updated 12/02', flag:true },
  { code:'03-315', desc:'Slab on grade, 5″, reinforced', uom:'SF', qty:18400, unit:6.8, waste:.03, sub:'Self', note:'' },
  { code:'03-320', desc:'Tilt-up panels, 7¼″ w/ reveals', uom:'SF', qty:26800, unit:14.9, waste:.02, sub:'Pacific Tilt', note:'Quote exp. 12/15' },
  { code:'03-350', desc:'Rebar #5 grade 60', uom:'TN', qty:38.2, unit:2140, waste:.05, sub:'Harris Rebar', note:'' },

  { sec:'05 · Steel' },
  { code:'05-120', desc:'Structural steel, erected', uom:'TN', qty:164, unit:4680, waste:0, sub:'Metrowest Steel', note:'Quote 11/29' },
  { code:'05-310', desc:'Steel deck, 1.5″ B-22ga', uom:'SF', qty:42100, unit:3.4, waste:.04, sub:'Metrowest Steel', note:'', flag:true },
  { code:'05-500', desc:'Misc. metals (embeds, stairs)', uom:'LS', qty:1, unit:54000, waste:0, sub:'Metrowest Steel', note:'' },

  { sec:'07 · Thermal / Moisture' },
  { code:'07-220', desc:'Rigid roof insulation R-30', uom:'SF', qty:22400, unit:2.8, waste:.05, sub:'Garland NW', note:'' },
  { code:'07-540', desc:'TPO roof, 60mil, mech. fastened', uom:'SF', qty:22400, unit:7.4, waste:.03, sub:'Garland NW', note:'' },
  { code:'07-620', desc:'Sheet metal flashings', uom:'LF', qty:1840, unit:18.5, waste:.05, sub:'Self', note:'' },
];

function fmt(n){ if (n==null || isNaN(n)) return '—'; return '$'+Number(n).toLocaleString(undefined,{maximumFractionDigits:0}); }
function extended(r){ if (!r.qty) return 0; return r.qty * r.unit * (1 + (r.waste||0)); }

function EstimatorView() {
  const [tab, setTab] = uS_est('findings');

  const visibleRows = estRows;
  const subtotals = uM_est(() => {
    const m = {};
    let current = '—';
    visibleRows.forEach(r => {
      if (r.sec) { current = r.sec; m[current] = 0; return; }
      m[current] = (m[current]||0) + extended(r);
    });
    return m;
  }, []);

  const total = Object.values(subtotals).reduce((a,b)=>a+b,0);
  const oh = total * 0.08;
  const profit = total * 0.105;
  const bond = total * 0.012;
  const grand = total + oh + profit + bond;

  return (
    <div className="view active">
      {/* Subheader — bid meta + running totals */}
      <div style={{padding:'14px 24px',borderBottom:'1px solid var(--line)',background:'var(--paper)',display:'flex',alignItems:'center',gap:14}}>
        <div>
          <div className="row gap-sm" style={{marginBottom:4}}>
            <span className="chip accent"><span className="dot"></span>Pricing</span>
            <span className="chip">CMAR · GMP</span>
            <span className="chip">Healthcare</span>
            <span className="muted" style={{fontSize:11.5}}>Bid due <b style={{color:'var(--accent)'}}>Fri Dec 5 · 2:00p MT</b></span>
          </div>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:'-.02em'}}>Denver Regional Lab — TriState Mechanical <span className="muted" style={{fontSize:13,fontWeight:500,marginLeft:8}}>Bid #26-082 · v3 draft</span></div>
        </div>
        <div className="bid-totals">
          <div className="t"><span className="l">Direct cost</span><span className="v">{fmt(total)}</span></div>
          <div className="divider"></div>
          <div className="t"><span className="l">OH + Profit</span><span className="v">{fmt(oh+profit)}</span></div>
          <div className="divider"></div>
          <div className="t"><span className="l">Bond</span><span className="v">{fmt(bond)}</span></div>
          <div className="divider"></div>
          <div className="t main"><span className="l">Bid total</span><span className="v">{fmt(grand)}</span></div>
          <div className="divider"></div>
          <div className="t"><span className="l">GM %</span><span className="v">22.4%</span></div>
        </div>
      </div>

      {/* 3-pane: tree | grid | side panel */}
      <div style={{display:'grid',gridTemplateColumns:'220px 1fr 340px',height:'calc(100vh - 52px - 105px)',overflow:'hidden'}}>

        {/* Tree */}
        <aside style={{borderRight:'1px solid var(--line)',background:'var(--paper-2)',overflowY:'auto'}}>
          <div className="tree">
            <div className="grp-head">Divisions</div>
            {[
              {c:'01', n:'General Conditions', k:3, active:false},
              {c:'03', n:'Concrete', k:4, active:true},
              {c:'05', n:'Steel', k:3},
              {c:'07', n:'Thermal / Moisture', k:3},
              {c:'08', n:'Openings', k:0, muted:true},
              {c:'09', n:'Finishes', k:0, muted:true},
              {c:'22', n:'Plumbing', k:8},
              {c:'23', n:'HVAC', k:14},
              {c:'26', n:'Electrical', k:11},
            ].map((d,i)=>(
              <div key={i} className={`node ${d.active?'active':''}`} style={d.muted?{opacity:.5}:{}}>
                <span className="mk tnum">{d.c}</span>
                <span>{d.n}</span>
                <span className="count">{d.k||'—'}</span>
              </div>
            ))}
            <div className="grp-head">Saved views</div>
            <div className="node">★ Long-lead items</div>
            <div className="node">★ Self-perform only</div>
            <div className="node">★ Above $50k</div>
            <div className="grp-head">Alternates</div>
            <div className="node sub">Alt-1 · Clerestory</div>
            <div className="node sub active">Alt-2 · Exp. lab</div>
            <div className="node sub">Alt-3 · Backup gen</div>
          </div>
        </aside>

        {/* Grid */}
        <div style={{overflow:'auto',position:'relative'}}>
          <div style={{padding:'10px 14px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:8,background:'var(--paper)',position:'sticky',top:0,zIndex:5}}>
            <button className="btn sm"><Icon.plus/> Add line</button>
            <button className="btn sm">Insert from library</button>
            <button className="btn sm">Apply assembly</button>
            <div className="spacer"></div>
            <span className="muted" style={{fontSize:11.5}}>18 lines · 4 subs · 2 flags</span>
            <span className="chip warn"><span className="dot"></span>2 quotes expiring</span>
          </div>

          <table className="wf">
            <thead>
              <tr>
                <th style={{paddingLeft:16,width:70}}>Code</th>
                <th>Description</th>
                <th style={{width:60}} className="ctr">UOM</th>
                <th style={{width:90}} className="num">Qty</th>
                <th style={{width:100}} className="num">Unit $</th>
                <th style={{width:60}} className="num">W%</th>
                <th style={{width:130}}>Vendor / Sub</th>
                <th style={{width:130}} className="num" >Extended</th>
                <th style={{width:30}}></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r,i)=>{
                if (r.sec) {
                  const st = subtotals[r.sec] || 0;
                  return <tr key={i} className="sec"><td colSpan={9}>{r.sec} <span className="tot tnum">{fmt(st)}</span></td></tr>;
                }
                return (
                  <tr key={i}>
                    <td style={{paddingLeft:16}} className="tnum muted" title={r.code}><span style={{fontSize:11.5}}>{r.code}</span></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <input className="inline-inp" defaultValue={r.desc}/>
                      </div>
                      {r.note && <div className="muted" style={{fontSize:11,marginTop:1,paddingLeft:7}}>
                        {r.note}
                      </div>}
                    </td>
                    <td className="ctr"><span className="chip mono">{r.uom}</span></td>
                    <td className="num"><input className="inline-inp num tnum" defaultValue={r.qty.toLocaleString()}/></td>
                    <td className={`num ${r.flag?'hl':''}`}><input className="inline-inp num tnum" defaultValue={r.unit.toLocaleString(undefined,{minimumFractionDigits:r.unit<100?2:0, maximumFractionDigits:2})}/></td>
                    <td className="num muted tnum" style={{fontSize:11.5}}>{r.waste?`${Math.round(r.waste*100)}%`:'—'}</td>
                    <td><span className="chip" style={{maxWidth:115, overflow:'hidden', textOverflow:'ellipsis'}}>{r.sub}</span></td>
                    <td className="num tnum" style={{fontWeight:600}}>{fmt(extended(r))}</td>
                    <td className="ctr muted" style={{cursor:'pointer'}}>⋯</td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td colSpan={7} style={{paddingLeft:16,textTransform:'uppercase',fontSize:11,letterSpacing:'.08em'}}>Direct cost subtotal</td>
                <td className="num tnum" style={{fontSize:14}}>{fmt(total)}</td>
                <td></td>
              </tr>
              <tr><td colSpan={7} style={{paddingLeft:16,color:'var(--ink-3)'}}>Overhead (8.0%)</td><td className="num tnum">{fmt(oh)}</td><td></td></tr>
              <tr><td colSpan={7} style={{paddingLeft:16,color:'var(--ink-3)'}}>Profit (10.5%)</td><td className="num tnum">{fmt(profit)}</td><td></td></tr>
              <tr><td colSpan={7} style={{paddingLeft:16,color:'var(--ink-3)'}}>Bond (1.2%)</td><td className="num tnum">{fmt(bond)}</td><td></td></tr>
              <tr className="total-row"><td colSpan={7} style={{paddingLeft:16,fontSize:12}}>BID TOTAL</td><td className="num tnum" style={{fontSize:16,color:'var(--accent)'}}>{fmt(grand)}</td><td></td></tr>
            </tbody>
          </table>

          {/* floating hand-note anchored at the flagged concrete row */}
          <span className="annot" style={{position:'absolute',top:298,left:520}}>
            Ready-Mix quote<br/>updated — verify mix<br/>spec w/ Gabe ↗
          </span>
        </div>

        {/* Side panel */}
        <aside className="side">
          <div className="tabs">
            <button className={tab==='findings'?'active':''} onClick={()=>setTab('findings')}>Findings <span className="n">4</span></button>
            <button className={tab==='library'?'active':''} onClick={()=>setTab('library')}>Library</button>
            <button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>History</button>
            <button className={tab==='rfi'?'active':''} onClick={()=>setTab('rfi')}>RFIs <span className="n">2</span></button>
          </div>
          <div className="pane">
            {tab==='findings' && <>
              <div className="eyebrow mb-sm">Automatic checks</div>

              <div className="finding">
                <div className="t" style={{color:'var(--warn)'}}>⚠ Quote expiring soon</div>
                <div className="txt"><b>Ready-Mix NW</b> on 03-310 expires <b>Dec 15</b>. Your bid is due Fri Dec 5 (valid at submission, but under 30-day hold).</div>
                <div className="sug">Request an extension to Jan 30? Draft email prefilled with spec + qty.</div>
                <div className="acts"><button className="btn xs accent">Draft email</button><button className="btn xs">Pin</button><button className="btn xs ghost">Dismiss</button></div>
              </div>

              <div className="finding">
                <div className="t" style={{color:'var(--bad)'}}>! Price drift vs. library</div>
                <div className="txt"><b>05-310 Steel deck</b> is priced at <b>$3.40/SF</b> — <b>17% below</b> your library avg ($4.10) over last 6 mo.</div>
                <div className="sug">Confirm Metrowest quote is current. Adding $0.70/SF would lift bid ~$29.5k.</div>
                <div className="acts"><button className="btn xs">Open vendor</button><button className="btn xs">Compare</button><button className="btn xs ghost">OK as-is</button></div>
              </div>

              <div className="finding">
                <div className="t" style={{color:'var(--accent)'}}>↳ Missing scope?</div>
                <div className="txt">Bid form lists <b>firestopping</b> (07-840) and <b>joint sealants</b> (07-920). No matching lines in draft.</div>
                <div className="acts"><button className="btn xs accent">Add both</button><button className="btn xs">Review spec</button></div>
              </div>

              <div className="finding">
                <div className="t" style={{color:'var(--ok)'}}>✓ Bid form coverage</div>
                <div className="txt">All <b>Division 09</b> items referenced in the ITB are accounted for (17 of 17).</div>
              </div>
            </>}

            {tab==='library' && <>
              <div className="eyebrow mb-sm">Library · suggested lines</div>
              <div className="row gap-sm mb">
                <span className="chip solid">For 03 · Concrete</span>
                <span className="chip">Similar jobs</span>
              </div>
              {[
                { d:'Concrete sealer, penetrating', m:'03-350 · SF', avg:'$1.20', n:'used on 8 jobs' },
                { d:'Control joints, sawcut 1″', m:'03-150 · LF', avg:'$3.40', n:'used on 12 jobs' },
                { d:'Bollards, 6″ × 48″ filled', m:'03-170 · EA', avg:'$385', n:'used on 5 jobs' },
                { d:'Curb & gutter, standard', m:'03-210 · LF', avg:'$42.50', n:'used on 9 jobs' },
                { d:'Equipment pads, 6″', m:'03-316 · SF', avg:'$11.20', n:'used on 7 jobs' },
                { d:'Housekeeping pads, MEP', m:'03-317 · SF', avg:'$9.80', n:'used on 11 jobs' },
              ].map((l,i)=>(
                <div className="lib-row" key={i}>
                  <div className="d">{l.d}</div>
                  <div className="m"><span>{l.m}</span> · <b>{l.avg}</b> <span>· {l.n}</span></div>
                </div>
              ))}
            </>}

            {tab==='history' && <>
              <div className="eyebrow mb-sm">Same scope · prior bids</div>
              {[
                { job:'Meridian Bio Facility', qty:'Tilt-up · 24,200 SF', unit:'$14.20', when:'Awarded 08/25', win:true },
                { job:'Boise Tech Centre', qty:'Tilt-up · 31,000 SF', unit:'$13.85', when:'Lost 04/25', win:false },
                { job:'TVCC Welding Lab', qty:'Tilt-up · 11,400 SF', unit:'$15.90', when:'Awarded 11/24', win:true },
                { job:'Eagle Warehouse II', qty:'Tilt-up · 58,800 SF', unit:'$12.40', when:'Lost 09/24', win:false },
              ].map((h,i)=>(
                <div className="lib-row" key={i}>
                  <div className="d">{h.job} <span className={`chip ${h.win?'ok':'bad'}`} style={{marginLeft:4}}>{h.win?'Won':'Lost'}</span></div>
                  <div className="m"><span>{h.qty}</span> · <b>{h.unit}/SF</b> <span>· {h.when}</span></div>
                </div>
              ))}
              <div className="muted" style={{fontSize:11.5,marginTop:10,padding:'0 4px'}}>
                Current draft: <b>$14.90/SF</b> — 7.5% above 12-mo avg. May reflect tariff pass-through.
              </div>
            </>}

            {tab==='rfi' && <>
              <div className="eyebrow mb-sm">Open RFIs</div>
              <div className="finding">
                <div className="t" style={{color:'var(--accent)'}}>RFI-04 · Deck gauge</div>
                <div className="txt">Spec calls 22ga but details show 20ga at canopy. Resolution impacts 05-310 price.</div>
                <div className="sug">Sent 12/01 to TriState · no response. Follow-up drafted.</div>
              </div>
              <div className="finding">
                <div className="t" style={{color:'var(--accent)'}}>RFI-07 · Bond requirement</div>
                <div className="txt">PW labor rates referenced but project not on public funds list. Confirm bond basis.</div>
              </div>
            </>}
          </div>
          <div style={{padding:'10px 14px',borderTop:'1px solid var(--line)',background:'var(--paper-2)',display:'flex',gap:6}}>
            <button className="btn ghost sm">QC checklist (12)</button>
            <div style={{flex:1}}></div>
            <button className="btn sm">Export CSV</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

window.Views = Object.assign(window.Views || {}, { estimator: EstimatorView });
