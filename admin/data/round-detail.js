(()=>{
'use strict';


const BASE=
location.origin
+
'/supabase';


const KEY=
'sb_publishable_mZe5EwSSrSubPL5K5yvJcw_J8LjdiXN';


const ZODIAC={
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


let currentRoundFile=null;


function installRoundFileStyle(){

  if(
    document.getElementById(
      'jmtRoundFileStyle'
    )
  ){
    return;
  }


  const style=
  document.createElement(
    'style'
  );


  style.id=
  'jmtRoundFileStyle';


  style.textContent=`

.dcRoundRow{
  cursor:pointer
}

.dcRoundRow:active{
  transform:scale(.995)
}

.dcFile{
  text-align:left
}

.dcFileBack{
  width:100%;
  margin-bottom:12px;
  padding:12px;
  border-radius:12px;
  border:1px solid rgba(214,168,63,.20);
  background:#151515;
  color:#d9bf6e;
  font-size:12px;
  font-weight:900;
  cursor:pointer
}

.dcFileHead{
  padding:14px;
  border-radius:14px;
  background:#111112;
  border:1px solid rgba(214,168,63,.18);
  margin-bottom:12px
}

.dcFileTitle{
  color:#e9cd73;
  font-size:15px;
  font-weight:900
}

.dcFileMeta{
  margin-top:6px;
  color:#847c6d;
  font-size:10px;
  line-height:1.7
}

.dcFileTabs{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-bottom:12px
}

.dcFileTab{
  border:1px solid rgba(214,168,63,.16);
  background:#111112;
  color:#8e8676;
  border-radius:12px;
  padding:11px;
  font-size:11px;
  font-weight:900;
  cursor:pointer
}

.dcFileTab.active{
  color:#ebcf76;
  border-color:rgba(214,168,63,.48);
  background:#1b170e
}

.dcPersonList{
  display:grid;
  gap:9px
}

.dcPerson{
  padding:13px;
  border-radius:14px;
  background:#0e0e0f;
  border:1px solid rgba(255,255,255,.06)
}

.dcPersonTop{
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:flex-start
}

.dcPersonName{
  color:#e7cc79;
  font-size:13px;
  font-weight:900
}

.dcPersonCode{
  margin-top:4px;
  color:#7f786c;
  font-size:9px
}

.dcSource{
  flex:none;
  padding:5px 8px;
  border-radius:99px;
  background:#211b0c;
  color:#caae59;
  font-size:9px;
  font-weight:900
}

.dcPersonGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:7px;
  margin-top:10px
}

.dcPersonMoney{
  padding:9px;
  border-radius:10px;
  background:#121213
}

.dcPersonMoney small{
  display:block;
  color:#746e63;
  font-size:9px;
  margin-bottom:4px
}

.dcPersonMoney strong{
  display:block;
  color:#ddd1b7;
  font-size:12px;
  word-break:break-word
}

.dcEntryBox{
  margin-top:10px;
  padding:10px;
  border-radius:11px;
  background:#14120d;
  border:1px solid rgba(214,168,63,.12)
}

.dcEntryTitle{
  color:#a99455;
  font-size:10px;
  font-weight:900;
  margin-bottom:7px
}

.dcEntryList{
  display:grid;
  gap:5px
}

.dcEntry{
  display:flex;
  justify-content:space-between;
  gap:10px;
  color:#aaa08c;
  font-size:10px
}

.dcRecord{
  margin-top:9px;
  padding-top:9px;
  border-top:1px solid rgba(255,255,255,.05);
  color:#69645c;
  font-size:8px;
  line-height:1.7;
  word-break:break-all
}

.dcEmptyFile{
  padding:20px;
  text-align:center;
  color:#777064;
  font-size:11px
}

`;


  document.head.appendChild(
    style
  );

}


function esc(value){

  return String(
    value
    ??
    ''
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
      value
      ||
      0
    )
  );

}


function periodText(code){

  if(code==='1030'){
    return '上午 11:45';
  }


  if(code==='1530'){
    return '下午 15:45';
  }


  return code||'—';

}


function sourceText(row){

  if(
    row.source_type
    ===
    'agent'
  ){

    return (
      row.agent_name
      ?
      '代理 · '
      +
      row.agent_name
      :
      '代理客户'
    );

  }


  return '平台主管';

}


function statusText(status){

  return (
    {
      open:'开放中',
      settled:'已结算',
      closed:'已关闭',
      paid:'已完成',
      partial:'部分完成',
      pending:'待处理',
      approved:'已确认',
      rejected:'已驳回'
    }[status]
    ||
    status
    ||
    '—'
  );

}


function getToken(){

  return (
    localStorage.getItem(
      'jmt_access_token'
    )
    ||
    sessionStorage.getItem(
      'jmt_access_token'
    )
    ||
    ''
  );

}


async function rpc(
  name,
  body
){

  const res=
  await fetch(

    BASE
    +
    '/rest/v1/rpc/'
    +
    name,

    {

      method:'POST',

      headers:{

        apikey:KEY,

        Authorization:
        'Bearer '
        +
        getToken(),

        'Content-Type':
        'application/json'

      },

      body:
      JSON.stringify(
        body
      )

    }

  );


  const text=
  await res.text();


  let data=null;


  try{

    data=
    text
    ?
    JSON.parse(text)
    :
    null;

  }
  catch{

    data=text;

  }


  if(!res.ok){

    throw new Error(
      data?.message
      ||
      data?.error
      ||
      text
      ||
      'REQUEST_FAILED'
    );

  }


  return data;

}


async function loadEntries(
  roundId
){

  const params=
  new URLSearchParams({

    select:
    [
      'id',
      'order_id',
      'round_id',
      'customer_id',
      'number_code',
      'points',
      'pending_points',
      'confirmed_points'
    ]
    .join(','),

    round_id:
    'eq.'
    +
    roundId,

    order:
    'number_code.asc'

  });


  const res=
  await fetch(

    BASE
    +
    '/rest/v1/customer_round_entries?'
    +
    params.toString(),

    {

      headers:{

        apikey:KEY,

        Authorization:
        'Bearer '
        +
        getToken()

      }

    }

  );


  if(!res.ok){

    throw new Error(
      'ROUND_ENTRIES_LOAD_FAILED'
    );

  }


  const data=
  await res.json();


  return Array.isArray(data)
  ?
  data
  :
  [];

}


function normalizeDossier(data){

  if(
    Array.isArray(data)
  ){

    return (
      data[0]
      ?.admin_round_dossier
      ||
      data[0]
      ?.dossier
      ||
      data[0]
      ||
      null
    );

  }


  return (
    data
    ?.admin_round_dossier
    ||
    data
    ?.dossier
    ||
    data
    ||
    null
  );

}


function groupEntries(entries){

  const map=
  new Map();


  for(
    const row
    of
    entries
  ){

    const key=
    String(
      row.customer_id
      ||
      ''
    );


    if(!map.has(key)){

      map.set(
        key,
        []
      );

    }


    map.get(key)
    .push(row);

  }


  return map;

}


function customerHtml(
  row,
  entryMap
){

  const entries=
  entryMap.get(
    String(
      row.customer_id
      ||
      ''
    )
  )
  ||
  [];


  const entryHtml=
  entries.length
  ?
  entries
  .map(
    entry=>{

      const zodiac=
      ZODIAC[
        entry.number_code
      ]
      ||
      entry.number_code;


      return `

        <div class="dcEntry">

          <span>
            ${esc(zodiac)}
          </span>

          <span>
            下注 ${money(entry.points)}
            · confirmed ${money(entry.confirmed_points)}
            · pending ${money(entry.pending_points)}
          </span>

        </div>

      `;

    }
  )
  .join('')
  :
  '<div class="dcEntry">暂无下注明细</div>';


  return `

    <div class="dcPerson">

      <div class="dcPersonTop">

        <div>

          <div class="dcPersonName">
            ${esc(
              row.display_name
              ||
              row.username
              ||
              row.customer_code
              ||
              '未命名客户'
            )}
          </div>

          <div class="dcPersonCode">
            ${esc(row.customer_code||'—')}
            ·
            ${esc(row.username||'—')}
          </div>

        </div>


        <div class="dcSource">
          ${esc(sourceText(row))}
        </div>

      </div>


      <div class="dcPersonGrid">

        <div class="dcPersonMoney">
          <small>提交金额</small>
          <strong>${money(row.submitted_total)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>确认金额</small>
          <strong>${money(row.confirmed_total)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>待确认</small>
          <strong>${money(row.pending_total)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>付款记录</small>
          <strong>${Number(row.payment_count||0)} 笔</strong>
        </div>

        <div class="dcPersonMoney">
          <small>中奖点数</small>
          <strong>${money(row.winning_points)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>应派彩</small>
          <strong>${money(row.payout_due)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>已派彩</small>
          <strong>${money(row.payout_paid)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>待派彩</small>
          <strong>${money(row.payout_remaining)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>实际退款</small>
          <strong>${money(row.refunded_amount)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>退款待核对</small>
          <strong>${money(row.refund_remaining)}</strong>
        </div>

      </div>


      <div class="dcEntryBox">

        <div class="dcEntryTitle">
          本期下注明细
        </div>

        <div class="dcEntryList">
          ${entryHtml}
        </div>

      </div>


      <div class="dcRecord">

        订单记录：
        ${esc(row.order_id||'—')}

        <br>

        派彩记录：
        ${esc(row.settlement_id||'—')}

        <br>

        付款：
        已确认 ${Number(row.approved_payment_count||0)} 笔 /
        待审核 ${Number(row.pending_payment_count||0)} 笔 /
        已驳回 ${Number(row.rejected_payment_count||0)} 笔

        <br>

        已确认付款金额：
        ${money(row.approved_payment_amount)}

        · 待审核：
        ${money(row.pending_payment_amount)}

        · 已驳回：
        ${money(row.rejected_payment_amount)}

      </div>

    </div>

  `;

}


function agentHtml(row){

  return `

    <div class="dcPerson">

      <div class="dcPersonTop">

        <div>

          <div class="dcPersonName">
            ${esc(
              row.display_name
              ||
              row.referral_code
              ||
              '未命名代理'
            )}
          </div>

          <div class="dcPersonCode">
            推荐码：
            ${esc(row.referral_code||'—')}
          </div>

        </div>


        <div class="dcSource">
          ${esc(statusText(row.agent_status))}
        </div>

      </div>


      <div class="dcPersonGrid">

        <div class="dcPersonMoney">
          <small>本期客户</small>
          <strong>${Number(row.customer_count||0)} 人</strong>
        </div>

        <div class="dcPersonMoney">
          <small>confirmed 客户</small>
          <strong>${Number(row.confirmed_customer_count||0)} 人</strong>
        </div>

        <div class="dcPersonMoney">
          <small>客户提交总额</small>
          <strong>${money(row.submitted_total)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>客户确认总额</small>
          <strong>${money(row.confirmed_total)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>佣金比例快照</small>
          <strong>${money(row.commission_rate_snapshot)}%</strong>
        </div>

        <div class="dcPersonMoney">
          <small>应付佣金</small>
          <strong>${money(row.commission_due)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>已付佣金</small>
          <strong>${money(row.commission_paid)}</strong>
        </div>

        <div class="dcPersonMoney">
          <small>待付佣金</small>
          <strong>${money(row.commission_remaining)}</strong>
        </div>

      </div>


      <div class="dcRecord">

        代理记录：
        ${esc(row.agent_id||'—')}

        <br>

        佣金状态：
        ${esc(statusText(row.commission_status))}

      </div>

    </div>

  `;

}


function renderCustomers(){

  const host=
  document.getElementById(
    'dcRoundFileBody'
  );


  if(
    !host
    ||
    !currentRoundFile
  ){
    return;
  }


  const rows=
  Array.isArray(
    currentRoundFile.dossier
    ?.customer_rows
  )
  ?
  currentRoundFile.dossier
  .customer_rows
  :
  [];


  const entryMap=
  groupEntries(
    currentRoundFile.entries
  );


  if(!rows.length){

    host.innerHTML=
    '<div class="dcEmptyFile">本期没有客户记录。</div>';

    return;

  }


  host.innerHTML=
  '<div class="dcPersonList">'
  +
  rows
  .map(
    row=>
    customerHtml(
      row,
      entryMap
    )
  )
  .join('')
  +
  '</div>';

}


function renderAgents(){

  const host=
  document.getElementById(
    'dcRoundFileBody'
  );


  if(
    !host
    ||
    !currentRoundFile
  ){
    return;
  }


  const rows=
  Array.isArray(
    currentRoundFile.dossier
    ?.agent_rows
  )
  ?
  currentRoundFile.dossier
  .agent_rows
  :
  [];


  if(!rows.length){

    host.innerHTML=
    '<div class="dcEmptyFile">本期没有代理客户记录。</div>';

    return;

  }


  host.innerHTML=
  '<div class="dcPersonList">'
  +
  rows
  .map(
    agentHtml
  )
  .join('')
  +
  '</div>';

}


window.setDataRoundTab=
function(tab){

  const customerBtn=
  document.getElementById(
    'dcRoundTabCustomers'
  );


  const agentBtn=
  document.getElementById(
    'dcRoundTabAgents'
  );


  if(customerBtn){

    customerBtn.classList.toggle(
      'active',
      tab==='customers'
    );

  }


  if(agentBtn){

    agentBtn.classList.toggle(
      'active',
      tab==='agents'
    );

  }


  if(tab==='agents'){
    renderAgents();
  }
  else{
    renderCustomers();
  }

};


function renderRoundFile(){

  const detail=
  document.getElementById(
    'dcDetail'
  );


  if(
    !detail
    ||
    !currentRoundFile
  ){
    return;
  }


  const dossier=
  currentRoundFile.dossier;


  const round=
  dossier.round
  ||
  {};


  const result=
  round.result_number
  ?
  (
    ZODIAC[
      round.result_number
    ]
    ||
    round.result_number
  )
  :
  '未开奖';


  detail.innerHTML=`

    <div class="dcFile">

      <button
        class="dcFileBack"
        type="button"
        onclick="closeDataRoundFile()">
        ← 返回数据明细
      </button>


      <div class="dcFileHead">

        <div class="dcFileTitle">
          ${esc(round.round_date)}
          ·
          ${esc(periodText(round.round_code))}
        </div>

        <div class="dcFileMeta">

          状态：
          ${esc(statusText(round.status))}

          · 开奖：
          ${esc(result)}

          <br>

          本期客户：
          ${Number(dossier.customers?.customer_count||0)}

          · 确认金额：
          ${money(dossier.customers?.confirmed_total)}

        </div>

      </div>


      <div class="dcFileTabs">

        <button
          id="dcRoundTabCustomers"
          class="dcFileTab active"
          type="button"
          onclick="setDataRoundTab('customers')">

          客户明细

        </button>


        <button
          id="dcRoundTabAgents"
          class="dcFileTab"
          type="button"
          onclick="setDataRoundTab('agents')">

          代理明细

        </button>

      </div>


      <div id="dcRoundFileBody">
      </div>

    </div>

  `;


  renderCustomers();

}


window.openDataRoundFile=
async function(roundId){

  const detail=
  document.getElementById(
    'dcDetail'
  );


  if(!detail){
    return;
  }


  if(!roundId){

    detail.textContent=
    '缺少期数编号，无法打开明细。';

    return;

  }


  detail.innerHTML=
  '<div class="dcLoading">正在读取本期客户、代理及下注明细...</div>';


  try{

    const [
      dossierRaw,
      entries
    ]=
    await Promise.all([

      rpc(
        'admin_round_dossier',
        {
          p_round_id:
          roundId
        }
      ),

      loadEntries(
        roundId
      )

    ]);


    const dossier=
    normalizeDossier(
      dossierRaw
    );


    if(
      !dossier
      ||
      !dossier.round
    ){

      throw new Error(
        'ROUND_DOSSIER_INVALID_RESPONSE'
      );

    }


    currentRoundFile={
      roundId,
      dossier,
      entries
    };


    renderRoundFile();

  }
  catch(err){

    console.error(
      err
    );


    detail.textContent=
    String(
      err.message
      ||
      ''
    )
    .includes(
      'ADMIN_AAL2_REQUIRED'
    )
    ?
    '管理员二次验证已失效，请返回管理中心重新验证。'
    :
    '本期明细读取失败，请重新尝试。';

  }

};


window.closeDataRoundFile=
function(){

  currentRoundFile=null;


  if(
    typeof window.applyScope
    ===
    'function'
  ){

    window.applyScope();

  }

};


installRoundFileStyle();

})();
