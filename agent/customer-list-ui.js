(()=>{
  let searchQuery = '';
  let installedList = null;
  let listObserver = null;
  let installTimer = null;

  let identityLoading = false;
  let identityLoadedAt = 0;
  let usernameByCode = new Map();

  const SEARCH_PLACEHOLDER = {
    zh:'搜索客户姓名 / 客户编号 / 用户名',
    my:'ဖောက်သည်အမည် / ကုဒ် / အသုံးပြုသူအမည် ရှာရန်',
    en:'Search name / customer code / username',
    th:'ค้นหาชื่อ / รหัสลูกค้า / ชื่อผู้ใช้',
    ms:'Cari nama / kod pelanggan / nama pengguna',
    vi:'Tìm tên / mã khách hàng / tên đăng nhập',
    id:'Cari nama / kode pelanggan / nama pengguna'
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

  const USERNAME_LABEL = {
    zh:'用户名',
    my:'အသုံးပြုသူအမည်',
    en:'Username',
    th:'ชื่อผู้ใช้',
    ms:'Nama pengguna',
    vi:'Tên đăng nhập',
    id:'Nama pengguna'
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
    list.style.maxHeight = '430px';
    list.style.overflowY = 'auto';
    list.style.overflowX = 'hidden';
    list.style.webkitOverflowScrolling = 'touch';
    list.style.overscrollBehavior = 'contain';
    list.style.paddingRight = '2px';
  }

  function codeFromCard(card){
    const match =
    String(
      card.textContent || ''
    )
    .match(
      /JMT-C[0-9A-Z-]+/i
    );

    return match
    ?
    match[0].toUpperCase()
    :
    '';
  }

  function decorateUsernames(cards){
    cards.forEach(
      card=>{
        const code =
        codeFromCard(card);

        if(!code){
          return;
        }

        const username =
        usernameByCode.get(code)
        ||
        '';

        let row =
        card.querySelector(
          '[data-agent-customer-username]'
        );

        if(!username){
          if(row){
            row.remove();
          }

          return;
        }

        if(!row){
          row =
          document.createElement(
            'div'
          );

          row.setAttribute(
            'data-agent-customer-username',
            '1'
          );

          row.style.cssText = `
            color:#9d927c;
            font-size:10px;
            margin-top:5px;
          `;

          const codeEl =
          Array
          .from(
            card.querySelectorAll('div')
          )
          .find(
            el=>
            el.children.length === 0
            &&
            String(
              el.textContent || ''
            )
            .trim()
            .toUpperCase()
            ===
            code
          );

          if(codeEl){
            codeEl.insertAdjacentElement(
              'afterend',
              row
            );
          }else{
            card.appendChild(row);
          }
        }

        const nextText =
        text(USERNAME_LABEL)
        +
        '：'
        +
        username;

        if(
          row.textContent
          !==
          nextText
        ){
          row.textContent =
          nextText;
        }
      }
    );
  }

  async function loadIdentities(
    force = false
  ){
    if(identityLoading){
      return;
    }

    if(
      !force
      &&
      Date.now()
      -
      identityLoadedAt
      <
      5000
    ){
      return;
    }

    if(
      typeof api
      !==
      'function'
    ){
      return;
    }

    identityLoading = true;

    try{
      const response =
      await api(
        '/rest/v1/rpc/get_agent_customer_login_identities',
        {
          method:'POST',
          headers:{
            'Content-Type':
            'application/json'
          },
          body:'{}'
        }
      );

      if(!response.ok){
        throw new Error(
          'AGENT_CUSTOMER_IDENTITIES_LOAD_FAILED'
        );
      }

      const rows =
      await response.json();

      const next =
      new Map();

      (
        Array.isArray(rows)
        ?
        rows
        :
        []
      )
      .forEach(
        row=>{
          const code =
          String(
            row.customer_code || ''
          )
          .trim()
          .toUpperCase();

          const username =
          String(
            row.username || ''
          )
          .trim();

          if(
            code
            &&
            username
          ){
            next.set(
              code,
              username
            );
          }
        }
      );

      usernameByCode =
      next;

      identityLoadedAt =
      Date.now();

      applyFilter();

    }catch(error){
      console.error(
        'agent customer identities',
        error
      );
    }finally{
      identityLoading = false;
    }
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
      text(
        SEARCH_PLACEHOLDER
      );
    }

    const cards =
    customerCards(list);

    decorateUsernames(
      cards
    );

    const noMatch =
    document.getElementById(
      'agentCustomerNoMatch'
    );

    if(cards.length === 0){
      if(noMatch){
        noMatch.style.display =
        'none';
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
        .includes(
          searchQuery
        );

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
      noMatch.style.display =
      'block';

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
      noMatch.style.display =
      'none';
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
      loadIdentities(false);
      return true;
    }

    installedList =
    list;

    if(listObserver){
      listObserver.disconnect();
    }

    listObserver =
    new MutationObserver(
      ()=>{
        applyFilter();
        loadIdentities(false);
      }
    );

    listObserver.observe(
      list,
      {
        childList:true
      }
    );

    applyFilter();
    loadIdentities(true);

    return true;
  }

  function waitForCustomerList(){
    if(install()){
      if(installTimer){
        clearInterval(
          installTimer
        );

        installTimer =
        null;
      }
    }
  }

  installTimer =
  setInterval(
    waitForCustomerList,
    400
  );

  setTimeout(
    ()=>{
      if(installTimer){
        clearInterval(
          installTimer
        );

        installTimer =
        null;
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
        event.target.id
        ===
        'langSelect'
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
      loadIdentities(false);
    }
  );

  waitForCustomerList();
})();
