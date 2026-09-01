(()=>{
'use strict';

/*
  JMT Admin Customer Center
  Compact UI Layer

  只负责：
  - 客户目录分页
  - 客户档案分类
  - 下注记录分页

  不修改：
  - 客户状态 RPC
  - 收款账户数据
  - 收款账户解锁
  - 下注金额
  - 付款状态
  - 客户 / 代理归属
*/

let customerListPage = 1;
let customerOrderPage = 1;
let selectedCustomerTab = 'basic';

let lastCustomerSearch = '';
let lastCustomerFilter = '';

const CUSTOMER_PAGE_SIZE = 12;
const ORDER_PAGE_SIZE = 8;
const orderEntryCache = new Map();
const orderEntryLoading = new Set();
const expandedOrderEntries = new Set();

/* =====================================
   STYLE
===================================== */

function installCustomerCompactStyle(){

  if(
    document.getElementById(
      'jmtCustomerCompactStyle'
    )
  ){
    return;
  }


  const style =
  document.createElement(
    'style'
  );


  style.id =
  'jmtCustomerCompactStyle';


  style.textContent = `

.customerDirectoryHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:10px;
}

.customerDirectoryHead strong{
  color:#e3c873;
  font-size:13px;
}

.customerDirectoryHead span{
  color:#80796c;
  font-size:10px;
}

.customerDirectoryRow{
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

.customerDirectoryRow:active{
  background:#17140d;
}

.customerDirectoryMain{
  flex:1;
  min-width:0;
}

.customerDirectoryNameLine{
  display:flex;
  align-items:center;
  gap:8px;
}

.customerDirectoryName{
  color:#efd477;
  font-size:15px;
  font-weight:900;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}

.customerDirectoryCode{
  color:#817968;
  font-size:10px;
  margin-top:4px;
}

.customerDirectoryStats{
  display:flex;
  flex-wrap:wrap;
  gap:5px 11px;
  margin-top:7px;
  color:#8e8678;
  font-size:10px;
}

.customerDirectoryStats strong{
  color:#d7c17c;
}

.customerDirectoryArrow{
  flex:none;
  color:#d8bf73;
  font-size:20px;
}

.customerTabs{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:7px;
  margin:14px 0 15px;
}

.customerTab{
  background:#131314;
  color:#8f8778;
  border:1px solid rgba(214,168,63,.14);
  padding:11px 5px;
  font-size:11px;
}

.customerTab.active{
  background:linear-gradient(
    180deg,
    #2b2210,
    #17140c
  );
  color:#efd477;
  border-color:rgba(214,168,63,.50);
}

.customerDetailHeader{
  padding:13px;
  border-radius:15px;
  background:#101011;
  border:1px solid rgba(214,168,63,.16);
}

.customerDetailHeaderTop{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
}

.customerDetailQuick{
  display:flex;
  flex-wrap:wrap;
  gap:8px 14px;
  margin-top:9px;
  color:#898174;
  font-size:10px;
}

.customerDetailQuick strong{
  color:#d8c078;
}

.customerBasicBlock{
  padding:13px;
  border-radius:14px;
  background:#101011;
  border:1px solid rgba(255,255,255,.055);
  margin-top:9px;
}

.customerBasicBlock small{
  display:block;
  color:#81796b;
  font-size:10px;
  margin-bottom:5px;
}

.customerBasicBlock strong{
  display:block;
  color:#e8dfca;
  font-size:13px;
  line-height:1.55;
  word-break:break-word;
}

.customerTabIntro{
  color:#847d6f;
  font-size:11px;
  line-height:1.65;
  margin-bottom:10px;
}

.customerPager{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  gap:8px;
  align-items:center;
  margin-top:14px;
}

.customerPager span{
  color:#8d8577;
  font-size:11px;
  text-align:center;
  white-space:nowrap;
}
.customerOrderDetailAction{margin-top:9px}
.customerOrderDetailAction button{margin-top:0}
.customerOrderEntryPanel{margin-top:9px;padding:12px;border-radius:13px;background:#0c0c0d;border:1px solid rgba(214,168,63,.14)}
.customerOrderEntryHead{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;color:#8d8577;font-size:10px}
.customerOrderEntryRow{display:grid;grid-template-columns:64px 1fr 1fr 1fr;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.customerOrderEntryRow:last-child{border-bottom:0}
.customerOrderEntryNumber{color:#efd477;font-size:14px;font-weight:900}
.customerOrderEntryCell small{display:block;color:#777166;font-size:9px;margin-bottom:3px}
.customerOrderEntryCell strong{display:block;color:#e9dfc7;font-size:11px}
.customerOrderEntryCell strong.confirmed{color:#86d19c}
.customerOrderEntryEmpty{padding:10px 0;text-align:center;color:#7f786b;font-size:11px}
@media(max-width:560px){.customerOrderEntryRow{grid-template-columns:52px 1fr}.customerOrderEntryCell{padding:3px 0}}
@media(max-width:500px){

  .customerTabs{
    grid-template-columns:1fr 1fr 1fr;
  }

  .customerPager{
    grid-template-columns:1fr;
  }

}

`;


  document.head.appendChild(
    style
  );

}


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
    page:safePage,
    pageCount,
    start,
    end:start+size
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

    <div class="customerPager">

      <button
        class="secondary"
        type="button"
        ${info.page <= 1 ? 'disabled' : ''}
        onclick="changeCustomerPage(
          '${type}',
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
        onclick="changeCustomerPage(
          '${type}',
          1
        )">

        下一页 →

      </button>

    </div>

  `;

}


window.changeCustomerPage =
function(
  type,
  delta
){

  if(
    type
    ===
    'customers'
  ){

    customerListPage +=
    delta;

  }


  if(
    type
    ===
    'orders'
  ){

    customerOrderPage +=
    delta;

  }


  renderCustomers();


  document
  .getElementById(
    'customerList'
  )
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


/* =====================================
   CUSTOMER LIST
===================================== */

window.renderCustomers =
function(){

  const list =
  document.getElementById(
    'customerList'
  );


  if(!list){
    return;
  }


  if(selectedCustomerId){

    const customer =
    customerById(
      selectedCustomerId
    );


    if(!customer){

      selectedCustomerId =
      null;

      selectedCustomerTab =
      'basic';

      renderCustomers();

      return;

    }


    list.innerHTML =
    compactCustomerDetailHtml(
      customer
    );


    return;

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
    query !== lastCustomerSearch
    ||
    customerFilter !== lastCustomerFilter
  ){

    customerListPage =
    1;

    lastCustomerSearch =
    query;

    lastCustomerFilter =
    customerFilter;

  }


  let rows =
  customers.filter(
    customer => {

      if(
        customerFilter
        ===
        'all'
      ){
        return true;
      }


      return (
        customerSourceKind(
          customer
        )
        ===
        customerFilter
      );

    }
  );


  if(query){

    rows =
    rows.filter(
      customer => {

        const text =
        [
          customer.customer_code,
          customer.username,
          customer.display_name,
          customer.phone
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
        没有找到客户
      </div>

    `;

    return;

  }


  const info =
  pageInfo(
    rows.length,
    customerListPage,
    CUSTOMER_PAGE_SIZE
  );


  customerListPage =
  info.page;


  const visible =
  rows.slice(
    info.start,
    info.end
  );


  list.innerHTML = `

    <div class="customerDirectoryHead">

      <strong>
        客户目录
      </strong>

      <span>
        共 ${rows.length} 位
      </span>

    </div>


    ${

      visible
      .map(
        customerDirectoryHtml
      )
      .join('')

    }


    ${

      pagerHtml(
        'customers',
        rows.length,
        customerListPage,
        CUSTOMER_PAGE_SIZE
      )

    }

  `;

};


