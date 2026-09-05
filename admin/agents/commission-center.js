(()=>{
'use strict';

/*
  JIN MANTANG
  Admin Agent Commission Center

  只负责管理员端代理佣金分类、搜索和显示。

  不修改：
  - 客户下注
  - 客户付款审核
  - confirmed 金额计算
  - 代理佣金公式
  - 佣金结算数据
  - 派彩
  - 退款
  - 客户 / 代理归属

  正式付款继续调用现有：
  markCommissionPaid(agentId, roundId)
*/

const CENTER_ID =
'agentCommissionCenter';

const STYLE_ID =
'agentCommissionCenterStyle';

let commissionFilterStatus =
'all';

let lastCommissionSignature =
'';


function cc$(id){

  return document
  .getElementById(
    id
  );

}


function ccMoney(value){

  return Number(
    value || 0
  )
  .toLocaleString(
    'en-US',
    {
      maximumFractionDigits:2
    }
  );

}


function ccEsc(value){

  return String(
    value ?? ''
  )
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#039;');

}


function ccAgent(row){

  if(
    typeof agents
    ===
    'undefined'
    ||
    !Array.isArray(
      agents
    )
  ){

    return null;

  }

  return agents.find(
    agent =>
    agent.id
    ===
    row.agent_id
  )
  ||
  null;

}


function ccAccounts(agentId){

  if(
    typeof payoutAccounts
    ===
    'undefined'
    ||
    !Array.isArray(
      payoutAccounts
    )
  ){

    return [];

  }

  return payoutAccounts.filter(
    account =>
    account.agent_id
    ===
    agentId
  );

}


function ccPeriod(code){

  if(
    code
    ===
    '1030'
  ){

    return '上午 11:45';

  }

  if(
    code
    ===
    '1530'
  ){

    return '下午 15:45';

  }

  return code
  ||
  '—';

}


function ccIsSettled(row){

  return (
    row.round_status
    ===
    'settled'
  );

}


function ccRemaining(row){

  return Math.max(
    Number(
      row.commission_remaining
      ??
      (
        Number(
          row.commission_due
          ||
          0
        )
        -
        Number(
          row.commission_paid
          ||
          0
        )
      )
    )
    ||
    0,
    0
  );

}


function ccStatus(row){

  const due =
  Number(
    row.commission_due
    ||
    0
  );

  const paid =
  Number(
    row.commission_paid
    ||
    0
  );

  const remaining =
  ccRemaining(
    row
  );

  if(
    due <= 0
  ){

    return 'none';

  }

  if(
    remaining <= 0
    &&
    paid > 0
  ){

    return 'paid';

  }

  if(
    paid > 0
    &&
    remaining > 0
  ){

    return 'partial';

  }

  return 'pending';

}


function ccStatusText(row){

  const status =
  ccStatus(
    row
  );

  if(
    status
    ===
    'paid'
  ){

    return '已支付';

  }

  if(
    status
    ===
    'partial'
  ){

    return '部分支付';

  }

  if(
    status
    ===
    'pending'
  ){

    return '待支付';

  }

  return '无需支付';

}


function ccPayoutText(row){

  if(
    row.payout_account_number_snapshot
  ){

    const parts =
    [
      row.payout_method_type_snapshot,
      row.payout_bank_name_snapshot,
      row.payout_account_name_snapshot,
      row.payout_account_number_snapshot
    ]
    .filter(Boolean);

    return parts.join(
      ' · '
    );

  }

  const accounts =
  ccAccounts(
    row.agent_id
  );

  if(
    !accounts.length
  ){

    return '未绑定';

  }

  const ready =
  accounts.filter(
    account =>
    account.agent_edit_locked
    !==
    false
  );

  if(
    !ready.length
  ){

    return '正在修改';

  }

  return ready
  .map(
    account => {

      const parts =
      [
        account.method_type,
        account.bank_name,
        account.account_name,
        account.account_number
      ]
      .filter(Boolean);

      return parts.join(
        ' · '
      );

    }
  )
  .join(' / ');

}


function installCommissionCenterStyle(){

  if(
    cc$(
      STYLE_ID
    )
  ){

    return;

  }

  const style =
  document.createElement(
    'style'
  );

  style.id =
  STYLE_ID;

  style.textContent = `

#${CENTER_ID} .ccSummary{
  display:grid;
  grid-template-columns:
  repeat(4,1fr);
  gap:9px;
}

#${CENTER_ID} .ccSummaryBox{
  background:#101011;
  border:
  1px solid
  rgba(255,255,255,.06);
  border-radius:14px;
  padding:13px;
}

#${CENTER_ID} .ccSummaryBox small{
  display:block;
  color:#817a6d;
  font-size:10px;
  margin-bottom:6px;
}

#${CENTER_ID} .ccSummaryBox strong{
  display:block;
  color:#ebcd72;
  font-size:18px;
  word-break:break-word;
}

#${CENTER_ID} .ccSummaryBox.current strong{
  color:#d8c270;
}

#${CENTER_ID} .ccSummaryBox.paid strong{
  color:#78d4a0;
}

#${CENTER_ID} .ccSummaryBox.pending strong{
  color:#e8bf68;
}

#${CENTER_ID} .ccFilters{
  display:grid;
  grid-template-columns:
  1.25fr 1fr 1fr;
  gap:8px;
  margin-top:14px;
}

#${CENTER_ID} select,
#${CENTER_ID} input{
  width:100%;
  border:
  1px solid
  rgba(214,168,63,.24);
  background:#101011;
  color:#f7f0df;
  border-radius:12px;
  padding:12px;
  font-size:12px;
  outline:none;
}

#${CENTER_ID} .ccTabs{
  display:grid;
  grid-template-columns:
  repeat(5,1fr);
  gap:7px;
  margin-top:10px;
}

#${CENTER_ID} .ccTab{
  background:#131314;
  border:
  1px solid
  rgba(214,168,63,.15);
  color:#857d6e;
  padding:9px 5px;
  font-size:10px;
}

#${CENTER_ID} .ccTab.active{
  color:#f0d27a;
  border-color:
  rgba(214,168,63,.42);
  background:#211b0f;
}

#${CENTER_ID} .ccRoundGroup{
  margin-top:15px;
  border:
  1px solid
  rgba(214,168,63,.22);
  border-radius:17px;
  overflow:hidden;
  background:#0d0d0e;
}

#${CENTER_ID} .ccRoundHead{
  padding:13px;
  background:
  linear-gradient(
    180deg,
    rgba(60,45,17,.42),
    rgba(18,17,14,.70)
  );
  border-bottom:
  1px solid
  rgba(214,168,63,.14);
}

#${CENTER_ID} .ccRoundTitle{
  color:#ecd077;
  font-size:15px;
  font-weight:900;
}

#${CENTER_ID} .ccRoundMeta{
  margin-top:4px;
  color:#817a6d;
  font-size:10px;
}

#${CENTER_ID} .ccItem{
  padding:14px;
  border-bottom:
  1px solid
  rgba(255,255,255,.05);
}

#${CENTER_ID} .ccItem:last-child{
  border-bottom:0;
}

#${CENTER_ID} .ccHead{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
}

#${CENTER_ID} .ccName{
  color:#f0d077;
  font-size:16px;
  font-weight:900;
}

#${CENTER_ID} .ccCode{
  margin-top:3px;
  color:#847b6e;
  font-size:10px;
}

#${CENTER_ID} .ccBadge{
  border-radius:999px;
  padding:6px 9px;
  font-size:9px;
  font-weight:900;
  white-space:nowrap;
}

#${CENTER_ID} .ccBadge.pending{
  color:#e4c16c;
  background:
  rgba(174,126,38,.15);
}

#${CENTER_ID} .ccBadge.paid{
  color:#80d6a1;
  background:
  rgba(58,145,88,.15);
}

#${CENTER_ID} .ccBadge.partial{
  color:#efc96c;
  background:
  rgba(187,139,38,.16);
}

#${CENTER_ID} .ccBadge.none{
  color:#8e887e;
  background:#181819;
}

#${CENTER_ID} .ccGrid{
  display:grid;
  grid-template-columns:
  repeat(5,1fr);
  gap:7px;
  margin-top:11px;
}

#${CENTER_ID} .ccBox{
  background:#131314;
  border:
  1px solid
  rgba(255,255,255,.05);
  border-radius:11px;
  padding:10px;
}

#${CENTER_ID} .ccBox small{
  display:block;
  color:#777166;
  font-size:9px;
  margin-bottom:5px;
}

#${CENTER_ID} .ccBox strong{
  display:block;
  color:#e8d8ad;
  font-size:13px;
  word-break:break-word;
}

#${CENTER_ID} .ccBox.money strong{
  color:#ecd176;
  font-size:15px;
}

#${CENTER_ID} .ccPayout{
  margin-top:10px;
  padding:10px;
  border-radius:11px;
  background:#101011;
  color:#888174;
  font-size:10px;
  line-height:1.6;
}

#${CENTER_ID} .ccActions{
  display:grid;
  grid-template-columns:
  1fr 1fr;
  gap:7px;
  margin-top:10px;
}

#${CENTER_ID} .ccActions button{
  margin:0;
}

#${CENTER_ID} .ccEmpty{
  padding:25px 10px;
  text-align:center;
  color:#777166;
  font-size:12px;
}

#${CENTER_ID} .ccCurrentNotice{
  margin-top:12px;
  padding:11px 12px;
  border-radius:12px;
  border:
  1px solid
  rgba(214,168,63,.15);
  background:
  rgba(110,82,25,.08);
  color:#9b917b;
  font-size:10px;
  line-height:1.7;
}

@media(max-width:760px){

  #${CENTER_ID} .ccSummary{
    grid-template-columns:
    1fr 1fr;
  }

  #${CENTER_ID} .ccFilters{
    grid-template-columns:1fr;
  }

  #${CENTER_ID} .ccTabs{
    grid-template-columns:
    repeat(2,1fr);
  }

  #${CENTER_ID} .ccGrid{
    grid-template-columns:
    1fr 1fr;
  }

}

@media(max-width:420px){

  #${CENTER_ID} .ccSummary,
  #${CENTER_ID} .ccGrid,
  #${CENTER_ID} .ccActions{
    grid-template-columns:1fr;
  }

}

`;

  document.head
  .appendChild(
    style
  );

}


function ensureCommissionCenter(){

  installCommissionCenterStyle();

  let card =
  cc$(
    CENTER_ID
  );

  if(card){

    return card;

  }

  const main =
  cc$(
    'mainBox'
  );

  if(!main){

    return null;

  }

  card =
  document.createElement(
    'section'
  );

  card.id =
  CENTER_ID;

  card.className =
  'card';

  const firstCard =
  main.querySelector(
    'section.card'
  );

  if(firstCard){

    firstCard.insertAdjacentElement(
      'afterend',
      card
    );

  }
  else{

    main.prepend(
      card
    );

  }

  return card;

}


function ccAllRows(){

  if(
    typeof commissionRows
    ===
    'undefined'
    ||
    !Array.isArray(
      commissionRows
    )
  ){

    return [];

  }

  return commissionRows;

}


function ccSummary(){

  const rows =
  ccAllRows();

  let current =
  0;

  let historicalDue =
  0;

  let paid =
  0;

  let pending =
  0;

  rows.forEach(
    row => {

      const due =
      Number(
        row.commission_due
        ||
        0
      );

      const paidAmount =
      Number(
        row.commission_paid
        ||
        0
      );

      if(
        ccIsSettled(
          row
        )
      ){

        historicalDue +=
        due;

        paid +=
        paidAmount;

        pending +=
        ccRemaining(
          row
        );

      }
      else{

        current +=
        due;

      }

    }
  );

  return {
    current,
    historicalDue,
    paid,
    pending
  };

}


function ccFilterRows(){

  const keyword =
  String(
    cc$(
      'ccSearch'
    )?.value
    ||
    ''
  )
  .trim()
  .toLowerCase();

  const date =
  String(
    cc$(
      'ccDate'
    )?.value
    ||
    ''
  )
  .trim();

  const period =
  String(
    cc$(
      'ccPeriod'
    )?.value
    ||
    ''
  )
  .trim();

  return ccAllRows()
  .filter(
    row => {

      /*
        佣金中心历史付款列表：
        只显示已经正式结算的期数。

        当前开放期佣金只进入顶部
        “当前期正式佣金”统计，
        不能混入待付款历史。
      */

      if(
        !ccIsSettled(
          row
        )
      ){

        return false;

      }

      const agent =
      ccAgent(
        row
      );

      const text =
      [
        agent?.display_name,
        agent?.referral_code,
        row.round_date,
        row.round_code
      ]
      .join(' ')
      .toLowerCase();

      if(
        keyword
        &&
        !text.includes(
          keyword
        )
      ){

        return false;

      }

      if(
        date
        &&
        String(
          row.round_date
          ||
          ''
        )
        !==
        date
      ){

        return false;

      }

      if(
        period
        &&
        String(
          row.round_code
          ||
          ''
        )
        !==
        period
      ){

        return false;

      }

      if(
        commissionFilterStatus
        !==
        'all'
        &&
        ccStatus(
          row
        )
        !==
        commissionFilterStatus
      ){

        return false;

      }

      return true;

    }
  )
  .sort(
    (
      a,
      b
    ) => {

      const dateCompare =
      String(
        b.round_date
        ||
        ''
      )
      .localeCompare(
        String(
          a.round_date
          ||
          ''
        )
      );

      if(dateCompare){

        return dateCompare;

      }

      return String(
        b.round_code
        ||
        ''
      )
      .localeCompare(
        String(
          a.round_code
          ||
          ''
        )
      );

    }
  );

}


function ccCanPay(row){

  if(
    !ccIsSettled(
      row
    )
    ||
    ccRemaining(
      row
    )
    <=
    0
  ){

    return false;

  }

  if(
    row.payout_account_number_snapshot
  ){

    return true;

  }

  const accounts =
  ccAccounts(
    row.agent_id
  );

  return (
    accounts.length
    >
    0
    &&
    accounts.every(
      account =>
      account.agent_edit_locked
      !==
      false
    )
  );

}


function ccItemHtml(row){

  const agent =
  ccAgent(
    row
  );

  const status =
  ccStatus(
    row
  );

  const remaining =
  ccRemaining(
    row
  );

  const canPay =
  ccCanPay(
    row
  );

  return `

    <div class="ccItem">

      <div class="ccHead">

        <div>

          <div class="ccName">
            ${ccEsc(
              agent?.display_name
              ||
              '未知代理'
            )}
          </div>

          <div class="ccCode">

            ${ccEsc(
              agent?.referral_code
              ||
              '—'
            )}

          </div>

        </div>


        <div
          class="ccBadge ${status}">

          ${ccEsc(
            ccStatusText(
              row
            )
          )}

        </div>

      </div>


      <div class="ccGrid">

        <div class="ccBox money">

          <small>
            客户已确认金额
          </small>

          <strong>
            ${ccMoney(
              row.confirmed_customer_points
            )}
          </strong>

        </div>


        <div class="ccBox">

          <small>
            当期佣金率
          </small>

          <strong>
            ${ccMoney(
              row.commission_rate_snapshot
            )}%
          </strong>

        </div>


        <div class="ccBox money">

          <small>
            应付佣金
          </small>

          <strong>
            ${ccMoney(
              row.commission_due
            )}
          </strong>

        </div>


        <div class="ccBox money">

          <small>
            已付佣金
          </small>

          <strong>
            ${ccMoney(
              row.commission_paid
            )}
          </strong>

        </div>


        <div class="ccBox money">

          <small>
            待付佣金
          </small>

          <strong>
            ${ccMoney(
              remaining
            )}
          </strong>

        </div>

      </div>


      <div class="ccPayout">

        收款方式：

        ${ccEsc(
          ccPayoutText(
            row
          )
        )}

        ${

          row.completed_at
          ?

          `
            <br>
            支付完成：
            ${ccEsc(
              typeof formatDate
              ===
              'function'
              ?
              formatDate(
                row.completed_at
              )
              :
              row.completed_at
            )}
          `

          :

          ''

        }

      </div>


      <div class="ccActions">

        <button
          type="button"
          class="secondary"
          onclick="
            openAgentFile(
              '${ccEsc(
                row.agent_id
              )}'
            )
          ">

          查看代理档案

        </button>


        ${

          remaining > 0
          ?

          `
            <button
              type="button"
              class="success"
              ${canPay ? '' : 'disabled'}
              onclick="
                markCommissionPaid(
                  '${ccEsc(
                    row.agent_id
                  )}',
                  '${ccEsc(
                    row.round_id
                  )}'
                )
              ">

              ${
                canPay
                ?
                '处理佣金付款'
                :
                '收款方式未准备好'
              }

            </button>
          `

          :

                    `
            ${
              row.payment_transaction
              &&
              row.payment_transaction.proof_storage_path
              ?
              `
                <button
                  type="button"
                  class="secondary"
                  onclick="
                    viewCommissionProof(
                      '${ccEsc(
                        row.payment_transaction.proof_storage_path
                      )}'
                    )
                  ">

                  查看付款凭证

                </button>
              `
              :
              `
                <button
                  type="button"
                  class="success"
                  disabled>

                  已完成

                </button>
              `
            }
          `

        }

      </div>

    </div>

  `;

}


