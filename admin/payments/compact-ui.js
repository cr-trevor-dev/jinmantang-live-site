(()=>{
'use strict';

/*
  JMT Admin Payment Center
  Compact UI Layer

  只负责：
  - 付款列表紧凑显示
  - 付款列表分页
  - 单笔付款进入详情

  不修改：
  - 付款数据
  - confirmed_amount
  - payment status
  - admin_review_customer_payment
  - 付款凭证读取
  - 超时退款逻辑
*/

let paymentPage = 1;
let selectedPaymentId = null;
let lastPaymentSearch = '';
let lastPaymentView = '';

const PAYMENT_PAGE_SIZE = 12;


/* =====================================
   STYLE
===================================== */

function installPaymentCompactStyle(){

  if(
    document.getElementById(
      'jmtPaymentCompactStyle'
    )
  ){
    return;
  }


  const style =
  document.createElement(
    'style'
  );


  style.id =
  'jmtPaymentCompactStyle';


  style.textContent = `

.paymentDirectoryHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-top:13px;
  margin-bottom:8px;
}

.paymentDirectoryHead strong{
  color:#e3c873;
  font-size:13px;
}

.paymentDirectoryHead span{
  color:#80796c;
  font-size:10px;
}

.paymentCompactRow{
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

.paymentCompactRow:active{
  background:#17140d;
}

.paymentCompactMain{
  min-width:0;
  flex:1;
}

.paymentCompactTop{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
}

.paymentCompactName{
  color:#efd477;
  font-size:15px;
  font-weight:900;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.paymentCompactCode{
  margin-top:4px;
  color:#817968;
  font-size:10px;
}

.paymentCompactInfo{
  display:flex;
  flex-wrap:wrap;
  gap:5px 12px;
  margin-top:7px;
  color:#8e8678;
  font-size:10px;
}

.paymentCompactInfo strong{
  color:#d7c17c;
  font-weight:900;
}

.paymentCompactAmount{
  color:#efd477!important;
}

.paymentCompactArrow{
  flex:none;
  color:#d8bf73;
  font-size:20px;
}

.paymentPager{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:8px;
  margin-top:14px;
}

.paymentPager span{
  text-align:center;
  color:#8d8577;
  font-size:11px;
  white-space:nowrap;
}

.paymentDetailTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-top:13px;
  margin-bottom:4px;
}

.paymentDetailTop strong{
  color:#e5c96f;
  font-size:13px;
}

.paymentDetailBack{
  width:auto;
  min-width:110px;
}

@media(max-width:520px){

  .paymentPager{
    grid-template-columns:1fr;
  }

}

`;


  document.head.appendChild(
    style
  );

}


/* =====================================
   PAGE
===================================== */

function paymentPageInfo(
  total
){

  const pageCount =
  Math.max(
    1,
    Math.ceil(
      total
      /
      PAYMENT_PAGE_SIZE
    )
  );


  paymentPage =
  Math.min(
    Math.max(
      1,
      paymentPage
    ),
    pageCount
  );


  const start =
  (
    paymentPage
    -
    1
  )
  *
  PAYMENT_PAGE_SIZE;


  return {
    pageCount,
    start,
    end:start+PAYMENT_PAGE_SIZE
  };

}


function paymentPagerHtml(total){

  const info =
  paymentPageInfo(
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

    <div class="paymentPager">

      <button
        class="secondary"
        type="button"
        ${paymentPage <= 1 ? 'disabled' : ''}
        onclick="changePaymentPage(-1)">

        ← 上一页

      </button>


      <span>
        ${paymentPage} / ${info.pageCount}
        · 共 ${total} 笔
      </span>


      <button
        class="secondary"
        type="button"
        ${paymentPage >= info.pageCount ? 'disabled' : ''}
        onclick="changePaymentPage(1)">

        下一页 →

      </button>

    </div>

  `;

}


window.changePaymentPage =
function(delta){

  paymentPage +=
  delta;


  renderPayments();


  document
  .getElementById(
    'paymentList'
  )
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


/* =====================================
   OPEN / CLOSE DETAIL
===================================== */

window.openPaymentFile =
function(paymentId){

  selectedPaymentId =
  paymentId;


  renderPayments();


  document
  .getElementById(
    'paymentList'
  )
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


window.closePaymentFile =
function(){

  selectedPaymentId =
  null;


  renderPayments();

};


/* =====================================
   LIST
===================================== */

window.renderPayments =
function(){

  const list =
  document.getElementById(
    'paymentList'
  );


  if(!list){
    return;
  }


  /*
    如果 Admin 在详情里完成审核，
    原来的 reviewPayment() 会调用 loadAll()。

    付款状态改变以后，
    如果它已经不属于当前分类，
    自动回到当前分类列表。
  */

  if(selectedPaymentId){

    const payment =
    payments.find(
      item =>
      item.id
      ===
      selectedPaymentId
    );


    if(
      payment
      &&
      paymentGroup(payment)
      ===
      currentView
    ){

      list.innerHTML =
      paymentDetailHtmlCompact(
        payment
      );


      return;

    }


    selectedPaymentId =
    null;

  }


  const query =
  String(
    document
    .getElementById(
      'searchInput'
    )
    ?.value
    ||
    ''
  )
  .trim()
  .toLowerCase();


  if(
    query
    !==
    lastPaymentSearch
    ||
    currentView
    !==
    lastPaymentView
  ){

    paymentPage =
    1;


    lastPaymentSearch =
    query;


    lastPaymentView =
    currentView;

  }


    let rows =
  payments.filter(
    payment =>
    paymentGroup(
      payment
    )
    ===
    currentView
  );


  rows =
  rows.filter(
    paymentMatchesPaymentFilter
  );


  if(query){

    rows =
    rows.filter(
      payment => {

        const customer =
        customerById(
          payment.customer_id
        );


        const text =
        [
          customer?.customer_code,
          customer?.username,
          customer?.display_name,
          customer?.phone
        ]
        .join(' ')
        .toLowerCase();


        return text.includes(
          query
        );

      }
    );

  }


  if(!rows.length){

    list.innerHTML = `

      <div class="empty">
        这个分类目前没有记录
      </div>

    `;


    return;

  }


  const info =
  paymentPageInfo(
    rows.length
  );


  const visible =
  rows.slice(
    info.start,
    info.end
  );


  list.innerHTML = `

    <div class="paymentDirectoryHead">

      <strong>
        ${esc(titleForView())}
      </strong>

      <span>
        共 ${rows.length} 笔
      </span>

    </div>


    ${

      visible
      .map(
        paymentCompactRowHtml
      )
      .join('')

    }


    ${

      paymentPagerHtml(
        rows.length
      )

    }

  `;

};


/* =====================================
   COMPACT ROW
===================================== */

function paymentCompactRowHtml(
  payment
){

  const customer =
  customerById(
    payment.customer_id
  );


  const group =
  paymentGroup(
    payment
  );


  const labelMap = {

    pending:
    '待审核',

    approved:
    '已通过',

    late:
    '超时未审核',

    rejected:
    '管理员驳回'

  };


  return `

    <div
      class="paymentCompactRow"
      onclick="openPaymentFile(
        '${esc(payment.id)}'
      )">

      <div class="paymentCompactMain">

        <div class="paymentCompactTop">

          <div class="paymentCompactName">

            ${esc(
              customer?.display_name
              ||
              '未填写姓名'
            )}

          </div>


          <div
            class="badge ${group}">

            ${esc(
              labelMap[group]
            )}

          </div>

        </div>


        <div class="paymentCompactCode">

          ${esc(
            customer?.customer_code
            ||
            '—'
          )}

        </div>


        <div class="paymentCompactInfo">

          <span>

            期数

            <strong>
              ${esc(
                roundName(
                  payment.round_id
                )
              )}
            </strong>

          </span>


          <span>

            申报

            <strong class="paymentCompactAmount">
              ${money(
                payment.declared_amount
              )}
            </strong>

          </span>


          ${
            group
            ===
            'approved'
            ?
            `
              <span>

                确认

                <strong>
                  ${money(
                    payment.confirmed_amount
                  )}
                </strong>

              </span>
            `
            :
            ''
          }


          <span>

            凭证

            <strong>
              ${
                proofForSubmission(
                  payment.id
                )
                ?
                '已上传'
                :
                '无'
              }
            </strong>

          </span>

        </div>

      </div>


      <div class="paymentCompactArrow">
        ›
      </div>

    </div>

  `;

}


/* =====================================
   DETAIL
===================================== */

function paymentDetailHtmlCompact(
  payment
){

  return `

    <div class="paymentDetailTop">

      <strong>
        付款详情
      </strong>

      <button
        class="secondary paymentDetailBack"
        type="button"
        onclick="closePaymentFile()">

        ← 返回列表

      </button>

    </div>


    ${paymentHtml(payment)}

  `;

}

/* =====================================
   DATE / ROUND FILTER
===================================== */

function installPaymentFilters(){

  if(
    document.getElementById(
      'paymentFilterBox'
    )
  ){
    return;
  }


  const toolbar =
  document.querySelector(
    '.toolbar'
  );


  if(!toolbar){
    return;
  }


  const box =
  document.createElement(
    'div'
  );


  box.id =
  'paymentFilterBox';


    box.innerHTML = `

    <div
      style="
        display:grid;
        grid-template-columns:1fr;
        gap:9px;
        margin-top:10px;
      ">

      <input
        id="paymentDateFilter"
        type="date"
        onchange="resetPaymentFilterPage()"
        style="
          width:100%;
        ">


      <div
        style="
          display:grid;
          grid-template-columns:1fr auto;
          gap:9px;
        ">

        <select
          id="paymentRoundFilter"
          onchange="resetPaymentFilterPage()"
          style="
            width:100%;
            min-width:0;
            border:1px solid rgba(214,168,63,.24);
            background:#101011;
            color:#fff;
            border-radius:13px;
            padding:14px;
            font-size:14px;
            outline:none;
          ">

          <option value="">
            全部期数
          </option>

          <option value="1030">
            上午 11:45
          </option>

          <option value="1530">
            下午 15:45
          </option>

        </select>


        <button
          class="secondary"
          type="button"
          onclick="clearPaymentFilters()"
          style="
            min-width:82px;
            padding-left:16px;
            padding-right:16px;
          ">

          清除

        </button>

      </div>

    </div>


    <div
      style="
        margin-top:8px;
        color:#776f61;
        font-size:10px;
        line-height:1.5;
      ">

      可按日期和上午 / 下午期筛选付款记录

    </div>

  `;


  toolbar.insertAdjacentElement(
    'afterend',
    box
  );

}


window.resetPaymentFilterPage =
function(){

  paymentPage =
  1;


  selectedPaymentId =
  null;


  renderPayments();

};


window.clearPaymentFilters =
function(){

  const date =
  document.getElementById(
    'paymentDateFilter'
  );


  const round =
  document.getElementById(
    'paymentRoundFilter'
  );


  if(date){
    date.value = '';
  }


  if(round){
    round.value = '';
  }


  paymentPage =
  1;


  selectedPaymentId =
  null;


  renderPayments();

};


function paymentMatchesPaymentFilter(
  payment
){

  const dateValue =
  document.getElementById(
    'paymentDateFilter'
  )
  ?.value
  ||
  '';


  const roundCode =
  document.getElementById(
    'paymentRoundFilter'
  )
  ?.value
  ||
  '';


  if(
    !dateValue
    &&
    !roundCode
  ){

    return true;

  }


  const round =
  rounds.find(
    item =>
    item.id
    ===
    payment.round_id
  );


  if(!round){

    return false;

  }


  if(
    dateValue
    &&
    round.round_date
    !==
    dateValue
  ){

    return false;

  }


  if(
    roundCode
    &&
    round.round_code
    !==
    roundCode
  ){

    return false;

  }


  return true;

}
/* =====================================
   INSTALL
===================================== */

function install(){

  installPaymentCompactStyle();

  installPaymentFilters();


  lastPaymentView =
  currentView;


  renderPayments();

}


install();

})();
