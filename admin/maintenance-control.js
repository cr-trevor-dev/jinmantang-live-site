(()=>{
'use strict';


function maintenance$(
  id
){
  return document
  .getElementById(
    id
  );
}


function formatMaintenanceTime(
  value
){

  if(!value){
    return '';
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
    return '';
  }


  const parts =
  new Intl.DateTimeFormat(
    'en-CA',
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
  .formatToParts(
    date
  );


  const get =
  type =>
  parts.find(
    part=>
    part.type===type
  )
  ?.value
  ||
  '';


  return (
    get('year')
    +
    '-'
    +
    get('month')
    +
    '-'
    +
    get('day')
    +
    'T'
    +
    get('hour')
    +
    ':'
    +
    get('minute')
  );

}


function mmtLocalToIso(
  value
){

  if(!value){
    return null;
  }


  const match =
  String(
    value
  )
  .match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );


  if(!match){
    return null;
  }


  const [
    ,
    year,
    month,
    day,
    hour,
    minute
  ] =
  match;


  /*
    Myanmar Time = UTC + 06:30
  */
  const utc =
  Date.UTC(
    Number(year),
    Number(month)-1,
    Number(day),
    Number(hour)-6,
    Number(minute)-30,
    0
  );


  return new Date(
    utc
  )
  .toISOString();

}


function installMaintenanceCard(){

  if(
    maintenance$(
      'maintenanceManagement'
    )
  ){
    return;
  }


  const siteSettings =
  maintenance$(
    'siteSettings'
  );


  if(!siteSettings){
    return;
  }


  const card =
  document.createElement(
    'div'
  );


  card.className =
  'card';


  card.id =
  'maintenanceManagement';


  card.innerHTML = `

    <div class="title">
      系统维护管理
    </div>


    <div class="note">
      仅控制客户页面和代理页面是否显示维护提示。
      不会删除或修改下注、付款、佣金、开奖、派彩和历史数据。
    </div>


    <div class="switchRow">

      <div class="switchText">
        客户页面维护模式
      </div>

      <label class="switch">

        <input
          id="customerMaintenanceEnabled"
          type="checkbox">

        <span class="slider"></span>

      </label>

    </div>


    <div class="switchRow">

      <div class="switchText">
        代理页面维护模式
      </div>

      <label class="switch">

        <input
          id="agentMaintenanceEnabled"
          type="checkbox">

        <span class="slider"></span>

      </label>

    </div>


    <label class="settingLabel">
      维护类型
    </label>

    <select id="maintenanceType">

      <option value="maintenance">
        系统维护
      </option>

      <option value="upgrade">
        系统升级
      </option>

      <option value="temporary">
        临时维护
      </option>

      <option value="optimization">
        服务优化
      </option>

    </select>


    <label class="settingLabel">
      预计恢复时间
    </label>

    <input
      id="maintenanceRestoreAt"
      type="datetime-local">


    <div class="note">
      可留空。时间按 Myanmar Time 显示。
    </div>


    <button
      type="button"
      onclick="saveMaintenanceSettings()">
      保存维护设置
    </button>


    <div
      class="msg"
      id="maintenanceMsg">
    </div>

  `;


  siteSettings
  .insertAdjacentElement(
    'afterend',
    card
  );


  loadMaintenanceSettings();

}


async function loadMaintenanceSettings(){

  const msg =
  maintenance$(
    'maintenanceMsg'
  );


  try{

    const response =
    await api(

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
      'maintenance_restore_at'

    );


    if(!response.ok){

      throw new Error(
        await response.text()
      );

    }


    const rows =
    await response.json();


    const settings =
    rows?.[0]
    ||
    {};


    maintenance$(
      'customerMaintenanceEnabled'
    ).checked =
    !!settings
    .customer_maintenance_enabled;


    maintenance$(
      'agentMaintenanceEnabled'
    ).checked =
    !!settings
    .agent_maintenance_enabled;


    maintenance$(
      'maintenanceType'
    ).value =
    settings
    .maintenance_type
    ||
    'maintenance';


    maintenance$(
      'maintenanceRestoreAt'
    ).value =
    formatMaintenanceTime(
      settings
      .maintenance_restore_at
    );


    msg.className =
    'msg';


    msg.textContent =
    '';

  }
  catch(error){

    console.error(
      'LOAD_MAINTENANCE_SETTINGS_FAILED',
      error
    );


    msg.className =
    'msg error';


    msg.textContent =
    '维护设置读取失败';

  }

}


window.saveMaintenanceSettings =
async function(){

  const msg =
  maintenance$(
    'maintenanceMsg'
  );


  const customerEnabled =
  maintenance$(
    'customerMaintenanceEnabled'
  )
  .checked;


  const agentEnabled =
  maintenance$(
    'agentMaintenanceEnabled'
  )
  .checked;


  const maintenanceType =
  maintenance$(
    'maintenanceType'
  )
  .value;


  const restoreValue =
  maintenance$(
    'maintenanceRestoreAt'
  )
  .value;


  const restoreAt =
  mmtLocalToIso(
    restoreValue
  );


  msg.className =
  'msg';


  msg.textContent =
  '正在保存维护设置...';


  try{

    const response =
    await api(

      '/rest/v1/site_settings?id=eq.1',

      {

        method:'PATCH',

        headers:{

          'Content-Type':
          'application/json',

          Prefer:
          'return=representation'

        },

        body:
        JSON.stringify({

          customer_maintenance_enabled:
          customerEnabled,

          agent_maintenance_enabled:
          agentEnabled,

          maintenance_type:
          maintenanceType,

          maintenance_restore_at:
          restoreAt,

          updated_at:
          new Date()
          .toISOString()

        })

      }

    );


    if(!response.ok){

      throw new Error(
        await response.text()
      );

    }


    msg.className =
    'msg success';


    msg.textContent =
    '✓ 维护设置已更新';


    await loadMaintenanceSettings();

  }
  catch(error){

    console.error(
      'SAVE_MAINTENANCE_SETTINGS_FAILED',
      error
    );


    msg.className =
    'msg error';


    msg.textContent =
    '保存失败，请重新登录后再试';

  }

};


function bootMaintenanceControl(){

  installMaintenanceCard();


  if(
    !maintenance$(
      'maintenanceManagement'
    )
  ){

    setTimeout(
      bootMaintenanceControl,
      500
    );

  }

}


if(
  document.readyState===
  'loading'
){

  document.addEventListener(

    'DOMContentLoaded',

    bootMaintenanceControl,

    {
      once:true
    }

  );

}
else{

  bootMaintenanceControl();

}

})();
