let fetchTick;

window.onload = function(){
    // 기본 이미지 로딩
    fetchImages(6);

    loadMap();

    //이벤트 바인딩
    document.getElementById('btn_morehodu').addEventListener('click', () =>{fetchImages()});

    document.getElementById('btn_subscribe').addEventListener('click', openSubModal)
}

async function fetchImages(count = 3, callback = appendImages){
    const btn_morehodu = document.getElementById('btn_morehodu');
    if(fetchTick) return ;
    try{
        fetchTick = true;
        btn_morehodu.classList.add('loading');
        const response = await fetch(`https://cataas.com/api/cats?skip=0&width=378&height=378&limit=${count}`);
        const jsonDatas = await response.json();
        const imgPromises = jsonDatas.map(async json =>{
            return await fetch(`https://cataas.com/cat?id=${json._id}`);
        });

        Promise.allSettled(imgPromises).then(results =>{
           return Promise.all(results.map(result => result.value.blob()));
        }).then(blobs =>{
            appendImages(blobs);
        });
    }catch(e){
        console.log(e);
        btn_morehodu.classList.remove('loading');
        return null;
    }finally{
        fetchTick = null;
    }
}

function appendImages(datas){
    const btn_morehodu = document.getElementById('btn_morehodu');
    const ulEl = document.querySelector('ul.showmore');

    datas.forEach(data => {
        const url = window.URL.createObjectURL(data);
        const liEl = document.createElement('li');
        const imgEl = document.createElement('img');
        imgEl.src = url;
        liEl.appendChild(imgEl);
        ulEl.appendChild(liEl);
    });

    btn_morehodu.classList.remove('loading');

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