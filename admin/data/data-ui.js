(()=>{
'use strict';

const BASE=location.origin+'/supabase';

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

let token=
localStorage.getItem(
  'jmt_access_token'
)
||
sessionStorage.getItem(
  'jmt_access_token'
)
||
'';

let refreshToken=
localStorage.getItem(
  'jmt_refresh_token'
)
||
sessionStorage.getItem(
  'jmt_refresh_token'
)
||
'';

let refreshPromise=null;


function installStyle(){

  if(
    document.getElementById(
      'jmtDataCenterLiveStyle'
    )
  ){
    return;
  }

  const style=
  document.createElement(
    'style'
  );

  style.id=
  'jmtDataCenterLiveStyle';

  style.textContent=`

.dcDetailList{
  display:grid;
  gap:9px;
  text-align:left
}

.dcRoundRow{
  padding:13px;
  border-radius:14px;
  background:#0e0e0f;
  border:1px solid rgba(214,168,63,.16)
}

.dcRoundTop{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px
}

.dcRoundName{
  color:#e8cc74;
  font-size:13px;
  font-weight:900
}

.dcRoundMeta{
  margin-top:4px;
  color:#7f786b;
  font-size:10px
}

.dcBadge{
  flex:none;
  padding:5px 8px;
  border-radius:99px;
  background:#26210f;
  color:#d6bb67;
  font-size:9px;
  font-weight:900
}

.dcMoneyGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:7px;
  margin-top:10px
}

.dcMoney{
  padding:9px;
  border-radius:10px;
  background:#121213
}

.dcMoney small{
  display:block;
  color:#777064;
  font-size:9px;
  margin-bottom:4px
}

.dcMoney strong{
  display:block;
  color:#ddd2ba;
  font-size:12px;
  word-break:break-word
}

.dcMoney strong.good{
  color:#78d5a0
}

.dcMoney strong.bad{
  color:#e49c96
}

.dcLoading{
  text-align:center;
  color:#8b8374;
  padding:18px 8px
}

`;

  document.head.appendChild(
    style
  );

}


function saveSession(data){

  if(data?.access_token){

    token=
    data.access_token;

    localStorage.setItem(
      'jmt_access_token',
      token
    );

    sessionStorage.setItem(
      'jmt_access_token',
      token
    );

  }


  if(data?.refresh_token){

    refreshToken=
    data.refresh_token;

    localStorage.setItem(
      'jmt_refresh_token',
      refreshToken
    );

    sessionStorage.setItem(
      'jmt_refresh_token',
      refreshToken
    );

  }

}


async function refreshAdminSession(){

  if(!refreshToken){
    return false;
  }


  if(refreshPromise){
    return refreshPromise;
  }


  refreshPromise=
  (
    async()=>{

      try{

        const res=
        await fetch(

          BASE
          +
          '/auth/v1/token?grant_type=refresh_token',

          {

            method:'POST',

            headers:{
              apikey:KEY,
              'Content-Type':
              'application/json'
            },

            body:
            JSON.stringify({
              refresh_token:
              refreshToken
            })

          }

        );


        if(!res.ok){
          return false;
        }


        const data=
        await res.json();


        if(!data.access_token){
          return false;
        }


        saveSession(
          data
        );


        return true;

      }
      catch{

        return false;

      }
      finally{

        refreshPromise=null;

      }

    }
  )();


  return refreshPromise;

}


async function api(
  path,
  options={}
){

  const request=
  ()=>fetch(

    BASE
    +
    path,

    {

      ...options,

      headers:{

        apikey:KEY,

        Authorization:
        'Bearer '
        +
        token,

        ...(
          options.headers
          ||
          {}
        )

      }

    }

  );


  let res=
  await request();


  if(res.status!==401){
    return res;
  }


  if(
    !await refreshAdminSession()
  ){
    return res;
  }


  return request();

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


function setText(
  id,
  value
){

  const el=
  document.getElementById(
    id
  );


  if(el){
    el.textContent=value;
  }

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


function statusText(status){

  return (
    {
      open:'开放中',
      settled:'已结算',
      closed:'已关闭'
    }[status]
    ||
    status
    ||
    '—'
  );

}


function lastDayOfMonth(
  monthValue
){

  const match=
  /^(\d{4})-(\d{2})$/
  .exec(
    monthValue
    ||
    ''
  );


  if(!match){
    return null;
  }


  const day=
  new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]),
      0
    )
  )
  .getUTCDate();


  return (
    monthValue
    +
    '-'
    +
    String(day)
    .padStart(
      2,
      '0'
    )
  );

}


