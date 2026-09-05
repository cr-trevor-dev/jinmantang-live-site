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
  repeat(5,1fr);
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
      5,
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
      <button
        id="agentNavGuide"
        class="agentMainNavBtn"
        type="button"
        onclick="location.href='/agent/guide/'">

        指南

        <span>
          使用说明
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

  const lang =
  typeof currentLang
  !==
  'undefined'
  ?
  currentLang
  :
  'zh';


  const text = {

    '本期':{
      zh:'本期',
      my:'ယခုအကြိမ်',
      en:'Current',
      th:'รอบปัจจุบัน',
      ms:'Pusingan Semasa',
      vi:'Kỳ hiện tại',
      id:'Periode Saat Ini'
    },

    '历史':{
      zh:'历史',
      my:'မှတ်တမ်း',
      en:'History',
      th:'ประวัติ',
      ms:'Sejarah',
      vi:'Lịch sử',
      id:'Riwayat'
    },

    '收款':{
      zh:'收款',
      my:'ငွေလက်ခံ',
      en:'Payout',
      th:'รับเงิน',
      ms:'Terima',
      vi:'Nhận tiền',
      id:'Penerimaan'
    },

    '账户':{
      zh:'账户',
      my:'အကောင့်',
      en:'Account',
      th:'บัญชี',
      ms:'Akaun',
      vi:'Tài khoản',
      id:'Akun'
    },
    '指南':{
      zh:'指南',
      my:'လမ်းညွှန်',
      en:'Guide',
      th:'คู่มือ',
      ms:'Panduan',
      vi:'Hướng dẫn',
      id:'Panduan'
    },

    '使用说明':{
      zh:'使用说明',
      my:'အသုံးပြုနည်း',
      en:'User Guide',
      th:'วิธีใช้งาน',
      ms:'Panduan Penggunaan',
      vi:'Hướng dẫn sử dụng',
      id:'Panduan Penggunaan'
    },
    '客户 · 佣金':{
      zh:'客户 · 佣金',
      my:'ဖောက်သည် · ကော်မရှင်',
      en:'Customers · Commission',
      th:'ลูกค้า · คอมมิชชั่น',
      ms:'Pelanggan · Komisen',
      vi:'Khách hàng · Hoa hồng',
      id:'Pelanggan · Komisi'
    },

    '佣金 · 付款':{
      zh:'佣金 · 付款',
      my:'ကော်မရှင် · ငွေပေးချေမှု',
      en:'Commission · Payment',
      th:'คอมมิชชั่น · ชำระเงิน',
      ms:'Komisen · Bayaran',
      vi:'Hoa hồng · Thanh toán',
      id:'Komisi · Pembayaran'
    },

    'KPay / 银行':{
      zh:'KPay / 银行',
      my:'KPay / ဘဏ်',
      en:'KPay / Bank',
      th:'KPay / ธนาคาร',
      ms:'KPay / Bank',
      vi:'KPay / Ngân hàng',
      id:'KPay / Bank'
    },

    '资料 · 推广':{
      zh:'资料 · 推广',
      my:'အချက်အလက် · ဖိတ်ခေါ်မှု',
      en:'Profile · Referral',
      th:'ข้อมูล · แนะนำ',
      ms:'Profil · Rujukan',
      vi:'Hồ sơ · Giới thiệu',
      id:'Profil · Referral'
    },

    '历史记录':{
      zh:'历史记录',
      my:'မှတ်တမ်း',
      en:'History Records',
      th:'ประวัติรายการ',
      ms:'Rekod Sejarah',
      vi:'Lịch sử giao dịch',
      id:'Riwayat'
    },

    '我的收款方式':{
      zh:'我的收款方式',
      my:'ကျွန်ုပ်၏ ငွေလက်ခံနည်းလမ်း',
      en:'My Payout Accounts',
      th:'ช่องทางรับเงินของฉัน',
      ms:'Akaun Penerimaan Saya',
      vi:'Phương thức nhận tiền',
      id:'Metode Penerimaan Saya'
    },

    '账户中心':{
      zh:'账户中心',
      my:'အကောင့်စင်တာ',
      en:'Account Center',
      th:'ศูนย์บัญชี',
      ms:'Pusat Akaun',
      vi:'Trung tâm tài khoản',
      id:'Pusat Akun'
    },

    '这里只显示当前期直属客户的有效金额、待确认金额和当前正式佣金。':{
      zh:'这里只显示当前期直属客户的有效金额、待确认金额和当前正式佣金。',
      my:'ဤနေရာတွင် လက်ရှိအကြိမ်၏ တိုက်ရိုက်ဖောက်သည် အတည်ပြုငွေ၊ စစ်ဆေးရန်စောင့်ငွေနှင့် လက်ရှိကော်မရှင်ကိုသာ ပြသပါသည်။',
      en:'Only confirmed customer amounts, pending amounts and current commission for this round are shown here.',
      th:'แสดงเฉพาะยอดลูกค้าที่ได้รับการยืนยัน ยอดรอตรวจสอบ และค่าคอมมิชชั่นรอบปัจจุบัน',
      ms:'Hanya jumlah pelanggan yang disahkan, jumlah menunggu dan komisen semasa dipaparkan.',
      vi:'Chỉ hiển thị số tiền khách hàng đã xác nhận, số tiền chờ xác nhận và hoa hồng hiện tại.',
      id:'Hanya jumlah pelanggan terkonfirmasi, jumlah menunggu, dan komisi saat ini yang ditampilkan.'
    },

    '查看每一期已经产生的代理佣金、支付状态与当期收款账户。开启下一期不会删除旧记录。':{
      zh:'查看每一期已经产生的代理佣金、支付状态与当期收款账户。开启下一期不会删除旧记录。',
      my:'အကြိမ်တိုင်း၏ ကော်မရှင်၊ ငွေပေးချေမှုအခြေအနေနှင့် ထိုအချိန်က ငွေလက်ခံအကောင့်ကို ကြည့်နိုင်ပါသည်။ အကြိမ်အသစ်ဖွင့်လှစ်သော်လည်း မှတ်တမ်းဟောင်းများ မပျောက်ပါ။',
      en:'View commission, payment status and payout account for each settled round. Old records remain when a new round opens.',
      th:'ดูค่าคอมมิชชั่น สถานะการจ่าย และบัญชีรับเงินของแต่ละรอบ ประวัติเก่าจะไม่หายเมื่อเปิดรอบใหม่',
      ms:'Lihat komisen, status bayaran dan akaun penerimaan setiap pusingan. Rekod lama kekal apabila pusingan baharu dibuka.',
      vi:'Xem hoa hồng, trạng thái thanh toán và tài khoản nhận tiền của từng kỳ. Dữ liệu cũ vẫn được giữ khi mở kỳ mới.',
      id:'Lihat komisi, status pembayaran, dan akun penerimaan setiap periode. Riwayat lama tetap tersimpan saat periode baru dibuka.'
    },

    '管理平台向你支付代理佣金时使用的 KPay 与银行账户。':{
      zh:'管理平台向你支付代理佣金时使用的 KPay 与银行账户。',
      my:'Platform မှ ကိုယ်စားလှယ်ကော်မရှင်ပေးချေရာတွင် အသုံးပြုမည့် KPay နှင့် ဘဏ်အကောင့်ကို စီမံနိုင်ပါသည်။',
      en:'Manage the KPay and bank accounts used to receive agent commission.',
      th:'จัดการบัญชี KPay และธนาคารสำหรับรับค่าคอมมิชชั่นตัวแทน',
      ms:'Urus akaun KPay dan bank untuk menerima komisen ejen.',
      vi:'Quản lý KPay và tài khoản ngân hàng dùng để nhận hoa hồng đại lý.',
      id:'Kelola KPay dan rekening bank untuk menerima komisi agen.'
    },

    '查看代理资料、当前佣金比例、永久推广码和客户注册链接。':{
      zh:'查看代理资料、当前佣金比例、永久推广码和客户注册链接。',
      my:'ကိုယ်စားလှယ်အချက်အလက်၊ လက်ရှိကော်မရှင်နှုန်း၊ အမြဲတမ်းဖိတ်ခေါ်ကုဒ်နှင့် ဖောက်သည်စာရင်းသွင်းလင့်ခ်ကို ကြည့်နိုင်ပါသည်။',
      en:'View agent profile, current commission rate, permanent referral code and customer registration link.',
      th:'ดูข้อมูลตัวแทน อัตราคอมมิชชั่นปัจจุบัน รหัสแนะนำถาวร และลิงก์สมัครลูกค้า',
      ms:'Lihat profil ejen, kadar komisen semasa, kod rujukan kekal dan pautan pendaftaran pelanggan.',
      vi:'Xem hồ sơ đại lý, tỷ lệ hoa hồng hiện tại, mã giới thiệu cố định và liên kết đăng ký khách hàng.',
      id:'Lihat profil agen, tarif komisi saat ini, kode referral permanen, dan tautan pendaftaran pelanggan.'
    }

  };


  return (
    text[value]?.[lang]
    ||
    value
  );

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
  const navLabels = {

    agentNavRound:[
      translated('本期'),
      translated('客户 · 佣金')
    ],

    agentNavHistory:[
      translated('历史'),
      translated('佣金 · 付款')
    ],

    agentNavPayout:[
      translated('收款'),
      translated('KPay / 银行')
    ],

    agentNavAccount:[
      translated('账户'),
      translated('资料 · 推广')
    ],
        agentNavGuide:[
      translated('指南'),
      translated('使用说明')
    ]

  };


  Object.entries(
    navLabels
  )
  .forEach(
    ([id,label])=>{

      const button =
      nav$(id);

      if(!button){
        return;
      }

      button.innerHTML = `
        ${label[0]}
        <span>
          ${label[1]}
        </span>
      `;

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
