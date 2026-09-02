(()=>{
'use strict';


/*
  JIN MANTANG
  Customer History Center

  这里只读取已经存在的正式账本：
  - customer_settlements
  - customer_round_orders
  - customer_payment_submissions
  - customer_payout_transactions
  - finance_refunds
  - rounds

  不创建第二套金额。
  不修改任何付款、下注、结算、退款、派彩数据。
*/


const PAGE_SIZE =
10;


let historyOpen =
false;


let historyView =
'rounds';


let historyPages = {
  rounds:1,
  payments:1,
  payouts:1
};


let historyData = {
  settlements:[],
  orders:[],
  payments:[],
  payouts:[],
  refunds:[],
  rounds:[]
};


let lastHistoryLoad =
0;


let historyLoading =
false;


/* =========================================
   BASIC
========================================= */

function h$(id){
  return document.getElementById(id);
}


function hEsc(value){

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


function hMoney(value){

  return new Intl.NumberFormat(
    'en-US',
    {
      maximumFractionDigits:0
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


function hTime(value){

  if(!value){
    return '—';
  }


  try{

    return new Date(
      value
    )
    .toLocaleString(
      'zh-CN',
      {
        timeZone:
        'Asia/Yangon',

        year:
        'numeric',

        month:
        '2-digit',

        day:
        '2-digit',

        hour:
        '2-digit',

        minute:
        '2-digit',

        hour12:
        false
      }
    );

  }
  catch{

    return String(
      value
    );

  }

}


function hPeriod(code){

  if(code === '1030'){
    return '上午 11:45';
  }


  if(code === '1530'){
    return '下午 3:45';
  }


  return code || '—';

}


const H_ZODIACS = [
  '鼠',
  '牛',
  '虎',
  '兔',
  '龙',
  '蛇',
  '马',
  '羊',
  '猴',
  '鸡',
  '狗',
  '猪'
];


function hZodiac(code){

  const index =
  Number(
    code
    ||
    0
  )
  -
  1;


  return (
    H_ZODIACS[
      index
    ]
    ||
    '—'
  );

}


async function hFetch(path){

  const res =
  await fetch(
    BASE
    +
    path,
    {
      headers:
      authHeaders()
    }
  );


  return parseResponse(
    res
  );

}


/* =========================================
   STYLE
========================================= */

function ensureHistoryStyle(){

  if(
    h$(
      'jmtCustomerHistoryStyle'
    )
  ){
    return;
  }


  const style =
  document.createElement(
    'style'
  );


  style.id =
  'jmtCustomerHistoryStyle';


  style.textContent = `

.customerHistoryHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
}

.customerHistoryToggle{
  width:auto!important;
  margin:0!important;
  padding:9px 13px!important;
  font-size:12px!important;
}

.customerHistoryBody{
  margin-top:14px;
}

.customerHistoryTabs{
  display:grid;
  grid-template-columns:
  repeat(3,1fr);
  gap:7px;
  margin-bottom:12px;
}

.customerHistoryTab{
  width:100%;
  margin:0;
  padding:11px 7px;
  border-radius:11px;
  background:#101011;
  color:#94896d;
  border:
  1px solid
  rgba(214,168,63,.16);
  font-size:12px;
  font-weight:800;
}

.customerHistoryTab.active{
  color:#f1d277;
  border-color:
  rgba(214,168,63,.48);
  background:
  linear-gradient(
    180deg,
    #2a210f,
    #15120b
  );
}

.customerHistoryItem{
  margin-top:8px;
  border:
  1px solid
  rgba(214,168,63,.16);
  border-radius:14px;
  background:#0d0d0e;
  overflow:hidden;
}

.customerHistoryItem summary{
  list-style:none;
  cursor:pointer;
  padding:13px;
}

.customerHistoryItem summary::-webkit-details-marker{
  display:none;
}

.customerHistorySummary{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
}

.customerHistoryMain{
  min-width:0;
}

.customerHistoryTitle{
  color:#e7ca77;
  font-size:13px;
  font-weight:900;
}

.customerHistoryMeta{
  color:#7f7767;
  font-size:10px;
  margin-top:5px;
  line-height:1.5;
}

.customerHistoryState{
  flex:none;
  padding:5px 8px;
  border-radius:999px;
  font-size:10px;
  font-weight:900;
}

.customerHistoryState.ok{
  color:#87d9a7;
  background:#153124;
}

.customerHistoryState.wait{
  color:#e1c76e;
  background:#352d13;
}

.customerHistoryState.bad{
  color:#dfa09a;
  background:#311919;
}

.customerHistoryState.neutral{
  color:#b6aa8b;
  background:#22201b;
}

.customerHistoryDetail{
  border-top:
  1px solid
  rgba(255,255,255,.05);
  padding:11px 13px 13px;
}

.customerHistoryRow{
  display:flex;
  justify-content:space-between;
  gap:14px;
  padding:7px 0;
  font-size:11px;
  border-bottom:
  1px solid
  rgba(255,255,255,.045);
}

.customerHistoryRow:last-child{
  border-bottom:0;
}

.customerHistoryRow span{
  color:#80786a;
}

.customerHistoryRow strong{
  color:#e2d5b3;
  text-align:right;
  word-break:break-word;
}

.customerHistoryNote{
  margin-top:9px;
  padding:10px 11px;
  border-radius:10px;
  border:
  1px solid
  rgba(214,168,63,.14);
  background:#12110d;
  color:#a99b76;
  font-size:10px;
  line-height:1.65;
}

.customerHistoryPager{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  gap:8px;
  align-items:center;
  margin-top:12px;
}

.customerHistoryPager button{
  margin:0;
  padding:10px;
  font-size:11px;
}

.customerHistoryPager span{
  color:#817968;
  font-size:10px;
  text-align:center;
  white-space:nowrap;
}

.customerHistoryEmpty{
  text-align:center;
  color:#817968;
  padding:24px 8px;
  font-size:11px;
}

@media(max-width:520px){

  .customerHistoryPager{
    grid-template-columns:1fr;
  }

}

`;


  document.head.appendChild(
    style
  );

}


/* =========================================
   CARD
========================================= */

function ensureHistoryCard(){

  let card =
  h$(
    'customerHistoryCard'
  );


  if(card){
    return card;
  }


  const roundCard =
  h$(
    'roundCard'
  );


  if(
    !roundCard
    ||
    !roundCard.parentNode
  ){
    return null;
  }


  card =
  document.createElement(
    'section'
  );


  card.id =
  'customerHistoryCard';


  card.className =
  'card';


  card.innerHTML = `

    <div class="customerHistoryHead">

      <div>

        <div
          class="cardTitle"
          style="margin-bottom:4px">

          历史记录

        </div>

        <div class="note"
          style="margin-top:0">

          期数、付款与派彩记录都会保留在这里。
          开启下一期不会删除上一期记录。

        </div>

      </div>


      <button
        id="customerHistoryToggle"
        class="secondary customerHistoryToggle"
        type="button"
        onclick="toggleCustomerHistory()">

        查看

      </button>

    </div>


    <div
      id="customerHistoryBody"
      class="customerHistoryBody hidden">

      <div class="customerHistoryTabs">

        <button
          id="customerHistoryTabRounds"
          class="customerHistoryTab active"
          type="button"
          onclick="setCustomerHistoryView('rounds')">

          期数

        </button>

        <button
          id="customerHistoryTabPayments"
          class="customerHistoryTab"
          type="button"
          onclick="setCustomerHistoryView('payments')">

          付款

        </button>

        <button
          id="customerHistoryTabPayouts"
          class="customerHistoryTab"
          type="button"
          onclick="setCustomerHistoryView('payouts')">

          派彩

        </button>

      </div>


      <div id="customerHistoryList">

        <div class="customerHistoryEmpty">
          正在读取历史记录...
        </div>

      </div>

    </div>

  `;


  roundCard.parentNode.insertBefore(
    card,
    roundCard
  );


  return card;

}


/* =========================================
   DATA MAP
========================================= */

function roundMap(){

  return new Map(
    historyData.rounds.map(
      item=>[
        item.id,
        item
      ]
    )
  );

}


function orderMap(){

  return new Map(
    historyData.orders.map(
      item=>[
        item.id,
        item
      ]
    )
  );

}


function refundMap(){

  const map =
  new Map();


  historyData.refunds
  .forEach(
    refund=>{

      if(
        refund.source_type
        !==
        'customer_payment'
      ){
        return;
      }


      if(
        !map.has(
          refund.source_id
        )
      ){
        map.set(
          refund.source_id,
          refund
        );
      }

    }
  );


  return map;

}


function payoutMap(){

  const map =
  new Map();


  historyData.payouts
  .forEach(
    tx=>{

      const key =
      tx.settlement_id;


      if(!map.has(key)){
        map.set(
          key,
          []
        );
      }


      map.get(
        key
      )
      .push(
        tx
      );

    }
  );


  return map;

}


/* =========================================
   PAYMENT STATUS
========================================= */

function friendlyRejectReason(reason){

  const text =
  String(
    reason
    ||
    ''
  )
  .trim();


  if(!text){

    return '平台未通过本次付款审核。';

  }


  if(
    text.includes(
      'ROUND_RESULT_PUBLISHED_BEFORE_PAYMENT_APPROVAL'
    )
  ){

    return '本笔付款在期开奖前尚未完成审核，现已转入平台人工核对。';

  }


  if(
    /^[A-Z0-9_:\- ]+$/
    .test(
      text
    )
  ){

    return '本次付款未通过审核，如需了解详情请联系平台客服。';

  }


  return text;

}


function paymentDisplay(
  payment,
  refund
){

  if(
    payment.status
    ===
    'approved'
  ){

    return {
      text:'已确认',
      kind:'ok',
      note:
      payment.reviewed_at
      ?
      '平台已确认本笔付款。'
      :
      '平台已确认本笔付款。'
    };

  }


  if(
    payment.status
    ===
    'pending'
  ){

    return {
      text:'审核中',
      kind:'wait',
      note:
      '付款已经提交，正在等待平台审核。'
    };

  }


  if(refund){

    const total =
    Number(
      refund.amount
      ||
      0
    );


    const refunded =
    Number(
      refund.refunded_amount
      ||
      0
    );


    if(
      refund.status
      ===
      'refunded'
      ||
      (
        total > 0
        &&
        refunded >= total
      )
    ){

      return {
        text:'已退回',
        kind:'ok',
        note:
        '平台已完成实际退款 '
        +
        hMoney(
          refunded
        )
        +
        '。'
      };

    }


    if(
      refund.status
      ===
      'partial'
    ){

      return {
        text:'部分退回',
        kind:'wait',
        note:
        '已实际退回 '
        +
        hMoney(
          refunded
        )
        +
        '，剩余 '
        +
        hMoney(
          Math.max(
            total
            -
            refunded,
            0
          )
        )
        +
        ' 待处理。'
      };

    }


    if(
      refund.status
      ===
      'cancelled'
    ){

      return {
        text:'已结案',
        kind:'neutral',
        note:
        '平台已完成到账核对，本笔记录无需继续退款处理。'
      };

    }


    return {
      text:'待平台核对',
      kind:'wait',
      note:
      '本笔付款在期开奖前尚未完成审核。平台正在核对实际到账情况；确认实际到账后，会按核对结果继续处理。'
    };

  }


  if(
    String(
      payment.rejection_reason
      ||
      ''
    )
    .includes(
      'ROUND_RESULT_PUBLISHED_BEFORE_PAYMENT_APPROVAL'
    )
  ){

    return {
      text:'待平台核对',
      kind:'wait',
      note:
      '本笔付款在期开奖前尚未完成审核，平台正在核对实际到账情况。'
    };

  }


  return {
    text:'未通过',
    kind:'bad',
    note:
    friendlyRejectReason(
      payment.rejection_reason
    )
  };

}


/* =========================================
   ROUND VIEW
========================================= */

function settlementState(
  settlement
){

  const due =
  Number(
    settlement.payout_due
    ||
    0
  );


  const paid =
  Number(
    settlement.payout_paid
    ||
    0
  );


  if(due <= 0){

    return {
      text:'未中奖',
      kind:'neutral'
    };

  }


  if(
    settlement.payout_status
    ===
    'paid'
    ||
    paid >= due
  ){

    return {
      text:'已完成',
      kind:'ok'
    };

  }


  if(paid > 0){

    return {
      text:'部分派彩',
      kind:'wait'
    };

  }


  return {
    text:'待派彩',
    kind:'wait'
  };

}


function roundItemHtml(
  settlement,
  rounds,
  orders
){

  const round =
  rounds.get(
    settlement.round_id
  )
  ||
  {};


  const order =
  orders.get(
    settlement.order_id
  )
  ||
  {};


  const state =
  settlementState(
    settlement
  );


  const due =
  Number(
    settlement.payout_due
    ||
    0
  );


  const paid =
  Number(
    settlement.payout_paid
    ||
    0
  );


  return `

    <details class="customerHistoryItem">

      <summary>

        <div class="customerHistorySummary">

          <div class="customerHistoryMain">

            <div class="customerHistoryTitle">

              ${hEsc(
                round.round_date
                ||
                '—'
              )}

              ·

              ${hEsc(
                hPeriod(
                  round.round_code
                )
              )}

              ·

              ${hEsc(
                hZodiac(
                  settlement.result_number
                  ||
                  round.result_number
                )
              )}

            </div>

            <div class="customerHistoryMeta">

              有效下注
              ${hMoney(
                order.confirmed_total
                ||
                0
              )}

              ${
                Number(
                  settlement.winning_points
                  ||
                  0
                )
                >
                0
                ?
                ' · 命中 '
                +
                hMoney(
                  settlement.winning_points
                )
                :
                ''
              }

            </div>

          </div>


          <div
            class="customerHistoryState ${state.kind}">

            ${state.text}

          </div>

        </div>

      </summary>


      <div class="customerHistoryDetail">

        <div class="customerHistoryRow">
          <span>开奖生肖</span>
          <strong>
            ${hEsc(
              hZodiac(
                settlement.result_number
                ||
                round.result_number
              )
            )}
          </strong>
        </div>

        <div class="customerHistoryRow">
          <span>本期有效下注</span>
          <strong>
            ${hMoney(
              order.confirmed_total
              ||
              0
            )}
          </strong>
        </div>

        <div class="customerHistoryRow">
          <span>命中金额</span>
          <strong>
            ${hMoney(
              settlement.winning_points
              ||
              0
            )}
          </strong>
        </div>

        <div class="customerHistoryRow">
          <span>中奖应返还</span>
          <strong>
            ${hMoney(due)}
          </strong>
        </div>

        ${
          due > 0
          ?
          `
            <div class="customerHistoryRow">
              <span>已派彩</span>
              <strong>
                ${hMoney(paid)}
              </strong>
            </div>

            <div class="customerHistoryRow">
              <span>剩余待派</span>
              <strong>
                ${hMoney(
                  Math.max(
                    due
                    -
                    paid,
                    0
                  )
                )}
              </strong>
            </div>
          `
          :
          ''
        }

        <div class="customerHistoryRow">
          <span>结算时间</span>
          <strong>
            ${hEsc(
              hTime(
                settlement.settled_at
              )
            )}
          </strong>
        </div>

        ${
          settlement.completed_at
          ?
          `
            <div class="customerHistoryRow">
              <span>完成时间</span>
              <strong>
                ${hEsc(
                  hTime(
                    settlement.completed_at
                  )
                )}
              </strong>
            </div>
          `
          :
          ''
        }

      </div>

    </details>

  `;

}


/* =========================================
   PAYMENT VIEW
========================================= */

function paymentItemHtml(
  payment,
  rounds,
  refunds
){

  const round =
  rounds.get(
    payment.round_id
  )
  ||
  {};


  const refund =
  refunds.get(
    payment.id
  )
  ||
  null;


  const state =
  paymentDisplay(
    payment,
    refund
  );


  return `

    <details class="customerHistoryItem">

      <summary>

        <div class="customerHistorySummary">

          <div class="customerHistoryMain">

            <div class="customerHistoryTitle">

              ${hEsc(
                payment.method_name_snapshot
                ||
                '付款'
              )}

              ·

              ${hMoney(
                payment.declared_amount
              )}

            </div>

            <div class="customerHistoryMeta">

              ${hEsc(
                round.round_date
                ||
                '—'
              )}

              ·

              ${hEsc(
                hPeriod(
                  round.round_code
                )
              )}

              ·

              ${hEsc(
                hTime(
                  payment.submitted_at
                )
              )}

            </div>

          </div>


          <div
            class="customerHistoryState ${state.kind}">

            ${state.text}

          </div>

        </div>

      </summary>


      <div class="customerHistoryDetail">

        <div class="customerHistoryRow">
          <span>提交金额</span>
          <strong>
            ${hMoney(
              payment.declared_amount
            )}
          </strong>
        </div>

        <div class="customerHistoryRow">
          <span>已确认金额</span>
          <strong>
            ${hMoney(
              payment.confirmed_amount
              ||
              0
            )}
          </strong>
        </div>

        <div class="customerHistoryRow">
          <span>提交时间</span>
          <strong>
            ${hEsc(
              hTime(
                payment.submitted_at
              )
            )}
          </strong>
        </div>

        ${
          payment.reviewed_at
          ?
          `
            <div class="customerHistoryRow">
              <span>审核时间</span>
              <strong>
                ${hEsc(
                  hTime(
                    payment.reviewed_at
                  )
                )}
              </strong>
            </div>
          `
          :
          ''
        }

        ${
          refund
          &&
          Number(
            refund.refunded_amount
            ||
            0
          )
          >
          0
          ?
          `
            <div class="customerHistoryRow">
              <span>已实际退回</span>
              <strong>
                ${hMoney(
                  refund.refunded_amount
                )}
              </strong>
            </div>
          `
          :
          ''
        }

        ${
          refund?.completed_at
          ?
          `
            <div class="customerHistoryRow">
              <span>退款完成时间</span>
              <strong>
                ${hEsc(
                  hTime(
                    refund.completed_at
                  )
                )}
              </strong>
            </div>
          `
          :
          ''
        }

        <div class="customerHistoryNote">
          ${hEsc(
            state.note
          )}
        </div>

      </div>

    </details>

  `;

}


/* =========================================
   PAYOUT VIEW
========================================= */

function payoutItemHtml(
  settlement,
  rounds,
  transactions
){

  const round =
  rounds.get(
    settlement.round_id
  )
  ||
  {};


  const state =
  settlementState(
    settlement
  );


  const txs =
  transactions.get(
    settlement.id
  )
  ||
  [];


  const due =
  Number(
    settlement.payout_due
    ||
    0
  );


  const paid =
  Number(
    settlement.payout_paid
    ||
    0
  );


  return `

    <details class="customerHistoryItem">

      <summary>

        <div class="customerHistorySummary">

          <div class="customerHistoryMain">

            <div class="customerHistoryTitle">

              ${hEsc(
                round.round_date
                ||
                '—'
              )}

              ·

              ${hEsc(
                hPeriod(
                  round.round_code
                )
              )}

              · 应派

              ${hMoney(due)}

            </div>

            <div class="customerHistoryMeta">

              开奖生肖
              ${hEsc(
                hZodiac(
                  settlement.result_number
                  ||
                  round.result_number
                )
              )}

              ·

              已派
              ${hMoney(paid)}

            </div>

          </div>


          <div
            class="customerHistoryState ${state.kind}">

            ${state.text}

          </div>

        </div>

      </summary>


      <div class="customerHistoryDetail">

        <div class="customerHistoryRow">
          <span>应派彩</span>
          <strong>
            ${hMoney(due)}
          </strong>
        </div>

        <div class="customerHistoryRow">
          <span>已派彩</span>
          <strong>
            ${hMoney(paid)}
          </strong>
        </div>

        <div class="customerHistoryRow">
          <span>剩余待派</span>
          <strong>
            ${hMoney(
              Math.max(
                due
                -
                paid,
                0
              )
            )}
          </strong>
        </div>

        ${
          txs.length
          ?
          txs
          .map(
            tx=>`

              <div class="customerHistoryNote">

                <strong>
                  本次派彩：
                  ${hMoney(
                    tx.amount
                  )}
                </strong>

                <br>

                时间：
                ${hEsc(
                  hTime(
                    tx.paid_at
                  )
                )}

                <br>

                收款方式：
                ${hEsc(
                  String(
                    tx.method_type
                    ||
                    ''
                  )
                  .toUpperCase()
                  ||
                  '—'
                )}

                <br>

                户名：
                ${hEsc(
                  tx.account_name_snapshot
                  ||
                  '—'
                )}

                <br>

                账号：
                ${hEsc(
                  tx.account_number_snapshot
                  ||
                  '—'
                )}

                ${
                  tx.bank_name_snapshot
                  ?
                  '<br>银行：'
                  +
                  hEsc(
                    tx.bank_name_snapshot
                  )
                  :
                  ''
                }

                ${
                  tx.admin_note
                  ?
                  '<br>平台备注：'
                  +
                  hEsc(
                    tx.admin_note
                  )
                  :
                  ''
                }

              </div>

            `
          )
          .join('')
          :
          `
            <div class="customerHistoryNote">
              ${
                due > 0
                ?
                '当前仍在等待平台实际派彩。'
                :
                '本期没有派彩记录。'
              }
            </div>
          `
        }

      </div>

    </details>

  `;

}


/* =========================================
   PAGING / RENDER
========================================= */

function pagerHtml(
  total,
  view
){

  const totalPages =
  Math.max(
    1,
    Math.ceil(
      total
      /
      PAGE_SIZE
    )
  );


  historyPages[
    view
  ] =
  Math.min(
    Math.max(
      historyPages[
        view
      ]
      ||
      1,
      1
    ),
    totalPages
  );


  if(totalPages <= 1){
    return '';
  }


  const page =
  historyPages[
    view
  ];


  return `

    <div class="customerHistoryPager">

      <button
        class="secondary"
        type="button"
        ${page <= 1 ? 'disabled' : ''}
        onclick="changeCustomerHistoryPage(-1)">

        ← 上一页

      </button>

      <span>
        ${page} / ${totalPages}
        · 共 ${total} 条
      </span>

      <button
        class="secondary"
        type="button"
        ${page >= totalPages ? 'disabled' : ''}
        onclick="changeCustomerHistoryPage(1)">

        下一页 →

      </button>

    </div>

  `;

}


function pageSlice(
  items,
  view
){

  const page =
  historyPages[
    view
  ]
  ||
  1;


  const start =
  (
    page
    -
    1
  )
  *
  PAGE_SIZE;


  return items.slice(
    start,
    start
    +
    PAGE_SIZE
  );

}


function renderHistory(){

  const list =
  h$(
    'customerHistoryList'
  );


  if(!list){
    return;
  }


  [
    'rounds',
    'payments',
    'payouts'
  ]
  .forEach(
    view=>{

      h$(
        view
        ===
        'rounds'
        ?
        'customerHistoryTabRounds'
        :
        view
        ===
        'payments'
        ?
        'customerHistoryTabPayments'
        :
        'customerHistoryTabPayouts'
      )
      ?.classList
      .toggle(
        'active',
        historyView
        ===
        view
      );

    }
  );


  const rounds =
  roundMap();


  if(
    historyView
    ===
    'payments'
  ){

    const refunds =
    refundMap();


    const items =
    historyData.payments;


    if(!items.length){

      list.innerHTML =
      '<div class="customerHistoryEmpty">暂无付款历史</div>';

      return;
    }


    list.innerHTML =
    pageSlice(
      items,
      'payments'
    )
    .map(
      item=>
      paymentItemHtml(
        item,
        rounds,
        refunds
      )
    )
    .join('')
    +
    pagerHtml(
      items.length,
      'payments'
    );


    return;

  }


  if(
    historyView
    ===
    'payouts'
  ){

    const txMap =
    payoutMap();


    const items =
    historyData.settlements
    .filter(
      item=>
      Number(
        item.payout_due
        ||
        0
      )
      >
      0
    );


    if(!items.length){

      list.innerHTML =
      '<div class="customerHistoryEmpty">暂无派彩历史</div>';

      return;
    }


    list.innerHTML =
    pageSlice(
      items,
      'payouts'
    )
    .map(
      item=>
      payoutItemHtml(
        item,
        rounds,
        txMap
      )
    )
    .join('')
    +
    pagerHtml(
      items.length,
      'payouts'
    );


    return;

  }


  const orders =
  orderMap();


  const items =
  historyData.settlements;


  if(!items.length){

    list.innerHTML =
    '<div class="customerHistoryEmpty">暂无已结算期数</div>';

    return;
  }


  list.innerHTML =
  pageSlice(
    items,
    'rounds'
  )
  .map(
    item=>
    roundItemHtml(
      item,
      rounds,
      orders
    )
  )
  .join('')
  +
  pagerHtml(
    items.length,
    'rounds'
  );

}


/* =========================================
   LOAD
========================================= */

async function loadHistory(
  force=false
){

  if(
    typeof token
    ===
    'undefined'
    ||
    !token
    ||
    typeof profile
    ===
    'undefined'
    ||
    !profile
  ){
    return;
  }


  ensureHistoryStyle();


  if(
    !ensureHistoryCard()
  ){
    return;
  }


  if(historyLoading){
    return;
  }


  if(
    !force
    &&
    Date.now()
    -
    lastHistoryLoad
    <
    8000
  ){
    return;
  }


  historyLoading =
  true;


  try{

    const [
      settlements,
      orders,
      payments,
      payouts,
      refunds
    ] =
    await Promise.all([

      hFetch(
        '/rest/v1/customer_settlements'
        +
        '?select=id,round_id,order_id,result_number,winning_points,payout_multiplier_snapshot,payout_due,payout_paid,payout_status,settled_at,completed_at'
        +
        '&order=settled_at.desc'
        +
        '&limit=100'
      ),

      hFetch(
        '/rest/v1/customer_round_orders'
        +
        '?select=id,round_id,status,submitted_total,confirmed_total,pending_total,submitted_at,locked_at,created_at,updated_at'
        +
        '&order=created_at.desc'
        +
        '&limit=100'
      ),

      hFetch(
        '/rest/v1/customer_payment_submissions'
        +
        '?select=id,round_id,declared_amount,confirmed_amount,status,method_name_snapshot,submitted_at,reviewed_at,rejection_reason'
        +
        '&order=submitted_at.desc'
        +
        '&limit=100'
      ),

      hFetch(
        '/rest/v1/customer_payout_transactions'
        +
        '?select=id,settlement_id,amount,method_type,account_name_snapshot,account_number_snapshot,bank_name_snapshot,admin_note,paid_at'
        +
        '&order=paid_at.desc'
        +
        '&limit=200'
      ),

      hFetch(
        '/rest/v1/finance_refunds'
        +
        '?select=id,source_type,source_id,amount,status,refunded_amount,reason,created_at,completed_at'
        +
        '&recipient_type=eq.customer'
        +
        '&order=created_at.desc'
        +
        '&limit=100'
      )

    ]);


    const roundIds =
    [
      ...new Set(
        [
          ...settlements.map(
            item=>
            item.round_id
          ),

          ...payments.map(
            item=>
            item.round_id
          )
        ]
        .filter(
          Boolean
        )
      )
    ];


    let rounds =
    [];


    if(roundIds.length){

      rounds =
      await hFetch(

        '/rest/v1/rounds'
        +
        '?select=id,round_date,round_code,result_number,status,settled_at,created_at'
        +
        '&id=in.('
        +
        roundIds.join(',')
        +
        ')'

      );

    }


    historyData = {
      settlements:
      Array.isArray(settlements)
      ?
      settlements
      :
      [],

      orders:
      Array.isArray(orders)
      ?
      orders
      :
      [],

      payments:
      Array.isArray(payments)
      ?
      payments
      :
      [],

      payouts:
      Array.isArray(payouts)
      ?
      payouts
      :
      [],

      refunds:
      Array.isArray(refunds)
      ?
      refunds
      :
      [],

      rounds:
      Array.isArray(rounds)
      ?
      rounds
      :
      []
    };


    lastHistoryLoad =
    Date.now();


    renderHistory();

  }
  catch(error){

    console.warn(
      'CUSTOMER_HISTORY_LOAD_FAILED',
      error
    );


    const list =
    h$(
      'customerHistoryList'
    );


    if(list){

      list.innerHTML =
      '<div class="customerHistoryEmpty">历史记录读取失败，请稍后刷新重试。</div>';

    }

  }
  finally{

    historyLoading =
    false;

  }

}


/* =========================================
   PUBLIC UI
========================================= */

window.toggleCustomerHistory =
function(){

  historyOpen =
  !historyOpen;


  const body =
  h$(
    'customerHistoryBody'
  );


  const button =
  h$(
    'customerHistoryToggle'
  );


  if(!body){
    return;
  }


  body.classList.toggle(
    'hidden',
    !historyOpen
  );


  if(button){

    button.textContent =
    historyOpen
    ?
    '收起'
    :
    '查看';

  }


  if(historyOpen){

    loadHistory(
      true
    );

  }

};


window.setCustomerHistoryView =
function(view){

  if(
    ![
      'rounds',
      'payments',
      'payouts'
    ]
    .includes(
      view
    )
  ){
    return;
  }


  historyView =
  view;


  renderHistory();

};


window.changeCustomerHistoryPage =
function(delta){

  historyPages[
    historyView
  ] =
  Math.max(
    1,
    (
      historyPages[
        historyView
      ]
      ||
      1
    )
    +
    Number(
      delta
      ||
      0
    )
  );


  renderHistory();


  h$(
    'customerHistoryCard'
  )
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


/*
  复用客户中心现在已经存在的 10 秒同步。
  原来的 refreshCustomerUx 继续正常运行，
  我们只在它完成后补读历史账本。
*/
const originalRefreshCustomerUx =
window.refreshCustomerUx;


window.refreshCustomerUx =
async function(){

  let result;


  if(
    typeof originalRefreshCustomerUx
    ===
    'function'
  ){

    result =
    await originalRefreshCustomerUx();

  }


  await loadHistory(
    false
  );


  return result;

};


window.addEventListener(
  'load',
  ()=>{

    setTimeout(
      ()=>{
        loadHistory(
          true
        );
      },
      1200
    );

  }
);


})();
