  /* ====================================================================
     ▼▼ ここだけ編集すればOK：動画・チャンネル・フォームの設定 ▼▼
     - YouTube動画ID：URLの「watch?v=」の後ろ、または「youtu.be/」の後ろの文字列
       例）https://www.youtube.com/watch?v=abc123XYZ  → 'abc123XYZ'
     - 空文字 '' のままにすると、その枠はプレースホルダー表示のままになります
     ==================================================================== */
  const KASHU_CONFIG = {
    youtubeChannelUrl: 'https://www.youtube.com/watch?v=Z09Ed5ayslc',   // 「▶ この動画をYouTubeで見る」のリンク先。動画1本への直リンク（自社チャンネルができたらそのURLに差し替え可）
    videos: {
      main: 'Z09Ed5ayslc',   // メイン動画：能美市 加州石産㈱ 正社員募集【公式】
      sub1: '',              // サブ動画1のID（ドローン空撮など）
      sub2: ''               // サブ動画2のID（作業風景など）
    },
    googleFormUrl: '',       // （方式Aを使う場合）GoogleフォームのURL

    /* ============================================================
       ▼▼ 問い合わせフォームの接続設定（方式B：見た目そのまま送信）▼▼
       Googleフォーム作成後、下の2つを埋めるだけで送信が有効になります。
         1) formResponseUrl … フォームの送信先。末尾は必ず /formResponse
            例）https://docs.google.com/forms/d/e/XXXXXXXX/formResponse
         2) entries … 各項目に対応する entry ID（例 'entry.1234567890'）
       ※ formResponseUrl が空の間は「見本」状態のまま（送信は無効）。
       ※ 設定すると「見本」注意書きは自動で消え、送信後に完了メッセージを表示します。
       ============================================================ */
    form: {
      formResponseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdCg4jJb2tFPUpACbkoPNi3QD3CvIMF5XuVl8Ki7uS0wnzhog/formResponse',
      entries: {
        CATEGORY: 'entry.786512268',    // ご相談の種類（ラジオ・必須）
        COMPANY:  'entry.1384097456',   // 会社名・屋号
        NAME:     'entry.1465276450',   // ご担当者名（必須）
        TEL:      'entry.854611767',    // 電話番号（必須）
        EMAIL:    'entry.1748101611',   // メールアドレス
        DATE:     'entry.1768134552',   // 搬入・納品の予定日
        TRUCK:    'entry.1847134824',   // 車種
        AREA:     'entry.2132249407',   // 現場の所在地
        MESSAGE:  'entry.769314318'     // ご相談内容
      }
    }
  };

  // --- 動画枠を設定に応じて埋め込みに差し替え ---
  (function applyVideos(){
    Object.entries(KASHU_CONFIG.videos).forEach(([key,id])=>{
      if(!id) return;
      const box=document.querySelector('.vframe[data-embed="'+key+'"]');
      if(!box) return;
      box.classList.remove('placeholder');
      box.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'" '+
        'title="加州石産 現場動画" loading="lazy" allowfullscreen '+
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>';
    });
    // チャンネルリンク
    const ch=document.getElementById('ytChannel');
    if(ch){ if(KASHU_CONFIG.youtubeChannelUrl){ ch.href=KASHU_CONFIG.youtubeChannelUrl; } else { ch.style.display='none'; } }
    // Googleフォーム（方式A）リンク
    const gf=document.getElementById('gformUrl');
    if(gf && KASHU_CONFIG.googleFormUrl){ gf.href=KASHU_CONFIG.googleFormUrl; gf.style.display='inline'; }
  })();

  const burger=document.getElementById('burger');
  const mm=document.getElementById('mobileMenu');
  burger.addEventListener('click',()=>mm.classList.toggle('open'));
  mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mm.classList.remove('open')));
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // --- お問い合わせフォーム：Googleフォーム接続 & 送信完了メッセージ ---
  (function setupForm(){
    const form=document.getElementById('kashuForm');
    if(!form) return;
    const cfg=(KASHU_CONFIG.form)||{};
    const notice=document.getElementById('formNotice');
    const success=document.getElementById('formSuccess');
    const hidden=document.getElementById('kashuHidden');
    const configured=!!(cfg.formResponseUrl && cfg.formResponseUrl.indexOf('/formResponse')>-1);

    if(configured){
      // 送信先を設定
      form.setAttribute('action',cfg.formResponseUrl);
      // 各項目に実 entry ID を割り当て（data-key で対応付け）
      const entries=cfg.entries||{};
      form.querySelectorAll('[data-key]').forEach(el=>{
        const id=entries[el.getAttribute('data-key')];
        if(id){ el.setAttribute('name',id); }
        else { el.removeAttribute('name'); }   // 未設定項目は送信しない
      });
      // 「見本」注意書きを消す
      if(notice){ notice.style.display='none'; }
    }

    // 送信ハンドラ
    let submitted=false;
    form.addEventListener('submit',function(e){
      if(!configured){
        // 未接続時は送信をブロック
        e.preventDefault();
        alert('このフォームは現在「見本」の状態です。\nお手数ですが、お電話（076-277-1107）にてご連絡ください。');
        return;
      }
      // Googleフォーム標準の「その他」欄は、値をそのまま送ると弾かれる。
      // 「__other_option__」＋別項目(.other_option_response)に本文、という形式で送る必要がある。
      const other=form.querySelector('input[type=radio][data-other]:checked');
      if(other && other.name){
        const originalValue=other.value;
        const extra=document.createElement('input');
        extra.type='hidden';
        extra.name=other.name+'.other_option_response';
        extra.value=other.getAttribute('data-other')||originalValue;
        form.appendChild(extra);
        other.value='__other_option__';
        // 送信データの組み立て後（次のタスク）に元へ戻す ※再送信時に壊れないように
        setTimeout(function(){ other.value=originalValue; extra.remove(); },0);
      }

      // 接続済み：隠しiframeへPOST（ページ遷移なし）。完了はiframeのloadで検知。
      submitted=true;
    });

    // 隠しiframeの読み込み完了＝Googleフォーム送信完了
    if(hidden){
      hidden.addEventListener('load',function(){
        if(!submitted) return;   // 初期表示時のloadは無視
        if(form) form.style.display='none';
        if(notice) notice.style.display='none';
        const alt=document.querySelector('.form-alt'); if(alt) alt.style.display='none';
        if(success){
          success.style.display='block';
          success.scrollIntoView({behavior:'smooth',block:'center'});
        }
        submitted=false;
      });
    }
  })();
