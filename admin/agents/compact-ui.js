(()=>{
'use strict';

/*
  JMT Admin Agent Center
  Compact UI Layer

  只负责：
  - 收起创建代理表单
  - 紧凑代理列表
  - 代理列表分页
  - 代理档案分类标签
  - 客户分页
  - 佣金历史分页

  不修改：
  - Supabase 查询
  - 代理状态 RPC
  - 佣金计算
  - 收款账户
  - Admin 解锁
  - 佣金支付
*/

let agentListPage = 1;
let agentCustomerPage = 1;
let agentCommissionPage = 1;
let selectedAgentTab = 'basic';

let lastAgentSearch = '';

const AGENT_PAGE_SIZE = 12;
const CUSTOMER_PAGE_SIZE = 10;
const COMMISSION_PAGE_SIZE = 6;


/* =====================================
   STYLE
===================================== */

function installCompactStyle(){

  if(
    document.getElementById(
      'jmtAgentCompactStyle'
    )
  ){
    return;
  }


  const style =
  document.createElement(
    'style'
  );


  style.id =
  'jmtAgentCompactStyle';


  style.textContent = `

.agentCompactToolbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:10px;
}

.agentCompactToolbar strong{
  color:#e3c873;
  font-size:13px;
}

.agentCompactToolbar span{
  color:#80796c;
  font-size:10px;
}

.agentCompactRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:13px 14px;
  margin-top:8px;
  border-radius:15px;
  background:#0f0f10;
  border:1px solid rgba(214,168,63,.16);
  cursor:pointer;
}

.agentCompactRow:active{
  background:#17140d;
}

.agentCompactMain{
  min-width:0;
  flex:1;
}

.agentCompactNameLine{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
}

.agentCompactName{
  color:#efd477;
  font-size:15px;
  font-weight:900;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.agentCompactCode{
  color:#817968;
  font-size:10px;
  margin-top:4px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.agentCompactStats{
  display:flex;
  flex-wrap:wrap;
  gap:5px 11px;
  margin-top:7px;
  color:#8e8678;
  font-size:10px;
}

.agentCompactStats strong{
  color:#d7c17c;
  font-weight:800;
}

.agentCompactArrow{
  flex:none;
  color:#d8bf73;
  font-size:20px;
  padding-left:4px;
}

.compactPager{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:8px;
  margin-top:14px;
}

.compactPager button{
  margin:0;
}

.compactPager span{
  color:#8d8577;
  font-size:11px;
  text-align:center;
  white-space:nowrap;
}

.createAgentToggle{
  margin-bottom:15px;
}

.createAgentToggle button{
  background:#171718;
  color:#e0c66f;
  border:1px solid rgba(214,168,63,.24);
}

.agentTabs{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:7px;
  margin-top:14px;
  margin-bottom:15px;
}

.agentTab{
  background:#131314;
  color:#8f8778;
  border:1px solid rgba(214,168,63,.14);
  padding:11px 5px;
  font-size:11px;
}

.agentTab.active{
  background:linear-gradient(
    180deg,
    #2b2210,
    #17140c
  );
  color:#efd477;
  border-color:rgba(214,168,63,.50);
}

.agentTabPanel{
  min-height:120px;
}

.agentBasicBlock{
  padding:13px;
  border-radius:14px;
  background:#101011;
  border:1px solid rgba(255,255,255,.055);
  margin-top:9px;
}

.agentBasicLabel{
  color:#81796b;
  font-size:10px;
  margin-bottom:5px;
}

.agentBasicValue{
  color:#e8dfca;
  font-size:13px;
  line-height:1.55;
  word-break:break-word;
}

.agentSectionIntro{
  color:#847d6f;
  font-size:11px;
  line-height:1.65;
  margin-bottom:10px;
}

.agentMiniSummary{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:8px;
  margin-bottom:13px;
}

.agentMiniBox{
  padding:11px;
  border-radius:12px;
  background:#101011;
  border:1px solid rgba(255,255,255,.05);
}

.agentMiniBox small{
  display:block;
  color:#777166;
  font-size:9px;
  margin-bottom:5px;
}

.agentMiniBox strong{
  display:block;
  color:#ecd176;
  font-size:14px;
  word-break:break-word;
}

.customerCompactLine{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:12px;
  margin-top:8px;
  border-radius:13px;
  background:#111112;
  border:1px solid rgba(255,255,255,.055);
}

.customerCompactLine .left{
  min-width:0;
  flex:1;
}

.customerCompactLine .customerNameSmall{
  color:#e7cb74;
  font-size:13px;
  font-weight:900;
}

.customerCompactLine .customerMetaSmall{
  color:#80796c;
  font-size:10px;
  line-height:1.55;
  margin-top:4px;
}

.agentDetailHeader{
  padding:13px;
  border-radius:15px;
  background:#101011;
  border:1px solid rgba(214,168,63,.16);
}

.agentDetailHeaderTop{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
}

.agentDetailQuick{
  display:flex;
  flex-wrap:wrap;
  gap:8px 14px;
  margin-top:9px;
  color:#898174;
  font-size:10px;
}

.agentDetailQuick strong{
  color:#d8c078;
}

@media(max-width:700px){

  .agentTabs{
    grid-template-columns:1fr 1fr;
  }

  .agentMiniSummary{
    grid-template-columns:1fr 1fr;
  }

}

`;


  document.head.appendChild(
    style
  );

}


/* =====================================
   CREATE FORM COLLAPSE
===================================== */

function installCreateToggle(){

  const createCard =
  document.getElementById(
    'createCard'
  );


  if(
    !createCard
    ||
    document.getElementById(
      'createAgentToggle'
    )
  ){
    return;
  }


  createCard.style.display =
  'none';


  const box =
  document.createElement(
    'div'
  );


  box.id =
  'createAgentToggle';


  box.className =
  'createAgentToggle';


  box.innerHTML = `

    <button
      type="button"
      onclick="toggleCreateAgentForm()">

      ＋ 创建新代理

    </button>

  `;


  createCard.parentNode.insertBefore(
    box,
    createCard
  );

}


window.toggleCreateAgentForm =
function(){

  const card =
  document.getElementById(
    'createCard'
  );


  const button =
  document.querySelector(
    '#createAgentToggle button'
  );


  if(
    !card
    ||
    !button
  ){
    return;
  }


  const opening =
  card.style.display
  ===
  'none';


  card.style.display =
  opening
  ?
  ''
  :
  'none';


  button.textContent =
  opening
  ?
  '－ 收起创建代理'
  :
  '＋ 创建新代理';

};


/* =====================================
   PAGINATION
===================================== */

function pageInfo(
  total,
  page,
  size
){

  const pageCount =
  Math.max(
    1,
    Math.ceil(
      total
      /
      size
    )
  );


  const safePage =
  Math.min(
    Math.max(
      1,
      page
    ),
    pageCount
  );


  const start =
  (
    safePage
    -
    1
  )
  *
  size;


  return {

    page:
    safePage,

    pageCount,

    rowsStart:
    start,

    rowsEnd:
    start
    +
    size

  };

}


function pagerHtml(
  type,
  total,
  page,
  size
){

  const info =
  pageInfo(
    total,
    page,
    size
  );


  if(
    info.pageCount
    <=
    1
  ){
    return '';
  }


  return `

    <div class="compactPager">

      <button
        class="secondary"
        type="button"
        ${info.page <= 1 ? 'disabled' : ''}
        onclick="changeAgentPage(
          '${escJs(type)}',
          -1
        )">

        ← 上一页

      </button>


      <span>
        ${info.page} / ${info.pageCount}
        · 共 ${total} 条
      </span>


      <button
        class="secondary"
        type="button"
        ${info.page >= info.pageCount ? 'disabled' : ''}
        onclick="changeAgentPage(
          '${escJs(type)}',
          1
        )">

        下一页 →
      </button>

    </div>

  `;

}


window.changeAgentPage =
function(
  type,
  delta
){

  if(
    type
    ===
    'agents'
  ){

    agentListPage +=
    delta;

  }


  if(
    type
    ===
    'customers'
  ){

    agentCustomerPage +=
    delta;

  }


  if(
    type
    ===
    'commissions'
  ){

    agentCommissionPage +=
    delta;

  }


  renderAgents();


  const list =
  document.getElementById(
    'agentList'
  );


  if(list){

    list.scrollIntoView({
      behavior:'smooth',
      block:'start'
    });

  }

};


/* =====================================
   COMPACT AGENT LIST
===================================== */

window.renderAgents =
function(){

  const box =
  document.getElementById(
    'agentList'
  );


  if(!box){
    return;
  }


  if(selectedAgentId){

    const agent =
    agentById(
      selectedAgentId
    );


    if(!agent){

      selectedAgentId =
      null;

      selectedAgentTab =
      'basic';

      renderAgents();

      return;

    }


    box.innerHTML =
    compactAgentDetailHtml(
      agent
    );


    return;

  }


  const searchInput =
  document.getElementById(
    'searchInput'
  );


  const keyword =
  String(
    searchInput?.value
    ||
    ''
  )
  .trim()
  .toLowerCase();


  if(
    keyword
    !==
    lastAgentSearch
  ){

    agentListPage =
    1;

    lastAgentSearch =
    keyword;

  }


  let rows =
  agents;


  if(keyword){

    rows =
    agents.filter(
      agent => {

        const text =
        [
          agent.display_name,
          agent.referral_code
        ]
        .join(' ')
        .toLowerCase();


        return text.includes(
          keyword
        );

      }
    );

  }


  if(!rows.length){

    box.innerHTML = `

      <div class="empty">
        没有找到代理
      </div>

    `;

    return;

  }


  const info =
  pageInfo(
    rows.length,
    agentListPage,
    AGENT_PAGE_SIZE
  );


  agentListPage =
  info.page;


  const visibleRows =
  rows.slice(
    info.rowsStart,
    info.rowsEnd
  );


  box.innerHTML = `

    <div class="agentCompactToolbar">

      <strong>
        代理目录
      </strong>

      <span>
        共 ${rows.length} 位
      </span>

    </div>


    ${

      visibleRows
      .map(
        compactAgentRowHtml
      )
      .join('')

    }


    ${

      pagerHtml(
        'agents',
        rows.length,
        agentListPage,
        AGENT_PAGE_SIZE
      )

    }

  `;

};


function compactAgentRowHtml(agent){

  const customerRows =
  customersForAgent(
    agent.id
  );


  const summary =
  commissionSummary(
    agent.id
  );


  return `

    <div
      class="agentCompactRow"
      onclick="openAgentFile(
        '${escJs(agent.id)}'
      )">

      <div class="agentCompactMain">

        <div class="agentCompactNameLine">

          <div class="agentCompactName">
            ${esc(agent.display_name || '未命名代理')}
          </div>

          <div
            class="badge ${statusClass(agent.status)}">

            ${esc(statusName(agent.status))}

          </div>

        </div>


        <div class="agentCompactCode">

          ${esc(agent.referral_code || '无推荐码')}

        </div>


        <div class="agentCompactStats">

          <span>
            客户
            <strong>${customerRows.length}</strong>
          </span>

          <span>
            业绩
            <strong>${money(summary.confirmed)}</strong>
          </span>

          <span>
            待付
            <strong>${money(summary.remaining)}</strong>
          </span>

          <span>
            收款
            <strong>${esc(payoutState(agent.id))}</strong>
          </span>

        </div>

      </div>


      <div class="agentCompactArrow">
        ›
      </div>

    </div>

  `;

}


/* =====================================
   DETAIL TAB
===================================== */

window.setAgentTab =
function(tab){

  if(
    ![
      'basic',
      'customers',
      'commission',
      'payout'
    ]
    .includes(
      tab
    )
  ){
    return;
  }


  selectedAgentTab =
  tab;


  if(
    tab
    ===
    'customers'
  ){

    agentCustomerPage =
    1;

  }


  if(
    tab
    ===
    'commission'
  ){

    agentCommissionPage =
    1;

  }


  renderAgents();

};


function tabsHtml(){

  const rows =
  [
    ['basic','基本资料'],
    ['customers','名下客户'],
    ['commission','佣金'],
    ['payout','收款方式']
  ];


  return `

    <div class="agentTabs">

      ${

        rows
        .map(
          ([key,label]) => `

            <button
              class="agentTab ${
                selectedAgentTab === key
                ?
                'active'
                :
                ''
              }"
              type="button"
              onclick="setAgentTab(
                '${key}'
              )">

              ${label}

            </button>

          `
        )
        .join('')

      }

    </div>

  `;

}