function ccGroupHtml(
  title,
  rows
){

  return `

    <div class="ccRoundGroup">

      <div class="ccRoundHead">

        <div class="ccRoundTitle">
          ${ccEsc(
            title
          )}
        </div>

        <div class="ccRoundMeta">

          共
          ${rows.length}
          位代理有佣金记录

        </div>

      </div>

      ${rows
        .map(
          ccItemHtml
        )
        .join('')
      }

    </div>

  `;

}


function ccListHtml(){

  const rows =
  ccFilterRows();

  if(
    !rows.length
  ){

    return `

      <div class="ccEmpty">
        当前筛选条件下没有找到代理佣金记录
      </div>

    `;

  }

  const groups =
  new Map();

  rows.forEach(
    row => {

      const key =
      String(
        row.round_date
        ||
        '—'
      )
      +
      '|'
      +
      String(
        row.round_code
        ||
        '—'
      );

      if(
        !groups.has(
          key
        )
      ){

        groups.set(
          key,
          []
        );

      }

      groups
      .get(
        key
      )
      .push(
        row
      );

    }
  );

  return Array
  .from(
    groups.entries()
  )
  .map(
    (
      [
        key,
        rows
      ]
    ) => {

      const first =
      rows[0];

      const title =
      String(
        first.round_date
        ||
        '—'
      )
      +
      ' · '
      +
      ccPeriod(
        first.round_code
      );

      return ccGroupHtml(
        title,
        rows
      );

    }
  )
  .join('');

}