function customerDirectoryHtml(customer){

  const source =
  customerSourceKind(
    customer
  )
  ===
  'direct'
  ?
  '平台主管'
  :
  '代理客户';


  return `

    <div
      class="customerDirectoryRow"
      onclick="openCustomerFile(
        '${esc(customer.id)}'
      )">

      <div class="customerDirectoryMain">

        <div class="customerDirectoryNameLine">

          <div class="customerDirectoryName">
            ${esc(customer.display_name || '未填写姓名')}
          </div>

          <div
            class="status ${statusClass(customer.status)}">

            ${esc(statusText(customer.status))}

          </div>

        </div>


        <div class="customerDirectoryCode">
          ${esc(customer.customer_code || '—')}
        </div>


        <div class="customerDirectoryStats">

          <span>
            来源
            <strong>${esc(source)}</strong>
          </span>

          <span>
            代理
            <strong>${esc(customerAgentName(customer))}</strong>
          </span>

          <span>
            收款
            <strong>${esc(customerPayoutState(customer.id))}</strong>
          </span>

        </div>

      </div>


      <div class="customerDirectoryArrow">
        ›
      </div>

    </div>

  `;

}


/* =====================================
   DETAIL
===================================== */

function compactCustomerDetailHtml(customer){

  const orderRows =
  ordersForCustomer(
    customer.id
  );


  return `

    <div class="customerDetailTop">

      <strong>
        客户档案
      </strong>

      <button
        class="secondary customerBackBtn"
        type="button"
        onclick="closeCustomerFile()">

        ← 返回客户列表

      </button>

    </div>


    <div class="customer">

      <div class="customerDetailHeader">

        <div class="customerDetailHeaderTop">

          <div>

            <div class="customerName">
              ${esc(customer.display_name || '未填写姓名')}
            </div>

            <div class="customerCode">
              ${esc(customer.customer_code || '—')}
            </div>

          </div>


          <div
            class="status ${statusClass(customer.status)}">

            ${esc(statusText(customer.status))}

          </div>

        </div>


        <div class="customerDetailQuick">

          <span>
            来源
            <strong>
              ${
                customerSourceKind(customer)
                ===
                'direct'
                ?
                '平台主管'
                :
                '代理客户'
              }
            </strong>
          </span>

          <span>
            所属代理
            <strong>
              ${esc(customerAgentName(customer))}
            </strong>
          </span>

          <span>
            收款
            <strong>
              ${esc(customerPayoutState(customer.id))}
            </strong>
          </span>

          <span>
            下注记录
            <strong>
              ${orderRows.length}
            </strong>
          </span>

        </div>

      </div>


      ${customerTabsHtml()}


      <div>
        ${customerTabContent(customer)}
      </div>

    </div>

  `;

}


