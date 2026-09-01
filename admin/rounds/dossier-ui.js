(function(){

'use strict';


const ZODIAC = {
  '01':'鼠',
  '02':'牛',
  '03':'虎',
  '04':'兔',
  '05':'龙',
  '06':'蛇',
  '07':'马',
  '08':'羊',
  '09':'猴',
  '10':'鸡',
  '11':'狗',
  '12':'猪'
};


let dossier = null;


/* =========================
   STYLE
========================= */

const style =
document.createElement(
  'style'
);

style.textContent = `

#roundDossierMount{
  margin:0
}

.rd-tabs{
  display:flex;
  gap:7px;
  overflow-x:auto;
  margin-top:14px;
  padding-bottom:2px
}

.rd-tab{
  width:auto;
  min-width:72px;
  flex:none;
  padding:10px 13px;
  font-size:12px;
  border-radius:11px;
  border:1px solid rgba(214,168,63,.20);
  background:#151516;
  color:#998f7d
}

.rd-tab.active{
  background:#29210f;
  color:#efd477;
  border-color:rgba(214,168,63,.40)
}

.rd-panel{
  display:none;
  margin-top:14px
}

.rd-panel.active{
  display:block
}

.rd-summary{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px
}

.rd-box{
  background:#101011;
  border:1px solid rgba(255,255,255,.055);
  border-radius:14px;
  padding:13px;
  min-width:0
}

.rd-box small{
  display:block;
  color:#777064;
  font-size:10px;
  margin-bottom:6px
}

.rd-box strong{
  display:block;
  color:#e8cb72;
  font-size:16px;
  line-height:1.4;
  word-break:break-word
}

.rd-section{
  margin-top:14px
}

.rd-section-title{
  color:#cdb568;
  font-size:13px;
  font-weight:900;
  margin-bottom:9px
}

.rd-zodiac{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px
}

.rd-zodiac-item{
  padding:12px;
  border-radius:13px;
  background:#101011;
  border:1px solid rgba(255,255,255,.055)
}

.rd-zodiac-name{
  color:#e6ca72;
  font-weight:900;
  font-size:14px
}

.rd-zodiac-meta{
  color:#817a6d;
  font-size:10px;
  line-height:1.7;
  margin-top:6px
}

.rd-list{
  display:grid;
  gap:9px
}

.rd-item{
  background:#101011;
  border:1px solid rgba(255,255,255,.055);
  border-radius:14px;
  padding:13px
}

.rd-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px
}

.rd-name{
  color:#e9cd75;
  font-size:14px;
  font-weight:900
}

.rd-meta{
  color:#7e776b;
  font-size:10px;
  line-height:1.6;
  margin-top:4px
}

.rd-badge{
  flex:none;
  border-radius:99px;
  padding:5px 8px;
  background:#29220f;
  color:#d8bd69;
  font-size:9px;
  font-weight:900
}

.rd-row{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:7px 0;
  border-bottom:1px solid rgba(255,255,255,.045);
  font-size:11px
}

.rd-row:last-child{
  border-bottom:0
}

.rd-row span{
  color:#777064
}

.rd-row strong{
  color:#ddd2b9;
  text-align:right
}

.rd-empty{
  padding:22px 8px;
  text-align:center;
  color:#777064;
  font-size:11px
}

.rd-notice{
  margin-top:10px;
  padding:11px;
  border-radius:12px;
  background:#15120b;
  border:1px solid rgba(214,168,63,.15);
  color:#938976;
  font-size:10px;
  line-height:1.7
}

.rd-select-row{
  display:grid;
  grid-template-columns:1fr auto;
  gap:8px
}

.rd-select-row select{
  margin:0
}

.rd-load{
  width:auto;
  padding:13px 16px;
  font-size:12px
}

.rd-msg{
  min-height:17px;
  color:#817a6d;
  text-align:center;
  font-size:10px;
  margin-top:9px
}

@media(max-width:500px){

  .rd-select-row{
    grid-template-columns:1fr
  }

  .rd-load{
    width:100%
  }

}

`;

document.head.appendChild(
  style
);


/* =========================
   HELPERS
========================= */

function esc(value){

  return String(
    value ?? ''
  )
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#039;');

}


function money(value){

  return new Intl.NumberFormat(
    'en-US',
    {
      maximumFractionDigits:2
    }
  )
  .format(
    Number(
      value || 0
    )
  );

}


function statusText(value){

  const map = {

    open:'开放中',

    settled:'已结算',

    draft:'已保存',

    payment_pending:
    '付款审核中',

    confirmed:'已确认',

    locked:'已锁定',

    pending:'待处理',

    partial:'部分完成',

    paid:'已完成',

    refunded:'已退款',

    cancelled:'已结案',

    none:'无'

  };


  return (
    map[value]
    ||
    value
    ||
    '—'
  );

}


function periodText(code){

  if(code === '1030'){
    return '上午 11:45';
  }

  if(code === '1530'){
    return '下午 15:45';
  }

  return code || '—';

}


function mmtDateTime(value){

  if(!value){
    return '—';
  }


  try{

    return new Intl.DateTimeFormat(
      'zh-CN',
      {
        timeZone:'Asia/Yangon',
        year:'numeric',
        month:'2-digit',
        day:'2-digit',
        hour:'2-digit',
        minute:'2-digit',
        hour12:false
      }
    )
    .format(
      new Date(value)
    );

  }catch(e){

    return '—';

  }

}


function box(
  title,
  value
){

  return `
    <div class="rd-box">

      <small>
        ${esc(title)}
      </small>

      <strong>
        ${esc(value)}
      </strong>

    </div>
  `;

}


function row(
  title,
  value
){

  return `
    <div class="rd-row">

      <span>
        ${esc(title)}
      </span>

      <strong>
        ${esc(value)}
      </strong>

    </div>
  `;

}


/* =========================
   BUILD UI
========================= */

function buildUI(){

  const mount =
  document.getElementById(
    'roundDossierMount'
  );


  if(!mount){
    return false;
  }


    mount.innerHTML = `

    <div class="card">

      <div class="title">
        期数档案
      </div>

      <div class="rd-select-row">

        <select id="rdRoundSelect">

          <option value="">
            正在读取期数...
          </option>

        </select>

        <button
          class="gold rd-load"
          id="rdLoadBtn"
          type="button">
          查看本期
        </button>

      </div>


      <div
        id="rdMsg"
        class="rd-msg">
      </div>


      <div
        id="rdContent"
        style="display:none">


        <div class="rd-tabs">

          <button
            class="rd-tab active"
            data-tab="overview"
            type="button">
            本期
          </button>

          <button
            class="rd-tab"
            data-tab="payment"
            type="button">
            付款
          </button>

          <button
            class="rd-tab"
            data-tab="payout"
            type="button">
            派彩
          </button>

          <button
            class="rd-tab"
            data-tab="refund"
            type="button">
            退款
          </button>

          <button
            class="rd-tab"
            data-tab="commission"
            type="button">
            佣金
          </button>

          <button
            class="rd-tab"
            data-tab="zodiac"
            type="button">
            生肖
          </button>

          <button
            class="rd-tab"
            data-tab="customers"
            type="button">
            客户
          </button>

          <button
            class="rd-tab"
            data-tab="agents"
            type="button">
            代理
          </button>

        </div>


        <div
          id="rdPanelOverview"
          class="rd-panel active">
        </div>

        <div
          id="rdPanelPayment"
          class="rd-panel">
        </div>

        <div
          id="rdPanelPayout"
          class="rd-panel">
        </div>

        <div
          id="rdPanelRefund"
          class="rd-panel">
        </div>

        <div
          id="rdPanelCommission"
          class="rd-panel">
        </div>

        <div
          id="rdPanelZodiac"
          class="rd-panel">
        </div>

        <div
          id="rdPanelCustomers"
          class="rd-panel">
        </div>

        <div
          id="rdPanelAgents"
          class="rd-panel">
        </div>


      </div>


      <div class="rd-notice">

        本区只读取本期正式数据，
        不会修改付款、开奖、派彩、
        退款或代理佣金。

      </div>

    </div>

  `;


  document.getElementById(
    'rdLoadBtn'
  )
  .addEventListener(
    'click',
    loadDossier
  );


  document
  .querySelectorAll(
    '.rd-tab'
  )
  .forEach(
    btn=>{

      btn.addEventListener(
        'click',
        ()=>setTab(
          btn.dataset.tab
        )
      );

    }
  );


  return true;
}

/* =========================
   TABS
========================= */

function setTab(name){

  const ids = {

    overview:
    'rdPanelOverview',

    payment:
    'rdPanelPayment',

    payout:
    'rdPanelPayout',

    refund:
    'rdPanelRefund',

    commission:
    'rdPanelCommission',

    zodiac:
    'rdPanelZodiac',

    customers:
    'rdPanelCustomers',

    agents:
    'rdPanelAgents'

  };


  document
  .querySelectorAll(
    '.rd-tab'
  )
  .forEach(
    btn=>{

      btn.classList.toggle(
        'active',
        btn.dataset.tab === name
      );

    }
  );


  document
  .querySelectorAll(
    '.rd-panel'
  )
  .forEach(
    panel=>{

      const active =
      panel.id ===
      ids[name];


      panel.classList.toggle(
        'active',
        active
      );


      panel.style.display =
      active
      ?
      'block'
      :
      'none';

    }
  );

}


/* =========================
   ROUND LIST
========================= */

async function loadRoundList(){

  const res =
  await api(

    '/rest/v1/rounds'
    +
    '?select=id,round_date,round_code,status,result_number'
    +
    '&order=round_date.desc,round_code.desc'
    +
    '&limit=100'

  );


  if(!res.ok){

    throw new Error(
      await res.text()
    );

  }


  const rows =
  await res.json();


  const select =
  document.getElementById(
    'rdRoundSelect'
  );


  if(
    !Array.isArray(rows)
    ||
    !rows.length
  ){

    select.innerHTML =
    '<option value="">暂无期数</option>';

    return;

  }


  select.innerHTML =
  rows
  .map(
    r=>{

      const result =
      r.result_number
      ?
      ' · '
      +
      (
        ZODIAC[
          r.result_number
        ]
        ||
        r.result_number
      )
      :
      '';


      return `
        <option value="${esc(r.id)}">

          ${esc(r.round_date)}
          ·
          ${esc(periodText(r.round_code))}
          ·
          ${esc(statusText(r.status))}
          ${esc(result)}

        </option>
      `;

    }
  )
  .join('');


  if(currentRound?.id){

    select.value =
    currentRound.id;

  }


  await loadDossier();

}


/* =========================
   LOAD DOSSIER
========================= */

async function loadDossier(){

  const select =
  document.getElementById(
    'rdRoundSelect'
  );


  const roundId =
  select?.value;


  if(!roundId){
    return;
  }


  const btn =
  document.getElementById(
    'rdLoadBtn'
  );


  const msg =
  document.getElementById(
    'rdMsg'
  );


  btn.disabled =
  true;


  msg.textContent =
  '正在读取...';


  try{

    const res =
    await api(

      '/rest/v1/rpc/admin_round_dossier',

      {

        method:'POST',

        headers:{
          'Content-Type':
          'application/json'
        },

        body:
        JSON.stringify({
          p_round_id:
          roundId
        })

      }

    );


    const text =
    await res.text();


    let data = null;


    try{

      data =
      text
      ?
      JSON.parse(text)
      :
      null;

    }catch(e){

      data = null;

    }


    if(!res.ok){

      throw new Error(
        data?.message
        ||
        text
        ||
        '读取失败'
      );

    }


    dossier =
    data;


    render();


    document.getElementById(
      'rdContent'
    )
    .style.display =
    'block';


    msg.textContent =
    '✓ 已读取最新档案';

  }
  catch(e){

    console.error(e);


    msg.textContent =
    '读取失败：'
    +
    (
      String(
        e.message
        ||
        ''
      )
      .includes(
        'ADMIN_AAL2_REQUIRED'
      )
      ?
      '请返回总后台重新进行管理员验证'
      :
      e.message
    );

  }
  finally{

    btn.disabled =
    false;

  }

}


/* =========================
   RENDER
========================= */

function render(){

  if(
    !dossier
    ||
    !dossier.round
  ){
    return;
  }


  renderOverview();

  splitOverviewSections();

  renderZodiac();

  renderCustomers();

  renderAgents();

  setTab(
    'overview'
  );

}


/* =========================
   OVERVIEW
========================= */

function renderOverview(){

  const r =
  dossier.round || {};

  const c =
  dossier.customers || {};

  const p =
  dossier.payments || {};

  const pay =
  dossier.payouts || {};

  const rf =
  dossier.refunds || {};

  const co =
  dossier.commissions || {};


  const result =
  r.result_number
  ?
  (
    ZODIAC[
      r.result_number
    ]
    ||
    r.result_number
  )
  :
  '尚未开奖';


  document.getElementById(
    'rdPanelOverview'
  )
  .innerHTML = `


    <div class="rd-section">

      <div class="rd-section-title">
        本期资料
      </div>

      <div class="rd-summary">

        ${box(
          '日期',
          r.round_date || '—'
        )}

        ${box(
          '期数',
          periodText(
            r.round_code
          )
        )}

        ${box(
          '状态',
          statusText(
            r.status
          )
        )}

        ${box(
          '开奖结果',
          result
        )}

        ${box(
          '截止时间',
          mmtDateTime(
            r.deadline_at
          )
        )}

        ${box(
          '结算时间',
          mmtDateTime(
            r.settled_at
          )
        )}

      </div>

    </div>


    <div class="rd-section">

      <div class="rd-section-title">
        客户金额
      </div>

      <div class="rd-summary">

        ${box(
          '客户人数',
          money(
            c.customer_count
          )
        )}

        ${box(
          '已确认客户',
          money(
            c.confirmed_customer_count
          )
        )}

        ${box(
          '本期已确认',
          money(
            c.confirmed_total
          )
        )}

        ${box(
          '仍在审核',
          money(
            c.pending_total
          )
        )}

        ${box(
          '平台主管金额',
          money(
            c.platform_confirmed_total
          )
        )}

        ${box(
          '代理客户金额',
          money(
            c.agent_confirmed_total
          )
        )}

      </div>

    </div>


    <div class="rd-section">

      <div class="rd-section-title">
        付款审核
      </div>

      <div class="rd-summary">

        ${box(
          '已确认到账',
          money(
            p.approved_amount
          )
        )}

        ${box(
          '确认笔数',
          money(
            p.approved_count
          )
        )}

        ${box(
          '审核中金额',
          money(
            p.pending_amount
          )
        )}

        ${box(
          '审核中笔数',
          money(
            p.pending_count
          )
        )}

        ${box(
          '驳回金额',
          money(
            p.rejected_amount
          )
        )}

        ${box(
          '驳回笔数',
          money(
            p.rejected_count
          )
        )}

      </div>

    </div>


    <div class="rd-section">

      <div class="rd-section-title">
        中奖与派彩
      </div>

      <div class="rd-summary">

        ${box(
          '中奖客户',
          money(
            pay.winner_count
          )
        )}

        ${box(
          '中奖本金',
          money(
            pay.winning_points
          )
        )}

        ${box(
          '应派彩',
          money(
            pay.payout_due
          )
        )}

        ${box(
          '已派彩',
          money(
            pay.payout_paid
          )
        )}

        ${box(
          '剩余待派',
          money(
            pay.payout_remaining
          )
        )}

      </div>

    </div>


    <div class="rd-section">

      <div class="rd-section-title">
        退款
      </div>

      <div class="rd-summary">

        ${box(
          '候选金额',
          money(
            rf.candidate_amount
          )
        )}

        ${box(
          '实际退款',
          money(
            rf.refunded_amount
          )
        )}

        ${box(
          '仍待核对',
          money(
            rf.remaining_amount
          )
        )}

        ${box(
          '未结案',
          money(
            rf.unresolved_count
          )
        )}

      </div>

      <div class="rd-notice">
        候选金额不代表实际退款。
        真正资金流出只看“实际退款”。
      </div>

    </div>


    <div class="rd-section">

      <div class="rd-section-title">
        代理佣金
      </div>

      <div class="rd-summary">

        ${box(
          '本期代理',
          money(
            co.agent_count
          )
        )}

        ${box(
          '应付佣金',
          money(
            co.commission_due
          )
        )}

        ${box(
          '已付佣金',
          money(
            co.commission_paid
          )
        )}

        ${box(
          '剩余佣金',
          money(
            co.commission_remaining
          )
        )}

      </div>

    </div>

  `;

}
/* =========================
   SPLIT OVERVIEW
========================= */

function splitOverviewSections(){

  const overview =
  document.getElementById(
    'rdPanelOverview'
  );


  const payment =
  document.getElementById(
    'rdPanelPayment'
  );


  const payout =
  document.getElementById(
    'rdPanelPayout'
  );


  const refund =
  document.getElementById(
    'rdPanelRefund'
  );


  const commission =
  document.getElementById(
    'rdPanelCommission'
  );


  if(
    !overview
    ||
    !payment
    ||
    !payout
    ||
    !refund
    ||
    !commission
  ){
    return;
  }


  const sections =
  Array.from(
    overview.querySelectorAll(
      ':scope > .rd-section'
    )
  );


  /*
    renderOverview 当前顺序：

    0 本期资料
    1 客户金额
    2 付款审核
    3 中奖与派彩
    4 退款
    5 代理佣金
  */


  payment.innerHTML =
  '';


  payout.innerHTML =
  '';


  refund.innerHTML =
  '';


  commission.innerHTML =
  '';


  if(sections[2]){

    payment.appendChild(
      sections[2]
    );

  }


  if(sections[3]){

    payout.appendChild(
      sections[3]
    );

  }


  if(sections[4]){

    refund.appendChild(
      sections[4]
    );

  }


  if(sections[5]){

    commission.appendChild(
      sections[5]
    );

  }

}

/* =========================
   ZODIAC
========================= */

function renderZodiac(){

  const rows =
  Array.isArray(
    dossier.zodiac
  )
  ?
  dossier.zodiac
  :
  [];


  const el =
  document.getElementById(
    'rdPanelZodiac'
  );


  if(!rows.length){

    el.innerHTML =
    '<div class="rd-empty">本期暂无生肖数据</div>';

    return;

  }


  el.innerHTML = `

    <div class="rd-zodiac">

      ${
        rows.map(
          r=>`

            <div class="rd-zodiac-item">

              <div class="rd-zodiac-name">

                ${
                  esc(
                    ZODIAC[
                      r.number_code
                    ]
                    ||
                    r.number_code
                  )
                }

              </div>

              <div class="rd-zodiac-meta">

                已确认：
                ${money(
                  r.confirmed_total
                )}

                <br>

                审核中：
                ${money(
                  r.pending_total
                )}

                <br>

                已确认客户：
                ${money(
                  r.confirmed_customer_count
                )}

              </div>

            </div>

          `
        )
        .join('')
      }

    </div>

  `;

}


/* =========================
   CUSTOMERS
========================= */

function renderCustomers(){

  const rows =
  Array.isArray(
    dossier.customer_rows
  )
  ?
  dossier.customer_rows
  :
  [];


  const el =
  document.getElementById(
    'rdPanelCustomers'
  );


  if(!rows.length){

    el.innerHTML =
    '<div class="rd-empty">本期暂无客户记录</div>';

    return;

  }


  el.innerHTML = `

    <div class="rd-list">

      ${
        rows.map(
          r=>{

            const source =
            r.source_type
            ===
            'platform'
            ?
            '平台主管'
            :
            (
              r.agent_name
              ||
              '代理客户'
            );


            return `

              <div class="rd-item">

                <div class="rd-head">

                  <div>

                    <div class="rd-name">

                      ${
                        esc(
                          r.display_name
                          ||
                          r.customer_code
                          ||
                          '客户'
                        )
                      }

                    </div>

                    <div class="rd-meta">

                      ${
                        esc(
                          r.customer_code
                          ||
                          '—'
                        )
                      }

                    </div>

                  </div>

                  <div class="rd-badge">
                    ${esc(source)}
                  </div>

                </div>


                <div style="margin-top:9px">

                  ${row(
                    '下注总额',
                    money(
                      r.submitted_total
                    )
                  )}

                  ${row(
                    '已确认',
                    money(
                      r.confirmed_total
                    )
                  )}

                  ${row(
                    '审核中',
                    money(
                      r.pending_total
                    )
                  )}

                  ${row(
                    '订单状态',
                    statusText(
                      r.order_status
                    )
                  )}

                  ${row(
                    '中奖本金',
                    money(
                      r.winning_points
                    )
                  )}

                  ${row(
                    '应派彩',
                    money(
                      r.payout_due
                    )
                  )}

                  ${row(
                    '已派彩',
                    money(
                      r.payout_paid
                    )
                  )}

                  ${row(
                    '剩余待派',
                    money(
                      r.payout_remaining
                    )
                  )}

                  ${row(
                    '实际退款',
                    money(
                      r.refunded_amount
                    )
                  )}

                </div>

              </div>

            `;

          }
        )
        .join('')
      }

    </div>

  `;

}


/* =========================
   AGENTS
========================= */

function renderAgents(){

  const rows =
  Array.isArray(
    dossier.agent_rows
  )
  ?
  dossier.agent_rows
  :
  [];


  const el =
  document.getElementById(
    'rdPanelAgents'
  );


  if(!rows.length){

    el.innerHTML =
    '<div class="rd-empty">本期没有代理客户</div>';

    return;

  }


  el.innerHTML = `

    <div class="rd-list">

      ${
        rows.map(
          r=>`

            <div class="rd-item">

              <div class="rd-head">

                <div>

                  <div class="rd-name">

                    ${
                      esc(
                        r.display_name
                        ||
                        '代理'
                      )
                    }

                  </div>

                  <div class="rd-meta">

                    推荐码：
                    ${
                      esc(
                        r.referral_code
                        ||
                        '—'
                      )
                    }

                  </div>

                </div>

                <div class="rd-badge">

                  ${
                    esc(
                      statusText(
                        r.commission_status
                      )
                    )
                  }

                </div>

              </div>


              <div style="margin-top:9px">

                ${row(
                  '本期客户',
                  money(
                    r.customer_count
                  )
                )}

                ${row(
                  '已确认客户',
                  money(
                    r.confirmed_customer_count
                  )
                )}

                ${row(
                  '客户已确认金额',
                  money(
                    r.confirmed_total
                  )
                )}

                ${row(
                  '审核中金额',
                  money(
                    r.pending_total
                  )
                )}

                ${row(
                  '佣金比例',
                  money(
                    r.commission_rate_snapshot
                  )
                  +
                  '%'
                )}

                ${row(
                  '应付佣金',
                  money(
                    r.commission_due
                  )
                )}

                ${row(
                  '已付佣金',
                  money(
                    r.commission_paid
                  )
                )}

                ${row(
                  '剩余佣金',
                  money(
                    r.commission_remaining
                  )
                )}

              </div>

            </div>

          `
        )
        .join('')
      }

    </div>

  `;

}


/* =========================
   INIT
========================= */

async function init(){

  if(!buildUI()){
    return;
  }


  try{

    await loadRoundList();

  }catch(e){

    console.error(e);


    const msg =
    document.getElementById(
      'rdMsg'
    );


    if(msg){

      msg.textContent =
      '期数档案读取失败，请刷新页面重试';

    }

  }

}


setTimeout(
  init,
  500
);


})();
