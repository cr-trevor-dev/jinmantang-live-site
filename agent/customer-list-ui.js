(()=>{
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

        applyFilter();
      }
    );

    return tools;
  }

  function applyListStyle(list){
    /*
      客户再多，也只占固定区域。
      约显示 2～3 张客户卡。
    */
    list.style.maxHeight = '430px';
    list.style.overflowY = 'auto';
    list.style.overflowX = 'hidden';
    list.style.webkitOverflowScrolling = 'touch';
    list.style.overscrollBehavior = 'contain';
    list.style.paddingRight = '2px';
  }

  function applyFilter(){
    const list =
    document.getElementById(
      'agentCustomerRoundList'
    );

    if(!list){
      return;
    }

    ensureTools(list);
    applyListStyle(list);

    const input =
    document.getElementById(
      'agentCustomerSearch'
    );

    if(input){
      input.placeholder =
      text(SEARCH_PLACEHOLDER);
    }

    const cards =
    customerCards(list);

    const noMatch =
    document.getElementById(
      'agentCustomerNoMatch'
    );

    if(cards.length === 0){
      if(noMatch){
        noMatch.style.display = 'none';
      }

      return;
    }

    let visibleCount = 0;

    cards.forEach(
      card=>{
        const matched =
        !searchQuery
        ||
        String(
          card.textContent || ''
        )
        .toLowerCase()
        .includes(searchQuery);

        card.style.display =
        matched
        ?
        ''
        :
        'none';

        if(matched){
          visibleCount++;
        }
      }
    );

    if(!noMatch){
      return;
    }

    if(
      searchQuery
      &&
      visibleCount === 0
    ){
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
    }else{
      noMatch.style.display = 'none';
    }
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
    applyListStyle(list);

    if(installedList === list){
      applyFilter();
      return true;
    }

    installedList = list;

    if(listObserver){
      listObserver.disconnect();
    }

    /*
      只监听客户列表自己的重新渲染。

      不监听整个网页，
      所以不会碰时钟、截止时间、
      退出登录、代理资料、收款方式
      或其他 Agent 功能。
    */
    listObserver =
    new MutationObserver(
      ()=>{
        applyFilter();
      }
    );

    listObserver.observe(
      list,
      {
        childList:true
      }
    );

    applyFilter();

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
    ux-cleanup.js 登录成功以后
    才创建客户实时列表。

    所以这里只短暂等待，
    找到以后立即停止。
  */
  installTimer =
  setInterval(
    waitForCustomerList,
    400
  );

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
          applyFilter,
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