/* =====================================
   TABS
===================================== */

function customerTabsHtml(){

  const tabs =
  [
    ['basic','基本资料'],
    ['payout','收款方式'],
    ['orders','下注记录']
  ];


  return `

    <div class="customerTabs">

      ${

        tabs
        .map(
          ([key,label]) => `

            <button
              class="customerTab ${
                selectedCustomerTab === key
                ?
                'active'
                :
                ''
              }"
              type="button"
              onclick="setCustomerTab(
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


window.setCustomerTab =
function(tab){

  if(
    ![
      'basic',
      'payout',
      'orders'
    ]
    .includes(
      tab
    )
  ){
    return;
  }


  selectedCustomerTab =
  tab;


  if(
    tab
    ===
    'orders'
  ){

    customerOrderPage =
    1;

  }


  renderCustomers();

};


function customerTabContent(customer){

  if(
    selectedCustomerTab
    ===
    'payout'
  ){

    return customerPayoutTab(
      customer
    );

  }


  if(
    selectedCustomerTab
    ===
    'orders'
  ){

    return customerOrdersTab(
      customer
    );

  }


  return customerBasicTab(
    customer
  );

}


/* =====================================
   BASIC TAB
===================================== */

function customerBasicTab(customer){

  return `

    <div class="customerTabIntro">
      这里查看客户身份、来源与账户状态。
    </div>


    <div class="customerBasicBlock">

      <small>
        用户名
      </small>

      <strong>
        ${esc(customer.username || '—')}
      </strong>

    </div>


    <div class="customerBasicBlock">

      <small>
        电话
      </small>

      <strong>
        ${esc(customer.phone || '—')}
      </strong>

    </div>


    <div class="customerBasicBlock">

      <small>
        客户来源
      </small>

      <strong>
        ${esc(customerSourceText(customer))}
      </strong>

    </div>


    <div class="customerBasicBlock">

      <small>
        所属代理
      </small>

      <strong>
        ${esc(customerAgentName(customer))}
      </strong>

    </div>


    ${
      customer.restriction_reason
      &&
      customer.status !== 'active'
      ?
      `
        <div class="restriction">
          平台说明：
          ${esc(customer.restriction_reason)}
        </div>
      `
      :
      ''
    }


    <div class="sectionLabel">
      客户状态管理
    </div>


    ${
      customer.status
      ===
      'active'
      ?
      `
        <div class="actions">

          <button
            class="warning"
            type="button"
            onclick="setCustomerStatus(
              '${esc(customer.id)}',
              'suspended'
            )">

            限制客户

          </button>


          <button
            class="danger"
            type="button"
            onclick="setCustomerStatus(
              '${esc(customer.id)}',
              'blocked'
            )">

            拉黑客户

          </button>

        </div>
      `
      :
      `
        <div class="actions three">

          <button
            class="success"
            type="button"
            onclick="setCustomerStatus(
              '${esc(customer.id)}',
              'active'
            )">

            恢复正常

          </button>


          <button
            class="warning"
            type="button"
            ${
              customer.status === 'suspended'
              ?
              'disabled'
              :
              ''
            }
            onclick="setCustomerStatus(
              '${esc(customer.id)}',
              'suspended'
            )">

            改为限制

          </button>


          <button
            class="danger"
            type="button"
            ${
              customer.status === 'blocked'
              ?
              'disabled'
              :
              ''
            }
            onclick="setCustomerStatus(
              '${esc(customer.id)}',
              'blocked'
            )">

            改为拉黑

          </button>

        </div>
      `
    }

  `;

}


