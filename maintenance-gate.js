(()=>{
'use strict';

const script =
document.currentScript;

const surface =
String(
  script?.dataset?.surface
  ||
  ''
)
.toLowerCase();


if(
  surface !== 'customer'
  &&
  surface !== 'agent'
){
  return;
}


const BASE =
location.origin
+
'/supabase';


const KEY =
'sb_publishable_mZe5EwSSrSubPL5K5yvJcw_J8LjdiXN';


const LANG_KEY =
surface === 'customer'
?
'jmt_customer_lang'
:
'jmt_agent_lang';


const SUPPORTED =
[
  'zh',
  'my',
  'en',
  'th',
  'ms',
  'vi',
  'id'
];


const storedLang =
localStorage.getItem(
  LANG_KEY
);


const lang =
SUPPORTED.includes(
  storedLang
)
?
storedLang
:
'zh';


const TEXT = {

  zh:{
    brand:'金满堂',
    maintenance:'系统维护中',
    upgrade:'系统升级中',
    temporary:'临时维护中',
    optimization:'服务优化中',

    maintenanceText:
    '我们正在进行系统维护，请稍后再试。',

    upgradeText:
    '我们正在进行系统升级，为您提供更稳定的服务。',

    temporaryText:
    '系统正在进行临时检查与维护，请稍后再试。',

    optimizationText:
    '我们正在优化系统服务，请稍后再试。',

    safe:
    '您的账户与历史数据不会受到影响。',

    restore:
    '预计恢复时间',

    later:
    '请稍后再试',

    footer:
    'JIN MANTANG · SYSTEM SERVICE'
  },


  my:{
    brand:'JIN MANTANG',
    maintenance:'စနစ် ပြုပြင်ထိန်းသိမ်းနေပါသည်',
    upgrade:'စနစ် အဆင့်မြှင့်နေပါသည်',
    temporary:'ယာယီ ပြုပြင်ထိန်းသိမ်းနေပါသည်',
    optimization:'ဝန်ဆောင်မှု ပိုမိုကောင်းမွန်အောင် ပြင်ဆင်နေပါသည်',

    maintenanceText:
    'စနစ်ကို ပြုပြင်ထိန်းသိမ်းနေပါသည်။ ခဏနောက်မှ ထပ်မံကြိုးစားပါ။',

    upgradeText:
    'ပိုမိုတည်ငြိမ်သော ဝန်ဆောင်မှုအတွက် စနစ်ကို အဆင့်မြှင့်နေပါသည်။',

    temporaryText:
    'စနစ်ကို ယာယီစစ်ဆေးပြုပြင်နေပါသည်။ ခဏနောက်မှ ထပ်မံကြိုးစားပါ။',

    optimizationText:
    'ဝန်ဆောင်မှုကို ပိုမိုကောင်းမွန်စေရန် စနစ်ကို ပြင်ဆင်နေပါသည်။',

    safe:
    'သင့်အကောင့်နှင့် မှတ်တမ်းဒေတာများ ထိခိုက်မည်မဟုတ်ပါ။',

    restore:
    'ခန့်မှန်း ပြန်လည်အသုံးပြုနိုင်မည့်အချိန်',

    later:
    'ခဏနောက်မှ ထပ်မံကြိုးစားပါ',

    footer:
    'JIN MANTANG · SYSTEM SERVICE'
  },


  en:{
    brand:'JIN MANTANG',
    maintenance:'System Maintenance',
    upgrade:'System Upgrade',
    temporary:'Temporary Maintenance',
    optimization:'Service Optimization',

    maintenanceText:
    'We are performing system maintenance. Please try again shortly.',

    upgradeText:
    'We are upgrading the system to provide a more stable service.',

    temporaryText:
    'The system is undergoing a temporary inspection and maintenance.',

    optimizationText:
    'We are optimizing system services. Please try again shortly.',

    safe:
    'Your account and historical data will not be affected.',

    restore:
    'Estimated restoration time',

    later:
    'Please try again shortly',

    footer:
    'JIN MANTANG · SYSTEM SERVICE'
  },


  th:{
    brand:'JIN MANTANG',
    maintenance:'กำลังบำรุงรักษาระบบ',
    upgrade:'กำลังอัปเกรดระบบ',
    temporary:'กำลังบำรุงรักษาชั่วคราว',
    optimization:'กำลังปรับปรุงบริการ',

    maintenanceText:
    'เรากำลังบำรุงรักษาระบบ โปรดลองอีกครั้งในภายหลัง',

    upgradeText:
    'เรากำลังอัปเกรดระบบเพื่อให้บริการมีความเสถียรมากขึ้น',

    temporaryText:
    'ระบบกำลังตรวจสอบและบำรุงรักษาชั่วคราว โปรดลองอีกครั้งภายหลัง',

    optimizationText:
    'เรากำลังปรับปรุงบริการของระบบ โปรดลองอีกครั้งภายหลัง',

    safe:
    'บัญชีและข้อมูลประวัติของคุณจะไม่ได้รับผลกระทบ',

    restore:
    'เวลาที่คาดว่าจะกลับมาใช้งาน',

    later:
    'โปรดลองอีกครั้งภายหลัง',

    footer:
    'JIN MANTANG · SYSTEM SERVICE'
  },


  ms:{
    brand:'JIN MANTANG',
    maintenance:'Penyelenggaraan Sistem',
    upgrade:'Naik Taraf Sistem',
    temporary:'Penyelenggaraan Sementara',
    optimization:'Pengoptimuman Perkhidmatan',

    maintenanceText:
    'Kami sedang menjalankan penyelenggaraan sistem. Sila cuba sebentar lagi.',

    upgradeText:
    'Kami sedang menaik taraf sistem untuk perkhidmatan yang lebih stabil.',

    temporaryText:
    'Sistem sedang menjalani pemeriksaan dan penyelenggaraan sementara.',

    optimizationText:
    'Kami sedang mengoptimumkan perkhidmatan sistem. Sila cuba sebentar lagi.',

    safe:
    'Akaun dan data sejarah anda tidak akan terjejas.',

    restore:
    'Anggaran masa pulih',

    later:
    'Sila cuba sebentar lagi',

    footer:
    'JIN MANTANG · SYSTEM SERVICE'
  },


  vi:{
    brand:'JIN MANTANG',
    maintenance:'Hệ thống đang bảo trì',
    upgrade:'Hệ thống đang nâng cấp',
    temporary:'Bảo trì tạm thời',
    optimization:'Đang tối ưu dịch vụ',

    maintenanceText:
    'Chúng tôi đang bảo trì hệ thống. Vui lòng thử lại sau.',

    upgradeText:
    'Chúng tôi đang nâng cấp hệ thống để cung cấp dịch vụ ổn định hơn.',

    temporaryText:
    'Hệ thống đang được kiểm tra và bảo trì tạm thời. Vui lòng thử lại sau.',

    optimizationText:
    'Chúng tôi đang tối ưu dịch vụ hệ thống. Vui lòng thử lại sau.',

    safe:
    'Tài khoản và dữ liệu lịch sử của bạn sẽ không bị ảnh hưởng.',

    restore:
    'Thời gian dự kiến khôi phục',

    later:
    'Vui lòng thử lại sau',

    footer:
    'JIN MANTANG · SYSTEM SERVICE'
  },


  id:{
    brand:'JIN MANTANG',
    maintenance:'Pemeliharaan Sistem',
    upgrade:'Peningkatan Sistem',
    temporary:'Pemeliharaan Sementara',
    optimization:'Optimalisasi Layanan',

    maintenanceText:
    'Kami sedang melakukan pemeliharaan sistem. Silakan coba lagi nanti.',

    upgradeText:
    'Kami sedang meningkatkan sistem untuk layanan yang lebih stabil.',

    temporaryText:
    'Sistem sedang menjalani pemeriksaan dan pemeliharaan sementara.',

    optimizationText:
    'Kami sedang mengoptimalkan layanan sistem. Silakan coba lagi nanti.',

    safe:
    'Akun dan data riwayat Anda tidak akan terpengaruh.',

    restore:
    'Perkiraan waktu pulih',

    later:
    'Silakan coba lagi nanti',

    footer:
    'JIN MANTANG · SYSTEM SERVICE'
  }

};


const t =
TEXT[lang]
||
TEXT.zh;


/*
  维护状态读取期间，
  先隐藏原页面。
  防止客户看到错误页面一闪而过。
*/
const style =
document.createElement(
  'style'
);


style.id =
'jmtMaintenanceGateStyle';


style.textContent = `

html.jmtMaintenanceChecking body{
  visibility:hidden!important;
}

html.jmtMaintenanceActive body{
  visibility:visible!important;
  overflow:hidden!important;
}

#jmtMaintenanceOverlay{
  position:fixed;
  inset:0;
  z-index:2147483647;
  overflow:auto;

  background:
  radial-gradient(
    circle at 50% -10%,
    #302006 0,
    #0d0b08 38%,
    #050505 78%
  );

  color:#f3e6bf;

  font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Arial,
  sans-serif;

  padding:
  max(
    24px,
    env(safe-area-inset-top)
  )
  16px
  max(
    28px,
    env(safe-area-inset-bottom)
  );

  display:flex;
  align-items:center;
  justify-content:center;
}

#jmtMaintenanceOverlay .jmtMCard{
  width:min(620px,100%);

  border:
  1px solid
  rgba(214,168,63,.34);

  border-radius:28px;

  background:
  linear-gradient(
    180deg,
    rgba(24,22,18,.98),
    rgba(9,9,10,.99)
  );

  box-shadow:
  0 28px 90px
  rgba(0,0,0,.48);

  padding:
  24px
  20px
  22px;

  text-align:center;
}

#jmtMaintenanceOverlay .jmtMImage{
  width:min(360px,92%);
  aspect-ratio:16/10;

  margin:
  0 auto 20px;

  border-radius:22px;
  overflow:hidden;

  border:
  1px solid
  rgba(218,175,66,.24);

  background:
  radial-gradient(
    circle at 50% 36%,
    rgba(213,163,52,.25),
    rgba(9,9,10,.96) 68%
  );

  display:grid;
  place-items:center;
}

#jmtMaintenanceOverlay .jmtMImage img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}

#jmtMaintenanceOverlay .jmtMFallback{
  font-size:58px;

  filter:
  drop-shadow(
    0 0 20px
    rgba(231,187,76,.24)
  );
}

#jmtMaintenanceOverlay .jmtMBrand{
  font-size:11px;
  letter-spacing:4px;
  color:#8f7f5d;
  margin-bottom:8px;
}

#jmtMaintenanceOverlay .jmtMTitle{
  font-size:27px;
  line-height:1.35;
  font-weight:900;
  color:#efcf73;
}

#jmtMaintenanceOverlay .jmtMText{
  margin:12px auto 0;
  max-width:470px;
  font-size:14px;
  line-height:1.8;
  color:#aaa08c;
}

#jmtMaintenanceOverlay .jmtMSafe{
  margin:16px auto 0;
  max-width:470px;

  padding:
  12px 14px;

  border-radius:14px;

  border:
  1px solid
  rgba(78,154,103,.22);

  background:
  rgba(43,109,66,.10);

  color:#89cda2;
  font-size:12px;
  line-height:1.65;
}

#jmtMaintenanceOverlay .jmtMRestore{
  margin:15px auto 0;
  max-width:470px;

  padding:
  12px 14px;

  border-radius:14px;

  background:#111112;

  border:
  1px solid
  rgba(214,168,63,.16);

  color:#d7bf79;

  font-size:12px;
  line-height:1.6;
}

#jmtMaintenanceOverlay .jmtMFoot{
  margin-top:20px;

  color:#6f685c;

  font-size:9px;
  letter-spacing:2px;
}

`;


document.head.appendChild(
  style
);


document.documentElement
.classList
.add(
  'jmtMaintenanceChecking'
);


function restoreText(
  value
){

  if(!value){
    return t.later;
  }


  const date =
  new Date(
    value
  );


  if(
    Number.isNaN(
      date.getTime()
    )
  ){
    return t.later;
  }


  const locale = {
    zh:'zh-CN',
    my:'my-MM',
    en:'en-US',
    th:'th-TH',
    ms:'ms-MY',
    vi:'vi-VN',
    id:'id-ID'
  }[lang]
  ||
  'zh-CN';


  const formatted =
  new Intl.DateTimeFormat(
    locale,
    {
      timeZone:
      'Asia/Yangon',

      year:'numeric',
      month:'2-digit',
      day:'2-digit',

      hour:'2-digit',
      minute:'2-digit',

      hour12:false
    }
  )
  .format(
    date
  );


  return (
    t.restore
    +
    '：'
    +
    formatted
    +
    ' MMT'
  );

}


function renderMaintenance(
  settings
){

  const type =
  [
    'maintenance',
    'upgrade',
    'temporary',
    'optimization'
  ]
  .includes(
    settings.maintenance_type
  )
  ?
  settings.maintenance_type
  :
  'maintenance';


  const title =
  t[type]
  ||
  t.maintenance;


  const message =
  t[
    type
    +
    'Text'
  ]
  ||
  t.maintenanceText;


  document.documentElement
  .classList
  .remove(
    'jmtMaintenanceChecking'
  );


  document.documentElement
  .classList
  .add(
    'jmtMaintenanceActive'
  );


  const draw =
  ()=>{

    document.body.innerHTML = `

      <div
        id="jmtMaintenanceOverlay"
        role="status"
        aria-live="polite">

        <div class="jmtMCard">

          <div class="jmtMImage">

            <img
              src="/maintenance-illustration.webp"
              alt=""
              onerror="
                this.remove();
                this.parentNode.insertAdjacentHTML(
                  'beforeend',
                  '<div class=&quot;jmtMFallback&quot;>⚙️</div>'
                )
              ">

          </div>


          <div class="jmtMBrand">
            ${t.brand}
          </div>


          <div class="jmtMTitle">
            ${title}
          </div>


          <div class="jmtMText">
            ${message}
          </div>


          <div class="jmtMSafe">
            ✓ ${t.safe}
          </div>


          <div class="jmtMRestore">
            ${
              restoreText(
                settings
                .maintenance_restore_at
              )
            }
          </div>


          <div class="jmtMFoot">
            ${t.footer}
          </div>

        </div>

      </div>

    `;

  };


  if(document.body){

    draw();

  }
  else{

    document.addEventListener(
      'DOMContentLoaded',
      draw,
      {
        once:true
      }
    );

  }

}


async function checkMaintenance(){

  const controller =
  new AbortController();


  const timer =
  setTimeout(
    ()=>{
      controller.abort();
    },
    3000
  );


  try{

    const response =
    await fetch(

      BASE
      +
      '/rest/v1/site_settings'
      +
      '?id=eq.1'
      +
      '&select='
      +
      'customer_maintenance_enabled,'
      +
      'agent_maintenance_enabled,'
      +
      'maintenance_type,'
      +
      'maintenance_restore_at',

      {

        headers:{
          apikey:KEY,
          Authorization:
          'Bearer '
          +
          KEY
        },

        cache:
        'no-store',

        signal:
        controller.signal

      }

    );


    if(!response.ok){

      throw new Error(
        'MAINTENANCE_CHECK_FAILED'
      );

    }


    const rows =
    await response.json();


    const settings =
    rows?.[0]
    ||
    {};


    const enabled =
    surface ===
    'customer'
    ?
    !!settings
    .customer_maintenance_enabled
    :
    !!settings
    .agent_maintenance_enabled;


    if(enabled){

      renderMaintenance(
        settings
      );

      return;

    }

  }
  catch(error){

    console.warn(
      'maintenance gate unavailable',
      error
    );

  }
  finally{

    clearTimeout(
      timer
    );

  }


  /*
    无维护 / 检查失败：
    原网站照常运行。
  */
  document.documentElement
  .classList
  .remove(
    'jmtMaintenanceChecking'
  );

}


checkMaintenance();

})();