function scopeRequest(){

  if(
    currentScope
    ===
    'round'
  ){

    const date=
    document.getElementById(
      'roundDate'
    )
    .value;


    const code=
    document.getElementById(
      'roundCode'
    )
    .value;


    if(!date){
      throw new Error(
        'DATE_REQUIRED'
      );
    }


    return {
      start:date,
      end:date,
      roundCode:code,
      title:
      date
      +
      ' · '
      +
      periodText(code)
    };

  }


  if(
    currentScope
    ===
    'day'
  ){

    const date=
    document.getElementById(
      'dayDate'
    )
    .value;


    if(!date){
      throw new Error(
        'DATE_REQUIRED'
      );
    }


    return {
      start:date,
      end:date,
      roundCode:null,
      title:
      date
      +
      ' · 当天两期'
    };

  }


  if(
    currentScope
    ===
    'month'
  ){

    const month=
    document.getElementById(
      'monthDate'
    )
    .value;


    if(!month){
      throw new Error(
        'MONTH_REQUIRED'
      );
    }


    return {
      start:
      month
      +
      '-01',

      end:
      lastDayOfMonth(
        month
      ),

      roundCode:null,

      title:
      month
      +
      ' · 本月'
    };

  }


  const start=
  document.getElementById(
    'customStart'
  )
  .value;


  const end=
  document.getElementById(
    'customEnd'
  )
  .value;


  if(
    !start
    ||
    !end
  ){

    throw new Error(
      'DATE_RANGE_REQUIRED'
    );

  }


  if(start>end){

    throw new Error(
      'INVALID_DATE_RANGE'
    );

  }


  return {
    start,
    end,
    roundCode:null,
    title:
    start
    +
    ' ～ '
    +
    end
  };

}


function normalizeRpcData(data){

  if(
    Array.isArray(data)
  ){

    return (
      data[0]
      ?.admin_data_center_summary
      ||
      data[0]
      ||
      null
    );

  }


  return (
    data
    ?.admin_data_center_summary
    ||
    data
    ||
    null
  );

}


function renderSummary(data){

  const s=
  data?.summary
  ||
  {};


  setText(
    'dcPlatformConfirmed',
    money(
      s.platform_confirmed_total
    )
  );


  setText(
    'dcAgentConfirmed',
    money(
      s.agent_customer_confirmed_total
    )
  );


  setText(
    'dcConfirmedTotal',
    money(
      s.confirmed_total
    )
  );


  setText(
    'dcPayoutPaid',
    money(
      s.customer_payout_paid
    )
  );


  setText(
    'dcCommissionPaid',
    money(
      s.agent_commission_paid
    )
  );


  setText(
    'dcRefundPaid',
    money(
      s.refund_paid
    )
  );


  setText(
    'dcActualOutflow',
    money(
      s.actual_outflow
    )
  );


  setText(
    'dcPayoutRemaining',
    money(
      s.customer_payout_remaining
    )
  );


  setText(
    'dcCommissionRemaining',
    money(
      s.agent_commission_remaining
    )
  );


  setText(
    'dcRefundRemaining',
    money(
      s.refund_review_remaining
    )
  );


  setText(
    'dcRoundCount',
    String(
      Number(
        s.round_count
        ||
        0
      )
    )
  );


  setText(
    'dcCustomerCount',
    String(
      Number(
        s.customer_count
        ||
        0
      )
    )
  );


  const net=
  Number(
    s.net_inflow
    ||
    0
  );


  const netEl=
  document.getElementById(
    'dcNetInflow'
  );


  if(netEl){

    netEl.textContent=
    money(net);


    netEl.style.color=
    net<0
    ?
    '#e49c96'
    :
    '#78d5a0';

  }

}


