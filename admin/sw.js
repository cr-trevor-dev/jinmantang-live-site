'use strict';

/*
  JIN MANTANG ADMIN PUSH SERVICE WORKER

  只负责：
  - 接收管理员 Web Push
  - 更新主屏幕角标
  - 显示管理员待办通知

  不缓存、不拦截网络请求。
  不读取、不修改付款、下注、余额、结算、退款、佣金数据。
*/

self.addEventListener(
  'install',
  event=>{

    event.waitUntil(
      self.skipWaiting()
    );

  }
);


self.addEventListener(
  'activate',
  event=>{

    event.waitUntil(
      self.clients.claim()
    );

  }
);


self.addEventListener(
  'push',
  event=>{

    let data = {};


    try{

      data =
      event.data
      ?
      event.data.json()
      :
      {};

    }
    catch{

      data = {};

    }


    const badge =
    Math.max(
      0,
      Number(
        data.badge
        ||
        0
      )
    );


    const tasks =
    [];


    if(
      'setAppBadge'
      in
      self.navigator
    ){

      if(badge > 0){

        tasks.push(
          self.navigator
          .setAppBadge(
            badge
          )
        );

      }
      else if(
        'clearAppBadge'
        in
        self.navigator
      ){

        tasks.push(
          self.navigator
          .clearAppBadge()
        );

      }

    }


    tasks.push(

      self.registration
      .showNotification(

        String(
          data.title
          ||
          '金满堂管理'
        ),

        {
          body:
          String(
            data.body
            ||
            '管理端有新的待处理事项。'
          ),

          icon:
          '/IMG_1429.png',

          tag:
          'jmt-admin-payment-alert',

          renotify:
          true,

          data:{
            url:
            String(
              data.url
              ||
              '/admin/payments/'
            )
          }
        }

      )

    );


    event.waitUntil(
      Promise.all(
        tasks
      )
    );

  }
);


self.addEventListener(
  'notificationclick',
  event=>{

    event.notification
    .close();


    const targetUrl =
    new URL(
      event.notification
      ?.data
      ?.url
      ||
      '/admin/payments/',
      self.location.origin
    )
    .href;


    event.waitUntil(

      self.clients
      .matchAll({
        type:'window',
        includeUncontrolled:true
      })
      .then(
        windows=>{

          for(
            const client
            of
            windows
          ){

            if(
              client.url
              .startsWith(
                self.location.origin
              )
              &&
              'focus'
              in
              client
            ){

              client.navigate(
                targetUrl
              );

              return client.focus();

            }

          }


          if(
            self.clients.openWindow
          ){

            return self.clients
            .openWindow(
              targetUrl
            );

          }


          return null;

        }
      )

    );

  }
);