/* =====================================
   AGENT DETAIL
===================================== */

function compactAgentDetailHtml(agent){

  const customerRows =
  customersForAgent(
    agent.id
  );


  const summary =
  commissionSummary(
    agent.id
  );


  return `

    <div class="detailTop">

      <strong>
        代理档案
      </strong>

      <button
        class="secondary"
        type="button"
        onclick="closeAgentFile()">

        ← 返回代理列表

      </button>

    </div>


    <div class="detailBox">

      <div class="agentDetailHeader">

        <div class="agentDetailHeaderTop">

          <div>

            <div class="name">
              ${esc(agent.display_name || '未命名代理')}
            </div>

            <div class="code">
              推荐码：
              ${esc(agent.referral_code || '—')}
            </div>

          </div>


          <div
            class="badge ${statusClass(agent.status)}">

            ${esc(statusName(agent.status))}

          </div>

        </div>


        <div class="agentDetailQuick">

          <span>
            客户
            <strong>${customerRows.length}</strong>
          </span>

          <span>
            有效业绩
            <strong>${money(summary.confirmed)}</strong>
          </span>

          <span>
            待付佣金
            <strong>${money(summary.remaining)}</strong>
          </span>

          <span>
            收款方式
            <strong>${esc(payoutState(agent.id))}</strong>
          </span>

        </div>

      </div>


      ${tabsHtml()}


      <div class="agentTabPanel">

        ${agentTabContent(agent)}

      </div>

    </div>

  `;

}