function ccRender(){

  const card =
  ensureCommissionCenter();

  if(!card){

    return;

  }

  const summary =
  ccSummary();

  card.innerHTML = `

    <div class="title">
      💰 代理佣金中心
    </div>


    <div class="ccSummary">

      <div class="ccSummaryBox current">

        <small>
          本期代理佣金
        </small>

        <strong>
          ${ccMoney(
            summary.current
          )}
        </strong>

      </div>


      <div class="ccSummaryBox">

        <small>
          历史累计应付
        </small>

        <strong>
          ${ccMoney(
            summary.historicalDue
          )}
        </strong>

      </div>


      <div class="ccSummaryBox paid">

        <small>
          已付佣金
        </small>

        <strong>
          ${ccMoney(
            summary.paid
          )}
        </strong>

      </div>


      <div class="ccSummaryBox pending">

        <small>
          历史待付佣金
        </small>

        <strong>
          ${ccMoney(
            summary.pending
          )}
        </strong>

      </div>

    </div>


    <div class="ccCurrentNotice">

      当前期正式佣金只计算直属客户已经由管理员确认到账的有效金额。

      保存金额、付款待审核金额、付款被拒绝金额都不会计入代理佣金。

      当前开放期佣金只在这里作为本期正式佣金显示，
      必须等该期正式结算后才进入下面的历史待付款列表。

    </div>


    <div class="ccFilters">

      <input
        id="ccSearch"
        type="search"
        autocomplete="off"
        placeholder="搜索代理名称 / 推荐码"
        oninput="window.filterAgentCommissionList()">


      <input
        id="ccDate"
        type="date"
        onchange="window.renderAgentCommissionCenter()">


      <select
        id="ccPeriod"
        onchange="window.renderAgentCommissionCenter()">

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

    </div>


    <div class="ccTabs">

      <button
        type="button"
        class="ccTab ${
          commissionFilterStatus
          ===
          'all'
          ?
          'active'
          :
          ''
        }"
        onclick="
          window.setAgentCommissionFilter(
            'all'
          )
        ">

        全部

      </button>


      <button
        type="button"
        class="ccTab ${
          commissionFilterStatus
          ===
          'pending'
          ?
          'active'
          :
          ''
        }"
        onclick="
          window.setAgentCommissionFilter(
            'pending'
          )
        ">

        待支付

      </button>


      <button
        type="button"
        class="ccTab ${
          commissionFilterStatus
          ===
          'paid'
          ?
          'active'
          :
          ''
        }"
        onclick="
          window.setAgentCommissionFilter(
            'paid'
          )
        ">

        已支付

      </button>


      <button
        type="button"
        class="ccTab ${
          commissionFilterStatus
          ===
          'partial'
          ?
          'active'
          :
          ''
        }"
        onclick="
          window.setAgentCommissionFilter(
            'partial'
          )
        ">

        部分支付

      </button>


      <button
        type="button"
        class="ccTab ${
          commissionFilterStatus
          ===
          'none'
          ?
          'active'
          :
          ''
        }"
        onclick="
          window.setAgentCommissionFilter(
            'none'
          )
        ">

        无需支付

      </button>

    </div>


    <div id="ccList">
      ${ccListHtml()}
    </div>

  `;

}