/* =====================================
   PAYOUT TAB
===================================== */

function customerPayoutTab(customer){

  const accountRows =
  accountsForCustomer(
    customer.id
  );


  return `

    <div class="customerTabIntro">

      客户自己的派彩收款方式。
      Admin 只开放一次修改权限，
      客户重新保存后会再次锁定。

    </div>


    ${

      accountRows.length
      ?

      accountRows
      .map(
        accountHtml
      )
      .join('')

      :

      `
        <div class="empty">
          客户尚未绑定收款方式
        </div>
      `

    }

  `;

}


/* =====================================
   ORDER TAB
===================================== */

function customerOrdersTab(customer){

  const rows =
  ordersForCustomer(
    customer.id
  );


  if(!rows.length){

    return `

      <div class="empty">
        暂无客户下注
      </div>

    `;

  }


  const info =
  pageInfo(
    rows.length,
    customerOrderPage,
    ORDER_PAGE_SIZE
  );


  customerOrderPage =
  info.page;


  const visible =
  rows.slice(
    info.start,
    info.end
  );


  return `

    <div class="customerTabIntro">

      共 ${rows.length} 期记录。
      每页显示 ${ORDER_PAGE_SIZE} 期。

    </div>


    ${

      visible
      .map(
        customerOrderCardHtml
      )
      .join('')

    }


    ${

      pagerHtml(
        'orders',
        rows.length,
        customerOrderPage,
        ORDER_PAGE_SIZE
      )

    }

  `;

}
function customerOrderCardHtml(order){

  const expanded =
  expandedOrderEntries.has(
    order.id
  );

  const loading =
  orderEntryLoading.has(
    order.id
  );

  return `

    ${orderHtml(order)}

    <div class="customerOrderDetailAction">

      <button
        class="secondary"
        type="button"
        onclick="toggleOrderEntries(
          '${esc(order.id)}'
        )">

        ${
          expanded
          ?
          '收起本期下注明细'
          :
          '查看本期下注明细'
        }

      </button>

    </div>

    ${
      expanded
      ?
      orderEntryPanelHtml(
        order,
        loading
      )
      :
      ''
    }

  `;

}


window.toggleOrderEntries =
async function(orderId){

  if(
    expandedOrderEntries.has(
      orderId
    )
  ){

    expandedOrderEntries.delete(
      orderId
    );

    renderCustomers();

    return;

  }


  expandedOrderEntries.add(
    orderId
  );


  if(
    orderEntryCache.has(
      orderId
    )
    &&
    orderEntryCache.get(
      orderId
    )
    !==
    null
  ){

    renderCustomers();

    return;

  }


  orderEntryLoading.add(
    orderId
  );

  renderCustomers();


  try{

    const res =
    await api(

      '/rest/v1/customer_round_entries'
      +
      '?select=id,order_id,round_id,customer_id,number_code,points,confirmed_points,pending_points'
      +
      '&order_id=eq.'
      +
      encodeURIComponent(
        orderId
      )
      +
      '&order=number_code.asc'

    );


    if(!res.ok){

      throw new Error(
        await res.text()
      );

    }


    const data =
    await res.json();


    orderEntryCache.set(
      orderId,
      Array.isArray(data)
      ?
      data
      :
      []
    );

  }
  catch(err){

    console.error(
      err
    );

    orderEntryCache.set(
      orderId,
      null
    );

  }
  finally{

    orderEntryLoading.delete(
      orderId
    );

    renderCustomers();

  }

};


