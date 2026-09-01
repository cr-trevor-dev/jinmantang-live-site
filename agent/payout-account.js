(()=>{
'use strict';

const CARD_ID='agentPayoutAccountCard';
const STYLE_ID='agentPayoutAccountStyle';

const TEXT={
zh:{
title:'💳 我的佣金收款方式',
intro:'这里填写平台向你支付推荐佣金时使用的收款账户。首次保存后会自动锁定；如需修改，请联系平台管理员解锁一次。',
kpay:'KPay',
bank:'银行账户',
holder:'收款人姓名',
number:'手机号码 / 账号',
bankName:'银行名称',
save:'保存并锁定',
locked:'已锁定',
editable:'管理员已解锁 · 可修改一次',
empty:'尚未绑定',
lockedHint:'该收款方式已经锁定。如需更改，请先联系平台管理员解锁。',
editableHint:'管理员已经允许你修改一次。重新保存后会再次自动锁定。',
firstHint:'首次绑定后会立即自动锁定。',
saving:'正在保存收款方式...',
saved:'✓ 收款方式已保存并锁定',
refresh:'刷新收款方式',
nameErr:'请输入正确的收款人姓名',
numberErr:'请输入正确的手机号码 / 账号',
bankErr:'请输入银行名称',
lockedErr:'这个收款方式已经锁定，请联系管理员解锁后再修改。',
duplicate:'这个收款账号已经被其他代理绑定，不能重复使用。',
inactive:'当前代理账号不是正常状态，暂时不能保存收款方式。',
loadErr:'收款方式读取失败',
saveErr:'保存失败',
updated:'最近更新',
confirm:'确认保存这个收款方式吗？保存后会立即锁定；之后如需修改，必须由平台管理员先解锁一次。'
},

my:{
title:'💳 ကျွန်ုပ်၏ ကော်မရှင်လက်ခံအကောင့်',
intro:'Referral commission လက်ခံရန်အသုံးပြုမည့်အကောင့်ကို ဤနေရာတွင်ထည့်ပါ။ ပထမဆုံးသိမ်းပြီးနောက် အလိုအလျောက် lock ဖြစ်မည်။ ပြင်ဆင်လိုပါက Admin ကို တစ်ကြိမ် unlock လုပ်ပေးရန် ဆက်သွယ်ပါ။',
kpay:'KPay',
bank:'ဘဏ်အကောင့်',
holder:'အကောင့်ပိုင်ရှင်အမည်',
number:'ဖုန်းနံပါတ် / အကောင့်နံပါတ်',
bankName:'ဘဏ်အမည်',
save:'သိမ်းပြီး Lock လုပ်မည်',
locked:'Lock လုပ်ထားသည်',
editable:'Admin Unlock လုပ်ထားသည် · တစ်ကြိမ်ပြင်နိုင်သည်',
empty:'မချိတ်ဆက်ရသေး',
lockedHint:'ဤအကောင့်ကို lock လုပ်ထားသည်။ ပြင်လိုပါက Admin ကို unlock လုပ်ပေးရန် ဆက်သွယ်ပါ။',
editableHint:'Admin မှ တစ်ကြိမ်ပြင်ခွင့်ပေးထားသည်။ ပြန်သိမ်းပြီးနောက် lock ပြန်ဖြစ်မည်။',
firstHint:'ပထမဆုံးချိတ်ဆက်ပြီးနောက် ချက်ချင်း lock ဖြစ်မည်။',
saving:'အကောင့်ကို သိမ်းနေသည်...',
saved:'✓ အကောင့်ကို သိမ်းပြီး Lock လုပ်ပြီးပါပြီ',
refresh:'အကောင့်ကို Refresh လုပ်မည်',
nameErr:'အကောင့်ပိုင်ရှင်အမည်ကို မှန်ကန်စွာထည့်ပါ',
numberErr:'ဖုန်းနံပါတ် / အကောင့်နံပါတ်ကို မှန်ကန်စွာထည့်ပါ',
bankErr:'ဘဏ်အမည်ကို ထည့်ပါ',
lockedErr:'ဤအကောင့်ကို lock လုပ်ထားသည်။ Admin unlock လုပ်ပြီးမှ ပြင်နိုင်ပါသည်။',
duplicate:'ဤအကောင့်ကို အခြား Agent တစ်ဦးက ချိတ်ဆက်ထားပြီးဖြစ်သည်။',
inactive:'Agent အကောင့်သည် လက်ရှိ Normal မဟုတ်သောကြောင့် မသိမ်းနိုင်သေးပါ။',
loadErr:'အကောင့်ဖတ်ရှုမှု မအောင်မြင်ပါ',
saveErr:'သိမ်းဆည်းမှု မအောင်မြင်ပါ',
updated:'နောက်ဆုံးပြင်ဆင်ချိန်',
confirm:'ဤအကောင့်ကို သိမ်းရန် အတည်ပြုပါသလား။ သိမ်းပြီးနောက် ချက်ချင်း lock ဖြစ်မည်။ နောက်တစ်ကြိမ်ပြင်လိုပါက Admin unlock လုပ်ပေးရမည်။'
},

en:{
title:'💳 My Commission Payout Account',
intro:'Set the account the platform should use to pay your referral commission. The first save locks it automatically. Contact an admin for a one-time unlock if you need to change it.',
kpay:'KPay',
bank:'Bank Account',
holder:'Account Holder',
number:'Phone / Account Number',
bankName:'Bank Name',
save:'Save & Lock',
locked:'Locked',
editable:'Admin unlocked · One edit allowed',
empty:'Not linked',
lockedHint:'This payout method is locked. Contact an admin to unlock it before making changes.',
editableHint:'An admin has allowed one edit. Saving again will lock it automatically.',
firstHint:'The first save locks this payout method immediately.',
saving:'Saving payout account...',
saved:'✓ Payout account saved and locked',
refresh:'Refresh payout accounts',
nameErr:'Enter a valid account holder name',
numberErr:'Enter a valid phone or account number',
bankErr:'Enter the bank name',
lockedErr:'This payout account is locked. Ask an admin to unlock it first.',
duplicate:'This payout account is already linked to another agent.',
inactive:'This agent account is not active, so payout details cannot be saved.',
loadErr:'Failed to load payout accounts',
saveErr:'Save failed',
updated:'Last updated',
confirm:'Save this payout method? It will be locked immediately. Any later change requires a one-time admin unlock.'
},

th:{
title:'💳 บัญชีรับค่าคอมมิชชั่นของฉัน',
intro:'ตั้งค่าบัญชีที่แพลตฟอร์มจะใช้จ่ายค่าคอมมิชชั่นแนะนำ หลังบันทึกครั้งแรกระบบจะล็อกอัตโนมัติ หากต้องการแก้ไขให้ติดต่อผู้ดูแลเพื่อปลดล็อกหนึ่งครั้ง',
kpay:'KPay',
bank:'บัญชีธนาคาร',
holder:'ชื่อเจ้าของบัญชี',
number:'เบอร์โทร / เลขบัญชี',
bankName:'ชื่อธนาคาร',
save:'บันทึกและล็อก',
locked:'ล็อกแล้ว',
editable:'ผู้ดูแลปลดล็อกแล้ว · แก้ไขได้หนึ่งครั้ง',
empty:'ยังไม่ได้ผูก',
lockedHint:'ช่องทางรับเงินนี้ถูกล็อก หากต้องการแก้ไขให้ติดต่อผู้ดูแลเพื่อปลดล็อกก่อน',
editableHint:'ผู้ดูแลอนุญาตให้แก้ไขได้หนึ่งครั้ง เมื่อบันทึกใหม่ระบบจะล็อกอีกครั้ง',
firstHint:'เมื่อผูกครั้งแรก ระบบจะล็อกทันที',
saving:'กำลังบันทึกบัญชีรับเงิน...',
saved:'✓ บันทึกและล็อกบัญชีรับเงินแล้ว',
refresh:'รีเฟรชบัญชีรับเงิน',
nameErr:'กรุณากรอกชื่อเจ้าของบัญชีให้ถูกต้อง',
numberErr:'กรุณากรอกเบอร์โทร / เลขบัญชีให้ถูกต้อง',
bankErr:'กรุณากรอกชื่อธนาคาร',
lockedErr:'บัญชีนี้ถูกล็อก กรุณาให้ผู้ดูแลปลดล็อกก่อนแก้ไข',
duplicate:'บัญชีนี้ถูกผูกกับตัวแทนรายอื่นแล้ว',
inactive:'บัญชีตัวแทนยังไม่อยู่ในสถานะปกติ จึงยังบันทึกไม่ได้',
loadErr:'อ่านบัญชีรับเงินไม่สำเร็จ',
saveErr:'บันทึกไม่สำเร็จ',
updated:'อัปเดตล่าสุด',
confirm:'ยืนยันบันทึกช่องทางรับเงินนี้หรือไม่? หลังบันทึกจะถูกล็อกทันที และการแก้ไขภายหลังต้องให้ผู้ดูแลปลดล็อกก่อน'
},

ms:{
title:'💳 Akaun Penerimaan Komisen Saya',
intro:'Tetapkan akaun untuk platform membayar komisen rujukan anda. Selepas simpanan pertama, akaun akan dikunci automatik. Hubungi admin untuk membuka kunci sekali jika perlu diubah.',
kpay:'KPay',
bank:'Akaun Bank',
holder:'Nama Pemilik Akaun',
number:'Telefon / Nombor Akaun',
bankName:'Nama Bank',
save:'Simpan & Kunci',
locked:'Dikunci',
editable:'Admin buka kunci · Boleh ubah sekali',
empty:'Belum dipautkan',
lockedHint:'Kaedah penerimaan ini dikunci. Hubungi admin untuk membuka kunci sebelum mengubahnya.',
editableHint:'Admin membenarkan satu perubahan. Selepas disimpan semula, ia akan dikunci automatik.',
firstHint:'Simpanan pertama akan mengunci kaedah ini.',
saving:'Menyimpan akaun penerimaan...',
saved:'✓ Akaun penerimaan disimpan dan dikunci',
refresh:'Muat semula akaun',
nameErr:'Masukkan nama pemilik akaun yang sah',
numberErr:'Masukkan telefon / nombor akaun yang sah',
bankErr:'Masukkan nama bank',
lockedErr:'Akaun ini dikunci. Minta admin membuka kunci terlebih dahulu.',
duplicate:'Akaun ini telah dipautkan kepada ejen lain.',
inactive:'Akaun ejen tidak aktif, jadi maklumat penerimaan belum boleh disimpan.',
loadErr:'Gagal membaca akaun penerimaan',
saveErr:'Gagal menyimpan',
updated:'Kemas kini terakhir',
confirm:'Sahkan simpan kaedah penerimaan ini? Selepas disimpan ia akan dikunci serta-merta dan perubahan seterusnya memerlukan admin membuka kunci.'
},

vi:{
title:'💳 Tài khoản nhận hoa hồng của tôi',
intro:'Thiết lập tài khoản để nền tảng thanh toán hoa hồng giới thiệu. Sau lần lưu đầu tiên, tài khoản sẽ tự động bị khóa. Nếu cần sửa, hãy liên hệ quản trị viên để mở khóa một lần.',
kpay:'KPay',
bank:'Tài khoản ngân hàng',
holder:'Tên chủ tài khoản',
number:'Số điện thoại / Số tài khoản',
bankName:'Tên ngân hàng',
save:'Lưu & khóa',
locked:'Đã khóa',
editable:'Admin đã mở khóa · Được sửa một lần',
empty:'Chưa liên kết',
lockedHint:'Phương thức nhận tiền này đã bị khóa. Hãy liên hệ quản trị viên để mở khóa trước khi sửa.',
editableHint:'Quản trị viên đã cho phép sửa một lần. Sau khi lưu lại, hệ thống sẽ tự động khóa lại.',
firstHint:'Lần lưu đầu tiên sẽ khóa phương thức này ngay lập tức.',
saving:'Đang lưu tài khoản nhận tiền...',
saved:'✓ Đã lưu và khóa tài khoản nhận tiền',
refresh:'Làm mới tài khoản',
nameErr:'Vui lòng nhập đúng tên chủ tài khoản',
numberErr:'Vui lòng nhập đúng số điện thoại / số tài khoản',
bankErr:'Vui lòng nhập tên ngân hàng',
lockedErr:'Tài khoản này đã khóa. Hãy yêu cầu quản trị viên mở khóa trước.',
duplicate:'Tài khoản này đã được liên kết với một đại lý khác.',
inactive:'Tài khoản đại lý hiện không hoạt động nên chưa thể lưu.',
loadErr:'Không thể tải tài khoản nhận tiền',
saveErr:'Lưu thất bại',
updated:'Cập nhật gần nhất',
confirm:'Xác nhận lưu phương thức nhận tiền này? Sau khi lưu, nó sẽ bị khóa ngay và mọi thay đổi sau đó cần quản trị viên mở khóa.'
},

id:{
title:'💳 Akun Penerimaan Komisi Saya',
intro:'Atur akun yang digunakan platform untuk membayar komisi referral. Setelah penyimpanan pertama, akun akan otomatis terkunci. Hubungi admin untuk membuka kunci sekali jika perlu diubah.',
kpay:'KPay',
bank:'Rekening Bank',
holder:'Nama Pemilik Akun',
number:'Telepon / Nomor Rekening',
bankName:'Nama Bank',
save:'Simpan & Kunci',
locked:'Terkunci',
editable:'Admin membuka kunci · Bisa diubah sekali',
empty:'Belum ditautkan',
lockedHint:'Metode penerimaan ini terkunci. Hubungi admin untuk membuka kunci sebelum mengubahnya.',
editableHint:'Admin mengizinkan satu perubahan. Setelah disimpan kembali, akun akan otomatis terkunci lagi.',
firstHint:'Penyimpanan pertama akan langsung mengunci metode ini.',
saving:'Menyimpan akun penerimaan...',
saved:'✓ Akun penerimaan disimpan dan dikunci',
refresh:'Muat ulang akun',
nameErr:'Masukkan nama pemilik akun yang valid',
numberErr:'Masukkan telepon / nomor rekening yang valid',
bankErr:'Masukkan nama bank',
lockedErr:'Akun ini terkunci. Minta admin membuka kunci terlebih dahulu.',
duplicate:'Akun ini sudah ditautkan ke agen lain.',
inactive:'Akun agen sedang tidak aktif sehingga data belum dapat disimpan.',
loadErr:'Gagal memuat akun penerimaan',
saveErr:'Gagal menyimpan',
updated:'Terakhir diperbarui',
confirm:'Simpan metode penerimaan ini? Setelah disimpan, akun akan langsung terkunci dan perubahan berikutnya memerlukan admin membuka kunci.'
}
};

let accounts=[];
let loading=false;
let saving=false;
let message='';
let messageType='';
let lastAgentId=null;

function lang(){

  try{

    if(
      typeof currentLang!=='undefined'
      &&
      TEXT[currentLang]
    ){
      return currentLang;
    }

  }catch(e){}

  const value=
  document.getElementById(
    'langSelect'
  )?.value;

  return TEXT[value]
  ?
  value
  :
  'zh';

}


function t(key){

  return (
    TEXT[lang()]?.[key]
    ||
    TEXT.zh[key]
    ||
    key
  );

}


function esc(value){

  return String(
    value
    ??
    ''
  )
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#039;');

}


function dateText(value){

  if(!value){
    return '—';
  }

  const date=
  new Date(value);

  if(
    Number.isNaN(
      date.getTime()
    )
  ){
    return '—';
  }

  return new Intl.DateTimeFormat(
    lang()==='zh'
    ?
    'zh-CN'
    :
    'en-GB',
    {
      timeZone:'Asia/Yangon',
      year:'numeric',
      month:'2-digit',
      day:'2-digit',
      hour:'2-digit',
      minute:'2-digit',
      hour12:false
    }
  )
  .format(date)
  +
  ' MMT';

}


function ready(){

  try{

    return Boolean(
      typeof token!=='undefined'
      &&
      token
      &&
      typeof agent!=='undefined'
      &&
      agent
      &&
      agent.id
    );

  }catch(e){

    return false;

  }

}


function active(){

  try{

    return Boolean(
      agent
      &&
      agent.status==='active'
    );

  }catch(e){

    return false;

  }

}


function byMethod(method){

  return (
    accounts.find(
      item =>
      item.method_type===method
    )
    ||
    null
  );

}


function ensureStyle(){

  if(
    document.getElementById(
      STYLE_ID
    )
  ){
    return;
  }

  const style=
  document.createElement(
    'style'
  );

  style.id=
  STYLE_ID;

  style.textContent=`
#${CARD_ID} .jmt-pa-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px
}

#${CARD_ID} .jmt-pa-box{
  background:#101011;
  border:1px solid rgba(214,168,63,.18);
  border-radius:14px;
  padding:13px
}

#${CARD_ID} .jmt-pa-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-bottom:10px
}

#${CARD_ID} .jmt-pa-name{
  color:#ecd076;
  font-size:15px;
  font-weight:900
}

#${CARD_ID} .jmt-pa-badge{
  border-radius:999px;
  padding:5px 8px;
  font-size:9px;
  font-weight:900;
  white-space:nowrap
}

#${CARD_ID} .jmt-pa-badge.locked{
  background:#153124;
  color:#79d6a2
}

#${CARD_ID} .jmt-pa-badge.editable{
  background:#352d13;
  color:#e2c870
}

#${CARD_ID} .jmt-pa-badge.empty{
  background:#1a1a1b;
  color:#8c8578
}

#${CARD_ID} .jmt-pa-field{
  margin-top:8px
}

#${CARD_ID} .jmt-pa-field label{
  display:block;
  color:#817b71;
  font-size:9px;
  margin-bottom:5px
}

#${CARD_ID} .jmt-pa-field input{
  font-size:13px
}

#${CARD_ID} .jmt-pa-hint{
  min-height:38px;
  margin-top:9px;
  color:#817b71;
  font-size:10px;
  line-height:1.55
}

#${CARD_ID} .jmt-pa-hint.editable{
  color:#d6bd70
}

#${CARD_ID} .jmt-pa-hint.locked{
  color:#91b79c
}

#${CARD_ID} .jmt-pa-msg{
  margin-top:10px;
  text-align:center;
  font-size:11px;
  line-height:1.55;
  min-height:17px;
  color:#9a9284
}

#${CARD_ID} .jmt-pa-msg.ok{
  color:#70d39d
}

#${CARD_ID} .jmt-pa-msg.err{
  color:#e58e8e
}

#${CARD_ID} .jmt-pa-updated{
  margin-top:6px;
  color:#6f6a61;
  font-size:9px
}

@media(max-width:520px){

  #${CARD_ID} .jmt-pa-grid{
    grid-template-columns:1fr
  }

}
`;

  document.head.appendChild(
    style
  );

}


function logoutCard(){

  const button=
  [
    ...document.querySelectorAll(
      'button'
    )
  ]
  .find(
    item =>
    item.getAttribute(
      'data-i18n'
    )==='logout'
  );

  return button
  ?
  button.closest(
    '.card'
  )
  :
  null;

}


function place(card){

  const box=
  document.getElementById(
    'agentBox'
  );

  if(!box){
    return;
  }

  const anchor=
  document.getElementById(
    'agentReferralCommissionHistoryCard'
  )
  ||
  document.getElementById(
    'agentCustomerRoundLiveCard'
  )
  ||
  document.getElementById(
    'agentReferralCard'
  );

  if(
    anchor
    &&
    anchor.parentNode===box
  ){

    if(
      anchor.nextElementSibling
      !==
      card
    ){

      anchor.insertAdjacentElement(
        'afterend',
        card
      );

    }

  }else{

    box.insertBefore(
      card,
      logoutCard()
      ||
      null
    );

  }

}


function ensureCard(){

  ensureStyle();

  let card=
  document.getElementById(
    CARD_ID
  );

  if(!card){

    card=
    document.createElement(
      'div'
    );

    card.id=
    CARD_ID;

    card.className=
    'card hidden';

    card.addEventListener(
      'click',
      onClick
    );

  }

  place(card);

  return card;

}


function status(account){

  if(!account){

    return {
      text:t('empty'),
      cls:'empty'
    };

  }

  return (
    account.agent_edit_locked===false
    ?
    {
      text:t('editable'),
      cls:'editable'
    }
    :
    {
      text:t('locked'),
      cls:'locked'
    }
  );

}


function form(method){

  const account=
  byMethod(method);

  const editable=
  !account
  ||
  account.agent_edit_locked===false;

  const disabled=
  editable
  &&
  active()
  &&
  !saving
  &&
  !loading
  ?
  ''
  :
  'disabled';

  const state=
  status(account);

  const prefix=
  'jmtPa_'
  +
  method;

  const hint=
  !account
  ?
  t('firstHint')
  :
  account.agent_edit_locked===false
  ?
  t('editableHint')
  :
  t('lockedHint');

  const hintClass=
  !account
  ?
  ''
  :
  account.agent_edit_locked===false
  ?
  'editable'
  :
  'locked';

  return `
<div class="jmt-pa-box">

  <div class="jmt-pa-head">

    <div class="jmt-pa-name">
      ${esc(
        method==='kpay'
        ?
        t('kpay')
        :
        t('bank')
      )}
    </div>

    <div class="jmt-pa-badge ${state.cls}">
      ${esc(state.text)}
    </div>

  </div>

  ${
    method==='bank'
    ?
    `
    <div class="jmt-pa-field">

      <label>
        ${esc(t('bankName'))}
      </label>

      <input
        id="${prefix}_bank"
        value="${esc(account?.bank_name||'')}"
        placeholder="${esc(t('bankName'))}"
        ${disabled}>

    </div>
    `
    :
    ''
  }

  <div class="jmt-pa-field">

    <label>
      ${esc(t('holder'))}
    </label>

    <input
      id="${prefix}_name"
      value="${esc(account?.account_name||'')}"
      placeholder="${esc(t('holder'))}"
      ${disabled}>

  </div>

  <div class="jmt-pa-field">

    <label>
      ${esc(t('number'))}
    </label>

    <input
      id="${prefix}_number"
      value="${esc(account?.account_number||'')}"
      placeholder="${esc(t('number'))}"
      ${disabled}>

  </div>

  <div class="jmt-pa-hint ${hintClass}">
    ${esc(hint)}
  </div>

  ${
    account?.updated_at
    ?
    `
    <div class="jmt-pa-updated">

      ${esc(t('updated'))}：
      ${esc(
        dateText(
          account.updated_at
        )
      )}

    </div>
    `
    :
    ''
  }

  <button
    type="button"
    data-jmt-pa-save="${method}"
    ${disabled}>

    ${esc(t('save'))}

  </button>

</div>
`;

}


function render(){

  const card=
  ensureCard();

  if(!ready()){

    card.classList.add(
      'hidden'
    );

    return;

  }

  card.classList.remove(
    'hidden'
  );

  card.innerHTML=`

<div class="title">
  ${esc(t('title'))}
</div>

<div
  class="note"
  style="margin-bottom:12px">

  ${esc(t('intro'))}

</div>

<div class="jmt-pa-grid">

  ${form('kpay')}

  ${form('bank')}

</div>

<button
  type="button"
  class="secondary"
  data-jmt-pa-refresh="1"
  ${
    loading||saving
    ?
    'disabled'
    :
    ''
  }>

  ${esc(t('refresh'))}

</button>

<div class="jmt-pa-msg ${messageType}">
  ${esc(message)}
</div>
`;

}


async function rpc(
  name,
  body={}
){

  const response=
  await api(
    '/rest/v1/rpc/'
    +
    name,
    {
      method:'POST',

      headers:{
        'Content-Type':
        'application/json'
      },

      body:
      JSON.stringify(
        body
      )
    }
  );

  const text=
  await response.text();

  let data=
  null;

  try{

    data=
    text
    ?
    JSON.parse(text)
    :
    null;

  }catch(e){

    data=
    text;

  }

  if(!response.ok){

    throw new Error(
      data?.message
      ||
      data?.error
      ||
      text
      ||
      'REQUEST_FAILED'
    );

  }

  return data;

}


function friendly(
  error,
  fallback
){

  const text=
  String(
    error?.message
    ||
    error
    ||
    ''
  );

  if(
    text.includes(
      'PAYOUT_ACCOUNT_LOCKED'
    )
  ){
    return t('lockedErr');
  }

  if(
    text.includes(
      'PAYOUT_ACCOUNT_ALREADY_BOUND'
    )
  ){
    return t('duplicate');
  }

  if(
    text.includes(
      'AGENT_NOT_ACTIVE'
    )
  ){
    return t('inactive');
  }

  if(
    text.includes(
      'ACCOUNT_NAME_REQUIRED'
    )
  ){
    return t('nameErr');
  }

  if(
    text.includes(
      'ACCOUNT_NUMBER_REQUIRED'
    )
  ){
    return t('numberErr');
  }

  if(
    text.includes(
      'BANK_NAME_REQUIRED'
    )
  ){
    return t('bankErr');
  }

  return (
    fallback
    +
    '：'
    +
    (
      text
      ||
      'UNKNOWN_ERROR'
    )
  );

}


async function load(
  show=false
){

  if(
    loading
    ||
    saving
    ||
    !ready()
  ){
    return;
  }

  loading=
  true;

  if(show){

    message='';
    messageType='';

    render();

  }

  try{

    const data=
    await rpc(
      'agent_my_payout_accounts'
    );

    const nextAccounts=
    Array.isArray(
      data?.rows
    )
    ?
    data.rows
    :
    [];


    const changed=
    JSON.stringify(
      accounts
    )
    !==
    JSON.stringify(
      nextAccounts
    );


    accounts=
    nextAccounts;


    if(
      changed
      ||
      show
    ){

      render();

    }

  }catch(error){

    console.error(
      'agent payout account load',
      error
    );

    message=
    friendly(
      error,
      t('loadErr')
    );

    messageType=
    'err';

    render();

  }finally{

    loading=
    false;
    render();
  }

}


function value(id){

  return String(
    document.getElementById(
      id
    )?.value
    ||
    ''
  )
  .trim();

}


async function save(method){

  if(
    saving
    ||
    !ready()
  ){
    return;
  }

  const existing=
  byMethod(method);

  if(
    existing
    &&
    existing.agent_edit_locked!==false
  ){

    message=
    t('lockedErr');

    messageType=
    'err';

    render();

    return;

  }

  if(!active()){

    message=
    t('inactive');

    messageType=
    'err';

    render();

    return;

  }

  const prefix=
  'jmtPa_'
  +
  method;

  const holder=
  value(
    prefix+'_name'
  );

  const number=
  value(
    prefix+'_number'
  );

  const bankName=
  method==='bank'
  ?
  value(
    prefix+'_bank'
  )
  :
  '';

  if(
    holder.length<2
  ){

    message=
    t('nameErr');

    messageType=
    'err';

    render();

    return;

  }

  if(
    number.length<5
  ){

    message=
    t('numberErr');

    messageType=
    'err';

    render();

    return;

  }

  if(
    method==='bank'
    &&
    bankName.length<2
  ){

    message=
    t('bankErr');

    messageType=
    'err';

    render();

    return;

  }

  if(
    !window.confirm(
      t('confirm')
    )
  ){
    return;
  }

  saving=
  true;

  message=
  t('saving');

  messageType='';

  render();

  try{

    await rpc(
      'agent_upsert_payout_account',
      {
        p_method_type:
        method,

        p_account_name:
        holder,

        p_account_number:
        number,

        p_bank_name:
        method==='bank'
        ?
        bankName
        :
        null
      }
    );

    saving=
    false;

    message=
    t('saved');

    messageType=
    'ok';

    await load(
      false
    );

  }catch(error){

    console.error(
      'agent payout account save',
      error
    );

    message=
    friendly(
      error,
      t('saveErr')
    );

    messageType=
    'err';

  }finally{

    saving=
    false;

    render();

  }

}


function onClick(event){

  const target=
  event.target;

  if(
    !target
    ||
    typeof target.closest!=='function'
  ){
    return;
  }

  const saveButton=
  target.closest(
    '[data-jmt-pa-save]'
  );

  if(saveButton){

    save(
      saveButton.getAttribute(
        'data-jmt-pa-save'
      )
    );

    return;

  }

  if(
    target.closest(
      '[data-jmt-pa-refresh]'
    )
  ){

    load(
      true
    );

  }

}


function editing(){

  const card=
  document.getElementById(
    CARD_ID
  );

  const element=
  document.activeElement;

  return Boolean(
    card
    &&
    element
    &&
    card.contains(
      element
    )
    &&
    element.tagName==='INPUT'
  );

}


function tick(){

  const card=
  ensureCard();

  place(card);

  if(!ready()){

    lastAgentId=
    null;

    accounts=[];

    card.classList.add(
      'hidden'
    );

    return;

  }

  if(
    lastAgentId
    !==
    agent.id
  ){

    lastAgentId=
    agent.id;

    accounts=[];

    message='';
    messageType='';

    render();

    load(
      false
    );

    return;

  }

  if(
    !editing()
    &&
    !loading
    &&
    !saving
  ){

    render();

  }

}


document
.getElementById(
  'langSelect'
)
?.addEventListener(
  'change',
  ()=>{
    setTimeout(
      render,
      0
    );
  }
);


window.addEventListener(
  'focus',
  ()=>{

    if(
      ready()
      &&
      !editing()
    ){

      load(
        false
      );

    }

  }
);


document.addEventListener(
  'visibilitychange',
  ()=>{

    if(
      document.visibilityState==='visible'
      &&
      ready()
      &&
      !editing()
    ){

      load(
        false
      );

    }

  }
);


ensureCard();
tick();

setInterval(
  ()=>{

    if(
      ready()
      &&
      !editing()
      &&
      !loading
      &&
      !saving
    ){

      load(
        false
      );

    }

  },
  20000
);

})();