function agentTabContent(agent){

  if(
    selectedAgentTab
    ===
    'customers'
  ){

    return agentCustomersTab(
      agent
    );

  }


  if(
    selectedAgentTab
    ===
    'commission'
  ){

    return agentCommissionTab(
      agent
    );

  }


  if(
    selectedAgentTab
    ===
    'payout'
  ){

    return agentPayoutTab(
      agent
    );

  }


  return agentBasicTab(
    agent
  );

}


/* =====================================
   BASIC TAB
===================================== */

function agentBasicTab(agent){

  return `

    <div class="agentSectionIntro">
      这里只处理代理身份、推荐链接、状态和未来佣金比例。
    </div>


    <div class="agentBasicBlock">

      <div class="agentBasicLabel">
        创建时间
      </div>

      <div class="agentBasicValue">
        ${esc(formatDate(agent.created_at))}
      </div>

    </div>


    <div class="agentBasicBlock">

      <div class="agentBasicLabel">
        当前推荐佣金比例
      </div>

      <div class="agentBasicValue">
        ${formatRate(agent.commission_rate)}%
      </div>

    </div>


    <div class="agentBasicBlock">

      <div class="agentBasicLabel">
        专属推荐链接
      </div>

      <div class="agentBasicValue">
        ${esc(referralLink(agent))}
      </div>

    </div>


    <div class="actions one">

      <button
        class="secondary"
        onclick="copyReferralLink(
          '${escJs(agent.id)}'
        )">

        复制推荐链接

      </button>

    </div>


    <div class="sectionLabel">
      代理状态
    </div>


    <div class="actions two">

      <button
        class="${
          agent.status === 'active'
          ?
          'warning'
          :
          'success'
        }"
        onclick="toggleAgentPause(
          '${escJs(agent.id)}'
        )">

        ${
          agent.status === 'active'
          ?
          '暂停代理'
          :
          '恢复正常'
        }

      </button>


      <button
        class="${
          agent.status === 'blocked'
          ?
          'success'
          :
          'danger'
        }"
        onclick="toggleAgentBlock(
          '${escJs(agent.id)}'
        )">

        ${
          agent.status === 'blocked'
          ?
          '解除限制'
          :
          '限制代理'
        }

      </button>

    </div>


    <div class="sectionLabel">
      推荐佣金比例
    </div>


    <input
      id="rateInput"
      type="number"
      min="0"
      max="40"
      step="0.5"
      value="${Number(agent.commission_rate || 0)}"
      placeholder="佣金比例 %">


    <button
      style="margin-top:9px"
      onclick="updateRate(
        '${escJs(agent.id)}'
      )">

      保存新比例

    </button>


    <div class="hint">

      修改这里只影响尚未锁定佣金比例的未来期数。
      已经产生快照的历史期不会改变。

    </div>

  `;

}


