(()=>{
'use strict';


/*
  JIN MANTANG
  Customer View Navigation

  只负责客户中心页面分类显示。

  不修改：
  - 下注数据
  - 付款审核
  - 开奖
  - 中奖计算
  - 派彩金额
  - 退款金额
  - 客户收款账户数据
  - 历史账本数据
*/


const CUSTOMER_VIEW_KEY =
'jmt_customer_view_v1';


const VALID_VIEWS =
[
  'round',
  'history',
  'payout',
  'account'
];


let currentCustomerView =
'round';


let navigationInstalled =
false;


let viewObserver =
null;


/* =========================================
   HELPERS
========================================= */

function nav$(id){

  return document
  .getElementById(
    id
  );

}


function dashboard(){

  return nav$(
    'dashboard'
  );

}


function sectionOf(id){

  return nav$(
    id
  )
  ?.closest(
    'section'
  )
  ||
  null;

}


function profileSection(){

  return sectionOf(
    'profileName'
  );

}


function payoutSection(){

  return sectionOf(
    'kpayStatus'
  );

}


function roundSection(){

  return nav$(
    'roundCard'
  );

}


function paymentSection(){

  return nav$(
    'paymentCard'
  );

}


function latestResultSection(){

  return nav$(
    'customerLatestResultCard'
  );

}


function historySection(){

  return nav$(
    'customerHistoryCard'
  );

}


function logoutSection(){

  const box =
  dashboard();


  if(!box){

    return null;

  }


  return box
  .querySelector(
    'button.danger[onclick="logout()"]'
  )
  ?.closest(
    'section'
  )
  ||
  null;

}


/* =========================================
   STYLE
========================================= */

function installNavigationStyle(){

  if(
    nav$(
      'jmtCustomerNavigationStyle'
    )
  ){

    return;

  }


  const style =
  document.createElement(
    'style'
  );


  style.id =
  'jmtCustomerNavigationStyle';


  style.textContent = `

.customerMainNav{
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

.customerMainNavGrid{
  display:grid;
  grid-template-columns:
  repeat(4,1fr);
  gap:7px;
}

.customerMainNavBtn{
  width:100%;
  margin:0!important;
  padding:11px 7px!important;
  border-radius:12px!important;
  border:
  1px solid
  transparent!important;
  background:
  transparent!important;
  color:
  #847b68!important;
  box-shadow:none!important;
  font-size:12px!important;
  font-weight:900!important;
  line-height:1.2;
}

.customerMainNavBtn span{
  display:block;
  margin-top:4px;
  color:#665f52;
  font-size:9px;
  font-weight:600;
}

.customerMainNavBtn.active{
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

.customerMainNavBtn.active span{
  color:#a99562;
}

.customerViewHidden{
  display:none!important;
}

.customerViewIntro{
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

.customerViewIntroTitle{
  color:#e8cc77;
  font-size:15px;
  font-weight:900;
}

.customerViewIntroText{
  margin-top:5px;
  color:#837967;
  font-size:10px;
  line-height:1.6;
}

@media(max-width:560px){

  .customerMainNav{
    top:5px;
  }

  .customerMainNavGrid{
    grid-template-columns:
    repeat(4,minmax(0,1fr));
    gap:5px;
  }

  .customerMainNavBtn{
    padding:
    10px 4px!important;
    font-size:
    11px!important;
  }

  .customerMainNavBtn span{
    display:none;
  }

}

`;


  document.head.appendChild(
    style
  );

}


/* =========================================
   NAVIGATION
========================================= */

function installNavigation(){

  const box =
  dashboard();


  if(
    !box
    ||
    navigationInstalled
  ){

    return;

  }


  installNavigationStyle();


  const nav =
  document.createElement(
    'div'
  );


  nav.id =
  'customerMainNav';


  nav.className =
  'customerMainNav';


  nav.innerHTML = `

    <div class="customerMainNavGrid">

      <button
        id="customerNavRound"
        class="customerMainNavBtn"
        type="button"
        onclick="setCustomerView('round')">

        本期

        <span>
          下注 · 付款
        </span>

      </button>


      <button
        id="customerNavHistory"
        class="customerMainNavBtn"
        type="button"
        onclick="setCustomerView('history')">

        历史

        <span>
          结果 · 账本
        </span>

      </button>


      <button
        id="customerNavPayout"
        class="customerMainNavBtn"
        type="button"
        onclick="setCustomerView('payout')">

        收款

        <span>
          电子钱包 / 银行
        </span>

      </button>


      <button
        id="customerNavAccount"
        class="customerMainNavBtn"
        type="button"
        onclick="setCustomerView('account')">

        账户

        <span>
          资料 · 客服
        </span>

      </button>

    </div>

  `;


  box.insertBefore(
    nav,
    box.firstChild
  );


  navigationInstalled =
  true;


  startViewObserver();

}


/* =========================================
   VIEW INTRO
========================================= */

function ensureViewIntro(){

  const nav =
  nav$(
    'customerMainNav'
  );


  if(!nav){

    return null;

  }


  let intro =
  nav$(
    'customerViewIntro'
  );


  if(intro){

    return intro;

  }


  intro =
  document.createElement(
    'div'
  );


  intro.id =
  'customerViewIntro';


  intro.className =
  'customerViewIntro';


  nav.insertAdjacentElement(
    'afterend',
    intro
  );


  return intro;

}


function renderViewIntro(){

  const intro =
  ensureViewIntro();


  if(!intro){

    return;

  }


  const content = {

    round:{
      title:'本期参与',
      text:
      '这里只显示当前开放期的下注、付款和审核状态。'
    },

    history:{
      title:'历史记录',
      text:
      '查看已结算期数、付款记录和派彩记录。旧记录不会因为开启下一期而消失。'
    },

    payout:{
      title:'我的收款方式',
      text:
      '集中管理您用于接收平台派彩的 KPay 与银行账户。'
    },

    account:{
      title:'账户中心',
      text:
      '查看个人资料、客户编号、注册手机以及联系客服。'
    }

  };


  const item =
  content[
    currentCustomerView
  ]
  ||
  content.round;


  intro.innerHTML = `

    <div class="customerViewIntroTitle">
      ${item.title}
    </div>

    <div class="customerViewIntroText">
      ${item.text}
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


  element.classList.toggle(
    'customerViewHidden',
    !visible
  );

}


function applyCurrentView(){

  if(
    !navigationInstalled
  ){

    return;

  }


  setVisible(
    profileSection(),
    currentCustomerView
    ===
    'account'
  );


  setVisible(
    payoutSection(),
    currentCustomerView
    ===
    'payout'
  );


  setVisible(
    roundSection(),
    currentCustomerView
    ===
    'round'
  );


  setVisible(
    paymentSection(),
    currentCustomerView
    ===
    'round'
  );


  setVisible(
    latestResultSection(),
    currentCustomerView
    ===
    'history'
  );


  setVisible(
    historySection(),
    currentCustomerView
    ===
    'history'
  );


  setVisible(
    logoutSection(),
    currentCustomerView
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
      'customerNavRound'
      :
      view
      ===
      'history'
      ?
      'customerNavHistory'
      :
      view
      ===
      'payout'
      ?
      'customerNavPayout'
      :
      'customerNavAccount';


      nav$(
        id
      )
      ?.classList
      .toggle(
        'active',
        currentCustomerView
        ===
        view
      );

    }
  );


  renderViewIntro();


  

}


/* =========================================
   PUBLIC ACTION
========================================= */

window.setCustomerView =
function(view){

  if(
    !VALID_VIEWS.includes(
      view
    )
  ){

    return;

  }


  currentCustomerView =
  view;


  sessionStorage.setItem(
    CUSTOMER_VIEW_KEY,
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


  applyCurrentView();


  nav$(
    'customerMainNav'
  )
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


/* =========================================
   DYNAMIC CARDS
========================================= */

function startViewObserver(){

  if(viewObserver){

    return;

  }


  const box =
  dashboard();


  if(!box){

    return;

  }


  viewObserver =
  new MutationObserver(
    ()=>{

      applyCurrentView();

    }
  );


  viewObserver.observe(
    box,
    {
      childList:true
    }
  );

}


/* =========================================
   INITIAL VIEW
========================================= */

function resolveInitialView(){

  const fromHash =
  String(
    location.hash
    ||
    ''
  )
  .replace(
    '#',
    ''
  );


  if(
    VALID_VIEWS.includes(
      fromHash
    )
  ){

    return fromHash;

  }


  const stored =
  sessionStorage.getItem(
    CUSTOMER_VIEW_KEY
  );


  if(
    VALID_VIEWS.includes(
      stored
    )
  ){

    return stored;

  }


  return 'round';

}


function bootNavigation(){

  if(
    !dashboard()
  ){

    return;

  }


  installNavigation();


  currentCustomerView =
  resolveInitialView();


  applyCurrentView();

}


/*
  dashboard 登录后才真正显示，
  这里不改原有登录流程。
*/
window.addEventListener(
  'load',
  ()=>{

    setTimeout(
      bootNavigation,
      1300
    );

  }
);


window.addEventListener(
  'hashchange',
  ()=>{

    const view =
    String(
      location.hash
      ||
      ''
    )
    .replace(
      '#',
      ''
    );


    if(
      VALID_VIEWS.includes(
        view
      )
    ){

      currentCustomerView =
      view;

      applyCurrentView();

    }

  }
);


})();
