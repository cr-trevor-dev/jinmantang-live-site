(()=>{
    /* =========================================================
     AGENT REFERRAL
  ========================================================= */

  const REFERRAL_STORAGE_KEY =
  'jmt_customer_referral_v1';

  const REFERRAL_MAX_AGE =
  7
  *
  24
  *
  60
  *
  60
  *
  1000;


  function validReferralCode(value){

    return /^JMA-[A-F0-9]{10}$/
    .test(
      String(
        value
        ||
        ''
      )
      .trim()
      .toUpperCase()
    );

  }


  function readStoredReferral(){

    try{

      const raw =
      localStorage.getItem(
        REFERRAL_STORAGE_KEY
      );

      if(!raw){
        return '';
      }


      const data =
      JSON.parse(
        raw
      );


      const code =
      String(
        data?.code
        ||
        ''
      )
      .trim()
      .toUpperCase();


      const savedAt =
      Number(
        data?.saved_at
        ||
        0
      );


      if(
        !validReferralCode(
          code
        )
        ||
        !savedAt
        ||
        Date.now()
        -
        savedAt
        >
        REFERRAL_MAX_AGE
      ){

        localStorage.removeItem(
          REFERRAL_STORAGE_KEY
        );

        return '';

      }


      return code;

    }
    catch{

      localStorage.removeItem(
        REFERRAL_STORAGE_KEY
      );

      return '';

    }

  }


    function captureReferral(){

    const fromUrl =
    String(
      new URLSearchParams(
        location.search
      )
      .get(
        'ref'
      )
      ||
      ''
    )
    .trim()
    .toUpperCase();


    if(
      validReferralCode(
        fromUrl
      )
    ){

      localStorage.setItem(

        REFERRAL_STORAGE_KEY,

        JSON.stringify({

          code:
          fromUrl,

          saved_at:
          Date.now()

        })

      );


      return fromUrl;

    }


    return readStoredReferral();

  }


  const referralCode =
  captureReferral();


  if(referralCode){

    const referralFetch =
    window.fetch.bind(
      window
    );


    window.fetch =
    async function(
      input,
      init={}
    ){

      const url =
      typeof input
      ===
      'string'
      ?
      input
      :
      input?.url
      ||
      '';


      let nextInit =
      init;


      let authAction =
      '';


      if(
        url.includes(
          '/functions/v1/customer-auth'
        )
        &&
        typeof init?.body
        ===
        'string'
      ){

        try{

          const body =
          JSON.parse(
            init.body
          );


          authAction =
          String(
            body?.action
            ||
            ''
          );


          if(
            authAction
            ===
            'register'
          ){

            body.referral_code =
            referralCode;


            nextInit = {

              ...init,

              body:
              JSON.stringify(
                body
              )

            };

          }

        }
        catch{}

      }


      const response =
      await referralFetch(
        input,
        nextInit
      );


      if(
        response.ok
        &&
        (
          authAction
          ===
          'register'
          ||
          authAction
          ===
          'login'
        )
      ){

        localStorage.removeItem(
          REFERRAL_STORAGE_KEY
        );

      }


      return response;

    };


    const oldTranslateError =
    window.translateError;


    if(
      typeof oldTranslateError
      ===
      'function'
    ){

      window.translateError =
      function(message){

        const text =
        String(
          message
          ||
          ''
        );


        if(
          text.includes(
            'REFERRAL_INVALID'
          )
        ){

          return '此代理推广链接无效，请重新获取正确链接。';

        }


        if(
          text.includes(
            'REFERRAL_INACTIVE'
          )
        ){

          return '此代理推广链接当前不可用，请联系平台客服。';

        }


        return oldTranslateError(
          message
        );

      };

    }


    window.addEventListener(

      'load',

      ()=>{

        if(
          typeof token
          !==
          'undefined'
          &&
          !token
          &&
          typeof showAuth
          ===
          'function'
        ){

          showAuth(
            'register'
          );

        }


        

      }

    );

  }
      /* =========================================================
     CUSTOMER LANGUAGE
  ========================================================= */

  const CUSTOMER_LANG_KEY =
  'jmt_customer_lang';


  let customerLang =
  localStorage.getItem(
    CUSTOMER_LANG_KEY
  )
  ||
  'zh';


  const CUSTOMER_LANG_INDEX = {
    my:0,
    en:1,
    th:2,
    ms:3,
    vi:4,
    id:5
  };


  const CUSTOMER_UI_TEXT = {

    '登录':['ဝင်ရောက်ရန်','Login','เข้าสู่ระบบ','Log Masuk','Đăng nhập','Login'],
    '注册':['စာရင်းသွင်းရန်','Register','สมัคร','Daftar','Đăng ký','Daftar'],
    '客户登录':['ဖောက်သည်ဝင်ရောက်ရန်','Customer Login','เข้าสู่ระบบลูกค้า','Log Masuk Pelanggan','Đăng nhập khách hàng','Login Pelanggan'],
    '用户名':['အသုံးပြုသူအမည်','Username','ชื่อผู้ใช้','Nama Pengguna','Tên đăng nhập','Nama Pengguna'],
    '密码':['စကားဝှက်','Password','รหัสผ่าน','Kata Laluan','Mật khẩu','Kata Sandi'],
    '请输入用户名':['အသုံးပြုသူအမည်ထည့်ပါ','Enter username','กรอกชื่อผู้ใช้','Masukkan nama pengguna','Nhập tên đăng nhập','Masukkan nama pengguna'],
    '请输入密码':['စကားဝှက်ထည့်ပါ','Enter password','กรอกรหัสผ่าน','Masukkan kata laluan','Nhập mật khẩu','Masukkan kata sandi'],

    '创建客户账户':['ဖောက်သည်အကောင့်ဖန်တီးရန်','Create Customer Account','สร้างบัญชีลูกค้า','Cipta Akaun Pelanggan','Tạo tài khoản khách hàng','Buat Akun Pelanggan'],
    '4–20 位字母、数字或下划线':['အက္ခရာ၊ နံပါတ် သို့မဟုတ် _ 4–20 လုံး','4–20 letters, numbers or underscores','4–20 ตัวอักษร ตัวเลข หรือขีดล่าง','4–20 huruf, nombor atau garis bawah','4–20 chữ cái, số hoặc dấu gạch dưới','4–20 huruf, angka atau garis bawah'],
    '至少 8 位':['အနည်းဆုံး 8 လုံး','At least 8 characters','อย่างน้อย 8 ตัว','Sekurang-kurangnya 8 aksara','Ít nhất 8 ký tự','Minimal 8 karakter'],
    '确认密码':['စကားဝှက်အတည်ပြုရန်','Confirm Password','ยืนยันรหัสผ่าน','Sahkan Kata Laluan','Xác nhận mật khẩu','Konfirmasi Kata Sandi'],
    '请再次输入密码':['စကားဝှက်ကို ထပ်မံထည့်ပါ','Enter password again','กรอกรหัสผ่านอีกครั้ง','Masukkan kata laluan sekali lagi','Nhập lại mật khẩu','Masukkan kata sandi lagi'],
    '真实姓名':['အမည်အပြည့်အစုံ','Full Name','ชื่อจริง','Nama Penuh','Họ tên','Nama Lengkap'],
    '请输入真实姓名':['အမည်အပြည့်အစုံထည့်ပါ','Enter full name','กรอกชื่อจริง','Masukkan nama penuh','Nhập họ tên','Masukkan nama lengkap'],
    '手机号码':['ဖုန်းနံပါတ်','Phone Number','หมายเลขโทรศัพท์','Nombor Telefon','Số điện thoại','Nomor Telepon'],
    '请输入手机号码':['ဖုန်းနံပါတ်ထည့်ပါ','Enter phone number','กรอกหมายเลขโทรศัพท์','Masukkan nombor telefon','Nhập số điện thoại','Masukkan nomor telepon'],
    '注册账户':['အကောင့်စာရင်းသွင်းရန်','Register Account','สมัครบัญชี','Daftar Akaun','Đăng ký tài khoản','Daftar Akun'],
    '请牢记用户名和密码。注册成功后系统会自动生成金满堂客户编号。':[
      'အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို မှတ်သားထားပါ။ စာရင်းသွင်းပြီးနောက် ဖောက်သည်နံပါတ်ကို စနစ်က အလိုအလျောက်ဖန်တီးပေးမည်။',
      'Please remember your username and password. A customer ID will be generated automatically after registration.',
      'โปรดจำชื่อผู้ใช้และรหัสผ่าน ระบบจะสร้างรหัสลูกค้าให้อัตโนมัติหลังสมัครสำเร็จ',
      'Sila ingat nama pengguna dan kata laluan. ID pelanggan akan dijana secara automatik selepas pendaftaran.',
      'Hãy ghi nhớ tên đăng nhập và mật khẩu. Mã khách hàng sẽ được tạo tự động sau khi đăng ký.',
      'Harap ingat nama pengguna dan kata sandi. ID pelanggan akan dibuat otomatis setelah pendaftaran.'
    ],

    '正在安全连接，请稍候...':['လုံခြုံစွာချိတ်ဆက်နေသည်...','Connecting securely...','กำลังเชื่อมต่ออย่างปลอดภัย...','Menyambung dengan selamat...','Đang kết nối an toàn...','Menghubungkan dengan aman...'],

    '我的账户':['ကျွန်ုပ်၏အကောင့်','My Account','บัญชีของฉัน','Akaun Saya','Tài khoản của tôi','Akun Saya'],
    '正常':['ပုံမှန်','Active','ปกติ','Aktif','Hoạt động','Aktif'],
    '姓名':['အမည်','Name','ชื่อ','Nama','Tên','Nama'],
    '注册手机号':['စာရင်းသွင်းဖုန်းနံပါတ်','Registered Phone','เบอร์โทรที่ลงทะเบียน','Telefon Berdaftar','Số điện thoại đăng ký','Nomor Terdaftar'],
    '注册手机号已绑定，不能自行修改；如需更换请联系客服。':[
      'စာရင်းသွင်းဖုန်းနံပါတ်ကို ချိတ်ဆက်ထားပြီး ကိုယ်တိုင်မပြင်နိုင်ပါ။ ပြောင်းလိုပါက ဝန်ဆောင်မှုကို ဆက်သွယ်ပါ။',
      'The registered phone number is locked. Contact support to change it.',
      'เบอร์โทรที่ลงทะเบียนถูกผูกแล้ว ไม่สามารถแก้ไขเองได้ หากต้องการเปลี่ยนโปรดติดต่อฝ่ายบริการ',
      'Nombor telefon berdaftar telah dikunci. Hubungi khidmat pelanggan untuk menukarnya.',
      'Số điện thoại đăng ký đã được khóa. Liên hệ hỗ trợ nếu cần thay đổi.',
      'Nomor telepon terdaftar sudah terkunci. Hubungi layanan pelanggan untuk menggantinya.'
    ],
    '保存个人资料':['ကိုယ်ရေးအချက်အလက်သိမ်းရန်','Save Profile','บันทึกข้อมูลส่วนตัว','Simpan Profil','Lưu thông tin','Simpan Profil'],

    '联系客服':['ဝန်ဆောင်မှုကိုဆက်သွယ်ရန်','Contact Support','ติดต่อฝ่ายบริการ','Hubungi Sokongan','Liên hệ hỗ trợ','Hubungi Dukungan'],
    '退出登录':['ထွက်ရန်','Logout','ออกจากระบบ','Log Keluar','Đăng xuất','Keluar'],

    '我的收款方式':['ကျွန်ုပ်၏ငွေလက်ခံနည်း','My Payout Methods','ช่องทางรับเงินของฉัน','Kaedah Penerimaan Saya','Phương thức nhận tiền','Metode Penerimaan Saya'],
    '未绑定':['မချိတ်ဆက်ရသေး','Not Linked','ยังไม่ผูก','Belum Dipautkan','Chưa liên kết','Belum Terhubung'],
    '请仔细核对。首次保存成功后将不能自行修改。':[
      'သေချာစစ်ဆေးပါ။ ပထမဆုံးသိမ်းပြီးနောက် ကိုယ်တိုင်ပြင်ဆင်၍ မရပါ။',
      'Please check carefully. It cannot be edited after the first successful save.',
      'กรุณาตรวจสอบให้ละเอียด หลังบันทึกครั้งแรกแล้วจะไม่สามารถแก้ไขเองได้',
      'Sila semak dengan teliti. Selepas simpanan pertama, ia tidak boleh diubah sendiri.',
      'Vui lòng kiểm tra kỹ. Sau lần lưu đầu tiên sẽ không thể tự chỉnh sửa.',
      'Periksa dengan teliti. Setelah pertama kali disimpan tidak dapat diubah sendiri.'
    ],
    'KPay 户名':['KPay အကောင့်အမည်','KPay Account Name','ชื่อบัญชี KPay','Nama Akaun KPay','Tên tài khoản KPay','Nama Akun KPay'],
    'KPay 手机号码':['KPay ဖုန်းနံပါတ်','KPay Phone Number','หมายเลข KPay','Nombor KPay','Số điện thoại KPay','Nomor KPay'],
    '保存并绑定 KPay':['KPay သိမ်းပြီး ချိတ်ဆက်ရန်','Save & Link KPay','บันทึกและผูก KPay','Simpan & Paut KPay','Lưu và liên kết KPay','Simpan & Hubungkan KPay'],
    '银行账户':['ဘဏ်အကောင့်','Bank Account','บัญชีธนาคาร','Akaun Bank','Tài khoản ngân hàng','Rekening Bank'],
    '银行名称':['ဘဏ်အမည်','Bank Name','ชื่อธนาคาร','Nama Bank','Tên ngân hàng','Nama Bank'],
    '银行户名':['ဘဏ်အကောင့်အမည်','Account Holder','ชื่อเจ้าของบัญชี','Nama Pemilik Akaun','Tên chủ tài khoản','Nama Pemilik Rekening'],
    '银行账号':['ဘဏ်အကောင့်နံပါတ်','Account Number','เลขบัญชี','Nombor Akaun','Số tài khoản','Nomor Rekening'],
    '保存并绑定银行账户':['ဘဏ်အကောင့်သိမ်းပြီး ချိတ်ဆက်ရန်','Save & Link Bank Account','บันทึกและผูกบัญชีธนาคาร','Simpan & Paut Akaun Bank','Lưu và liên kết tài khoản ngân hàng','Simpan & Hubungkan Rekening Bank'],

    '参与本期':['ယခုအကြိမ် ပါဝင်ရန်','Current Round','เข้าร่วมรอบนี้','Pusingan Semasa','Tham gia kỳ này','Putaran Saat Ini'],
    '读取中':['ဖတ်နေသည်','Loading','กำลังโหลด','Memuatkan','Đang tải','Memuat'],
    '正在读取管理员当前开放期...':['လက်ရှိဖွင့်ထားသောအကြိမ်ကို ဖတ်နေသည်...','Loading current open round...','กำลังโหลดรอบปัจจุบัน...','Memuatkan pusingan semasa...','Đang tải kỳ hiện tại...','Memuat putaran saat ini...'],
    '当前暂无可参与的开放期，请等待下一期开放。':['လက်ရှိပါဝင်နိုင်သောအကြိမ် မရှိသေးပါ။ နောက်တစ်ကြိမ်ကို စောင့်ပါ။','No open round is currently available. Please wait for the next round.','ขณะนี้ยังไม่มีรอบที่เปิด กรุณารอรอบถัดไป','Tiada pusingan terbuka sekarang. Sila tunggu pusingan seterusnya.','Hiện chưa có kỳ mở. Vui lòng chờ kỳ tiếp theo.','Belum ada putaran terbuka. Silakan tunggu putaran berikutnya.'],

    '截止时间':['နောက်ဆုံးအချိန်','Deadline','เวลาปิดรับ','Masa Tutup','Hạn chót','Batas Waktu'],
    '距离截止':['ကျန်ရှိချိန်','Time Remaining','เวลาที่เหลือ','Masa Baki','Thời gian còn lại','Sisa Waktu'],
    '赔率':['အချိုး','Odds','อัตราจ่าย','Odds','Tỷ lệ','Odds'],
    '1 : 10 总返还':['1 : 10 စုစုပေါင်းပြန်လည်ပေးချေ','1 : 10 Total Return','1 : 10 ยอดคืนรวม','1 : 10 Jumlah Pulangan','1 : 10 Tổng hoàn trả','1 : 10 Total Pengembalian'],
    '状态':['အခြေအနေ','Status','สถานะ','Status','Trạng thái','Status'],
    '未保存':['မသိမ်းရသေး','Not Saved','ยังไม่บันทึก','Belum Disimpan','Chưa lưu','Belum Disimpan'],
    '本期合计':['ယခုအကြိမ်စုစုပေါင်း','Round Total','ยอดรวมรอบนี้','Jumlah Pusingan','Tổng kỳ này','Total Putaran'],
    '保存本期':['ယခုအကြိမ်သိမ်းရန်','Save Round','บันทึกรอบนี้','Simpan Pusingan','Lưu kỳ này','Simpan Putaran'],
        '金额':['ငွေပမာဏ','Amount','จำนวนเงิน','Jumlah','Số tiền','Jumlah'],
    '已锁定 ':['လော့ခ်ချပြီး ','Locked ','ล็อกแล้ว ','Dikunci ','Đã khóa ','Terkunci '],
    '可修改':['ပြင်ဆင်နိုင်သည်','Editable','แก้ไขได้','Boleh Diubah','Có thể sửa','Dapat Diubah'],
    '已绑定':['ချိတ်ဆက်ပြီး','Linked','ผูกแล้ว','Dipautkan','Đã liên kết','Terhubung'],
    '已拒绝':['ပယ်ချပြီး','Rejected','ปฏิเสธแล้ว','Ditolak','Đã từ chối','Ditolak'],

    '收款资料用于平台派奖。首次保存后将自动绑定，客户不能自行修改；如需更换，请联系客服。':[
      'ငွေလက်ခံအချက်အလက်ကို ပလက်ဖောင်းမှ ဆုငွေပေးချေရန် အသုံးပြုပါသည်။ ပထမဆုံးသိမ်းပြီးနောက် အလိုအလျောက်ချိတ်ဆက်မည်ဖြစ်ပြီး ကိုယ်တိုင်မပြင်နိုင်ပါ။ ပြောင်းလိုပါက ဝန်ဆောင်မှုကို ဆက်သွယ်ပါ။',
      'Payout details are used for platform payouts. After the first save they will be linked and cannot be changed by the customer. Contact support if you need to replace them.',
      'ข้อมูลรับเงินใช้สำหรับการจ่ายรางวัลของแพลตฟอร์ม หลังบันทึกครั้งแรกจะถูกผูกและลูกค้าไม่สามารถแก้ไขเองได้ หากต้องการเปลี่ยนโปรดติดต่อฝ่ายบริการ',
      'Maklumat penerimaan digunakan untuk pembayaran platform. Selepas simpanan pertama ia akan dipautkan dan tidak boleh diubah sendiri. Hubungi sokongan jika perlu menukarnya.',
      'Thông tin nhận tiền được dùng để nền tảng trả thưởng. Sau lần lưu đầu tiên thông tin sẽ được liên kết và khách hàng không thể tự sửa. Liên hệ hỗ trợ nếu cần thay đổi.',
      'Data penerimaan digunakan untuk pembayaran platform. Setelah pertama kali disimpan akan terhubung dan tidak dapat diubah sendiri. Hubungi dukungan jika perlu menggantinya.'
    ],

    '已进入付款审核或已经确认的金额会锁定，不能减少；截止前仍可继续增加金额。':[
      'ငွေပေးချေမှုစစ်ဆေးနေသော သို့မဟုတ် အတည်ပြုပြီးသော ငွေပမာဏကို လော့ခ်ချမည်ဖြစ်ပြီး လျှော့၍မရပါ။ ပိတ်ချိန်မတိုင်မီ ထပ်တိုးနိုင်ပါသည်။',
      'Amounts under payment review or already confirmed are locked and cannot be reduced. You may still increase them before the deadline.',
      'ยอดที่เข้าสู่การตรวจสอบการชำระหรือยืนยันแล้วจะถูกล็อกและลดไม่ได้ แต่ยังเพิ่มได้ก่อนเวลาปิดรับ',
      'Jumlah yang sedang disemak atau telah disahkan akan dikunci dan tidak boleh dikurangkan. Ia masih boleh ditambah sebelum masa tutup.',
      'Số tiền đang được duyệt thanh toán hoặc đã xác nhận sẽ bị khóa và không thể giảm. Vẫn có thể tăng trước thời hạn.',
      'Jumlah yang sedang ditinjau atau sudah dikonfirmasi akan dikunci dan tidak dapat dikurangi. Masih dapat ditambah sebelum batas waktu.'
    ],

    'KPay 已绑定':['KPay ချိတ်ဆက်ပြီး','KPay Linked','ผูก KPay แล้ว','KPay Dipautkan','KPay đã liên kết','KPay Terhubung'],
    '银行账户已绑定':['ဘဏ်အကောင့်ချိတ်ဆက်ပြီး','Bank Account Linked','ผูกบัญชีธนาคารแล้ว','Akaun Bank Dipautkan','Tài khoản ngân hàng đã liên kết','Rekening Bank Terhubung'],
    '如需更换，请联系客服。':['ပြောင်းလိုပါက ဝန်ဆောင်မှုကို ဆက်သွယ်ပါ။','Contact support if you need to change it.','หากต้องการเปลี่ยนโปรดติดต่อฝ่ายบริการ','Hubungi sokongan jika perlu menukarnya.','Liên hệ hỗ trợ nếu cần thay đổi.','Hubungi dukungan jika perlu menggantinya.'],

    '下一期':['နောက်တစ်ကြိမ်','Next Round','รอบถัดไป','Pusingan Seterusnya','Kỳ tiếp theo','Putaran Berikutnya'],
    '暂未开放':['မဖွင့်သေးပါ','Not Open Yet','ยังไม่เปิด','Belum Dibuka','Chưa mở','Belum Dibuka'],
    '上一期已经结束，结果与结算见上方。下一期开放后会自动显示在这里。':[
      'ယခင်အကြိမ်ပြီးဆုံးပါပြီ။ ရလဒ်နှင့်ရှင်းတမ်းကို အပေါ်တွင်ကြည့်ပါ။ နောက်တစ်ကြိမ်ဖွင့်လျှင် ဤနေရာတွင် အလိုအလျောက်ပြမည်။',
      'The previous round has ended. See the result and settlement above. The next round will appear here automatically when it opens.',
      'รอบก่อนหน้าสิ้นสุดแล้ว ดูผลและการชำระด้านบน รอบถัดไปจะแสดงที่นี่อัตโนมัติเมื่อเปิด',
      'Pusingan sebelumnya telah tamat. Lihat keputusan dan penyelesaian di atas. Pusingan seterusnya akan muncul di sini secara automatik apabila dibuka.',
      'Kỳ trước đã kết thúc. Xem kết quả và quyết toán ở phía trên. Kỳ tiếp theo sẽ tự động hiển thị tại đây khi mở.',
      'Putaran sebelumnya telah berakhir. Lihat hasil dan penyelesaian di atas. Putaran berikutnya akan muncul otomatis di sini saat dibuka.'
    ],
    '当前暂无开放期，请等待下一期开放。':['လက်ရှိဖွင့်ထားသောအကြိမ် မရှိသေးပါ။ နောက်တစ်ကြိမ်ဖွင့်ရန် စောင့်ပါ။','There is currently no open round. Please wait for the next round.','ขณะนี้ยังไม่มีรอบเปิด กรุณารอรอบถัดไป','Tiada pusingan terbuka sekarang. Sila tunggu pusingan seterusnya.','Hiện chưa có kỳ mở. Vui lòng chờ kỳ tiếp theo.','Saat ini belum ada putaran terbuka. Silakan tunggu putaran berikutnya.'],

    '当前账户已被限制':['လက်ရှိအကောင့်ကို ကန့်သတ်ထားသည်','Account Restricted','บัญชีถูกจำกัด','Akaun Disekat','Tài khoản bị hạn chế','Akun Dibatasi'],
    '当前账户暂时无法使用参与及付款功能。如需了解原因或恢复账户，请联系平台客服。':[
      'လက်ရှိအကောင့်သည် ပါဝင်ခြင်းနှင့် ငွေပေးချေမှုလုပ်ဆောင်ချက်များကို ယာယီအသုံးမပြုနိုင်ပါ။ အကြောင်းရင်းသိလိုပါက သို့မဟုတ် အကောင့်ပြန်ဖွင့်လိုပါက ပလက်ဖောင်းဝန်ဆောင်မှုကို ဆက်သွယ်ပါ။',
      'This account temporarily cannot participate or make payments. Contact platform support for the reason or to restore the account.',
      'บัญชีนี้ไม่สามารถเข้าร่วมหรือชำระเงินได้ชั่วคราว โปรดติดต่อฝ่ายบริการแพลตฟอร์มหากต้องการทราบสาเหตุหรือกู้คืนบัญชี',
      'Akaun ini sementara tidak boleh menyertai atau membuat pembayaran. Hubungi sokongan platform untuk mengetahui sebab atau memulihkan akaun.',
      'Tài khoản hiện tạm thời không thể tham gia hoặc thanh toán. Liên hệ hỗ trợ nền tảng để biết lý do hoặc khôi phục tài khoản.',
      'Akun ini sementara tidak dapat berpartisipasi atau melakukan pembayaran. Hubungi dukungan platform untuk mengetahui alasan atau memulihkan akun.'
    ],

    '例如：KPay 转账':['ဥပမာ - KPay လွှဲငွေ','Example: KPay transfer','ตัวอย่าง: โอนผ่าน KPay','Contoh: pindahan KPay','Ví dụ: chuyển khoản KPay','Contoh: transfer KPay'],
    '总返还':['စုစုပေါင်းပြန်လည်ပေးချေ','Total Return','ยอดคืนรวม','Jumlah Pulangan','Tổng hoàn trả','Total Pengembalian'],

    '只有开奖前由管理员确认的金额，':['开奖မတိုင်မီ Admin အတည်ပြုထားသော ငွေပမာဏသာ ','Only amounts confirmed by Admin before the draw ','เฉพาะยอดที่ผู้ดูแลยืนยันก่อนออกรางวัลเท่านั้น ','Hanya jumlah yang disahkan Admin sebelum keputusan ','Chỉ số tiền được Admin xác nhận trước khi mở thưởng ','Hanya jumlah yang dikonfirmasi Admin sebelum hasil '],
    '才属于本期有效下注。':['ယခုအကြိမ်အတွက် အကျုံးဝင်သောလောင်းကြေးဖြစ်သည်။','count as valid bets for this round.','จึงถือเป็นเดิมพันที่ถูกต้องของรอบนี้','dikira sebagai pertaruhan sah pusingan ini.','mới được tính là cược hợp lệ của kỳ này.','yang dihitung sebagai taruhan sah putaran ini.'],
    '待审核、已拒绝或仅保存的金额，':['စစ်ဆေးရန်စောင့်နေသော၊ ပယ်ချထားသော သို့မဟုတ် သိမ်းထားရုံသာဖြစ်သော ငွေပမာဏများသည် ','Amounts pending review, rejected, or only saved ','ยอดที่รอตรวจสอบ ถูกปฏิเสธ หรือเพียงบันทึกไว้ ','Jumlah menunggu semakan, ditolak atau hanya disimpan ','Số tiền đang chờ duyệt, bị từ chối hoặc chỉ mới lưu ','Jumlah yang menunggu tinjauan, ditolak, atau hanya disimpan '],
    '不会参与中奖计算。':['အနိုင်ရတွက်ချက်မှုတွင် မပါဝင်ပါ။','do not participate in winning calculations.','จะไม่นำไปคำนวณรางวัล','tidak akan digunakan dalam pengiraan kemenangan.','sẽ không tham gia tính tiền trúng thưởng.','tidak ikut dalam perhitungan kemenangan.'],

    '本期付款已全部确认。':['ယခုအကြိမ်ငွေပေးချေမှုအားလုံး အတည်ပြုပြီးပါပြီ။','All payments for this round are confirmed.','การชำระรอบนี้ได้รับการยืนยันครบแล้ว','Semua bayaran pusingan ini telah disahkan.','Thanh toán kỳ này đã được xác nhận đầy đủ.','Semua pembayaran putaran ini telah dikonfirmasi.'],
    '付款已提交，当前有 ':['ငွေပေးချေမှုတင်ပြီးပါပြီ။ လက်ရှိ ','Payment submitted. Currently ','ส่งการชำระแล้ว ขณะนี้มี ','Bayaran telah dihantar. Kini ','Đã gửi thanh toán. Hiện có ','Pembayaran telah dikirim. Saat ini '],
    ' 正在等待管理员确认。':[' သည် Admin အတည်ပြုရန် စောင့်နေသည်။',' is awaiting Admin confirmation.',' กำลังรอผู้ดูแลยืนยัน',' sedang menunggu pengesahan Admin.',' đang chờ Admin xác nhận.',' sedang menunggu konfirmasi Admin.'],
    '上一笔付款未通过：':['ယခင်ငွေပေးချေမှု မအောင်မြင်ပါ：','Previous payment was rejected: ','การชำระก่อนหน้าไม่ผ่าน: ','Bayaran sebelumnya ditolak: ','Khoản thanh toán trước không được duyệt: ','Pembayaran sebelumnya ditolak: '],
    '上一笔付款未通过，请重新提交。':['ယခင်ငွေပေးချေမှု မအောင်မြင်ပါ။ ပြန်လည်တင်ပါ။','Previous payment was rejected. Please submit again.','การชำระก่อนหน้าไม่ผ่าน กรุณาส่งใหม่','Bayaran sebelumnya ditolak. Sila hantar semula.','Khoản thanh toán trước không được duyệt. Vui lòng gửi lại.','Pembayaran sebelumnya ditolak. Silakan kirim ulang.'],
    '原因：':['အကြောင်းရင်း：','Reason: ','เหตุผล: ','Sebab: ','Lý do: ','Alasan: '],
    '客服暂未配置':['ဝန်ဆောင်မှုကို မသတ်မှတ်ရသေးပါ','Support Not Configured','ยังไม่ได้ตั้งค่าฝ่ายบริการ','Sokongan Belum Ditetapkan','Chưa cấu hình hỗ trợ','Dukungan Belum Dikonfigurasi'],
    '本期付款':['ယခုအကြိမ်ငွေပေးချေမှု','Round Payment','การชำระรอบนี้','Bayaran Pusingan','Thanh toán kỳ này','Pembayaran Putaran'],
    '下注合计':['လောင်းကြေးစုစုပေါင်း','Bet Total','ยอดเดิมพันรวม','Jumlah Pertaruhan','Tổng cược','Total Taruhan'],
    '审核中':['စစ်ဆေးနေသည်','Pending Review','กำลังตรวจสอบ','Menunggu Semakan','Đang xét duyệt','Sedang Ditinjau'],
    '已确认':['အတည်ပြုပြီး','Confirmed','ยืนยันแล้ว','Disahkan','Đã xác nhận','Dikonfirmasi'],
    '现在还需付款':['ယခုပေးချေရန်ကျန်','Amount Remaining','ยอดที่ยังต้องชำระ','Baki Perlu Dibayar','Số tiền còn phải trả','Sisa yang Harus Dibayar'],
    '付款到平台账户':['Platform အကောင့်သို့ပေးချေရန်','Pay to Platform Account','ชำระเข้าบัญชีแพลตฟอร์ม','Bayar ke Akaun Platform','Thanh toán vào tài khoản nền tảng','Bayar ke Akun Platform'],
    '请选择平台收款方式':['Platform ငွေလက်ခံနည်းရွေးပါ','Select platform payment method','เลือกช่องทางรับเงินของแพลตฟอร์ม','Pilih kaedah pembayaran platform','Chọn phương thức thanh toán nền tảng','Pilih metode pembayaran platform'],
    '本次付款金额':['ယခုပေးချေမည့်ငွေ','Payment Amount','ยอดชำระครั้งนี้','Jumlah Bayaran','Số tiền thanh toán','Jumlah Pembayaran'],
    '请输入付款金额':['ပေးချေမည့်ငွေထည့်ပါ','Enter payment amount','กรอกยอดชำระ','Masukkan jumlah bayaran','Nhập số tiền thanh toán','Masukkan jumlah pembayaran'],
    '付款截图 / 凭证':['ငွေပေးချေမှု Screenshot / အထောက်အထား','Payment Screenshot / Proof','ภาพ / หลักฐานการชำระ','Screenshot / Bukti Bayaran','Ảnh / chứng từ thanh toán','Screenshot / Bukti Pembayaran'],
    '备注（可不填）':['မှတ်ချက် (မဖြည့်လည်းရသည်)','Note (Optional)','หมายเหตุ (ไม่บังคับ)','Nota (Pilihan)','Ghi chú (không bắt buộc)','Catatan (Opsional)'],
    '提交付款审核':['ငွေပေးချေမှု စစ်ဆေးရန်တင်ရန်','Submit Payment for Review','ส่งการชำระเพื่อตรวจสอบ','Hantar Bayaran untuk Semakan','Gửi thanh toán để duyệt','Kirim Pembayaran untuk Ditinjau'],
    '付款记录':['ငွေပေးချေမှုမှတ်တမ်း','Payment History','ประวัติการชำระ','Sejarah Bayaran','Lịch sử thanh toán','Riwayat Pembayaran'],
    '暂无付款记录':['ငွေပေးချေမှုမှတ်တမ်း မရှိသေးပါ','No payment history','ยังไม่มีประวัติการชำระ','Tiada sejarah bayaran','Chưa có lịch sử thanh toán','Belum ada riwayat pembayaran'],

    '最近一期结果':['နောက်ဆုံးအကြိမ်ရလဒ်','Latest Round Result','ผลรอบล่าสุด','Keputusan Pusingan Terkini','Kết quả kỳ gần nhất','Hasil Putaran Terbaru'],
    '开奖生肖：':['ပေါက်သောရာသီခွင်：','Winning Zodiac: ','นักษัตรที่ออก: ','Zodiak Pemenang: ','Con giáp trúng: ','Shio Pemenang: '],
    '我的有效下注':['ကျွန်ုပ်၏အတည်ပြုလောင်းကြေး','My Confirmed Bets','เดิมพันที่ยืนยันแล้ว','Pertaruhan Disahkan','Cược đã xác nhận','Taruhan Dikonfirmasi'],
    '命中生肖金额':['ပေါက်ရာသီခွင်ငွေ','Winning Zodiac Amount','ยอดเดิมพันที่ถูกรางวัล','Jumlah Zodiak Menang','Tiền cược trúng con giáp','Jumlah Shio Menang'],
    '本期赔率':['ယခုအကြိမ်အချိုး','Round Odds','อัตราจ่ายรอบนี้','Odds Pusingan','Tỷ lệ kỳ này','Odds Putaran'],
    '中奖返还':['အနိုင်ရပြန်လည်ပေးချေငွေ','Winning Return','ยอดรางวัลคืน','Pulangan Menang','Tiền trúng trả lại','Pengembalian Menang'],
    '未中奖 · 本期已结算':['မပေါက်ပါ · ယခုအကြိမ်ရှင်းပြီး','No Win · Round Settled','ไม่ถูกรางวัล · รอบนี้ปิดบัญชีแล้ว','Tidak Menang · Pusingan Selesai','Không trúng · Kỳ đã quyết toán','Tidak Menang · Putaran Selesai'],
    '已派彩':['ပေးချေပြီး','Paid Out','จ่ายรางวัลแล้ว','Sudah Dibayar','Đã trả thưởng','Sudah Dibayar'],
    '部分派彩 · 剩余 ':['တစ်စိတ်တစ်ပိုင်းပေးချေပြီး · ကျန် ','Partially Paid · Remaining ','จ่ายบางส่วน · คงเหลือ ','Bayaran Sebahagian · Baki ','Đã trả một phần · Còn ','Dibayar Sebagian · Sisa '],
    '待派彩 · 平台应返还 ':['ဆုငွေပေးရန်စောင့် · Platform ပြန်ပေးရမည် ','Pending Payout · Platform Returns ','รอจ่ายรางวัล · แพลตฟอร์มต้องคืน ','Menunggu Bayaran · Platform Perlu Bayar ','Chờ trả thưởng · Nền tảng cần trả ','Menunggu Pembayaran · Platform Harus Membayar '],

    '鼠':['ကြွက်','Rat','หนู','Tikus','Chuột','Tikus'],
    '牛':['နွား','Ox','วัว','Lembu','Trâu','Sapi'],
    '虎':['ကျား','Tiger','เสือ','Harimau','Hổ','Harimau'],
    '兔':['ယုန်','Rabbit','กระต่าย','Arnab','Thỏ','Kelinci'],
    '龙':['နဂါး','Dragon','มังกร','Naga','Rồng','Naga'],
    '蛇':['မြွေ','Snake','งู','Ular','Rắn','Ular'],
    '马':['မြင်း','Horse','ม้า','Kuda','Ngựa','Kuda'],
    '羊':['ဆိတ်','Goat','แพะ','Kambing','Dê','Kambing'],
    '猴':['မျောက်','Monkey','ลิง','Monyet','Khỉ','Monyet'],
    '鸡':['ကြက်','Rooster','ไก่','Ayam','Gà','Ayam'],
    '狗':['ခွေး','Dog','สุนัข','Anjing','Chó','Anjing'],
    '猪':['ဝက်','Pig','หมู','Babi','Heo','Babi']

  };


  function customerTranslateValue(value){

    let result =
    String(
      value
      ??
      ''
    );


    const entries =
    Object.entries(
      CUSTOMER_UI_TEXT
    )
    .sort(
      (a,b)=>
      b[0].length
      -
      a[0].length
    );


    entries.forEach(
      ([zh, translations])=>{

        const index =
        CUSTOMER_LANG_INDEX[
          customerLang
        ];

        const target =
        customerLang === 'zh'
        ?
        zh
        :
        (
          translations[index]
          ||
          zh
        );


        const sources =
        [
          zh,
          ...translations
        ]
        .filter(Boolean)
        .sort(
          (a,b)=>
          b.length
          -
          a.length
        );


        sources.forEach(
          source=>{

            if(
              source
              &&
              source !== target
              &&
              result.includes(
                source
              )
            ){

              result =
              result
              .split(source)
              .join(target);

            }

          }
        );

      }
    );


    return result;

  }


  let customerLanguageApplying =
  false;


  let customerLanguageTimer =
  null;


  function applyCustomerLanguage(){

    if(
      customerLanguageApplying
    ){

      return;

    }


    customerLanguageApplying =
    true;


    try{

      document.documentElement.lang =
      customerLang;


      const walker =
      document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );


      const nodes =
      [];


      while(
        walker.nextNode()
      ){

        const parent =
        walker.currentNode
        .parentElement;


        if(
          parent
          &&
          ![
            'SCRIPT',
            'STYLE'
          ]
          .includes(
            parent.tagName
          )
        ){

          nodes.push(
            walker.currentNode
          );

        }

      }


      nodes.forEach(
        node=>{

          const next =
          customerTranslateValue(
            node.nodeValue
          );


          if(
            next !==
            node.nodeValue
          ){

            node.nodeValue =
            next;

          }

        }
      );


      document
      .querySelectorAll(
        '[placeholder]'
      )
      .forEach(
        el=>{

          const next =
          customerTranslateValue(
            el.placeholder
          );


          if(
            next !==
            el.placeholder
          ){

            el.placeholder =
            next;

          }

        }
      );


      const select =
      document.getElementById(
        'customerLangSelect'
      );


      if(select){

        select.value =
        customerLang;

      }

    }
    finally{

      customerLanguageApplying =
      false;

    }

  }


  function changeCustomerLanguage(
    lang
  ){

    if(
      ![
        'zh',
        'my',
        'en',
        'th',
        'ms',
        'vi',
        'id'
      ]
      .includes(
        lang
      )
    ){

      lang =
      'zh';

    }


    customerLang =
    lang;


    localStorage.setItem(
      CUSTOMER_LANG_KEY,
      lang
    );


    applyCustomerLanguage();

  }


  window.changeCustomerLanguage =
  changeCustomerLanguage;


  function ensureCustomerLanguagePicker(){

    if(
      document.getElementById(
        'customerLangSelect'
      )
    ){

      return;

    }


    const wrap =
    document.createElement(
      'div'
    );


    wrap.style.margin =
    '0 0 14px';


    wrap.innerHTML = `

      <select
        id="customerLangSelect"
        onchange="changeCustomerLanguage(this.value)"
        style="
          text-align:center;
          color:#ecd277;
          font-weight:800;
          background:#101011;
          border:1px solid rgba(214,168,63,.25);
          border-radius:12px;
          padding:12px;
          width:100%;
        ">

        <option value="zh">
          中文
        </option>

        <option value="my">
          မြန်မာ
        </option>

        <option value="en">
          English
        </option>

        <option value="th">
          ไทย
        </option>

        <option value="ms">
          Bahasa Melayu
        </option>

        <option value="vi">
          Tiếng Việt
        </option>

        <option value="id">
          Bahasa Indonesia
        </option>

      </select>

    `;


    const brand =
    document.querySelector(
      '.brand'
    );


    if(
      brand
      &&
      brand.parentNode
    ){

      brand.insertAdjacentElement(
        'afterend',
        wrap
      );

    }

  }


  function scheduleCustomerLanguage(){

    if(
      customerLanguageApplying
    ){

      return;

    }


    clearTimeout(
      customerLanguageTimer
    );


    customerLanguageTimer =
    setTimeout(
      applyCustomerLanguage,
      20
    );

  }


  ensureCustomerLanguagePicker();

  applyCustomerLanguage();


  
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
    applyCustomerLanguage();
  }


    window.refreshCustomerUx =
  refresh;


  window.applyCustomerLanguage =
  applyCustomerLanguage;


  window.addEventListener(
    'load',
    ()=>{

      setTimeout(
        refresh,
        900
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
