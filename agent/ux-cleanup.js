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
    Number(
      value || 0
    )
  );


  const zodiacNames =
  [
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


  function cardByChild(id){

    const el =
    $(id);


    return el
    ?
    el.closest(
      '.card'
    )
    :
    null;

  }


  function setCardHidden(
    id,
    hidden
  ){

    const card =
    cardByChild(id);


    if(card){

      card.classList.toggle(
        'hidden',
        Boolean(hidden)
      );

    }

  }

  function ensureReferralCard(){

    let card =
    $('agentReferralCard');


    if(card){

      return card;

    }


    const agentBox =
    $('agentBox');


    if(!agentBox){

      return null;

    }


    card =
    document.createElement(
      'div'
    );


    card.id =
    'agentReferralCard';


    card.className =
    'card hidden';


    card.innerHTML = `

      <div class="title">
        我的专属推广链接
      </div>


      <div class="info">

        <div
          class="box highlight">

          <small>
            永久推广码
          </small>

          <strong
            id="agentReferralCode">
            —
          </strong>

        </div>

      </div>


      <div
        style="margin-top:12px">

        <div
          style="
            color:#817b71;
            font-size:10px;
            margin-bottom:7px
          ">
          客户专属注册链接
        </div>


        <input
          id="agentReferralLink"
          type="text"
          readonly>


        <button
          id="copyAgentReferralLink"
          type="button">
          复制专属注册链接
        </button>


        <div
          id="agentReferralCopyMsg"
          class="msg">
        </div>

      </div>


      <div class="note">

        此推广链接仅用于确认客户归属代理，
        不包含代理佣金比例。

      </div>

    `;


    const profileCard =
    $('agentName')
    ?.
    closest(
      '.card'
    );


    if(
      profileCard
      &&
      profileCard.parentNode
      ===
      agentBox
    ){

      profileCard.insertAdjacentElement(
        'afterend',
        card
      );

    }
    else{

      agentBox.insertBefore(
        card,
        agentBox.firstChild
      );

    }


    const copyButton =
    $('copyAgentReferralLink');


    if(copyButton){

      copyButton.addEventListener(
        'click',
        async ()=>{

          const linkInput =
          $('agentReferralLink');

          const msg =
          $('agentReferralCopyMsg');


          if(
            !linkInput
            ||
            !linkInput.value
          ){

            return;

          }


          try{

            await navigator.clipboard.writeText(
              linkInput.value
            );

          }
          catch(error){

            linkInput.focus();

            linkInput.select();

            document.execCommand(
              'copy'
            );

          }


          if(msg){

            msg.textContent =
            '✓ 已复制专属注册链接';

            msg.className =
            'msg success';

          }

        }
      );

    }


    return card;

  }


  function applyReferralCard(){

    const card =
    ensureReferralCard();


    if(!card){

      return;

    }


    if(
      typeof agent
      ===
      'undefined'
      ||
      !agent
    ){

      card.classList.add(
        'hidden'
      );

      return;

    }


    const code =
    String(
      agent.referral_code
      ||
      ''
    )
    .trim();


    if(!code){

      card.classList.add(
        'hidden'
      );

      return;

    }


    const codeEl =
    $('agentReferralCode');

    const linkEl =
    $('agentReferralLink');


    if(codeEl){

      codeEl.textContent =
      code;

    }


    if(linkEl){

      linkEl.value =
      location.origin
      +
      '/customer/?ref='
      +
      encodeURIComponent(
        code
      );

    }


    card.classList.remove(
      'hidden'
    );

  }
    let customerRoundLiveLoading =
  false;

  let customerRoundLiveRoundId =
  null;

  let customerRoundLiveLoadedAt =
  0;

  let customerRoundLiveRows =
  [];


  function ensureCustomerRoundLiveCard(){

    let card =
    $('agentCustomerRoundLiveCard');


    if(card){

      return card;

    }


    const agentBox =
    $('agentBox');


    if(!agentBox){

      return null;

    }


    card =
    document.createElement(
      'div'
    );


    card.id =
    'agentCustomerRoundLiveCard';


    card.className =
    'card hidden';


    card.innerHTML = `

      <div class="title">
        我的客户 · 本期实时汇总
      </div>


      <div
        id="agentCustomerRoundSummary">
      </div>


      <div
        id="agentCustomerRoundList"
        style="margin-top:12px">
      </div>


      <div
        class="note">

        只统计直属客户本期数据。

        待确认金额不会计入正式有效金额。

      </div>

    `;


    const referralCard =
    $('agentReferralCard');


    if(
      referralCard
      &&
      referralCard.parentNode
      ===
      agentBox
    ){

      referralCard.insertAdjacentElement(
        'afterend',
        card
      );

    }
    else{

      const profileCard =
      $('agentName')
      ?.
      closest(
        '.card'
      );


      if(
        profileCard
        &&
        profileCard.parentNode
        ===
        agentBox
      ){

        profileCard.insertAdjacentElement(
          'afterend',
          card
        );

      }
      else{

        agentBox.insertBefore(
          card,
          agentBox.firstChild
        );

      }

    }


    return card;

  }


  function customerRoundGrouped(rows){

    const map =
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

        const customerId =
        String(
          row.customer_id
          ||
          ''
        );


        if(!customerId){

          return;

        }


        if(
          !map.has(
            customerId
          )
        ){

          map.set(
            customerId,
            {
              customer_id:
              customerId,

              customer_code:
              row.customer_code
              ||
              '—',

              display_name:
              row.display_name
              ||
              '—',

              order_status:
              row.order_status
              ||
              '',

              submitted_total:
              number(
                row.submitted_total
              ),

              confirmed_total:
              number(
                row.confirmed_total
              ),

              pending_total:
              number(
                row.pending_total
              ),

              entries:[]
            }
          );

        }


        if(
          row.number_code
          !=
          null
        ){

          map
          .get(
            customerId
          )
          .entries
          .push({
            number_code:
            String(
              row.number_code
            ),

            points:
            number(
              row.points
            ),

            confirmed_points:
            number(
              row.confirmed_points
            ),

            pending_points:
            number(
              row.pending_points
            )
          });

        }

      }
    );


    return [
      ...map.values()
    ];

  }


  function zodiacFromNumberCode(code){

    const index =
    Number(
      code
    )
    -
    1;


    return (
      zodiacNames[
        index
      ]
      ||
      String(
        code
        ||
        '—'
      )
    );

  }


  function renderCustomerRoundLive(){

    const card =
    ensureCustomerRoundLiveCard();


    if(!card){

      return;

    }


    const summary =
    $('agentCustomerRoundSummary');

    const list =
    $('agentCustomerRoundList');


    const customers =
    customerRoundGrouped(
      customerRoundLiveRows
    );


    let confirmedTotal =
    0;

    let pendingTotal =
    0;


    customers.forEach(
      customer=>{

        confirmedTotal +=
        number(
          customer.confirmed_total
        );

        pendingTotal +=
        number(
          customer.pending_total
        );

      }
    );


    if(summary){

      summary.innerHTML = `

        <div class="info">

          <div
            class="box highlight">

            <small>
              直属客户
            </small>

            <strong>
              ${fmt(customers.length)}
            </strong>

          </div>


          <div
            class="box highlight">

            <small>
              本期有效金额
            </small>

            <strong>
              ${fmt(confirmedTotal)}
            </strong>

          </div>


          <div
            class="box">

            <small>
              待确认金额
            </small>

            <strong>
              ${fmt(pendingTotal)}
            </strong>

          </div>

        </div>

      `;

    }


    if(list){

      if(
        customers.length
        ===
        0
      ){

        list.innerHTML = `

          <div
            class="settlementNotice">

            当前暂无直属客户。

          </div>

        `;

      }
      else{

        list.innerHTML =
        customers
        .map(
          customer=>{

            const entries =
            customer.entries
            .filter(
              entry=>
              (
                entry.points > 0
                ||
                entry.confirmed_points > 0
                ||
                entry.pending_points > 0
              )
            )
            .map(
              entry=>`

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    padding:8px 0;
                    border-bottom:
                    1px solid rgba(255,255,255,.05)
                  ">

                  <div
                    style="
                      color:#dec372;
                      font-weight:800
                    ">
                    ${zodiacFromNumberCode(
                      entry.number_code
                    )}
                  </div>

                  <div
                    style="
                      text-align:right;
                      color:#918a7c;
                      font-size:11px;
                      line-height:1.6
                    ">

                    有效
                    <strong
                      style="color:#70d39d">
                      ${fmt(
                        entry.confirmed_points
                      )}
                    </strong>

                    · 待确认
                    <strong
                      style="color:#e8c86e">
                      ${fmt(
                        entry.pending_points
                      )}
                    </strong>

                  </div>

                </div>

              `
            )
            .join(
              ''
            );


            return `

              <div
                style="
                  background:#101011;
                  border:
                  1px solid rgba(214,168,63,.16);
                  border-radius:14px;
                  padding:13px;
                  margin-top:10px
                ">

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    align-items:flex-start
                  ">

                  <div>

                    <div
                      style="
                        color:#efcf70;
                        font-weight:900;
                        font-size:14px
                      ">
                      ${customer.display_name}
                    </div>

                    <div
                      style="
                        color:#777166;
                        font-size:10px;
                        margin-top:4px
                      ">
                      ${customer.customer_code}
                    </div>

                  </div>


                  <div
                    style="
                      text-align:right;
                      font-size:10px;
                      line-height:1.7
                    ">

                    <div
                      style="color:#70d39d">

                      有效
                      ${fmt(
                        customer.confirmed_total
                      )}

                    </div>

                    <div
                      style="color:#e8c86e">

                      待确认
                      ${fmt(
                        customer.pending_total
                      )}

                    </div>

                  </div>

                </div>


                ${
                  entries
                  ||
                  `

                    <div
                      style="
                        margin-top:10px;
                        color:#777166;
                        font-size:10px
                      ">

                      本期暂无下注明细

                    </div>

                  `
                }

              </div>

            `;

          }
        )
        .join(
          ''
        );

      }

    }


    card.classList.remove(
      'hidden'
    );

  }


  async function loadCustomerRoundLive(){

    if(
      customerRoundLiveLoading
    ){

      return;

    }


    if(
      typeof currentRound
      ===
      'undefined'
      ||
      !currentRound
      ||
      !currentRound.id
    ){

      return;

    }


    customerRoundLiveLoading =
    true;


    try{

      const response =
      await api(
        '/rest/v1/rpc/get_agent_customer_round_live',
        {
          method:'POST',

          headers:{
            'Content-Type':
            'application/json'
          },

          body:
          JSON.stringify({
            p_round_id:
            currentRound.id
          })
        }
      );


      if(
        !response.ok
      ){

        throw new Error(
          'CUSTOMER_ROUND_LIVE_LOAD_FAILED'
        );

      }


      const rows =
      await response.json();


      customerRoundLiveRows =
      Array.isArray(
        rows
      )
      ?
      rows
      :
      [];


      customerRoundLiveRoundId =
      currentRound.id;

      customerRoundLiveLoadedAt =
      Date.now();


      renderCustomerRoundLive();

    }
    catch(error){

      console.error(
        'agent customer round live',
        error
      );

    }
    finally{

      customerRoundLiveLoading =
      false;

    }

  }


  function applyCustomerRoundLive(){

    const card =
    ensureCustomerRoundLiveCard();


    if(!card){

      return;

    }


    if(
      typeof agent
      ===
      'undefined'
      ||
      !agent
      ||
      typeof currentRound
      ===
      'undefined'
      ||
      !currentRound
      ||
      !currentRound.id
    ){

      card.classList.add(
        'hidden'
      );

      return;

    }


    if(
      customerRoundLiveRoundId
      !==
      currentRound.id
    ){

      customerRoundLiveRows =
      [];

      customerRoundLiveRoundId =
      null;

      customerRoundLiveLoadedAt =
      0;

    }


    if(
      customerRoundLiveRoundId
      ===
      currentRound.id
    ){

      renderCustomerRoundLive();

    }


    const stale =
    (
      Date.now()
      -
      customerRoundLiveLoadedAt
    )
    >
    5000;


    if(
      !customerRoundLiveLoading
      &&
      stale
    ){

      loadCustomerRoundLive();

    }

  }
  function ensureSimpleCard(){

    let card =
    $('agentSimpleSettledCard');


    if(card){

      return card;

    }


    card =
    document.createElement(
      'div'
    );


    card.id =
    'agentSimpleSettledCard';


    card.className =
    'card hidden';


    const logoutButton =
    [
      ...document.querySelectorAll(
        'button'
      )
    ]
    .find(
      button =>
      button.getAttribute(
        'data-i18n'
      )
      ===
      'logout'
    );


    const logoutCard =
    logoutButton
    ?
    logoutButton.closest(
      '.card'
    )
    :
    null;


    const agentBox =
    $('agentBox');


    if(agentBox){

      agentBox.insertBefore(
        card,
        logoutCard || null
      );

    }


    return card;

  }


  function periodName(round){

    if(!round){

      return '—';

    }


    if(
      round.round_code
      ===
      '1030'
    ){

      return '上午 11:45';

    }


    if(
      round.round_code
      ===
      '1530'
    ){

      return '下午 3:45';

    }


    return (
      round.round_code
      ||
      '—'
    );

  }


  function resultName(round){

    if(
      !round
      ||
      round.result_number
      ==
      null
    ){

      return '—';

    }


    return (
      zodiacNames[
        Number(
          round.result_number
        )
        -
        1
      ]
      ||
      '—'
    );

  }


  function number(value){

    const n =
    Number(
      value || 0
    );


    return Number.isFinite(n)
    ?
    n
    :
    0;

  }


  function hasPaymentHistory(){

    return (
      typeof paymentSubmissions
      !==
      'undefined'
      &&
      Array.isArray(
        paymentSubmissions
      )
      &&
      paymentSubmissions.length
      >
      0
    );

  }


  function settlementValue(key){

    return (
      typeof settlement
      !==
      'undefined'
      &&
      settlement
    )
    ?
    number(
      settlement[key]
    )
    :
    0;

  }


  function currentSavedTotal(){

    return (
      typeof submittedTotal
      !==
      'undefined'
    )
    ?
    number(
      submittedTotal
    )
    :
    0;

  }


  function currentConfirmedTotal(){

    return settlementValue(
      'submitted_total'
    );

  }


  function hasFinancialActivity(){

    return (

      currentSavedTotal()
      >
      0

      ||

      currentConfirmedTotal()
      >
      0

      ||

      settlementValue(
        'amount_due'
      )
      >
      0

      ||

      settlementValue(
        'amount_received'
      )
      >
      0

      ||

      hasPaymentHistory()

    );

  }


  function renderSettledCard(card){

    const savedTotal =
    currentSavedTotal();


    const confirmedTotal =
    currentConfirmedTotal();


    const commission =
    settlementValue(
      'commission_amount'
    );


    const payout =
    settlementValue(
      'result_payout'
    );


    const finalBalance =
    settlementValue(
      'final_balance'
    );


    const noValidBet =
    confirmedTotal
    <=
    0;


    let financialHtml =
    '';


    if(noValidBet){

      financialHtml = `

        <div
          class="settlementNotice"
          style="margin-top:12px">

          本期没有管理员确认的有效下注，
          因此不参与中奖计算，
          也无需结款。

          ${
            savedTotal > 0
            ?
            `

              <br><br>

              保存申报金额

              <strong>
                ${fmt(savedTotal)}
              </strong>

              仅作为历史记录。

            `
            :
            ''
          }

        </div>

      `;

    }
    else{

      const balanceLabel =
      finalBalance > 0
      ?
      '代理应付平台'
      :
      finalBalance < 0
      ?
      '平台应付代理'
      :
      '结算完成';


      financialHtml = `

        <div
          class="info"
          style="margin-top:10px">

          <div
            class="box commission highlight">

            <small>
              本期代理佣金
            </small>

            <strong>
              ${fmt(commission)}
            </strong>

          </div>


          <div
            class="box highlight">

            <small>
              中奖返还
            </small>

            <strong>
              ${fmt(payout)}
            </strong>

          </div>


          <div
            class="box highlight">

            <small>
              ${balanceLabel}
            </small>

            <strong>
              ${fmt(
                Math.abs(
                  finalBalance
                )
              )}
            </strong>

          </div>

        </div>


        <div
          class="settlementNotice paid"
          style="margin-top:12px">

          只有开奖前由管理员确认的金额
          才进入正式结算。

          本期已经锁定，
          不能再补交或修改。

        </div>

      `;

    }


    card.innerHTML = `

      <div class="title">
        最近一期结果
      </div>


      <div
        class="settlementNotice paid"
        style="margin-bottom:12px">

        ✓ 本期已开奖 · 数据已锁定

      </div>


      <div class="info">

        <div
          class="box highlight">

          <small>
            期数
          </small>

          <strong>

            ${
              currentRound
              ?.round_date
              ||
              '—'
            }

            ·

            ${
              periodName(
                currentRound
              )
            }

          </strong>

        </div>


        <div
          class="box highlight">

          <small>
            开奖生肖
          </small>

          <strong>

            ${
              resultName(
                currentRound
              )
            }

          </strong>

        </div>


        <div class="box">

          <small>
            保存申报金额
          </small>

          <strong>
            ${fmt(savedTotal)}
          </strong>

        </div>


        <div class="box">

          <small>
            正式确认金额
          </small>

          <strong>
            ${fmt(confirmedTotal)}
          </strong>

        </div>

      </div>


      ${financialHtml}

    `;


    card.classList.remove(
      'hidden'
    );

  }


  function renderOpenState(card){

    card.classList.add(
      'hidden'
    );


    const activity =
    hasFinancialActivity();


    const due =
    (
      typeof getPaymentAmountDue
      ===
      'function'
    )
    ?
    number(
      getPaymentAmountDue()
    )
    :
    settlementValue(
      'amount_due'
    );


    const remaining =
    (
      typeof getPaymentRemaining
      ===
      'function'
    )
    ?
    number(
      getPaymentRemaining()
    )
    :
    0;


    const showFinance =
    activity;


    const showPayment =
    (
      hasPaymentHistory()
      ||
      due > 0
      ||
      remaining > 0
    );


    /*
      当前开放期：
      下注区始终显示。
    */

    setCardHidden(
      'numberGrid',
            true
    );


    /*
      没有下注、没有付款历史：
      不显示整块结款。
    */

    setCardHidden(
      'settlementSubmittedTotal',
            true
    );


    /*
      只有真正产生应付款
      或已经有付款记录，
      才显示付款中心。
    */

    setCardHidden(
      'paymentRequiredAmount',
           true
    );


    /*
      开奖以前不显示
      六个“等待开奖”的结果框。
    */

    setCardHidden(
      'resultNumber',
      true
    );

  }


  function renderNoRoundState(card){

    card.classList.add(
      'hidden'
    );


    setCardHidden(
      'numberGrid',
      true
    );


    setCardHidden(
      'settlementSubmittedTotal',
      true
    );


    setCardHidden(
      'paymentRequiredAmount',
      true
    );


    setCardHidden(
      'resultNumber',
      true
    );

  }


  function applyAgentUx(){

    try{
      applyReferralCard();
            applyCustomerRoundLive();
            const roundStatusEl =
      $('roundStatus');

      if(roundStatusEl){

        roundStatusEl.textContent =
        '仅供查看 · 不支持提交 / 修改';

        roundStatusEl.style.color =
        '#ff5b5b';

      }


      const serverNoteEl =
      document.querySelector(
        '[data-i18n="serverNote"]'
      );

      if(serverNoteEl){

        serverNoteEl.textContent =
        '代理账号仅供查看直属客户数据，不支持提交或修改任何订单。';

      }
      if(
        typeof currentRound
        ===
        'undefined'
      ){

        return;

      }


      const card =
      ensureSimpleCard();


      if(!currentRound){

        renderNoRoundState(
          card
        );


        return;

      }


      const ended =
      (
        currentRound.status
        ===
        'settled'

        ||

        currentRound.result_number
        !=
        null
      );


      /*
        已开奖：
        旧下注、结款、付款、结果区
        全部隐藏。

        只保留一张最终摘要。
      */

      if(ended){

        setCardHidden(
          'numberGrid',
          true
        );


        setCardHidden(
          'settlementSubmittedTotal',
          true
        );


        setCardHidden(
          'paymentRequiredAmount',
          true
        );


        setCardHidden(
          'resultNumber',
          true
        );


        renderSettledCard(
          card
        );


        return;

      }


      /*
        当前开放期。
      */

      renderOpenState(
        card
      );

    }
    catch(error){

      console.error(
        'agent ux cleanup',
        error
      );

    }

  }


  function polishFooter(){

    const foot =
    document.querySelector(
      '.foot'
    );


    if(foot){

      foot.textContent =
      '© JIN MANTANG · AGENT SYSTEM';

    }

  }


  window.addEventListener(
    'load',
    ()=>{

      setTimeout(
        ()=>{

          polishFooter();

          applyAgentUx();

        },
        700
      );


      /*
        主页面自己会不断同步数据，
        所以这里也周期检查显示状态。

        不修改数据库，
        只控制页面该显示什么。
      */

      setInterval(
        ()=>{

          polishFooter();

          applyAgentUx();

        },
        2500
      );

    }
  );

})();