window.filterAgentCommissionList =
function(){

  const list =
  cc$('ccList');

  if(!list){
    return;
  }

  list.innerHTML =
  ccListHtml();

};
window.setAgentCommissionFilter =
function(status){

  commissionFilterStatus =
  status;

  ccRender();

};


window.renderAgentCommissionCenter =
function(){

  const search =
  cc$(
    'ccSearch'
  )?.value
  ||
  '';

  const date =
  cc$(
    'ccDate'
  )?.value
  ||
  '';

  const period =
  cc$(
    'ccPeriod'
  )?.value
  ||
  '';

  ccRender();

  if(
    cc$(
      'ccSearch'
    )
  ){

    cc$(
      'ccSearch'
    ).value =
    search;

  }

  if(
    cc$(
      'ccDate'
    )
  ){

    cc$(
      'ccDate'
    ).value =
    date;

  }

  if(
    cc$(
      'ccPeriod'
    )
  ){

    cc$(
      'ccPeriod'
    ).value =
    period;

  }

};


function ccSignature(){

  try{

    return JSON.stringify(
      ccAllRows()
    )
    +
    JSON.stringify(
      typeof payoutAccounts
      !==
      'undefined'
      ?
      payoutAccounts
      :
      []
    );

  }
  catch{

    return String(
      Date.now()
    );

  }

}


function ccTick(){

  const main =
  cc$(
    'mainBox'
  );

  if(
    !main
    ||
    main.classList.contains(
      'hidden'
    )
  ){

    return;

  }

  const signature =
  ccSignature();

  if(
    !cc$(
      CENTER_ID
    )
    ||
    signature
    !==
    lastCommissionSignature
  ){

    lastCommissionSignature =
    signature;

    ccRender();

  }

}


ccTick();

setInterval(
  ccTick,
  1200
);

})();
