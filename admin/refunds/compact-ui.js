(()=>{
'use strict';

/*
  JMT Admin Refund Center
  Compact UI Layer

  只负责：
  - 待处理 / 已退款 / 已结案分类
  - 紧凑列表
  - 分页
  - 单笔退款详情

  不修改：
  - refund amount
  - refunded_amount
  - refund status
  - admin_record_finance_refund
  - admin_close_finance_refund
  - 退款凭证
  - 退款事件历史
*/

let refundView = 'pending';
let refundPage = 1;
let selectedRefundId = null;

const REFUND_PAGE_SIZE = 10;


/* =====================================
   STYLE
===================================== */

function installRefundCompactStyle(){

  if(
    document.getElementById(
      'jmtRefundCompactStyle'
    )
  ){
    return;
  }


  const style =
  document.createElement(
    'style'
  );


  style.id =
  'jmtRefundCompactStyle';


  style.textContent = `

.refundViewTabs{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
  margin-bottom:14px;
}

.refundViewBtn{
  margin:0;
  background:#141415;
  color:#978e7c;
  border:1px solid rgba(214,168,63,.16);
}

.refundViewBtn.active{
  background:linear-gradient(
    180deg,
    #2a210f,
    #17130c
  );
  color:#f0d27a;
  border-color:rgba(214,168,63,.52);
}

.refundDirectoryHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:9px;
}

.refundDirectoryHead strong{
  color:#e3c873;
  font-size:13px;
}

.refundDirectoryHead span{
  color:#80796c;
  font-size:10px;
}

.refundCompactRow{
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

.refundCompactRow:active{
  background:#17140d;
}

.refundCompactMain{
  flex:1;
  min-width:0;
}

.refundCompactTop{
  display:flex;
  align-items:center;
  gap:8px;
}

.refundCompactName{
  color:#efd477;
  font-size:15px;
  font-weight:900;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}

.refundCompactMeta{
  color:#817968;
  font-size:10px;
  margin-top:4px;
}

.refundCompactInfo{
  display:flex;
  flex-wrap:wrap;
  gap:5px 12px;
  margin-top:7px;
  color:#8e8678;
  font-size:10px;
}

.refundCompactInfo strong{
  color:#d7c17c;
}

.refundCompactMoney{
  color:#efd477!important;
}

.refundCompactArrow{
  flex:none;
  color:#d8bf73;
  font-size:20px;
}

.refundPager{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  gap:8px;
  align-items:center;
  margin-top:14px;
}

.refundPager button{
  margin:0;
}

.refundPager span{
  color:#8d8577;
  font-size:11px;
  text-align:center;
  white-space:nowrap;
}

.refundDetailTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:5px;
}

.refundDetailTop strong{
  color:#e5c96f;
  font-size:13px;
}

.refundDetailBack{
  width:auto;
  min-width:110px;
  margin:0;
  background:#171718;
  color:#d9c37c;
  border:1px solid rgba(214,168,63,.22);
}

@media(max-width:520px){

  .refundPager{
    grid-template-columns:1fr;
  }

  .refundViewTabs{
    grid-template-columns:1fr;
  }

}

`;


  document.head.appendChild(
    style
  );

}


/* =====================================
   SECTIONS
===================================== */

function refundPendingSection(){

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


function refundHistorySection(){

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
   TABS
===================================== */

function installRefundTabs(){

  if(
    document.getElementById(
      'jmtRefundViewTabs'
    )
  ){
    return;
  }


  const pending =
  refundPendingSection();


  if(!pending){
    return;
  }


  const box =
  document.createElement(
    'div'
  );


  box.id =
  'jmtRefundViewTabs';


  box.className =
  'refundViewTabs';


  box.innerHTML = `

    <button
      id="refundViewPending"
      class="refundViewBtn active"
      type="button"
      onclick="setRefundView('pending')">

      待处理

    </button>


    <button
      id="refundViewRefunded"
      class="refundViewBtn"
      type="button"
      onclick="setRefundView('refunded')">

      已退款

    </button>


    <button
      id="refundViewCancelled"
      class="refundViewBtn"
      type="button"
      onclick="setRefundView('cancelled')">

      已结案

    </button>

  `;


  pending.parentNode.insertBefore(
    box,
    pending
  );

}


window.setRefundView =
function(view){

  if(
    ![
      'pending',
      'refunded',
      'cancelled'
    ]
    .includes(
      view
    )
  ){
    return;
  }


  refundView =
  view;


  refundPage =
  1;


  selectedRefundId =
  null;


  render();

};


/* =====================================
   HELPERS
===================================== */

function isPendingRefund(row){

  return (
    row.status
    ===
    'pending'
    ||
    row.status
    ===
    'partial'
  );

}


function rowsForRefundView(){

  let viewRows = [];


  if(
    refundView
    ===
    'refunded'
  ){

    viewRows =
    rows.filter(
      row =>
      row.status
      ===
      'refunded'
    );

  }
  else if(
    refundView
    ===
    'cancelled'
  ){

    viewRows =
    rows.filter(
      row =>
      row.status
      ===
      'cancelled'
    );

  }
  else{

    return rows.filter(
      isPendingRefund
    );

  }


  const historyDate =
  document.getElementById(
    'historyDate'
  )?.value
  ||
  '';


  const historyPeriod =
  document.getElementById(
    'historyPeriod'
  )?.value
  ||
  '';


  const historyStatus =
  document.getElementById(
    'historyStatus'
  )?.value
  ||
  '';


  return viewRows.filter(
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


      if(
        historyStatus
        &&
        String(
          row.status
          ||
          ''
        )
        !==
        historyStatus
      ){

        return false;

      }


      return true;

    }
  );

}


/* =====================================
   PAGINATION
===================================== */

function refundPageInfo(total){

  const pageCount =
  Math.max(
    1,
    Math.ceil(
      total
      /
      REFUND_PAGE_SIZE
    )
  );


  refundPage =
  Math.min(
    Math.max(
      1,
      refundPage
    ),
    pageCount
  );


  const start =
  (
    refundPage
    -
    1
  )
  *
  REFUND_PAGE_SIZE;


  return {
    pageCount,
    start,
    end:start+REFUND_PAGE_SIZE
  };

}


function refundPagerHtml(total){

  const info =
  refundPageInfo(
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

    <div class="refundPager">

      <button
        class="refundDetailBack"
        type="button"
        ${refundPage <= 1 ? 'disabled' : ''}
        onclick="changeRefundPage(-1)">

        ← 上一页

      </button>


      <span>
        ${refundPage} / ${info.pageCount}
        · 共 ${total} 笔
      </span>


      <button
        class="refundDetailBack"
        type="button"
        ${refundPage >= info.pageCount ? 'disabled' : ''}
        onclick="changeRefundPage(1)">

        下一页 →

      </button>

    </div>

  `;

}


window.changeRefundPage =
function(delta){

  refundPage +=
  delta;


  render();


  activeRefundList()
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


/* =====================================
   OPEN / CLOSE
===================================== */

window.openRefundFile =
function(refundId){

  selectedRefundId =
  refundId;


  render();


  activeRefundList()
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


window.closeRefundFile =
function(){

  selectedRefundId =
  null;


  render();

};


function activeRefundList(){

  return document.getElementById(
    refundView
    ===
    'pending'
    ?
    'pendingList'
    :
    'historyList'
  );

}


/* =====================================
   ROW
===================================== */

function refundCompactRowHtml(row){

  const total =
  Number(
    row.amount
    ||
    0
  );


  const refunded =
  Number(
    row.refunded_amount
    ||
    0
  );


  const remaining =
  Math.max(
    0,
    total
    -
    refunded
  );


  return `

    <div
      class="refundCompactRow"
      onclick="openRefundFile(
        '${esc(row.id)}'
      )">

      <div class="refundCompactMain">

        <div class="refundCompactTop">

          <div class="refundCompactName">
            ${esc(row.recipient_name || '未知对象')}
          </div>


          <div
            class="badge ${esc(row.status)}">

            ${esc(statusText(row.status))}

          </div>

        </div>


        <div class="refundCompactMeta">

          ${esc(recipientText(row))}

          ${
            row.customer_code
            ?
            ' · '
            +
            esc(row.customer_code)
            :
            ''
          }

          ${
            row.customer_username
            ?
            ' · @'
            +
            esc(row.customer_username)
            :
            ''
          }

        </div>


        <div class="refundCompactInfo">

          <span>

            期数

            <strong>
              ${esc(roundName(row))}
            </strong>

          </span>


          <span>

            金额

            <strong>
              ${money(total)}
            </strong>

          </span>


          ${
            refundView
            ===
            'pending'
            ?
            `
              <span>

                剩余

                <strong class="refundCompactMoney">
                  ${money(remaining)}
                </strong>

              </span>
            `
            :
            `
              <span>

                已退

                <strong class="refundCompactMoney">
                  ${money(refunded)}
                </strong>

              </span>
            `
          }

        </div>

      </div>


      <div class="refundCompactArrow">
        ›
      </div>

    </div>

  `;

}


/* =====================================
   LIST
===================================== */

function renderRefundList(
  target,
  viewRows
){

  if(!target){
    return;
  }


  if(selectedRefundId){

    const selected =
    rows.find(
      row =>
      String(row.id)
      ===
      String(selectedRefundId)
    );


    let belongs =
    false;


    if(selected){

      if(
        refundView
        ===
        'pending'
      ){

        belongs =
        isPendingRefund(
          selected
        );

      }


      if(
        refundView
        ===
        'refunded'
      ){

        belongs =
        selected.status
        ===
        'refunded';

      }


      if(
        refundView
        ===
        'cancelled'
      ){

        belongs =
        selected.status
        ===
        'cancelled';

      }

    }


    if(belongs){

      target.innerHTML = `

        <div class="refundDetailTop">

          <strong>
            退款详情
          </strong>


          <button
            class="refundDetailBack"
            type="button"
            onclick="closeRefundFile()">

            ← 返回列表

          </button>

        </div>


        ${refundHtml(selected)}

      `;


      return;

    }


    selectedRefundId =
    null;

  }


  if(!viewRows.length){

    target.innerHTML = `

      <div class="empty">

        ${
          refundView
          ===
          'pending'
          ?
          '当前没有待处理退款'
          :
          refundView
          ===
          'refunded'
          ?
          '暂无已退款记录'
          :
          '暂无已结案记录'
        }

      </div>

    `;


    return;

  }


  const info =
  refundPageInfo(
    viewRows.length
  );


  const visible =
  viewRows.slice(
    info.start,
    info.end
  );


  target.innerHTML = `

    <div class="refundDirectoryHead">

      <strong>

        ${
          refundView
          ===
          'pending'
          ?
          '待处理退款'
          :
          refundView
          ===
          'refunded'
          ?
          '已退款记录'
          :
          '已结案记录'
        }

      </strong>


      <span>
        共 ${viewRows.length} 笔
      </span>

    </div>


    ${

      visible
      .map(
        refundCompactRowHtml
      )
      .join('')

    }


    ${refundPagerHtml(viewRows.length)}

  `;

}


/* =====================================
   OVERRIDE ORIGINAL RENDER
===================================== */

window.render =
function(){

  const pending =
  rows.filter(
    isPendingRefund
  );


  const refunded =
  rows.filter(
    row =>
    row.status
    ===
    'refunded'
  );


  const cancelled =
  rows.filter(
    row =>
    row.status
    ===
    'cancelled'
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
    'refundedCount'
  )
  .textContent =
  refunded.length;


  document
  .getElementById(
    'cancelledCount'
  )
  .textContent =
  cancelled.length;


  /*
    Tab 状态
  */

  document
  .getElementById(
    'refundViewPending'
  )
  ?.classList
  .toggle(
    'active',
    refundView
    ===
    'pending'
  );


  document
  .getElementById(
    'refundViewRefunded'
  )
  ?.classList
  .toggle(
    'active',
    refundView
    ===
    'refunded'
  );


  document
  .getElementById(
    'refundViewCancelled'
  )
  ?.classList
  .toggle(
    'active',
    refundView
    ===
    'cancelled'
  );


  /*
    同时只显示一个分类
  */

  const pendingBox =
  refundPendingSection();


  const historyBox =
  refundHistorySection();


  if(pendingBox){

    pendingBox.style.display =
    refundView
    ===
    'pending'
    ?
    ''
    :
    'none';

  }


  if(historyBox){

    historyBox.style.display =
    refundView
    ===
    'pending'
    ?
    'none'
    :
    '';

  }


  renderRefundList(
    activeRefundList(),
    rowsForRefundView()
  );

};


/* =====================================
   INSTALL
===================================== */

function install(){

  installRefundCompactStyle();

  installRefundTabs();

  render();

}


install();

})();
