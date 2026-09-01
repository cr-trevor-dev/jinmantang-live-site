(()=>{
  const PAGE_SIZE = 5;

  let currentPage = 1;
  let searchQuery = '';
  let installedList = null;
  let listObserver = null;
  let installTimer = null;

  const SEARCH_PLACEHOLDER = {
    zh:'搜索客户姓名 / 客户编号',
    my:'ဖောက်သည်အမည် / ကုဒ် ရှာရန်',
    en:'Search customer name / code',
    th:'ค้นหาชื่อลูกค้า / รหัส',
    ms:'Cari nama / kod pelanggan',
    vi:'Tìm tên / mã khách hàng',
    id:'Cari nama / kode pelanggan'
  };

  const NO_MATCH = {
    zh:'没有找到符合条件的客户',
    my:'ကိုက်ညီသော ဖောက်သည် မတွေ့ပါ',
    en:'No matching customers',
    th:'ไม่พบลูกค้าที่ตรงกัน',
    ms:'Tiada pelanggan sepadan',
    vi:'Không tìm thấy khách hàng phù hợp',
    id:'Tidak ada pelanggan yang cocok'
  };

  function lang(){
    try{
      if(
        typeof currentLang !== 'undefined'
        &&
        currentLang
      ){
        return currentLang;
      }
    }catch(e){}

    return 'zh';
  }

  function text(map){
    return map[lang()] || map.zh;
  }

  function customerCards(list){
    return Array
    .from(list.children)
    .filter(
      el=>
      el instanceof HTMLElement
      &&
      !el.classList.contains('settlementNotice')
    );
  }

  function ensureTools(list){
    let tools =
    document.getElementById(
      'agentCustomerListTools'
    );

    if(tools){
      return tools;
    }

    tools =
    document.createElement('div');

    tools.id =
    'agentCustomerListTools';

    tools.style.cssText =
    'margin-top:14px';

    tools.innerHTML = `
      <input
        id="agentCustomerSearch"
        type="search"
        autocomplete="off"
        style="
          width:100%;
          padding:12px 13px;
          border-radius:12px;
          border:1px solid rgba(214,168,63,.20);
          background:#101011;
          color:#f3e5bd;
          outline:none;
          font-size:13px;
        "
      >

      <div
        id="agentCustomerPagination"
        style="
          display:none;
          grid-template-columns:48px 1fr 48px;
          gap:8px;
          align-items:center;
          margin-top:10px;
        "
      >
        <button
          id="agentCustomerPrev"
          type="button"
          class="secondary"
          style="margin:0;padding:10px"
        >
          ‹
        </button>

        <div
          id="agentCustomerPageInfo"
          style="
            text-align:center;
            color:#8f8778;
            font-size:11px;
          "
        ></div>

        <button
          id="agentCustomerNext"
          type="button"
          class="secondary"
          style="margin:0;padding:10px"
        >
          ›
        </button>
      </div>

      <div
        id="agentCustomerNoMatch"
        style="
          display:none;
          text-align:center;
          color:#777166;
          font-size:11px;
          padding:14px 4px 2px;
        "
      ></div>
    `;

    list.insertAdjacentElement(
      'beforebegin',
      tools
    );

    const input =
    document.getElementById(
      'agentCustomerSearch'
    );

    input.placeholder =
    text(SEARCH_PLACEHOLDER);

    input.addEventListener(
      'input',
      ()=>{
        searchQuery =
        String(input.value || '')
        .trim()
        .toLowerCase();

        currentPage = 1;

        applyPagination();
      }
    );

    document
    .getElementById('agentCustomerPrev')
    .addEventListener(
      'click',
      ()=>{
        if(currentPage > 1){
          currentPage--;
          applyPagination();
        }
      }
    );

    document
    .getElementById('agentCustomerNext')
    .addEventListener(
      'click',
      ()=>{
        currentPage++;
        applyPagination();
      }
    );

    return tools;
  }

  function applyPagination(){
    const list =
    document.getElementById(
      'agentCustomerRoundList'
    );

    if(!list){
      return;
    }

    ensureTools(list);

    const input =
    document.getElementById(
      'agentCustomerSearch'
    );

    if(input){
      input.placeholder =
      text(SEARCH_PLACEHOLDER);
    }

    const allCards =
    customerCards(list);

    const pagination =
    document.getElementById(
      'agentCustomerPagination'
    );

    const noMatch =
    document.getElementById(
      'agentCustomerNoMatch'
    );

    if(allCards.length === 0){
      if(pagination){
        pagination.style.display = 'none';
      }

      if(noMatch){
        noMatch.style.display = 'none';
      }

      return;
    }

    const filtered =
    allCards.filter(
      card=>{
        if(!searchQuery){
          return true;
        }

        return String(
          card.textContent || ''
        )
        .toLowerCase()
        .includes(searchQuery);
      }
    );

    const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length / PAGE_SIZE
      )
    );

    currentPage =
    Math.min(
      Math.max(currentPage,1),
      totalPages
    );

    allCards.forEach(
      card=>{
        card.style.display = 'none';
      }
    );

    const start =
    (currentPage - 1) * PAGE_SIZE;

    filtered
    .slice(
      start,
      start + PAGE_SIZE
    )
    .forEach(
      card=>{
        card.style.display = '';
      }
    );

    if(filtered.length === 0){
      pagination.style.display = 'none';

      noMatch.style.display = 'block';

      const nextText =
      text(NO_MATCH);

      if(
        noMatch.textContent
        !==
        nextText
      ){
        noMatch.textContent =
        nextText;
      }

      return;
    }

    noMatch.style.display = 'none';

    pagination.style.display =
    totalPages > 1
    ?
    'grid'
    :
    'none';

    const pageInfo =
    document.getElementById(
      'agentCustomerPageInfo'
    );

    const nextPageInfo =
    currentPage +
    ' / ' +
    totalPages +
    ' · ' +
    filtered.length;

    if(
      pageInfo.textContent
      !==
      nextPageInfo
    ){
      pageInfo.textContent =
      nextPageInfo;
    }

    const prev =
    document.getElementById(
      'agentCustomerPrev'
    );

    const next =
    document.getElementById(
      'agentCustomerNext'
    );

    prev.disabled =
    currentPage <= 1;

    next.disabled =
    currentPage >= totalPages;
  }

  function install(){
    const list =
    document.getElementById(
      'agentCustomerRoundList'
    );

    if(!list){
      return false;
    }

    ensureTools(list);

    if(installedList === list){
      applyPagination();
      return true;
    }

    installedList = list;

    if(listObserver){
      listObserver.disconnect();
    }

    listObserver =
    new MutationObserver(
      ()=>{
        applyPagination();
      }
    );

    /*
      只监听“客户列表”本身。
      原来的实时刷新重画客户列表时，
      才重新执行分页。

      不再监听整个网页，
      所以不会影响时钟、截止时间、
      登出按钮、收款账户等其他区域。
    */
    listObserver.observe(
      list,
      {
        childList:true
      }
    );

    applyPagination();

    return true;
  }

  function waitForCustomerList(){
    if(install()){
      if(installTimer){
        clearInterval(installTimer);
        installTimer = null;
      }
    }
  }

  /*
    客户实时卡片由 ux-cleanup.js
    登录成功后动态创建。

   这里只短暂等待它出现，
    找到以后马上停止轮询。
  */
  installTimer =
  setInterval(
    waitForCustomerList,
    400
  );

  /*
    最长等 30 秒。
    即使登录失败或页面没有客户卡，
    也不会永远运行。
  */
  setTimeout(
    ()=>{
      if(installTimer){
        clearInterval(installTimer);
        installTimer = null;
      }
    },
    30000
  );

  document.addEventListener(
    'change',
    event=>{
      if(
        event.target
        &&
        event.target.id === 'langSelect'
      ){
        setTimeout(
          applyPagination,
          0
        );
      }
    }
  );

  window.addEventListener(
    'pageshow',
    ()=>{
      waitForCustomerList();
    }
  );

  waitForCustomerList();
})();
