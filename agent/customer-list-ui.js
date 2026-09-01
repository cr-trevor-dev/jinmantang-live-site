(()=>{
  const PAGE_SIZE = 10;

  let currentPage = 1;
  let searchQuery = '';
  let installedList = null;
  let listObserver = null;

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

  function ensureTools(card,list){
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

    tools.style.cssText = `
      margin-top:14px;
    `;

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
          style="
            margin:0;
            padding:10px;
          "
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
        >
        </div>

        <button
          id="agentCustomerNext"
          type="button"
          class="secondary"
          style="
            margin:0;
            padding:10px;
          "
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
      >
      </div>
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
    const card =
    document.getElementById(
      'agentCustomerRoundLiveCard'
    );

    const list =
    document.getElementById(
      'agentCustomerRoundList'
    );

    if(!card || !list){
      return;
    }

    ensureTools(card,list);

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

    /*
      如果原页面当前显示的是
      “暂无直属客户”，保持原页面自己的提示，
      不做任何干预。
    */
    if(allCards.length === 0){
      const pagination =
      document.getElementById(
        'agentCustomerPagination'
      );

      const noMatch =
      document.getElementById(
        'agentCustomerNoMatch'
      );

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

    const visible =
    filtered.slice(
      start,
      start + PAGE_SIZE
    );

    visible.forEach(
      card=>{
        card.style.display = '';
      }
    );

    const pagination =
    document.getElementById(
      'agentCustomerPagination'
    );

    const pageInfo =
    document.getElementById(
      'agentCustomerPageInfo'
    );

    const prev =
    document.getElementById(
      'agentCustomerPrev'
    );

    const next =
    document.getElementById(
      'agentCustomerNext'
    );

    const noMatch =
    document.getElementById(
      'agentCustomerNoMatch'
    );

    if(filtered.length === 0){
      pagination.style.display = 'none';

      noMatch.style.display = 'block';
      noMatch.textContent =
      text(NO_MATCH);

      return;
    }

    noMatch.style.display = 'none';

    if(totalPages > 1){
      pagination.style.display = 'grid';
    }else{
      pagination.style.display = 'none';
    }

    pageInfo.textContent =
    currentPage +
    ' / ' +
    totalPages +
    ' · ' +
    filtered.length;

    prev.disabled =
    currentPage <= 1;

    next.disabled =
    currentPage >= totalPages;
  }

  function install(){
    const card =
    document.getElementById(
      'agentCustomerRoundLiveCard'
    );

    const list =
    document.getElementById(
      'agentCustomerRoundList'
    );

    if(!card || !list){
      return;
    }

    ensureTools(card,list);

    if(installedList === list){
      applyPagination();
      return;
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

    listObserver.observe(
      list,
      {
        childList:true
      }
    );

    applyPagination();
  }

  const pageObserver =
  new MutationObserver(
    ()=>{
      install();
    }
  );

  pageObserver.observe(
    document.documentElement,
    {
      childList:true,
      subtree:true
    }
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
    install
  );

  install();
})();