/* =====================================
   CUSTOMERS TAB
===================================== */

function agentCustomersTab(agent){

  const rows =
  customersForAgent(
    agent.id
  );


  if(!rows.length){

    return `

      <div class="empty">
        目前没有绑定到该代理的客户
      </div>

    `;

  }


  const info =
  pageInfo(
    rows.length,
    agentCustomerPage,
    CUSTOMER_PAGE_SIZE
  );


  agentCustomerPage =
  info.page;


  const visible =
  rows.slice(
    info.rowsStart,
    info.rowsEnd
  );


  return `

    <div class="agentSectionIntro">

      共 ${rows.length} 位客户。
      这里只显示客户归属关系，不允许代理修改客户金额。

    </div>


    ${

      visible
      .map(
        customerCompactHtml
      )
      .join('')

    }


    ${

      pagerHtml(
        'customers',
        rows.length,
        agentCustomerPage,
        CUSTOMER_PAGE_SIZE
      )

    }

  `;

}


function customerCompactHtml(customer){

  return `

    <div class="customerCompactLine">

      <div class="left">

        <div class="customerNameSmall">
          ${esc(customer.display_name || '未填写姓名')}
        </div>

        <div class="customerMetaSmall">

          ${esc(customer.customer_code || '—')}

          ·

          @${esc(customer.username || '—')}

          <br>

          ${esc(customer.phone || '—')}

          · 绑定：
          ${esc(formatDate(customer.referral_bound_at))}

        </div>

      </div>


      <div
        class="badge ${statusClass(customer.status)}">

        ${esc(statusName(customer.status))}

      </div>

    </div>

  `;

}