function roundRowHtml(row){

  const net=
  Number(
    row.net_inflow
    ||
    0
  );


  const result=
  row.result_number
  ?
  (
    ' · 开奖 '
    +
    (
      ZODIAC[
        row.result_number
      ]
      ||
      row.result_number
    )
  )
  :
  '';


  return `

        <div class="dcRoundRow" role="button" tabindex="0" onclick="openDataRoundFile('${esc(row.round_id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openDataRoundFile('${esc(row.round_id)}')}">

      <div class="dcRoundTop">

        <div>

          <div class="dcRoundName">
            ${esc(row.round_date)} · ${esc(periodText(row.round_code))}
          </div>

          <div class="dcRoundMeta">
            ${esc(statusText(row.status))}${esc(result)}
          </div>

        </div>

        <div class="dcBadge">
          ${Number(row.customer_count||0)} 人次
        </div>

      </div>


      <div class="dcMoneyGrid">

        <div class="dcMoney">
          <small>确认收入</small>
          <strong>${money(row.confirmed_total)}</strong>
        </div>

        <div class="dcMoney">
          <small>客户派彩</small>
          <strong>${money(row.payout_paid)}</strong>
        </div>

        <div class="dcMoney">
          <small>代理佣金</small>
          <strong>${money(row.commission_paid)}</strong>
        </div>

        <div class="dcMoney">
          <small>实际退款</small>
          <strong>${money(row.refunded_amount)}</strong>
        </div>

        <div class="dcMoney">
          <small>实际支出</small>
          <strong>${money(row.actual_outflow)}</strong>
        </div>

        <div class="dcMoney">
          <small>净流入</small>
          <strong class="${net<0?'bad':'good'}">
            ${money(net)}
          </strong>
        </div>

      </div>

    </div>

  `;

}


function renderDetails(data){

  const el=
  document.getElementById(
    'dcDetail'
  );


  if(!el){
    return;
  }


  const rows=
  Array.isArray(
    data?.round_rows
  )
  ?
  data.round_rows
  :
  [];


  if(!rows.length){

    el.textContent=
    '这个范围目前没有期数数据。';

    return;

  }


  el.innerHTML=
  '<div class="dcDetailList">'
  +
  rows
  .map(
    roundRowHtml
  )
  .join('')
  +
  '</div>';

}


function renderError(message){

  const text=
  String(
    message
    ||
    ''
  );


  let output=
  '数据读取失败，请重新尝试。';


  if(
    text.includes(
      'ADMIN_AAL2_REQUIRED'
    )
  ){

    output=
    '管理员二次验证已经失效，请返回管理中心重新验证。';

  }
  else if(
    text.includes(
      'DATE_REQUIRED'
    )
    ||
    text.includes(
      'MONTH_REQUIRED'
    )
    ||
    text.includes(
      'DATE_RANGE_REQUIRED'
    )
  ){

    output=
    '请选择完整的数据日期范围。';

  }
  else if(
    text.includes(
      'INVALID_DATE_RANGE'
    )
  ){

    output=
    '开始日期不能晚于结束日期。';

  }


  const detail=
  document.getElementById(
    'dcDetail'
  );


  if(detail){
    detail.textContent=output;
  }

}


window.applyScope=
async function(){

  const detail=
  document.getElementById(
    'dcDetail'
  );


  try{

    const request=
    scopeRequest();


    setText(
      'scopeTitle',
      request.title
    );


    if(detail){

      detail.innerHTML=
      '<div class="dcLoading">正在读取正式资金数据...</div>';

    }


    const res=
    await api(

      '/rest/v1/rpc/admin_data_center_summary',

      {

        method:'POST',

        headers:{
          'Content-Type':
          'application/json'
        },

        body:
        JSON.stringify({

          p_start_date:
          request.start,

          p_end_date:
          request.end,

          p_round_code:
          request.roundCode

        })

      }

    );


    const text=
    await res.text();


    let parsed=null;


    try{

      parsed=
      text
      ?
      JSON.parse(text)
      :
      null;

    }
    catch{

      parsed=text;

    }


    if(!res.ok){

      throw new Error(

        parsed?.message
        ||
        parsed?.error
        ||
        text
        ||
        'REQUEST_FAILED'

      );

    }


    const data=
    normalizeRpcData(
      parsed
    );


    if(
      !data
      ||
      !data.summary
      ||
      !Array.isArray(
        data.round_rows
      )
    ){

      throw new Error(
        'DATA_CENTER_INVALID_RESPONSE'
      );

    }


    renderSummary(
      data
    );


    renderDetails(
      data
    );

  }
  catch(err){

    console.error(
      err
    );


    renderError(
      err.message
    );

  }

};


function install(){

  installStyle();


  setTimeout(
    ()=>{
      window.applyScope();
    },
    150
  );

}


install();

})();
