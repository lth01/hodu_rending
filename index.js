let fetchTick;
const btn_LoadingClass = "loading";
const span_LoadingClass = "loader";

window.onload = function(){
    const mqr = window.matchMedia('(max-width: 390px)');
    mqr.addEventListener('change',(e) =>{
       e.matches ? InitMobileScreen() : InitPcScreen();
    });

    const btn_morehodu = document.getElementById('btn_morehodu');
    const btn_subscribe = document.getElementById('btn_subscribe');
    const btn_arrowUp = document.getElementById('btn_arrowUp');

    // header 기능 미개발 버튼
    const btns_interactLMenu = document.querySelectorAll('.interact-lMenu > button, .mobile > .frame .footer-rside button');

    // footer 기능 미개발 버튼
    const btns_familySites = document.querySelectorAll('.family-sites > button');

    const btns_download = document.querySelectorAll('.btn_download') || [];
    const logos = document.querySelectorAll('.logo');

    // 기본 이미지 로딩
   appendImages(6);

    loadMap();

    //이벤트 바인딩
    btn_morehodu?.addEventListener('click', () =>{appendImages(3)});

    btn_subscribe?.addEventListener('click', openSubModal)

    btns_download.forEach((el)=>{
        el.addEventListener('click', ()=>{downRandCat(el)});
    });

    //이벤트 바인딩 - 화면 상단이동 버튼 포지션 조절
    bindScrollArrowUpEvent(document.querySelector('.main-section-footerarticle'), togglePosArrowBtn);

    //이벤트 바인딩 - 화면 상단이동 버튼
    btn_arrowUp?.addEventListener('click', () =>{
        window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
    });

    logos.forEach(el =>{
        el.addEventListener('click', pageRefresh);
    });

    //미개발 기능 안내 추가
    [...btns_interactLMenu, ...btns_familySites].forEach((el) =>{
        el.addEventListener('click', () =>{
            alert('아직 준비중인 메뉴에요! 나중을 기대해주세요 :)');
        });
    });
}

function bindScrollArrowUpEvent(el = document.querySelector('.main-section-footerarticle'), callback){
    const option = {
        threshold: 0.3 
    };
    const observer = new IntersectionObserver(callback ,option);

    observer.observe(el);
}

async function fetchImages(count = 3){
    if(fetchTick) return ;
    try{
        fetchTick = true;
        const response = await fetch(`https://cataas.com/api/cats?skip=0&width=378&height=378&limit=${count}`);
        const jsonDatas = await response.json();
        const imgPromises = jsonDatas.map(async json =>{
            return await fetch(`https://cataas.com/cat?id=${json._id}`);
        });

        return Promise.allSettled(imgPromises).then(results =>{
           return Promise.all(results.map(async result => await result.value.blob()));
        }).then(blobs =>{
            return blobs;
        });
    }catch(e){
        console.log(e);
        return null;
    }finally{
        fetchTick = null;
    }
}

async function appendImages(count){
    const btn_morehodu = document.getElementById('btn_morehodu');
    const ulEl = document.querySelector('ul.showmore');

    addProgCssBtn(btn_morehodu);

    (await fetchImages(count || 6) || []).forEach(data => {
        const url = window.URL.createObjectURL(data);
        const liEl = document.createElement('li');
        const imgEl = document.createElement('img');
        imgEl.src = url;
        liEl.appendChild(imgEl);
        ulEl.appendChild(liEl);
    });

    removeProgCssBtn(btn_morehodu);
}

async function downRandCat(btnEl){
    if(!btnEl) return ;
    addProgCssBtn(btnEl);

    (await fetchImages(1) || []).forEach(data =>{
        //이미지 다운로드 코드
        const url = window.URL.createObjectURL(data)
        const a = document.createElement("a")
        a.href = url
        a.download = `cat_${new Date().getTime()}.jpeg` 
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url);
    });

    removeProgCssBtn(btnEl);
}

function loadMap(){
    const mapEl = document.getElementById('hoduhouse-map');
    const opt = {
        center: new kakao.maps.LatLng(33.4423379727783, 126.571449734542 ), //지도의 중심좌표.
        level: 4 //지도의 레벨(확대, 축소 정도)
    };
    const map = new kakao.maps.Map(mapEl, opt);
    const marker = new kakao.maps.Marker({
        position: opt.center
    });

    marker.setMap(map);
}

function openSubModal(){
    if(!emailValidate()){ alert('이메일 형식이 알맞지 않습니다.'); return ;}
    // 이미 모달창이 있을경우 열릴 필요 x
    if(document.querySelector('.modal-wrap')) return ;
    //호환성
    if("content" in document.createElement("template")){
        // template 코드 clone
        const template = document.getElementById('hodu-modal');
        const modalFrag = template.content.cloneNode(true);
        const modalWrap = modalFrag.querySelector('.modal-wrap');

        // 이벤트 바인딩
        modalFrag.getElementById('btn_modalClose').addEventListener('click', closeModal);

        //body에 추가
        document.body.appendChild(modalWrap);
    }
}

function closeModal(){
    document.querySelectorAll('.modal-wrap').forEach(el =>{
        el.remove();
    });
}

function emailValidate(){
    const tBx_email = document.getElementById('tBx_email');
    // browser standard validate pattern
    const validatePattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const regEx = new RegExp(validatePattern);

    console.log(tBx_email, tBx_email.value);
    
    return regEx.test(tBx_email.value) ? true : false; 
}

function pageRefresh(){
    location.href = location.href;
}

function togglePosArrowBtn(entries, observe){
    const isInterSecting = entries[0].isIntersecting;
    const wrap_arrowBtn = document.querySelector('.nav-rightaside');

    isInterSecting ? 
    wrap_arrowBtn.classList.add('posUp') :
    wrap_arrowBtn.classList.remove('posUp');
}

function addProgCssBtn(btnEl){
    const loadSpan = document.createElement('span');
    loadSpan.classList.add(span_LoadingClass);
    btnEl.classList.add(btn_LoadingClass);
    btnEl.appendChild(loadSpan);
}

function removeProgCssBtn(btnEl){
   const loadSpan = btnEl.querySelector(`.${span_LoadingClass}`);
   btnEl.classList.remove(btn_LoadingClass);
   btnEl.removeChild(loadSpan);
}

function InitPcScreen(){
    console.log('hi pc');
}

function InitMobileScreen(){
    console.log('hi mobile');
}