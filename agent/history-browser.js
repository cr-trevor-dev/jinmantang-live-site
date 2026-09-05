(()=>{
'use strict';

/*
  Agent Commission History Browser
  只读取：
  - 正式已结算期数
  - 当前代理已有佣金历史

  不创建、不修改任何佣金/付款/下注数据。
*/

const CARD_ID =
'agentCommissionHistoryBrowser';

let loaded = false;
let loading = false;
let rounds = [];
let commissions = [];
let expanded = false;
const HISTORY_BROWSER_I18N = {

  zh:{
    title:'历史佣金查询',
    expand:'展开查询',
    collapse:'收起',
    hint1:'可按年、月、日期和期数查看自己的佣金状态。',
    hint2:'没有产生佣金的正式期数，也会明确显示“该期暂无佣金”。',
    year:'年',
    month:'月',
    day:'日',
    chooseRound:'请选择要查询的正式期数',
    noCommission:'该期暂无佣金',
    noCommissionText:'该期没有产生你的代理佣金。',
    noCommissionReason:'只有直属客户实际提交付款，并由平台后台确认到账的有效金额才会产生代理佣金。',
    confirmed:'直属客户有效金额',
    rate:'当期佣金率',
    due:'应付佣金',
    paid:'已付佣金',
    paidAt:'支付完成：',
    statusPaid:'已支付',
    statusPartial:'部分支付',
    statusPending:'待支付'
  },

  my:{
    title:'ကော်မရှင်မှတ်တမ်း ရှာဖွေရန်',
    expand:'ရှာဖွေရန် ဖွင့်မည်',
    collapse:'ပိတ်မည်',
    hint1:'နှစ်၊ လ၊ ရက်နှင့် အကြိမ်အလိုက် ကော်မရှင်အခြေအနေကို ကြည့်နိုင်ပါသည်။',
    hint2:'ကော်မရှင်မရှိသော တရားဝင်အကြိမ်များကိုလည်း “ဤအကြိမ် ကော်မရှင်မရှိပါ” ဟု ပြသပါမည်။',
    year:'နှစ်',
    month:'လ',
    day:'ရက်',
    chooseRound:'ကြည့်လိုသော တရားဝင်အကြိမ်ကို ရွေးပါ',
    noCommission:'ဤအကြိမ် ကော်မရှင်မရှိပါ',
    noCommissionText:'ဤအကြိမ်တွင် သင့်အတွက် ကိုယ်စားလှယ်ကော်မရှင် မရှိပါ။',
    noCommissionReason:'တိုက်ရိုက်ဖောက်သည်မှ အမှန်တကယ်ငွေပေးချေပြီး Platform မှ အတည်ပြုထားသော ငွေပမာဏရှိမှသာ ကော်မရှင် ရရှိပါမည်။',
    confirmed:'တိုက်ရိုက်ဖောက်သည် အတည်ပြုငွေ',
    rate:'အကြိမ်ကော်မရှင်နှုန်း',
    due:'ပေးရန် ကော်မရှင်',
    paid:'ပေးချေပြီး ကော်မရှင်',
    paidAt:'ပေးချေပြီးချိန်：',
    statusPaid:'ပေးချေပြီး',
    statusPartial:'တစ်စိတ်တစ်ပိုင်း ပေးချေပြီး',
    statusPending:'ပေးချေရန်စောင့်နေသည်'
  },

  en:{
    title:'Commission History Search',
    expand:'Open Search',
    collapse:'Collapse',
    hint1:'View your commission status by year, month, date and round.',
    hint2:'Settled rounds with no commission will also clearly show “No commission for this round”.',
    year:'Year',
    month:'Month',
    day:'Day',
    chooseRound:'Select a settled round to view',
    noCommission:'No Commission This Round',
    noCommissionText:'No agent commission was generated for this round.',
    noCommissionReason:'Commission is generated only from valid payments submitted by direct customers and confirmed by the platform.',
    confirmed:'Confirmed Customer Amount',
    rate:'Round Commission Rate',
    due:'Commission Due',
    paid:'Commission Paid',
    paidAt:'Paid At:',
    statusPaid:'Paid',
    statusPartial:'Partially Paid',
    statusPending:'Pending'
  },

  th:{
    title:'ค้นหาประวัติคอมมิชชั่น',
    expand:'เปิดการค้นหา',
    collapse:'ย่อ',
    hint1:'ดูสถานะคอมมิชชั่นตามปี เดือน วันที่ และรอบได้',
    hint2:'รอบที่ไม่มีคอมมิชชั่นจะแสดงอย่างชัดเจนว่า “รอบนี้ไม่มีคอมมิชชั่น”',
    year:'ปี',
    month:'เดือน',
    day:'วัน',
    chooseRound:'เลือกรอบที่ต้องการดู',
    noCommission:'รอบนี้ไม่มีคอมมิชชั่น',
    noCommissionText:'รอบนี้ไม่มีค่าคอมมิชชั่นตัวแทนของคุณ',
    noCommissionReason:'ค่าคอมมิชชั่นจะเกิดขึ้นเมื่อมีการชำระเงินจริงจากลูกค้าโดยตรงและได้รับการยืนยันจากระบบแล้วเท่านั้น',
    confirmed:'ยอดลูกค้าโดยตรงที่ยืนยันแล้ว',
    rate:'อัตราคอมมิชชั่นรอบนั้น',
    due:'ค่าคอมมิชชั่นที่ต้องจ่าย',
    paid:'ค่าคอมมิชชั่นที่จ่ายแล้ว',
    paidAt:'ชำระเสร็จเมื่อ:',
    statusPaid:'จ่ายแล้ว',
    statusPartial:'จ่ายบางส่วน',
    statusPending:'รอจ่าย'
  },

  ms:{
    title:'Carian Sejarah Komisen',
    expand:'Buka Carian',
    collapse:'Tutup',
    hint1:'Lihat status komisen mengikut tahun, bulan, tarikh dan pusingan.',
    hint2:'Pusingan tanpa komisen juga akan dipaparkan sebagai “Tiada komisen untuk pusingan ini”.',
    year:'Tahun',
    month:'Bulan',
    day:'Hari',
    chooseRound:'Pilih pusingan yang ingin dilihat',
    noCommission:'Tiada Komisen Pusingan Ini',
    noCommissionText:'Tiada komisen ejen dijana untuk pusingan ini.',
    noCommissionReason:'Komisen hanya dijana daripada bayaran sah pelanggan langsung yang telah disahkan oleh platform.',
    confirmed:'Jumlah Pelanggan Disahkan',
    rate:'Kadar Komisen Pusingan',
    due:'Komisen Perlu Dibayar',
    paid:'Komisen Dibayar',
    paidAt:'Dibayar Pada:',
    statusPaid:'Dibayar',
    statusPartial:'Dibayar Sebahagian',
    statusPending:'Menunggu'
  },

  vi:{
    title:'Tra cứu lịch sử hoa hồng',
    expand:'Mở tra cứu',
    collapse:'Thu gọn',
    hint1:'Xem trạng thái hoa hồng theo năm, tháng, ngày và kỳ.',
    hint2:'Kỳ không phát sinh hoa hồng cũng sẽ hiển thị rõ “Kỳ này không có hoa hồng”.',
    year:'Năm',
    month:'Tháng',
    day:'Ngày',
    chooseRound:'Chọn kỳ đã quyết toán để xem',
    noCommission:'Kỳ này không có hoa hồng',
    noCommissionText:'Kỳ này không phát sinh hoa hồng đại lý của bạn.',
    noCommissionReason:'Hoa hồng chỉ phát sinh từ khoản thanh toán hợp lệ của khách hàng trực thuộc đã được nền tảng xác nhận.',
    confirmed:'Số tiền khách hàng đã xác nhận',
    rate:'Tỷ lệ hoa hồng kỳ',
    due:'Hoa hồng phải trả',
    paid:'Hoa hồng đã trả',
    paidAt:'Hoàn tất thanh toán:',
    statusPaid:'Đã thanh toán',
    statusPartial:'Đã thanh toán một phần',
    statusPending:'Chờ thanh toán'
  },

  id:{
    title:'Pencarian Riwayat Komisi',
    expand:'Buka Pencarian',
    collapse:'Tutup',
    hint1:'Lihat status komisi berdasarkan tahun, bulan, tanggal, dan periode.',
    hint2:'Periode tanpa komisi juga akan menampilkan “Tidak ada komisi untuk periode ini”.',
    year:'Tahun',
    month:'Bulan',
    day:'Hari',
    chooseRound:'Pilih periode yang ingin dilihat',
    noCommission:'Tidak Ada Komisi Periode Ini',
    noCommissionText:'Tidak ada komisi agen yang dihasilkan untuk periode ini.',
    noCommissionReason:'Komisi hanya dihasilkan dari pembayaran valid pelanggan langsung yang telah dikonfirmasi oleh platform.',
    confirmed:'Jumlah Pelanggan Terkonfirmasi',
    rate:'Tarif Komisi Periode',
    due:'Komisi Terutang',
    paid:'Komisi Dibayar',
    paidAt:'Pembayaran Selesai:',
    statusPaid:'Dibayar',
    statusPartial:'Dibayar Sebagian',
    statusPending:'Menunggu'
  }

};


function historyText(key){

  const lang =
  typeof currentLang
  !==
  'undefined'
  ?
  currentLang
  :
  'zh';

  return (
    HISTORY_BROWSER_I18N[lang]?.[key]
    ||
    HISTORY_BROWSER_I18N.zh[key]
    ||
    key
  );

}

/* =========================
   BASIC
========================= */

function h$(id){
  return document.getElementById(id);
}


function money(value){

  return Number(
    value || 0
  ).toLocaleString(
    'en-US',
    {
      maximumFractionDigits:0
    }
  );

}


function esc(value){

  return String(
    value ?? ''
  )
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#039;');

}


function periodText(code){

  if(code === '1030'){
    return '11:45';
  }

  if(code === '1530'){
    return '15:45';
  }

  return code || '—';

}


function statusInfo(row){

  if(!row){

    return {
      text:
      historyText(
        'noCommission'
      ),
      cls:'none'
    };

  }

  const due =
  Number(
    row.commission_due || 0
  );

  const paid =
  Number(
    row.commission_paid || 0
  );

  const remaining =
  Number(
    row.commission_remaining
    ??
    Math.max(
      due - paid,
      0
    )
  );

  if(
    due > 0
    &&
    remaining <= 0
  ){

    return {
      text:
      historyText(
        'statusPaid'
      ),
      cls:'paid'
    };

  }

  if(
    paid > 0
    &&
    remaining > 0
  ){

    return {
      text:
      historyText(
        'statusPartial'
      ),
      cls:'partial'
    };

  }

  if(due > 0){

    return {
      text:
      historyText(
        'statusPending'
      ),
      cls:'pending'
    };

  }

  return {
    text:
    historyText(
      'noCommission'
    ),
    cls:'none'
  };

}


function commissionForRound(round){

  return commissions.find(
    row =>
    (
      row.round_id
      &&
      row.round_id === round.id
    )
    ||
    (
      row.round_date === round.round_date
      &&
      row.round_code === round.round_code
    )
  )
  ||
  null;

}


/* =========================
   STYLE
========================= */

function installStyle(){

  if(
    h$(
      'agentCommissionHistoryBrowserStyle'
    )
  ){
    return;
  }

  const style =
  document.createElement(
    'style'
  );

  style.id =
  'agentCommissionHistoryBrowserStyle';

  style.textContent = `

#${CARD_ID}{
  border:
  1px solid
  rgba(214,168,63,.28);
}

#${CARD_ID} .ahbHead{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

#${CARD_ID} .ahbTitle{
  color:#efcf70;
  font-size:17px;
  font-weight:900;
}

#${CARD_ID} .ahbToggle{
  width:auto;
  margin:0;
  padding:9px 13px;
  background:#171718;
  color:#d9c37c;
  border:
  1px solid
  rgba(214,168,63,.22);
}

#${CARD_ID} .ahbHint{
  margin-top:8px;
  color:#81796b;
  font-size:10px;
  line-height:1.65;
}

#${CARD_ID} .ahbFilters{
  display:grid;
  grid-template-columns:
  repeat(4,1fr);
  gap:8px;
  margin-top:14px;
}

#${CARD_ID} select{
  width:100%;
  padding:11px 9px;
  border-radius:11px;
  border:
  1px solid
  rgba(214,168,63,.20);
  background:#101011;
  color:#e8deca;
  outline:none;
  font-size:12px;
}

#${CARD_ID} .ahbResult{
  margin-top:12px;
  padding:14px;
  border-radius:15px;
  background:#101011;
  border:
  1px solid
  rgba(214,168,63,.16);
}

#${CARD_ID} .ahbResultHead{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
}

#${CARD_ID} .ahbRound{
  color:#efcf70;
  font-size:15px;
  font-weight:900;
}

#${CARD_ID} .ahbBadge{
  padding:6px 9px;
  border-radius:99px;
  font-size:10px;
  font-weight:900;
  white-space:nowrap;
}

#${CARD_ID} .ahbBadge.paid{
  color:#70d39d;
  background:
  rgba(61,142,89,.14);
}

#${CARD_ID} .ahbBadge.pending,
#${CARD_ID} .ahbBadge.partial{
  color:#e8c86e;
  background:
  rgba(167,121,36,.14);
}

#${CARD_ID} .ahbBadge.none{
  color:#918a7c;
  background:#181819;
}

#${CARD_ID} .ahbGrid{
  display:grid;
  grid-template-columns:
  repeat(4,1fr);
  gap:8px;
  margin-top:12px;
}

#${CARD_ID} .ahbBox{
  padding:11px;
  border-radius:12px;
  background:#131314;
  border:
  1px solid
  rgba(255,255,255,.05);
}

#${CARD_ID} .ahbBox small{
  display:block;
  color:#777166;
  font-size:9px;
  margin-bottom:5px;
}

#${CARD_ID} .ahbBox strong{
  display:block;
  color:#ecd176;
  font-size:15px;
  word-break:break-word;
}

#${CARD_ID} .ahbNoCommission{
  padding:24px 12px;
  text-align:center;
  color:#9a907e;
  font-size:13px;
  line-height:1.7;
}

#${CARD_ID} .ahbPaidAt{
  margin-top:10px;
  color:#81796b;
  font-size:10px;
}

@media(max-width:600px){

  #${CARD_ID} .ahbFilters,
  #${CARD_ID} .ahbGrid{
    grid-template-columns:
    1fr 1fr;
  }

}

`;

  document.head
  .appendChild(
    style
  );

}


/* =========================
   CARD
========================= */

function ensureCard(){

  let card =
  h$(CARD_ID);

  if(card){
    return card;
  }

  const agentBox =
  h$('agentBox');

  if(!agentBox){
    return null;
  }

  card =
  document.createElement(
    'div'
  );

  card.id =
  CARD_ID;

  card.className =
  'card agentNavHidden';

  const historyCard =
  h$(
    'agentReferralCommissionHistoryCard'
  );

  if(
    historyCard
    &&
    historyCard.parentNode
    ===
    agentBox
  ){

    historyCard.insertAdjacentElement(
      'afterend',
      card
    );

  }
  else{

    agentBox.appendChild(
      card
    );

  }

  installStyle();

  return card;

}


/* =========================
   OPTIONS
========================= */

function unique(values){

  return [
    ...new Set(values)
  ];

}


function selectedYear(){
  return h$('ahbYear')?.value || '';
}

function selectedMonth(){
  return h$('ahbMonth')?.value || '';
}

function selectedDay(){
  return h$('ahbDay')?.value || '';
}

function selectedPeriod(){
  return h$('ahbPeriod')?.value || '';
}


function yearOptions(){

  return unique(
    rounds.map(
      round =>
      String(
        round.round_date || ''
      ).slice(
        0,
        4
      )
    )
    .filter(Boolean)
  )
  .sort(
    (a,b)=>b.localeCompare(a)
  );

}


function monthOptions(year){

  return unique(
    rounds
    .filter(
      round =>
      String(
        round.round_date || ''
      ).startsWith(
        year + '-'
      )
    )
    .map(
      round =>
      String(
        round.round_date
      ).slice(
        5,
        7
      )
    )
  )
  .sort(
    (a,b)=>b.localeCompare(a)
  );

}


function dayOptions(year,month){

  return unique(
    rounds
    .filter(
      round =>
      String(
        round.round_date || ''
      ).startsWith(
        year
        +
        '-'
        +
        month
        +
        '-'
      )
    )
    .map(
      round =>
      String(
        round.round_date
      ).slice(
        8,
        10
      )
    )
  )
  .sort(
    (a,b)=>b.localeCompare(a)
  );

}


function periodOptions(
  year,
  month,
  day
){

  const date =
  [
    year,
    month,
    day
  ].join('-');

  return rounds
  .filter(
    round =>
    round.round_date === date
  )
  .map(
    round =>
    round.round_code
  );

}


/* =========================
   FILTER UI
========================= */

function resetFilterDefaults(){

  if(!rounds.length){
    return;
  }

  const latest =
  rounds[0];

  const parts =
  String(
    latest.round_date
  ).split('-');

  if(
    parts.length !== 3
  ){
    return;
  }

  if(h$('ahbYear')){
    h$('ahbYear').value =
    parts[0];
  }

  refreshMonths(
    parts[1]
  );

  refreshDays(
    parts[2]
  );

  refreshPeriods(
    latest.round_code
  );

}


function refreshMonths(
  wanted=''
){

  const year =
  selectedYear();

  const months =
  monthOptions(
    year
  );

  const select =
  h$('ahbMonth');

  if(!select){
    return;
  }

  select.innerHTML =
  months.map(
    month =>
    `
      <option value="${esc(month)}">
                ${esc(month)} ${historyText('month')}
      </option>
    `
  )
  .join('');

  if(
    wanted
    &&
    months.includes(wanted)
  ){

    select.value =
    wanted;

  }

}


function refreshDays(
  wanted=''
){

  const year =
  selectedYear();

  const month =
  selectedMonth();

  const days =
  dayOptions(
    year,
    month
  );

  const select =
  h$('ahbDay');

  if(!select){
    return;
  }

  select.innerHTML =
  days.map(
    day =>
    `
      <option value="${esc(day)}">
               ${esc(day)} ${historyText('day')}
      </option>
    `
  )
  .join('');

  if(
    wanted
    &&
    days.includes(wanted)
  ){

    select.value =
    wanted;

  }

}


function refreshPeriods(
  wanted=''
){

  const periods =
  periodOptions(
    selectedYear(),
    selectedMonth(),
    selectedDay()
  );

  const select =
  h$('ahbPeriod');

  if(!select){
    return;
  }

  select.innerHTML =
  periods.map(
    code =>
    `
      <option value="${esc(code)}">
        ${esc(
          periodText(code)
        )}
      </option>
    `
  )
  .join('');

  if(
    wanted
    &&
    periods.includes(wanted)
  ){

    select.value =
    wanted;

  }

  renderResult();

}


/* =========================
   RESULT
========================= */

function currentSelectedRound(){

  const date =
  [
    selectedYear(),
    selectedMonth(),
    selectedDay()
  ].join('-');

  return rounds.find(
    round =>
    round.round_date === date
    &&
    round.round_code ===
    selectedPeriod()
  )
  ||
  null;

}


function formatCompleted(value){

  if(!value){
    return '—';
  }

  const date =
  new Date(value);

  if(
    Number.isNaN(
      date.getTime()
    )
  ){
    return '—';
  }

  return new Intl.DateTimeFormat(
    'zh-CN',
    {
      timeZone:'Asia/Yangon',
      year:'numeric',
      month:'2-digit',
      day:'2-digit',
      hour:'2-digit',
      minute:'2-digit',
      hour12:false
    }
  ).format(
    date
  );

}


function renderResult(){

  const box =
  h$('ahbResult');

  if(!box){
    return;
  }

  const round =
  currentSelectedRound();

  if(!round){

    box.innerHTML = `
      <div class="ahbNoCommission">
                ${historyText('chooseRound')}
      </div>
    `;

    return;
  }

  const row =
  commissionForRound(
    round
  );

  const status =
  statusInfo(
    row
  );

  if(!row){

    box.innerHTML = `

      <div class="ahbResultHead">

        <div class="ahbRound">
          ${esc(round.round_date)}
          ·
          ${esc(
            periodText(
              round.round_code
            )
          )}
        </div>

        <div class="ahbBadge none">
                    ${historyText('noCommission')}
        </div>

      </div>

      <div class="ahbNoCommission">

                ${historyText('noCommissionText')}

        <br>

                ${historyText('noCommissionReason')}

      </div>

    `;

    return;
  }

  box.innerHTML = `

    <div class="ahbResultHead">

      <div class="ahbRound">

        ${esc(round.round_date)}

        ·

        ${esc(
          periodText(
            round.round_code
          )
        )}

      </div>

      <div
        class="ahbBadge ${status.cls}">

        ${esc(status.text)}

      </div>

    </div>


    <div class="ahbGrid">

      <div class="ahbBox">

        <small>
                    ${historyText('confirmed')}
        </small>

        <strong>
          ${money(
            row.confirmed_customer_points
          )}
        </strong>

      </div>


      <div class="ahbBox">

        <small>
                    ${historyText('rate')}
        </small>

        <strong>
          ${money(
            row.commission_rate_snapshot
          )}%
        </strong>

      </div>


      <div class="ahbBox">

        <small>
                    ${historyText('due')}
        </small>

        <strong>
          ${money(
            row.commission_due
          )}
        </strong>

      </div>


      <div class="ahbBox">

        <small>
                   ${historyText('paid')}
        </small>

        <strong>
          ${money(
            row.commission_paid
          )}
        </strong>

      </div>

    </div>


    ${
      row.completed_at
      ?
      `
        <div class="ahbPaidAt">

                    ${historyText('paidAt')}
          ${esc(
            formatCompleted(
              row.completed_at
            )
          )}

        </div>
      `
      :
      ''
    }

  `;

}


/* =========================
   RENDER
========================= */

function render(){

  const card =
  ensureCard();

  if(!card){
    return;
  }

  const years =
  yearOptions();

  card.innerHTML = `

    <div class="ahbHead">

      <div class="ahbTitle">
               ${historyText('title')}
      </div>

      <button
        type="button"
        class="ahbToggle"
        id="ahbToggle">

                ${
          expanded
          ?
          historyText('collapse')
          :
          historyText('expand')
        }

      </button>

    </div>


    <div class="ahbHint">

            ${historyText('hint1')}

      ${historyText('hint2')}

    </div>


    <div
      id="ahbBody"
      style="
        display:${expanded ? 'block' : 'none'}
      ">

      <div class="ahbFilters">

        <select id="ahbYear">

          ${years.map(
            year =>
            `
              <option value="${esc(year)}">
                                ${esc(year)} ${historyText('year')}
              </option>
            `
          ).join('')}

        </select>


        <select id="ahbMonth">
        </select>


        <select id="ahbDay">
        </select>


        <select id="ahbPeriod">
        </select>

      </div>


      <div
        id="ahbResult"
        class="ahbResult">
      </div>

    </div>

  `;


  h$('ahbToggle')
  ?.addEventListener(
    'click',
    ()=>{

      expanded =
      !expanded;

      render();

      if(expanded){
        resetFilterDefaults();
      }

    }
  );


  h$('ahbYear')
  ?.addEventListener(
    'change',
    ()=>{

      refreshMonths();
      refreshDays();
      refreshPeriods();

    }
  );


  h$('ahbMonth')
  ?.addEventListener(
    'change',
    ()=>{

      refreshDays();
      refreshPeriods();

    }
  );


  h$('ahbDay')
  ?.addEventListener(
    'change',
    ()=>{

      refreshPeriods();

    }
  );


  h$('ahbPeriod')
  ?.addEventListener(
    'change',
    renderResult
  );


  if(expanded){
    resetFilterDefaults();
  }

}


/* =========================
   LOAD
========================= */

async function load(){

  if(
    loading
    ||
    loaded
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

  if(
    typeof agent
    ===
    'undefined'
    ||
    !agent
  ){
    return;
  }

  loading = true;

  try{

    const responses =
    await Promise.all([

      api(
        '/rest/v1/rounds'
        +
        '?select=id,round_date,round_code,status,settled_at'
        +
        '&status=eq.settled'
        +
        '&order=round_date.desc,round_code.desc'
        +
        '&limit=2000'
      ),

      api(
        '/rest/v1/rpc/get_agent_referral_commission_history',
        {
          method:'POST',

          headers:{
            'Content-Type':
            'application/json'
          },

          body:
          JSON.stringify({})
        }
      )

    ]);


    for(
      const response
      of
      responses
    ){

      if(!response.ok){

        throw new Error(
          'AGENT_HISTORY_BROWSER_LOAD_FAILED'
        );

      }

    }


    const roundData =
    await responses[0]
    .json();


    const commissionData =
    await responses[1]
    .json();


    rounds =
    Array.isArray(
      roundData
    )
    ?
    roundData
    :
    [];


    commissions =
    Array.isArray(
      commissionData?.rows
    )
    ?
    commissionData.rows
    :
    [];


    loaded = true;

    render();

  }
  catch(error){

    console.error(
      'agent history browser',
      error
    );

  }
  finally{

    loading = false;

  }

}


/* =========================
   VISIBILITY
========================= */

function applyVisibility(){

  const card =
  ensureCard();

  if(!card){
    return;
  }

  const isHistory =
  location.hash
  ===
  '#history';

  card.classList.toggle(
    'agentNavHidden',
    !isHistory
  );

    if(isHistory){
    load();

    const lang =
    typeof currentLang
    !==
    'undefined'
    ?
    currentLang
    :
    'zh';

    if(
      loaded
      &&
      card.dataset.historyLang
      !==
      lang
    ){

      const year =
      selectedYear();

      const month =
      selectedMonth();

      const day =
      selectedDay();

      const period =
      selectedPeriod();

      card.dataset.historyLang =
      lang;

      render();

      if(
        expanded
        &&
        year
      ){

        h$('ahbYear').value =
        year;

        refreshMonths(
          month
        );

        refreshDays(
          day
        );

        refreshPeriods(
          period
        );

      }

    }

  }

}


window.addEventListener(
  'hashchange',
  applyVisibility
);


setInterval(
  ()=>{
    applyVisibility();
  },
  900
);


applyVisibility();

})();
