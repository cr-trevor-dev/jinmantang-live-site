(()=>{
'use strict';

/*
  JMT Admin Customer Payout
  Compact UI Layer

  只负责：
  - 待派彩 / 已完成分类切换
  - 紧凑列表
  - 分页
  - 单笔派彩详情

  不修改：
  - payout_due
  - payout_paid
  - payout_remaining
  - payout_status
  - admin_record_customer_payout
  - 派彩凭证
  - 派彩交易历史
*/

let payoutView = 'pending';
let payoutPage = 1;
let selectedPayoutId = null;

const PAYOUT_PAGE_SIZE = 10;


/* =====================================
   STYLE
===================================== */

function installPayoutCompactStyle(){

  if(
    document.getElementById(
      'jmtPayoutCompactStyle'
    )
  ){
    return;
  }


  const style =
  document.createElement(
    'style'
  );


  style.id =
  'jmtPayoutCompactStyle';


  style.textContent = `

.payoutViewTabs{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-bottom:14px;
}

.payoutViewBtn{
  margin:0;
  background:#141415;
  color:#978e7c;
  border:1px solid rgba(214,168,63,.16);
}

.payoutViewBtn.active{
  background:
  linear-gradient(
    180deg,
    #2a210f,
    #17130c
  );
  color:#f0d27a;
  border-color:rgba(214,168,63,.52);
}

.payoutDirectoryHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:9px;
}

.payoutDirectoryHead strong{
  color:#e3c873;
  font-size:13px;
}

.payoutDirectoryHead span{
  color:#80796c;
  font-size:10px;
}

.payoutCompactRow{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  padding:13px 14px;
  margin-top:8px;
  border-radius:15px;
  background:#0f0f10;
  border:1px solid rgba(214,168,63,.16);
  cursor:pointer;
}

.payoutCompactRow:active{
  background:#17140d;
}

.payoutCompactMain{
  flex:1;
  min-width:0;
}

.payoutCompactTop{
  display:flex;
  align-items:center;
  gap:8px;
}

.payoutCompactName{
  color:#efd477;
  font-size:15px;
  font-weight:900;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}

.payoutCompactCode{
  color:#817968;
  font-size:10px;
  margin-top:4px;
}

.payoutCompactInfo{
  display:flex;
  flex-wrap:wrap;
  gap:5px 12px;
  margin-top:7px;
  color:#8e8678;
  font-size:10px;
}

.payoutCompactInfo strong{
  color:#d7c17c;
}

.payoutCompactMoney{
  color:#efd477!important;
}

.payoutCompactArrow{
  flex:none;
  color:#d8bf73;
  font-size:20px;
}

.payoutPager{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  gap:8px;
  align-items:center;
  margin-top:14px;
}

.payoutPager button{
  margin-top:0;
}

.payoutPager span{
  color:#8d8577;
  font-size:11px;
  text-align:center;
  white-space:nowrap;
}

.payoutDetailTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:5px;
}

.payoutDetailTop strong{
  color:#e5c96f;
  font-size:13px;
}

.payoutDetailBack{
  width:auto;
  min-width:110px;
  margin-top:0;
  background:#171718;
  color:#d9c37c;
  border:1px solid rgba(214,168,63,.22);
}

@media(max-width:520px){

  .payoutPager{
    grid-template-columns:1fr;
  }

}

`;


  document.head.appendChild(
    style
  );

}


/* =====================================
   EXISTING SECTIONS
===================================== */

function pendingSection(){

  return document
  .getElementById(
    'pendingList'
  )
  ?.closest(
    'section'
  )
  ||
  null;

}


function historySection(){

  return document
  .getElementById(
    'historyList'
  )
  ?.closest(
    'section'
  )
  ||
  null;

}


/* =====================================
   VIEW TABS
===================================== */

function installPayoutTabs(){

  if(
    document.getElementById(
      'jmtPayoutViewTabs'
    )
  ){
    return;
  }


  const pending =
  pendingSection();


  if(!pending){
    return;
  }


  const box =
  document.createElement(
    'div'
  );


  box.id =
  'jmtPayoutViewTabs';


  box.className =
  'payoutViewTabs';


  box.innerHTML = `

    <button
      id="payoutViewPending"
      class="payoutViewBtn active"
      type="button"
      onclick="setPayoutView('pending')">

      待派彩

    </button>


    <button
      id="payoutViewPaid"
      class="payoutViewBtn"
      type="button"
      onclick="setPayoutView('paid')">

      已完成

    </button>

  `;


  pending.parentNode.insertBefore(
    box,
    pending
  );

}


window.setPayoutView =
function(view){

  if(
    ![
      'pending',
      'paid'
    ]
    .includes(
      view
    )
  ){
    return;
  }


  payoutView =
  view;


  payoutPage =
  1;


  selectedPayoutId =
  null;


  render();

};


/* =====================================
   HELPERS
===================================== */

function isPendingPayout(row){

  return (
    row.payout_status
    !==
    'paid'
    &&
    Number(
      row.payout_remaining
      ||
      0
    )
    >
    0
  );

}


function rowsForView(){

  if(
    payoutView
    !==
    'paid'
  ){

    return rows.filter(
      isPendingPayout
    );

  }


  let paidRows =
  rows.filter(
    row =>
    row.payout_status
    ===
    'paid'
  );


  const historyDate =
  document.getElementById(
    'payoutHistoryDate'
  )?.value
  ||
  '';


  const historyPeriod =
  document.getElementById(
    'payoutHistoryPeriod'
  )?.value
  ||
  '';


  paidRows =
  paidRows.filter(
    row => {

      if(
        historyDate
        &&
        String(
          row.round_date
          ||
          ''
        )
        !==
        historyDate
      ){

        return false;

      }


      if(
        historyPeriod
        &&
        String(
          row.round_code
          ||
          ''
        )
        !==
        historyPeriod
      ){

        return false;

      }


      return true;

    }
  );


  return paidRows;

}


function payoutKey(row){

  return String(
    row.settlement_id
    ||
    ''
  );

}


/* =====================================
   PAGINATION
===================================== */

function payoutPageInfo(total){

  const pageCount =
  Math.max(
    1,
    Math.ceil(
      total
      /
      PAYOUT_PAGE_SIZE
    )
  );


  payoutPage =
  Math.min(
    Math.max(
      1,
      payoutPage
    ),
    pageCount
  );


  const start =
  (
    payoutPage
    -
    1
  )
  *
  PAYOUT_PAGE_SIZE;


  return {
    pageCount,
    start,
    end:start+PAYOUT_PAGE_SIZE
  };

}


function payoutPagerHtml(total){

  const info =
  payoutPageInfo(
    total
  );


  if(
    info.pageCount
    <=
    1
  ){
    return '';
  }


  return `

    <div class="payoutPager">

      <button
        class="payoutDetailBack"
        type="button"
        ${payoutPage <= 1 ? 'disabled' : ''}
        onclick="changePayoutPage(-1)">

        ← 上一页

      </button>


      <span>
        ${payoutPage} / ${info.pageCount}
        · 共 ${total} 笔
      </span>


      <button
        class="payoutDetailBack"
        type="button"
        ${payoutPage >= info.pageCount ? 'disabled' : ''}
        onclick="changePayoutPage(1)">

        下一页 →

      </button>

    </div>

  `;

}


window.changePayoutPage =
function(delta){

  payoutPage +=
  delta;


  render();


  activePayoutList()
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


/* =====================================
   OPEN / CLOSE
===================================== */

window.openPayoutFile =
function(settlementId){

  selectedPayoutId =
  settlementId;


  render();


  activePayoutList()
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


window.closePayoutFile =
function(){

  selectedPayoutId =
  null;


  render();

};


function activePayoutList(){

  return document.getElementById(
    payoutView
    ===
    'paid'
    ?
    'historyList'
    :
    'pendingList'
  );

}


/* =====================================
   COMPACT ROW
===================================== */

function payoutCompactRowHtml(row){

  return `

    <div
      class="payoutCompactRow"
      onclick="openPayoutFile(
        '${esc(payoutKey(row))}'
      )">

      <div class="payoutCompactMain">

        <div class="payoutCompactTop">

          <div class="payoutCompactName">
            ${esc(row.display_name || '客户')}
          </div>


          <div
            class="badge ${esc(row.payout_status)}">

            ${esc(
              statusText(
                row.payout_status
              )
            )}

          </div>

        </div>


        <div class="payoutCompactCode">

          ${esc(row.customer_code || '—')}

          ${
            row.username
            ?
            ' · @'
            +
            esc(row.username)
            :
            ''
          }

        </div>


        <div class="payoutCompactInfo">

          <span>

            期数

            <strong>
              ${esc(row.round_date || '—')}
              ·
              ${esc(periodName(row.round_code))}
            </strong>

          </span>


          <span>

            应派

            <strong>
              ${money(row.payout_due)}
            </strong>

          </span>


          ${
            payoutView
            ===
            'pending'
            ?
            `
              <span>

                剩余

                <strong class="payoutCompactMoney">
                  ${money(row.payout_remaining)}
                </strong>

              </span>
            `
            :
            `
              <span>

                已派

                <strong class="payoutCompactMoney">
                  ${money(row.payout_paid)}
                </strong>

              </span>
            `
          }

        </div>

      </div>


      <div class="payoutCompactArrow">
        ›
      </div>

    </div>

  `;

}


/* =====================================
   LIST RENDER
===================================== */

function renderPayoutList(
  target,
  viewRows
){

  if(!target){
    return;
  }


  if(selectedPayoutId){

    const selected =
    rows.find(
      row =>
      payoutKey(row)
      ===
      selectedPayoutId
    );


    const belongs =
    selected
    &&
    (
      payoutView
      ===
      'paid'
      ?
      selected.payout_status
      ===
      'paid'
      :
      isPendingPayout(
        selected
      )
    );


    if(belongs){

      target.innerHTML = `

        <div class="payoutDetailTop">

          <strong>
            派彩详情
          </strong>

          <button
            class="payoutDetailBack"
            type="button"
            onclick="closePayoutFile()">

            ← 返回列表

          </button>

        </div>


        ${payoutHtml(selected)}

      `;


      return;

    }


    selectedPayoutId =
    null;

  }


  if(!viewRows.length){

    target.innerHTML = `

      <div class="empty">

        ${
          payoutView
          ===
          'paid'
          ?
          '暂无已完成派彩记录'
          :
          '当前没有待派彩客户'
        }

      </div>

    `;


    return;

  }


  const info =
  payoutPageInfo(
    viewRows.length
  );


  const visible =
  viewRows.slice(
    info.start,
    info.end
  );


  target.innerHTML = `

    <div class="payoutDirectoryHead">

      <strong>

        ${
          payoutView
          ===
          'paid'
          ?
          '已完成记录'
          :
          '待派彩列表'
        }

      </strong>

      <span>
        共 ${viewRows.length} 笔
      </span>

    </div>


    ${

      visible
      .map(
        payoutCompactRowHtml
      )
      .join('')

    }


    ${payoutPagerHtml(viewRows.length)}

  `;

}


/* =====================================
   OVERRIDE ORIGINAL RENDER
===================================== */

window.render =
function(){

  const pending =
  rows.filter(
    isPendingPayout
  );


  const paid =
  rows.filter(
    row =>
    row.payout_status
    ===
    'paid'
  );


  /*
    原来的三个总览数字继续保留
  */

  document
  .getElementById(
    'pendingCount'
  )
  .textContent =
  pending.length;


  document
  .getElementById(
    'pendingAmount'
  )
  .textContent =
  money(
    pending.reduce(
      (
        sum,
        row
      ) =>
      sum
      +
      Number(
        row.payout_remaining
        ||
        0
      ),
      0
    )
  );


  document
  .getElementById(
    'paidCount'
  )
  .textContent =
  paid.length;


  /*
    Tab 状态
  */

  document
  .getElementById(
    'payoutViewPending'
  )
  ?.classList
  .toggle(
    'active',
    payoutView
    ===
    'pending'
  );


  document
  .getElementById(
    'payoutViewPaid'
  )
  ?.classList
  .toggle(
    'active',
    payoutView
    ===
    'paid'
  );


  /*
    同一时间只显示一个分类，
    不再让待派彩和历史一起向下铺。
  */

  const pendingBox =
  pendingSection();


  const historyBox =
  historySection();


  if(pendingBox){

    pendingBox.style.display =
    payoutView
    ===
    'pending'
    ?
    ''
    :
    'none';

  }


  if(historyBox){

    historyBox.style.display =
    payoutView
    ===
    'paid'
    ?
    ''
    :
    'none';

  }


  /*
    原 section 自己已有标题，
    列表内部再使用紧凑目录。
  */

  renderPayoutList(
    activePayoutList(),
    rowsForView()
  );

};


/* =====================================
   INSTALL
===================================== */

function install(){

  installPayoutCompactStyle();

  installPayoutTabs();

  render();

}


install();

})();
