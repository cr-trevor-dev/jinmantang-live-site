(()=>{
'use strict';

/*
  JIN MANTANG ADMIN PUSH CLIENT

  只负责：
  - 注册 /admin/sw.js
  - 请求通知权限
  - 创建 Web Push subscription
  - 把当前管理员设备的 subscription 保存到独立通知表
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


async function adminApi(
  path,
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
    path,

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
  await adminApi(
    '/rest/v1/admin_push_config'
    +
    '?select=vapid_public_key'
    +
    '&id=eq.1'
    +
    '&limit=1'
  );


  const rows =
  await res.json();


  const key =
  Array.isArray(
    rows
  )
  ?
  rows[0]
  ?.vapid_public_key
  :
  '';


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
  json.endpoint;


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


  await adminApi(

    '/rest/v1/admin_push_subscriptions'
    +
    '?on_conflict=endpoint',

    {
      method:'POST',

      headers:{
        Prefer:
        'resolution=merge-duplicates,return=minimal'
      },

      body:
      JSON.stringify({
        endpoint,
        p256dh,
        auth,
        user_agent:
        navigator.userAgent,
        active:true,
        updated_at:
        new Date()
        .toISOString()
      })
    }

  );

}


async function syncVisibleBadge(){

  try{

    const res =
    await adminApi(
      '/functions/v1/admin-payment-alert',
      {
        method:'POST',
        body:
        JSON.stringify({
          mode:'count_only'
        })
      }
    );


    const data =
    await res.json();


    const count =
    Math.max(
      0,
      Number(
        data.count
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

  }
  catch(error){

    console.warn(
      'ADMIN_BADGE_SYNC_FAILED',
      error
    );

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


    await saveSubscription(
      subscription
    );


    await syncVisibleBadge();


    return {
      ok:true
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
