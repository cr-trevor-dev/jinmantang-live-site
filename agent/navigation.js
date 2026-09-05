(()=>{
'use strict';

/*
  JIN MANTANG
  Agent View Navigation

  只负责代理端页面分类显示。
  不修改任何数据库数据、佣金计算、
  客户下注、付款审核、派彩或收款账户数据。
*/

const AGENT_VIEW_KEY =
'jmt_agent_view_v1';

const VALID_VIEWS =
[
  'round',
  'history',
  'payout',
  'account'
];

let currentAgentView =
'round';

let installed =
false;

let observer =
null;


function nav$(id){

  return document
  .getElementById(
    id
  );

}


function agentBox(){

  return nav$(
    'agentBox'
  );

}


function cardByChild(id){

  return nav$(id)
  ?.closest(
    '.card'
  )
  ||
  null;

}


function profileCard(){

  return cardByChild(
    'agentName'
  );

}


function roundCard(){

  return cardByChild(
    'roundName'
  );

}


function referralCard(){

  return nav$(
    'agentReferralCard'
  );

}


function liveCard(){

  return nav$(
    'agentCustomerRoundLiveCard'
  );

}


function historyCard(){

  return nav$(
    'agentReferralCommissionHistoryCard'
  );

}


function payoutCard(){

  return nav$(
    'agentPayoutAccountCard'
  );

}


function settledCard(){

  return nav$(
    'agentSimpleSettledCard'
  );

}


function logoutCard(){

  const box =
  agentBox();

  if(!box){
    return null;
  }

  return Array
  .from(
    box.querySelectorAll(
      'button'
    )
  )
  .find(
    button =>
    button.getAttribute(
      'data-i18n'
    )
    ===
    'logout'
  )
  ?.closest(
    '.card'
  )
  ||
  null;

}


/* =========================================
   STYLE
========================================= */

function installStyle(){

  if(
    nav$(
      'jmtAgentNavigationStyle'
    )
  ){

    return;

  }

  const style =
  document.createElement(
    'style'
  );

  style.id =
  'jmtAgentNavigationStyle';

  style.textContent = `

.agentMainNav{
  position:sticky;
  top:8px;
  z-index:30;
  margin-bottom:15px;
  padding:8px;
  border-radius:18px;
  background:
  rgba(10,10,11,.94);
  border:
  1px solid
  rgba(214,168,63,.24);
  box-shadow:
  0 12px 35px
  rgba(0,0,0,.28);
  backdrop-filter:
  blur(16px);
  -webkit-backdrop-filter:
  blur(16px);
}

.agentMainNavGrid{
  display:grid;
  grid-template-columns:
  repeat(4,1fr);
  gap:7px;
}

.agentMainNavBtn{
  width:100%;
  margin:0!important;
  padding:
  11px 7px!important;
  border-radius:
  12px!important;
  border:
  1px solid
  transparent!important;
  background:
  transparent!important;
  color:
  #847b68!important;
  box-shadow:
  none!important;
  font-size:
  12px!important;
  font-weight:
  900!important;
  line-height:1.2;
}

.agentMainNavBtn span{
  display:block;
  margin-top:4px;
  color:#665f52;
  font-size:9px;
  font-weight:600;
}

.agentMainNavBtn.active{
  color:
  #f1d47c!important;
  border-color:
  rgba(214,168,63,.40)!important;
  background:
  linear-gradient(
    180deg,
    rgba(76,56,20,.62),
    rgba(30,25,15,.92)
  )!important;
}

.agentMainNavBtn.active span{
  color:#a99562;
}

.agentNavHidden{
  display:none!important;
}

.agentViewIntro{
  margin-bottom:12px;
  padding:12px 14px;
  border-radius:14px;
  border:
  1px solid
  rgba(214,168,63,.14);
  background:
  linear-gradient(
    180deg,
    rgba(25,22,16,.88),
    rgba(13,13,14,.92)
  );
}

.agentViewIntroTitle{
  color:#e8cc77;
  font-size:15px;
  font-weight:900;
}

.agentViewIntroText{
  margin-top:5px;
  color:#837967;
  font-size:10px;
  line-height:1.6;
}

@media(max-width:560px){

  .agentMainNav{
    top:5px;
  }

  .agentMainNavGrid{
    grid-template-columns:
    repeat(
      4,
      minmax(0,1fr)
    );
    gap:5px;
  }

  .agentMainNavBtn{
    padding:
    10px 4px!important;
    font-size:
    11px!important;
  }

  .agentMainNavBtn span{
    display:none;
  }

}

`;

  document.head
  .appendChild(
    style
  );

}


/* =========================================
   NAVIGATION
========================================= */

function installNavigation(){

  const box =
  agentBox();

  if(
    !box
    ||
    installed
  ){

    return;

  }

  installStyle();

  const nav =
  document.createElement(
    'div'
  );

  nav.id =
  'agentMainNav';

  nav.className =
  'agentMainNav';

  nav.innerHTML = `

    <div class="agentMainNavGrid">

      <button
        id="agentNavRound"
        class="agentMainNavBtn"
        type="button"
        onclick="setAgentView('round')">

        本期

        <span>
          客户 · 佣金
        </span>

      </button>


      <button
        id="agentNavHistory"
        class="agentMainNavBtn"
        type="button"
        onclick="setAgentView('history')">

        历史

        <span>
          佣金 · 付款
        </span>

      </button>


      <button
        id="agentNavPayout"
        class="agentMainNavBtn"
        type="button"
        onclick="setAgentView('payout')">

        收款

        <span>
          KPay / 银行
        </span>

      </button>


      <button
        id="agentNavAccount"
        class="agentMainNavBtn"
        type="button"
        onclick="setAgentView('account')">

        账户

        <span>
          资料 · 推广
        </span>

      </button>

    </div>

  `;

  box.insertBefore(
    nav,
    box.firstChild
  );

  installed =
  true;

  startObserver();

}


/* =========================================
   INTRO
========================================= */

function ensureIntro(){

  const nav =
  nav$(
    'agentMainNav'
  );

  if(!nav){
    return null;
  }

  let intro =
  nav$(
    'agentViewIntro'
  );

  if(intro){
    return intro;
  }

  intro =
  document.createElement(
    'div'
  );

  intro.id =
  'agentViewIntro';

  intro.className =
  'agentViewIntro';

  nav.insertAdjacentElement(
    'afterend',
    intro
  );

  return intro;

}


function translated(value){

  if(
    typeof window
    .agentExtraTranslateValue
    ===
    'function'
  ){

    return window
    .agentExtraTranslateValue(
      value
    );

  }

  return value;

}


function renderIntro(){

  const intro =
  ensureIntro();

  if(!intro){
    return;
  }

  const content = {

    round:{
      title:
      '本期',
      text:
      '这里只显示当前期直属客户的有效金额、待确认金额和当前正式佣金。'
    },

    history:{
      title:
      '历史记录',
      text:
      '查看每一期已经产生的代理佣金、支付状态与当期收款账户。开启下一期不会删除旧记录。'
    },

    payout:{
      title:
      '我的收款方式',
      text:
      '管理平台向你支付代理佣金时使用的 KPay 与银行账户。'
    },

    account:{
      title:
      '账户中心',
      text:
      '查看代理资料、当前佣金比例、永久推广码和客户注册链接。'
    }

  };

  const item =
  content[
    currentAgentView
  ]
  ||
  content.round;

  intro.innerHTML = `

    <div class="agentViewIntroTitle">
      ${translated(
        item.title
      )}
    </div>

    <div class="agentViewIntroText">
      ${translated(
        item.text
      )}
    </div>

  `;

}


/* =========================================
   VISIBILITY
========================================= */

function setVisible(
  element,
  visible
){

  if(!element){
    return;
  }

  element.classList
  .toggle(
    'agentNavHidden',
    !visible
  );

}


function applyView(){

  if(!installed){
    return;
  }

  setVisible(
    roundCard(),
    currentAgentView
    ===
    'round'
  );

  setVisible(
    liveCard(),
    currentAgentView
    ===
    'round'
  );

  setVisible(
    settledCard(),
    currentAgentView
    ===
    'history'
  );

  setVisible(
    historyCard(),
    currentAgentView
    ===
    'history'
  );

  setVisible(
    payoutCard(),
    currentAgentView
    ===
    'payout'
  );

  setVisible(
    profileCard(),
    currentAgentView
    ===
    'account'
  );

  setVisible(
    referralCard(),
    currentAgentView
    ===
    'account'
  );

  setVisible(
    logoutCard(),
    currentAgentView
    ===
    'account'
  );

  [
    'round',
    'history',
    'payout',
    'account'
  ]
  .forEach(
    view=>{

      const id =
      view
      ===
      'round'
      ?
      'agentNavRound'
      :
      view
      ===
      'history'
      ?
      'agentNavHistory'
      :
      view
      ===
      'payout'
      ?
      'agentNavPayout'
      :
      'agentNavAccount';

      nav$(
        id
      )
      ?.classList
      .toggle(
        'active',
        currentAgentView
        ===
        view
      );

    }
  );

  renderIntro();

}


/* =========================================
   PUBLIC ACTION
========================================= */

window.setAgentView =
function(view){

  if(
    !VALID_VIEWS.includes(
      view
    )
  ){

    return;

  }

  currentAgentView =
  view;

  sessionStorage.setItem(
    AGENT_VIEW_KEY,
    view
  );

  const wantedHash =
  '#'
  +
  view;

  if(
    location.hash
    !==
    wantedHash
  ){

    history.replaceState(
      null,
      '',
      wantedHash
    );

  }

  applyView();

  nav$(
    'agentMainNav'
  )
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


/* =========================================
   RESTORE VIEW
========================================= */

function restoreView(){

  const hash =
  String(
    location.hash
    ||
    ''
  )
  .replace(
    '#',
    ''
  );

  const stored =
  sessionStorage
  .getItem(
    AGENT_VIEW_KEY
  );

  if(
    VALID_VIEWS.includes(
      hash
    )
  ){

    currentAgentView =
    hash;

  }

  else if(
    VALID_VIEWS.includes(
      stored
    )
  ){

    currentAgentView =
    stored;

  }

  else{

    currentAgentView =
    'round';

  }

}


/* =========================================
   DYNAMIC CARDS
========================================= */

function startObserver(){

  if(observer){
    return;
  }

  const box =
  agentBox();

  if(!box){
    return;
  }

  observer =
  new MutationObserver(
    ()=>{

      applyView();

    }
  );

  observer.observe(
    box,
    {
      childList:true
    }
  );

}


/* =========================================
   START
========================================= */

function tick(){

  const box =
  agentBox();

  if(!box){
    return;
  }

  installNavigation();

  applyView();

}


restoreView();

tick();

setInterval(
  tick,
  900
);

})();
