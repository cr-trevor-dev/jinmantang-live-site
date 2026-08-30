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


    if(
      agentBox
    ){

      agentBox.insertBefore(
        card,
        logoutCard || null
      );

    }


    return card;

  }


  function setCardHiddenByChild(
    childId,
    hidden
  ){

    const child =
    $(childId);


    if(!child){

      return;

    }


    const card =
    child.closest(
      '.card'
    );


    if(card){

      card.classList.toggle(
        'hidden',
        hidden
      );

    }

  }


  function getPeriodName(){

    if(
      !currentRound
    ){

      return '—';

    }


    if(
      currentRound.round_code
      ===
      '1030'
    ){

      return '上午 11:45';

    }


    if(
      currentRound.round_code
      ===
      '1530'
    ){

      return '下午 3:45';

    }


    return (
      currentRound.round_code
      ||
      '—'
    );

  }


  function renderSimpleSettledView(){

    try{

      if(
        typeof currentRound
        ===
        'undefined'
      ){

        return;

      }


      const ended =
      Boolean(
        currentRound
      )
      &&
      (
        currentRound.status
        ===
        'settled'
        ||
        currentRound.result_number
        !=
        null
      );


      const simpleCard =
      ensureSimpleCard();


      if(!ended){

        simpleCard
        .classList
        .add(
          'hidden'
        );


        [
          'numberGrid',
          'settlementSubmittedTotal',
          'paymentRequiredAmount',
          'resultNumber'
        ]
        .forEach(
          id =>
          setCardHiddenByChild(
            id,
            false
          )
        );


        return;

      }


      /*
        开奖后：
        把旧的复杂操作区收起来。
      */

      [
        'numberGrid',
        'settlementSubmittedTotal',
        'paymentRequiredAmount',
        'resultNumber'
      ]
      .forEach(
        id =>
        setCardHiddenByChild(
          id,
          true
        )
      );


      const savedTotal =
      typeof submittedTotal
      !==
      'undefined'
      ?
      Number(
        submittedTotal || 0
      )
      :
      0;


      const confirmedTotal =
      (
        typeof settlement
        !==
        'undefined'
        &&
        settlement
      )
      ?
      Number(
        settlement
        .submitted_total
        ||
        0
      )
      :
      0;


      const commission =
      (
        typeof settlement
        !==
        'undefined'
        &&
        settlement
      )
      ?
      Number(
        settlement
        .commission_amount
        ||
        0
      )
      :
      0;


      const resultPayout =
      (
        typeof settlement
        !==
        'undefined'
        &&
        settlement
      )
      ?
      Number(
        settlement
        .result_payout
        ||
        0
      )
      :
      0;


      const resultIndex =
      Number(
        currentRound
        .result_number
        ||
        0
      )
      -
      1;


      const resultName =
      zodiacNames[
        resultIndex
      ]
      ||
      '—';


      const noValidBet =
      confirmedTotal
      <=
      0;


      let detailHtml =
      '';


      if(noValidBet){

        detailHtml = `

          <div
            class="settlementNotice"
            style="margin-top:12px">

            本期没有管理员确认的有效下注，
            因此无需付款，也不参与中奖计算。

            <br><br>

            保存申报金额
            <strong>
              ${fmt(savedTotal)}
            </strong>
            仅作为本期历史记录。

          </div>

        `;

      }
      else{

        detailHtml = `

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
                ${fmt(resultPayout)}
              </strong>

            </div>

          </div>


          <div
            class="settlementNotice"
            style="margin-top:12px">

            只有开奖前经管理员确认的金额，
            才进入本期正式结算。

            开奖以后，
            本期不再接受新的付款或审核。

          </div>

        `;

      }


      simpleCard.innerHTML = `

        <div class="title">

          本期已结束

        </div>


        <div
          class="settlementNotice paid"
          style="margin-bottom:12px">

          ✓ 开奖结果已经发布

          <br>

          本期数据已锁定，
          不能再修改或补交付款。

        </div>


        <div class="info">

          <div
            class="box highlight">

            <small>
              期数
            </small>

            <strong>
              ${
                currentRound.round_date
                ||
                '—'
              }
              ·
              ${getPeriodName()}
            </strong>

          </div>


          <div
            class="box highlight">

            <small>
              开奖生肖
            </small>

            <strong>
              ${resultName}
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


        ${detailHtml}

      `;


      simpleCard
      .classList
      .remove(
        'hidden'
      );

    }
    catch(error){

      console.error(
        'agent settled view',
        error
      );

    }

  }


  window.addEventListener(
    'load',
    ()=>{

      setTimeout(
        renderSimpleSettledView,
        700
      );


      setInterval(
        renderSimpleSettledView,
        5000
      );

    }
  );

})();