/* =====================================
   COMMISSION TAB
===================================== */

function agentCommissionTab(agent){

  const rows =
  commissionsForAgent(
    agent.id
  );


  const accountRows =
  accountsForAgent(
    agent.id
  );


  const summary =
  commissionSummary(
    agent.id
  );


  const info =
  pageInfo(
    rows.length,
    agentCommissionPage,
    COMMISSION_PAGE_SIZE
  );


  agentCommissionPage =
  info.page;


  const visible =
  rows.slice(
    info.rowsStart,
    info.rowsEnd
  );


  return `

    <div class="agentMiniSummary">

      <div class="agentMiniBox">
        <small>客户已确认</small>
        <strong>${money(summary.confirmed)}</strong>
      </div>

      <div class="agentMiniBox">
        <small>客户待确认</small>
        <strong>${money(summary.pending)}</strong>
      </div>

      <div class="agentMiniBox">
        <small>累计应付佣金</small>
        <strong>${money(summary.due)}</strong>
      </div>

      <div class="agentMiniBox">
        <small>剩余待付佣金</small>
        <strong>${money(summary.remaining)}</strong>
      </div>

    </div>


    <div class="sectionLabel">
      历史佣金结算
    </div>


    ${

      visible.length
      ?

      visible
      .map(
        row =>
        commissionHtml(
          row,
          agent,
          accountRows
        )
      )
      .join('')

      :

      `
        <div class="empty">
          暂无佣金记录
        </div>
      `

    }


    ${

      pagerHtml(
        'commissions',
        rows.length,
        agentCommissionPage,
        COMMISSION_PAGE_SIZE
      )

    }


    <div class="hint">

      推荐佣金继续只按照客户真正 confirmed 的金额计算。
      历史期继续使用对应期数保存的佣金率和收款账户快照。

    </div>

  `;

}


/* =====================================
   PAYOUT TAB
===================================== */

function agentPayoutTab(agent){

  const rows =
  accountsForAgent(
    agent.id
  );


  return `

    <div class="agentSectionIntro">

      这里是代理自己的佣金收款方式。
      Admin 只能开放一次修改权限；
      代理重新保存后会再次锁定。

    </div>


    ${

      rows.length
      ?

      rows
      .map(
        accountHtml
      )
      .join('')

      :

      `
        <div class="empty">
          代理尚未绑定收款方式
        </div>
      `

    }

  `;

}


/* =====================================
   OPEN / CLOSE OVERRIDE
===================================== */

window.openAgentFile =
function(agentId){

  selectedAgentId =
  agentId;


  selectedAgentTab =
  'basic';


  agentCustomerPage =
  1;


  agentCommissionPage =
  1;


  renderAgents();


  const list =
  document.getElementById(
    'agentList'
  );


  if(list){

    list.scrollIntoView({
      behavior:'smooth',
      block:'start'
    });

  }

};


window.closeAgentFile =
function(){

  selectedAgentId =
  null;


  selectedAgentTab =
  'basic';


  renderAgents();

};


/* =====================================
   INSTALL
===================================== */

function install(){

  installCompactStyle();

  installCreateToggle();

  renderAgents();

}


install();

})();