function orderEntryPanelHtml(
  order,
  loading
){

  if(loading){

    return `

      <div class="customerOrderEntryPanel">

        <div class="customerOrderEntryEmpty">
          正在读取本期下注明细...
        </div>

      </div>

    `;

  }


  const cached =
  orderEntryCache.get(
    order.id
  );


  if(cached === null){

    return `

      <div class="customerOrderEntryPanel">

        <div class="customerOrderEntryEmpty">
          本期下注明细读取失败，请收起后重新打开。
        </div>

      </div>

    `;

  }


  const entries =
  aggregateOrderEntries(
    cached
    ||
    []
  );


  if(!entries.length){

    return `

      <div class="customerOrderEntryPanel">

        <div class="customerOrderEntryEmpty">
          本期暂无可显示的下注号码明细
        </div>

      </div>

    `;

  }


  return `

    <div class="customerOrderEntryPanel">

      <div class="customerOrderEntryHead">

        <span>
          本期下注号码
        </span>

        <span>
          共 ${entries.length} 个号码
        </span>

      </div>


      ${

        entries
        .map(
          orderEntryRowHtml
        )
        .join('')

      }

    </div>

  `;

}


function aggregateOrderEntries(entries){

  const map =
  new Map();


  entries.forEach(
    entry => {

      const code =
      String(
        entry.number_code
        ??
        ''
      );


      if(!map.has(code)){

        map.set(
          code,
          {
            number_code:code,
            points:0,
            pending_points:0,
            confirmed_points:0
          }
        );

      }


      const item =
      map.get(
        code
      );


      item.points +=
      Number(
        entry.points
        ||
        0
      );


      item.pending_points +=
      Number(
        entry.pending_points
        ||
        0
      );


      item.confirmed_points +=
      Number(
        entry.confirmed_points
        ||
        0
      );

    }
  );


  return Array
  .from(
    map.values()
  )
  .sort(
    (a,b) =>
    String(a.number_code)
    .localeCompare(
      String(b.number_code),
      undefined,
      {
        numeric:true
      }
    )
  );

}


function orderEntryRowHtml(entry){

  const rawCode =
  String(
    entry.number_code
    ||
    '—'
  );


  const numberCode =
  /^\d+$/.test(
    rawCode
  )
  ?
  rawCode.padStart(
    2,
    '0'
  )
  :
  rawCode;


  return `

    <div class="customerOrderEntryRow">

      <div class="customerOrderEntryNumber">
        ${esc(numberCode)}
      </div>


      <div class="customerOrderEntryCell">

        <small>
          下注
        </small>

        <strong>
          ${money(entry.points)}
        </strong>

      </div>


      <div class="customerOrderEntryCell">

        <small>
          审核中
        </small>

        <strong>
          ${money(entry.pending_points)}
        </strong>

      </div>


      <div class="customerOrderEntryCell">

        <small>
          已确认
        </small>

        <strong class="confirmed">
          ${money(entry.confirmed_points)}
        </strong>

      </div>

    </div>

  `;

}

/* =====================================
   OPEN / CLOSE
===================================== */

window.openCustomerFile =
function(customerId){

  selectedCustomerId =
  customerId;


  selectedCustomerTab =
  'basic';


  customerOrderPage =
  1;


  renderCustomers();


  document
  .getElementById(
    'customerList'
  )
  ?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });

};


window.closeCustomerFile =
function(){

  selectedCustomerId =
  null;


  selectedCustomerTab =
  'basic';


  renderCustomers();

};


/* =====================================
   INSTALL
===================================== */

function install(){

  installCustomerCompactStyle();

  lastCustomerFilter =
  customerFilter;

  renderCustomers();

}


install();

})();
