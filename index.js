let fetchTick;

window.onload = function(){
    // 기본 이미지 로딩
    fetchImages(6);



    //이벤트 바인딩
    document.getElementById('btn-morehodu').addEventListener('click',() =>{fetchImages()});
}

async function fetchImages(count = 3, callback = appendImages){
    const btn_morehodu = document.getElementById('btn-morehodu');
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
    const btn_morehodu = document.getElementById('btn-morehodu');
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