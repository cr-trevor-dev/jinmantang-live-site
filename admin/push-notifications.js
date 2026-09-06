(()=>{
'use strict';

/*
  JIN MANTANG ADMIN PUSH CLIENT

  只负责：
  - 注册 /admin/sw.js
  - 请求通知权限
  - 创建 Web Push subscription
  - 通过独立 Edge Function 保存管理员设备订阅
  - 同步当前待办角标

  不修改：
  - 付款
  - 下注
  - 余额
  - 结算
  - 退款
  - 派彩
  - 代理佣金
*/

const BASE =
location.origin
+
'/supabase';


const KEY =
'sb_publishable_mZe5EwSSrSubPL5K5yvJcw_J8LjdiXN';


function getAdminToken(){

  if(
    typeof token
    ===
    'string'
    &&
    token
  ){

    return token;

  }


  return (
    localStorage.getItem(
      'jmt_access_token'
    )
    ||
    sessionStorage.getItem(
      'jmt_access_token'
    )
    ||
    ''
  );

}


function base64UrlToUint8Array(
  base64String
){

  const padding =
  '='.repeat(
    (
      4
      -
      base64String.length
      %
      4
    )
    %
    4
  );


  const base64 =
  (
    base64String
    +
    padding
  )
  .replace(
    /-/g,
    '+'
  )
  .replace(
    /_/g,
    '/'
  );


  const rawData =
  atob(
    base64
  );


  return Uint8Array.from(
    [
      ...rawData
    ]
    .map(
      char =>
      char.charCodeAt(
        0
      )
    )
  );

}


async function functionApi(
  action,
  options={}
){

  const token =
  getAdminToken();


  if(!token){

    throw new Error(
      'ADMIN_TOKEN_MISSING'
    );

  }


  const res =
  await fetch(

    BASE
    +
    '/functions/v1/admin-payment-alert'
    +
    '?action='
    +
    encodeURIComponent(
      action
    ),

    {
      ...options,

      headers:{

        apikey:
        KEY,

        Authorization:
        'Bearer '
        +
        token,

        'Content-Type':
        'application/json',

        ...(
          options.headers
          ||
          {}
        )

      }
    }

  );


  if(!res.ok){

    throw new Error(
      await res.text()
    );

  }


  return res;

}


async function loadPushPublicKey(){

  const res =
  await functionApi(
    'public-key',
    {
      method:'GET'
    }
  );


  const data =
  await res.json();


  const key =
  String(
    data.publicKey
    ||
    ''
  );


  if(!key){

    throw new Error(
      'VAPID_PUBLIC_KEY_MISSING'
    );

  }


  return key;

}


async function saveSubscription(
  subscription
){

  const json =
  subscription.toJSON();


  const endpoint =
  json.endpoint
  ||
  '';


  const p256dh =
  json.keys
  ?.p256dh
  ||
  '';


  const auth =
  json.keys
  ?.auth
  ||
  '';


  if(
    !endpoint
    ||
    !p256dh
    ||
    !auth
  ){

    throw new Error(
      'PUSH_SUBSCRIPTION_INCOMPLETE'
    );

  }


  const res =
  await functionApi(
    'subscribe',
    {
      method:'POST',

      body:
      JSON.stringify({
        endpoint,

        keys:{
          p256dh,
          auth
        }
      })
    }
  );


  return res.json();

}


async function syncVisibleBadge(){

  try{

    const res =
    await functionApi(
      'state',
      {
        method:'GET'
      }
    );


    const data =
    await res.json();


    const count =
    Math.max(
      0,
      Number(
        data.total
        ||
        0
      )
    );


    if(
      'setAppBadge'
      in
      navigator
    ){

      if(count > 0){

        await navigator
        .setAppBadge(
          count
        );

      }
      else if(
        'clearAppBadge'
        in
        navigator
      ){

        await navigator
        .clearAppBadge();

      }

    }


    return count;

  }
  catch(error){

    console.warn(
      'ADMIN_BADGE_SYNC_FAILED',
      error
    );


    return 0;

  }

}


window.enableAdminPushNotifications =
async function(){

  if(
    !(
      'serviceWorker'
      in
      navigator
    )
    ||
    !(
      'PushManager'
      in
      window
    )
    ||
    !(
      'Notification'
      in
      window
    )
  ){

    return {
      ok:false,
      reason:'UNSUPPORTED'
    };

  }


  try{

    const permission =
    await Notification
    .requestPermission();


    if(
      permission
      !==
      'granted'
    ){

      return {
        ok:false,
        reason:'PERMISSION_NOT_GRANTED'
      };

    }


    const registration =
    await navigator
    .serviceWorker
    .register(
      '/admin/sw.js',
      {
        scope:'/admin/'
      }
    );


    await navigator
    .serviceWorker
    .ready;


    let subscription =
    await registration
    .pushManager
    .getSubscription();


    if(!subscription){

      const publicKey =
      await loadPushPublicKey();


      subscription =
      await registration
      .pushManager
      .subscribe({

        userVisibleOnly:true,

        applicationServerKey:
        base64UrlToUint8Array(
          publicKey
        )

      });

    }


    const saved =
    await saveSubscription(
      subscription
    );


    await syncVisibleBadge();


    return {
      ok:true,
      state:
      saved.state
      ||
      null
    };

  }
  catch(error){

    console.error(
      'ADMIN_PUSH_ENABLE_FAILED',
      error
    );


    return {
      ok:false,
      reason:'FAILED'
    };

  }

};


window.syncAdminBadge =
syncVisibleBadge;

})();
