(()=>{
  const $ =
  id =>
  document.getElementById(id);

  const fmt =
  value =>
  new Intl.NumberFormat(
    'en-US',
    {
      maximumFractionDigits:0
    }
  ).format(
    Number(value || 0)
  );

  const Z =
  [
    '鼠','牛','虎','兔','龙','蛇',
    '马','羊','猴','鸡','狗','猪'
  ];

  let loading =
  false;


  function ensureStyle(){

    if(
      $('customerUxCleanupStyle')
    ){
      return;
    }

    const style =
    document.createElement(
      'style'
    );

    style.id =
    'customerUxCleanupStyle';

    style.textContent = `

      .customerResultHero{
        border:1px solid rgba(212,169,59,.34);
        border-radius:14px;
        padding:14px;
        background:
        linear-gradient(
          180deg,
          rgba(35,26,10,.96),
          rgba(10,9,7,.98)
        );
        margin-bottom:12px;
      }

      .customerResultHero small{
        display:block;
        color:#8e7b4c;
        font-size:10px;
        margin-bottom:5px;
      }

      .customerResultHero strong{
        display:block;
        color:#f2ca61;
        font-size:26px;
        line-height:1.25;
      }

      .customerResultGrid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:8px;
      }

      .customerResultBox{
        border:1px solid rgba(212,169,59,.17);
        border-radius:12px;
        padding:11px;
        background:#0c0b09;
        min-height:78px;
      }

      .customerResultBox span{
        display:block;
        color:#827454;
        font-size:10px;
        margin-bottom:5px;
      }

      .customerResultBox b{
        display:block;
        color:#ead18c;
        font-size:15px;
        line-height:1.35;
        word-break:break-word;
      }

      .customerResultState{
        margin-top:12px;
        border-radius:12px;
        padding:12px;
        font-size:13px;
        line-height:1.6;
      }

      .customerResultState.win{
        border:1px solid rgba(72,159,93,.30);
        background:rgba(61,133,79,.11);
        color:#a8dab5;
      }

      .customerResultState.none{
        border:1px solid rgba(212,169,59,.18);
        background:rgba(170,126,43,.08);
        color:#cdb97d;
      }

      .customerPayoutCompact{
        border:1px solid rgba(79,143,92,.22);
        background:rgba(61,122,75,.08);
        border-radius:11px;
        padding:11px 12px;
        color:#b4ccb8;
        font-size:12px;
        line-height:1.65;
      }

      .customerPayoutCompact b{
        color:#e5cd88;
      }

      @media(max-width:520px){

        .customerResultGrid{
          grid-template-columns:
          1fr 1fr;
        }

      }

    `;

    document.head.appendChild(
      style
    );

  }


  function ensureResultCard(){

    let card =
    $('customerLatestResultCard');

    if(card){
      return card;
    }

    card =
    document.createElement(
      'section'
    );

    card.id =
    'customerLatestResultCard';

    card.className =
    'card hidden';

    const roundCard =
    $('roundCard');

    if(
      roundCard
      &&
      roundCard.parentNode
    ){

      const anchor =
      roundCard.previousElementSibling
      ||
      roundCard;

      roundCard.parentNode.insertBefore(
        card,
        anchor
      );

    }

    return card;

  }


  function periodName(code){

    if(code === '1030'){
      return '上午 11:45';
    }

    if(code === '1530'){
      return '下午 3:45';
    }

    return code || '—';

  }


  function zodiacName(code){

    const index =
    Number(code || 0)
    -
    1;

    return (
      Z[index]
      ||
      '—'
    );

  }


  function payoutState(row){

    const due =
    Number(
      row?.payout_due
      ||
      0
    );

    const paid =
    Number(
      row?.payout_paid
      ||
      0
    );

    const status =
    String(
      row?.payout_status
      ||
      ''
    );

    if(due <= 0){

      return {
        text:
        '未中奖 · 本期已结算',

        kind:
        'none'
      };

    }

    if(
      status === 'paid'
      ||
      paid >= due
    ){

      return {
        text:
        '已派彩',

        kind:
        'win'
      };

    }

    if(paid > 0){

      return {

        text:
        '部分派彩 · 剩余 '
        +
        fmt(
          Math.max(
            due - paid,
            0
          )
        ),

        kind:
        'win'

      };

    }

    return {

      text:
      '待派彩 · 平台应返还 '
      +
      fmt(due),

      kind:
      'win'

    };

  }


  function renderResult(row){

    const card =
    ensureResultCard();

    if(!row){

      card.classList.add(
        'hidden'
      );

      return;

    }

    const state =
    payoutState(row);

    const win =
    Number(
      row.winning_points
      ||
      0
    );

    const due =
    Number(
      row.payout_due
      ||
      0
    );

    card.innerHTML = `

      <div class="cardTitle">

        最近一期结果

      </div>


      <div class="customerResultHero">

        <small>

          ${row.round_date || '—'}
          ·
          ${periodName(row.round_code)}

        </small>

        <strong>

          开奖生肖：
          ${zodiacName(row.result_number)}

        </strong>

      </div>


      <div class="customerResultGrid">

        <div class="customerResultBox">

          <span>
            我的有效下注
          </span>

          <b>
            ${fmt(row.confirmed_total)}
          </b>

        </div>


        <div class="customerResultBox">

          <span>
            命中生肖金额
          </span>

          <b>
            ${fmt(win)}
          </b>

        </div>


        <div class="customerResultBox">

          <span>
            本期赔率
          </span>

          <b>
            1 : ${fmt(row.payout_multiplier_snapshot)}
            总返还
          </b>

        </div>


        <div class="customerResultBox">

          <span>
            中奖返还
          </span>

          <b>
            ${fmt(due)}
          </b>

        </div>

      </div>


      <div
        class="customerResultState ${state.kind}">

        ${state.text}

      </div>


      <div class="note">

        只有开奖前由管理员确认的金额，
        才属于本期有效下注。

        待审核、已拒绝或仅保存的金额，
        不会参与中奖计算。

      </div>

    `;

    card.classList.remove(
      'hidden'
    );

  }


  async function loadLatestResult(){

    if(
      !token
      ||
      !profile
      ||
      loading
    ){

      return undefined;

    }

    loading =
    true;

    try{

      const res =
      await fetch(

        BASE
        +
        '/rest/v1/rpc/customer_latest_settlement_summary',

        {

          method:'POST',

          headers:
          authHeaders(),

          body:'{}'

        }

      );

      const data =
      await parseResponse(
        res
      );

      return (
        data?.settlement
        ||
        null
      );

    }
    catch(error){

      console.warn(
        'CUSTOMER_LATEST_SETTLEMENT_FAILED',
        error
      );

      return undefined;

    }
    finally{

      loading =
      false;

    }

  }


  function compactPayout(method){

    const isKpay =
    method ===
    'kpay';

    const status =
    $(
      isKpay
      ?
      'kpayStatus'
      :
      'bankStatus'
    );

    if(!status){
      return;
    }

    const box =
    status.closest(
      '.accountBox'
    );

    if(!box){
      return;
    }

    const notice =
    $(
      isKpay
      ?
      'kpayNotice'
      :
      'bankNotice'
    );

    const button =
    $(
      isKpay
      ?
      'saveKpayBtn'
      :
      'saveBankBtn'
    );

    const fields =
    [
      ...box.querySelectorAll(
        '.field'
      )
    ];

    const bound =
    status.classList.contains(
      'bound'
    )
    ||
    String(
      status.textContent
      ||
      ''
    )
    .includes(
      '已绑定'
    );

    let compact =
    box.querySelector(
      '.customerPayoutCompact'
    );


    if(!bound){

      fields.forEach(
        el =>
        el.style.display =
        ''
      );

      if(notice){
        notice.style.display =
        '';
      }

      if(button){
        button.style.display =
        '';
      }

      if(compact){
        compact.remove();
      }

      return;

    }


    fields.forEach(
      el =>
      el.style.display =
      'none'
    );

    if(notice){
      notice.style.display =
      'none';
    }

    if(button){
      button.style.display =
      'none';
    }


    if(!compact){

      compact =
      document.createElement(
        'div'
      );

      compact.className =
      'customerPayoutCompact';

      box.appendChild(
        compact
      );

    }


    if(isKpay){

      const name =
      $('kpayName')?.value
      ||
      '—';

      const number =
      $('kpayNumber')?.value
      ||
      '—';

      compact.innerHTML = `

        <b>
          KPay 已绑定
        </b>

        <br>

        ${name}
        ·
        ${number}

        <br>

        如需更换，请联系客服。

      `;

    }
    else{

      const bank =
      $('bankName')?.value
      ||
      '—';

      const name =
      $('bankAccountName')?.value
      ||
      '—';

      const number =
      $('bankAccountNumber')?.value
      ||
      '—';

      compact.innerHTML = `

        <b>
          银行账户已绑定
        </b>

        <br>

        ${bank}
        ·
        ${name}

        <br>

        ${number}

        <br>

        如需更换，请联系客服。

      `;

    }

  }


  function simplifyNoOpenRound(
    hasSettlement
  ){

    if(
      typeof currentRound
      ===
      'undefined'
      ||
      currentRound
    ){

      return;

    }

    const title =
    $('roundTitle');

    const badge =
    $('roundBadge');

    const empty =
    $('roundEmpty');

    if(title){

      title.textContent =
      '下一期';

    }

    if(badge){

      badge.textContent =
      '暂未开放';

    }

    const box =
    empty?.querySelector(
      '.closedBox'
    );

    if(box){

      box.textContent =
      hasSettlement

      ?

      '上一期已经结束，结果与结算见上方。下一期开放后会自动显示在这里。'

      :

      '当前暂无开放期，请等待下一期开放。';

    }

  }


  function polishFooter(){

    const foot =
    document.querySelector(
      '.foot'
    );

    if(foot){

      foot.textContent =
      '© JIN MANTANG · CUSTOMER SYSTEM';

    }

  }


  async function refresh(){

    if(
      !token
      ||
      !profile
    ){

      return;

    }

    ensureStyle();

    compactPayout(
      'kpay'
    );

    compactPayout(
      'bank'
    );

    polishFooter();


    const row =
    await loadLatestResult();


    if(
      row
      !==
      undefined
    ){

      renderResult(
        row
      );

      simplifyNoOpenRound(
        Boolean(row)
      );

    }

  }


  window.addEventListener(
    'load',
    ()=>{

      setTimeout(
        refresh,
        900
      );

      setInterval(
        refresh,
        10000
      );

    }
  );


  document.addEventListener(
    'visibilitychange',
    ()=>{

      if(
        document.visibilityState
        ===
        'visible'
      ){

        refresh();

      }

    }
  );

})();
