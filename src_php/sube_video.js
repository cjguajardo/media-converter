var accion_video = 1,
  h = 726,
  w = 650,
  id_publi = 0,
  llave_app = Math.random().toString(36).substring(2, 15),
  tokenaws = 'gyu';
function mflex(i) {
  // document.getElementById(i).style.display = 'flex';
}
function lg(nv) {
  return localStorage.getItem(nv);
}
function ls(nv, v) {
  localStorage.setItem(nv, v);
}
function va(i) {
  return document.getElementById(i).value;
}
function initdb() {
  const request = window.indexedDB.open('pwaR25', 1);
  request.onerror = function (e) {
    alert('Error IndexedDb: ' + e);
    console.log('error: ');
  };

  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var J = db.createObjectStore('multimedia', { keyPath: 'id' });
    J.createIndex('id_recurso', 'id_recurso', { multiEntry: true });
    J.createIndex('indice', 'indice', { multiEntry: true });
    J.createIndex('estado', 'estado', { multiEntry: true });
    J.createIndex('trama', 'trama', { multiEntry: true });
    J.createIndex('crc', 'crc', { multiEntry: true });
    var J = db.createObjectStore('multimedia_recurso', { keyPath: 'id' });
    J.createIndex('id_recurso', 'id_recurso', { multiEntry: true });
    J.createIndex('b64', 'b64', { multiEntry: true });
    J.createIndex('id_publi', 'id_publi', { multiEntry: true });
    J.createIndex('ancho', 'ancho', { multiEntry: true });
    J.createIndex('alto', 'alto', { multiEntry: true });
    J.createIndex('progreso', 'progreso', { multiEntry: true });
    J.createIndex('img', 'img', { multiEntry: true });
  };

  cdb = window.indexedDB.open('pwaR25', 1);
  cdb.onsuccess = function (event) {
    db = cdb.result;
    console.log('conexion indexdb OK!:)');
  };
}
initdb();
function ubicate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert('Geolocation is not supported by this browser');
  }
}

function showPosition(position) {
  vava('lat', position.coords.latitude);
  vava('lon', position.coords.longitude);
  vava(
    'ubi',
    'https://maps.google.com/?q=' +
      position.coords.latitude +
      ',' +
      position.coords.longitude
  );
  ubiok();
}
async function audio_principal(id) {
  vap = document.querySelector('#' + id);
  fileName = vap.value;
  //mime=vap.files[0].type;
  extension = fileName.split('.').pop();
  mime = 'audio/' + extension;
  try {
    espere_audio();
  } catch (e) {}
  const myInput = vap;
  const formData = new FormData();
  formData.append('file', myInput.files[0]);
  fetch('https://media-convert.redmin.cl/convert', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: 'Bearer ' + tokenaws,
    },
  })
    .then(response => {
      return response.json();
    })
    .then(text => {
      audiok(text.file);
      vava(id, '');
    });
}
async function foto_principal(id) {
  try {
    mientras();
  } catch (e) {}
  vap = document.querySelector('#' + id);
  fileName = vap.value;

  extension = fileName.split('.').pop();
  mimo = 'image/' + extension;
  if (extension == 'jpg') mimo = 'image/jpeg';

  const d = new Date();
  let ahora = d.getTime();
  name = 'foto_' + va('pwa0') + '_' + ahora;

  const myInput = vap;
  const formData = new FormData();
  aver = URL.createObjectURL(myInput.files[0]);
  try {
    useblob(aver);
  } catch (e) {}
  if (
    navigator.userAgent.search('Safari') >= 0 &&
    navigator.userAgent.search('Chrome') < 0
  ) {
    compresion = 2;
  } else {
    compresion = 77;
  }
  const blob = await comprimirImagen(myInput.files[0], parseInt(compresion));
  //console.log({ blob });
  formData.append('img', blob);
  sid = id.substr(1, 100);
  try {
    acla(sid, 'espere');
    seta(sid, 'style', '');
  } catch (e) {}
  fetch(
    'https://rie.cl/1/0/src/subir_foto.php?extension=' +
      extension +
      '&medio=' +
      medio +
      '&width=' +
      anchoi +
      '&height=' +
      altoi +
      '&mime=' +
      mimo +
      '&name=' +
      name +
      '&yx=' +
      yx,
    {
      method: 'POST',
      body: formData,
    }
  )
    .then(response => {
      return response.text();
    })
    .then(text => {
      eval(text);
    });
  setTimeout(function () {
    fetch(
      'https://rie.cl/1/0/src/subir_foto_2.php?extension=' +
        extension +
        '&medio=' +
        medio +
        '&width=' +
        anchoi +
        '&height=' +
        altoi +
        '&mime=' +
        mimo +
        '&name=' +
        name,
      {
        method: 'POST',
        body: formData,
      }
    )
      .then(response => {
        return response.text();
      })
      .then(text => {
        eval(text);
      });
  }, 1000);
}
const comprimirImagen = (imagenComoArchivo, porcentajeCalidad) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');

    const imagen = new Image();
    imagen.onload = () => {
      width = imagen.width;
      height = imagen.height;
      if (width > 1999) {
        height = (2000 * height) / width;
        width = 2000;
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(imagen, 0, 0, width, height);
      eeff = extension;
      if (
        navigator.userAgent.search('Safari') >= 0 &&
        navigator.userAgent.search('Chrome') < 0
      ) {
        if (eeff == 'webp') {
          eeff = 'png';
          extension = 'png';
        }
      } else {
        if (eeff == 'webp') {
          eeff = 'jpeg';
          extension = 'jpeg';
        }
      }
      if (extension == 'jpg') eeff = 'jpeg';
      if (extension == 'gif') {
        eeff = 'webp';
        extension = 'gif';
      }
      anchoi = width;
      altoi = height;
      canvas.toBlob(
        blob => {
          if (blob === null) {
            return reject(blob);
          } else {
            resolve(blob);
          }
        },
        'image/' + eeff,
        porcentajeCalidad / 100
      );
    };
    imagen.src = URL.createObjectURL(imagenComoArchivo);
  });
};
function submitChunks() {
  const file = document.getElementById('ivideo0').files[0];
  const x = 10;

  fileToBase64(file).then(base64 => {
    const chunkSize = Math.ceil(base64.length / x);
    const chunks = [];
    const base64crc = crc32(base64);

    while (base64.length > 0) {
      chunks.push(base64.substring(0, chunkSize));
      base64 = base64.substring(chunkSize);
    }

    console.log({
      chunks,
      chunkSize,
    });

    const json = [];
    chunks.forEach((chunk, index) => {
      fetch('https://media-convert.redmin.cl/upload-chunk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chunk,
          max: chunks.length,
          index: index + 1,
          id: '34e6rftyv87',
          crc: base64crc,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log({
            data,
          });
          if (data.success) {
            console.log('success');
          } else {
            console.log('error');
          }
        })
        .catch(error => {
          console.log('error', error);
        });
    });
  });
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function camo(timo) {
  r = `accion=789&ya=` + va('ya' + l) + '&timo=' + timo;
  f(r);
}

function cargadmin() {
  r = `accion=1&ya=` + va('ya' + l);
  f(r);
}

function ubiok() {
  carga_mapa();
}

function cliko() {
  cli('oko');
}
function muco() {
  m('coco');
  paletap = paleta.split('onclick').join(`onclick='cliko()' onmouseover`);
  ihs('cepa', paletap);
  SBi('s' + l, 0);
}

function respaki0() {
  ihs(
    'paki0',
    `<i onclick="ihs('paki0','<u>Por favor Espere...</u>');nuevap(1)">+</i>`
  );
}

function FM(j) {
  ant = l - 1;
  /////hb();
  ////if(j==1){hb();ti(333,`accion_foto=1;yx=va('ya'+l);cli('iportada'+l)`);}
  if (j == 1) {
    ti(333, `accion_foto=1;yx=va('ya'+ant);cli('iportada'+ant)`);
  }
  ////if(j==2){hb();ti(333,`accion_video=1;yx=va('ya'+l);cli('ivideo'+l)`);}
  if (j == 2) {
    ti(333, `accion_video=1;yx=va('ya'+ant);cli('ivideo'+ant)`);
  }
  if (j == 3) ti(333, `accion_audio=1;yx=llave_app;cli('audio0')`);
  if (j == 4) {
    ti(333, `id_publi='-1';pwa=va('pwa'+ant);instancia(13,0,va('ya'+ant))`);
  }
  ////if(j==5){hb();ti(333,`instancia(14,0,va('ya'+l))`);}
  if (j == 5) {
    hb();
    ti(333, `instancia(14,0,va('ya'+l))`);
  }
  if (j == 6) {
    hb();
    ti(333, `id_publi='-1';pwa=va('pwa'+l);instancia(4,0,va('ya'+l))`);
  }
  if (j == 7) {
    ti(333, `yx=0;cli('iportada0')`);
  }
  ///foto att
  if (j == 8) {
    ti(333, `accion_video=100;yx=0;cli('ivideo0')`);
  }
  ///video gale publicacion
  if (j == 9) ti(333, `accion_audio=2;yx=0;cli('audio0')`);
  ///audio gale publicacion
  if (j == 10) ti(333, `accion_file=2;yx=0;cli('fil')`);
  ///file gale publicacion
  if (j == 11) ti(333, `accion_audio=3;cli('audio0')`);
  ///audio en foto multimedia
}

function nuevap(orden) {
  r = `accion=100&ya=` + llave_app + '&orden=' + orden;
  f(r);
}

function grabarco() {
  r =
    `accion=111&co1=` +
    va('co1') +
    '&co2=' +
    va('co2') +
    '&co3=' +
    va('co3') +
    '&ya=' +
    llave_app;
  f(r);
}
function F(c1, c2, c3) {
  vava('co1', c1);
  vava('co2', c2);
  vava('co3', c3);
  ihs(
    'cssi' + l,
    `
.topc,.ipc b u{background:${c2}}
.rie u svg{fill:#fff}
.rie u:hover{background:${c3}}
.iiiiiiipc{background:linear-gradient(${c2}90,#ffffff);}
.ipc b svg{fill:${c2}}
.ipc b i{color:${c2}}
.dpc{background:${c2}50}
.ipc::-webkit-scrollbar-thumb {background:${c2}70}
.sggal s{background:${c2}90}
.medio2 .mod h1{color:${c2}}
.sggal span{background:${c2}10}



.top svg{fill:${c1}}.cc,.top i{color:${c1}}
.medio1 .slat,.top s{background:${c2}}
.n .slat,.n .top s{background:linear-gradient(${c2},#000000);}
.fc{border:7px ${c2} solid}
.bapp{border:1px ${c2}70 solid}
.n .bapp{border:1px ${c2}90 solid}
.rrss svg{fill:${c3}}
.n .rrss svg{fill:${c1}}
.botones b{background:${c2}}
.botones svg{fill:${c1}}
.botones i{color:${c1}}
.mecan b svg{fill:${c3}}

.eemedio1 .slat{background:linear-gradient(${c2},#ffffff);}
.eemedio1 .top s{background:linear-gradient(${c2},#ffffff);}

.een .top s{background:linear-gradient(${c2},#000000);}


`
  );
}

function b64toblob(base, id, tipo) {
  if (base != '')
    fetch(base)
      .then(res => res.blob())
      .then(blob => {
        console.log(blob);
        blobo = URL.createObjectURL(blob);
        ////alert(blobo)
        if (tipo == 1) {
          seta(id, 'src', blobo);
          video_portada = blobo;
        }
        if (tipo == 2) seta(id, 'src', blobo);
      });
}

var crc32 = function (rr) {
  for (var a, o = [], c = 0; c < 256; c++) {
    a = c;
    for (var f = 0; f < 8; f++) a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
    o[c] = a;
  }
  for (var n = -1, t = 0; t < rr.length; t++)
    n = (n >>> 8) ^ o[255 & (n ^ rr.charCodeAt(t))];
  return (-1 ^ n) >>> 0;
};

function disparar(idmu) {
  ////alert(idmu);
  var och = db.transaction('multimedia', 'readwrite').objectStore('multimedia');
  var rch = och.get(idmu);
  rch.onsuccess = function (event) {
    var ht = rch.result;
    estado = ht.estado;
    id_m = ht.id;
    id_recurso = ht.id_recurso;
    indice = ht.indice;
    tramadol = ht.trama;
    crc = ht.crc;
    tokenaws = 'aaa';
    const formData = new FormData();
    formData.append('trama', tramadol);
    formData.append('indice', indice);
    formData.append('id_m', id_m);
    formData.append('id_recurso', id_recurso);

    if (estado == 0) {
      (async () => {
        const rawResponse = await fetch(
          // 'https://media-convert.redmin.cl/upload-chunk',
          'http://localhost:8099/upload-chunk',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + tokenaws,
            },
            body: JSON.stringify({
              chunk: tramadol,
              max: 100,
              index: indice,
              id: id_recurso,
              id_recurso: id_recurso,
              crc: crc,
            }),
          }
        );
        if (rawResponse.status == 200) {
          console.log(
            'rawResponse.status--------' + indice + ' --- ' + rawResponse.status
          );
          console.log({
            rawResponse,
          });

          prox = parseInt(indice) + parseInt(1);
          console.log('enviando-------:' + prox);
          if (indice <= 100) okmulti(id_m, id_recurso, prox);
          ///alert('$indice $trama');
          else alert('fin');
        }
        //const content = await rawResponse.json();
        //console.log(content);
      })();
    } else {
      prox = parseInt(indice) + parseInt(1);
      disparar(id_recurso + '_' + prox);
    }
  };
}

function okmulti(idm, rec, prox) {
  if (prox <= 100) {
    var och = db
      .transaction('multimedia', 'readwrite')
      .objectStore('multimedia');
    var rch = och.get(idm);
    rch.onsuccess = function (event) {
      ////

      var da = rch.result;
      id_recurso = da.id_recurso;
      da.estado = 1;
      var upch = och.put(da);

      var ttnn = db
        .transaction('multimedia_recurso', 'readwrite')
        .objectStore('multimedia_recurso');
      var kkk = ttnn.index('id_recurso').get(id_recurso);
      kkk.onsuccess = function (event) {
        var { progreso } = kkk.result ?? {};
        console.log({ progreso });
        if (typeof progreso !== 'undefined') {
          proa = oda.progreso;
          oda.progreso = prox;
          var fvg = ttnn.put(kkk.result);
        }
        ////////try{console.log('pro_'+id_recurso+' --indice:'+indice);ihs('pro_'+id_recurso,' '+proa)}catch(e){}
      };

      //////////console.log('okm='+idm);
      ///////////var raa=db.transaction(["multimedia"],"readwrite").objectStore("multimedia").delete(idm);

      if (prox <= 100) disparar(rec + '_' + prox);
      /////else alert('termino');
    };
  }
}

function progre() {
  ///cdb=window.indexedDB.open("pwaR25", 1);cdb.onsuccess=function(event){db=cdb.result;
  var q2 = db
    .transaction('multimedia_recurso', 'readwrite')
    .objectStore('multimedia_recurso');
  can = q2.count();
  can.onsuccess = function () {
    n = can.result;
    if (can > 0) mflex('pepro');
    /////console.log('xxxxxxxxxxxxxx');
    ct = 1;
    q2.openCursor().onsuccess = function (event) {
      var ht = event.target.result;
      ////////console.log('yyyyyyyyyyyyyyyy');
      if (ht) {
        id_recurso = ht.value.id_recurso;
        progreso = ht.value.progreso;
        proxi = parseInt(progreso) + parseInt(1);
        disparar(id_recurso + '_' + proxi);
        //////
        console.log(
          'zzzzzzzzzzzzzzz' + id_recurso + ' rrrrrrrrrrrrr---- ' + proxi
        );
        ht.continue();
        ct++;
      }
    };
  };
  //////}
}

function getBase64(file, tipomulti, id, id_publi, ancho, alto) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    b64 = reader.result;
    largo = b64.length;
    lt = largo / 100;
    ///////alert(b64.length)
    const dT = new Date();
    let time = dT.getTime();

    cdb = window.indexedDB.open('pwaR25', 1);
    cdb.onsuccess = async function (event) {
      db = cdb.result;

      if (id == 'video_portada') {
        var raa = (db
          .transaction(['multimedia_recurso'], 'readwrite')
          .objectStore('multimedia_recurso')
          .delete(id).onsuccess = function (event) {
          var rm = (db
            .transaction(['multimedia_recurso'], 'readwrite')
            .objectStore('multimedia_recurso')
            .add({
              id: id,
              id_recurso: 'trama_' + llave_app + '_' + time,
              b64: b64,
              id_publi: id_publi,
              ancho: ancho,
              alto: alto,
            }).onsuccess = function (event) {
            eval(lg('haga'));
          });
        });
      } else {
        idmr = 'trama_' + llave_app + '_' + time;
        var rm = db
          .transaction(['multimedia_recurso'], 'readwrite')
          .objectStore('multimedia_recurso')
          .add({
            id: 'trama_' + llave_app + '_' + time,
            b64: '',
            nombre: id,
            id_recurso: 'trama_' + llave_app + '_' + time,
            b64: '',
            id_publi: id_publi,
            ancho: ancho,
            alto: alto,
          });
      }

      crc = crc32(b64);

      kt = 1;
      alert(b64);
      const chunkSize = Math.ceil(b64.length / 100);
      const chunks = [];
      const id_recurso = 'trama_' + llave_app + '_' + time;

      while (b64.length > 0) {
        chunks.push(b64.substring(0, chunkSize));
        trama = b64.substring(0, chunkSize);
        b64 = b64.substring(chunkSize);

        var rm = (db
          .transaction(['multimedia'], 'readwrite')
          .objectStore('multimedia')
          .add({
            id: 'trama_' + llave_app + '_' + time + '_' + kt,
            id_recurso: id_recurso,
            indice: kt,
            trama: trama,
            estado: 0,
            crc: crc,
          }).onsuccess = function (event) {});
        kt++;
      }

      chunks.forEach(async (chunk, index) => {
        await fetch(
          // 'https://media-convert.redmin.cl/upload-chunk',
          'http://localhost:8099/upload-chunk',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + tokenaws,
            },
            body: JSON.stringify({
              chunk,
              max: 100,
              index: index + 1,
              id: id_recurso,
              crc: crc,
            }),
          }
        );
      });

      // disparar('trama_' + llave_app + '_' + time + '_1');
      // mflex('pepro');
    };
  };
  reader.onerror = function (error) {
    alert('Error: ', error);
  };
}

function sube_video() {
  ///l=l-1;
  app = va('pwa0');

  //vap = document.querySelector('#ivideo'+l);
  vap = document.querySelector('#ivideo0');
  fileName = vap.value;
  extension = fileName.split('.').pop();
  mime = 'video/' + extension;

  const myInput = vap;
  /////const formData = new FormData();
  peso = myInput.files[0].size;

  //////////
  if (accion_video == 1) {
    limite = 20000000;
    menosde = 20;
    depo = 'de portada';
  }
  if (accion_video == 100) {
    limite = 50000000;
    menosde = 50;
    depo = '';
  }
  if (peso < limite) {
    ////formData.append("img", myInput.files[0]);
    aver = URL.createObjectURL(myInput.files[0]);

    blob = myInput.files[0];
    console.log('blob:' + blob);
    const videoBlob = new Blob([blob], {
      type: 'video/mp4',
    });
    const formData = new FormData();
    ///formData.append('file', videoBlob, 'video.mp4');
    formData.append('file', myInput.files[0]);

    eval(`fov_${app}=1`);
    eval(`video_portada_${app}=aver`);
    video_portada = aver;

    const $video = document.createElement('video');
    $video.src = aver;
    $video.addEventListener('loadedmetadata', function () {
      ancho = this.videoWidth;
      alto = this.videoHeight;
      R = alto / ancho;
      cv = '';
      if (alto > ancho) cv = 'class="vertical"';
      W = 140 / R;
      es1 = '';
      if (ancho > alto) {
        es1 = 'width:210vw;left:-55vw';
      }
      vh1 = h / w;
      Wvw = W * vh1;
      L2 = Wvw / 2 - 50;
      L1 = W - 50;
      if (id_publi == 0) idmr = 'video_portada';
      if (id_publi > 0) idmr = 'base_video_' + id_publi + '_f' + nf;

      tipomulti = 1;
      ///video
      getBase64(myInput.files[0], 1, idmr, id_publi, ancho, alto);
      ////////submitChunks();

      if (accion_video == 1) {
        ////ihs('conte','<div class="card espere" style="height:94vw">Cargando Video, Por favor espere...</div>');
        //indb=1;
        ls(
          'haga',
          `videok(aver,yx,'https://rie2024.s3.amazonaws.com/51_i_201219236150.67068dd2.1956566abcd.full.webp')`
        );
      }

      if (accion_video == 100) {
        coto(1);
        idf = 'f' + nf;
        ihm(
          'gale',
          '<div id="' +
            idf +
            '" class="espere" style="order:' +
            nf +
            '"></div><span id="a' +
            idf +
            '"></span>'
        );
        seta('video', 'src', aver);
        //////imgvideo=capture();videok(aver,0,imgvideo);
        m('video');
        ti(1000, 'imgvideo=capture();');
        ti(3000, `o('video');videok(aver,0,imgvideo)`);
      }
      if (accion_video == 101) {
        coto(1);
        idf = 'f' + nf;
        ihm(
          'gale',
          '<div id="' +
            idf +
            '" class="espere"></div><span id="a' +
            idf +
            '"></span>'
        );
      }

      if (accion_video == 10100000) {
        ///alert(accion_video);
        r = `accion=1&tipo=2&vurl=` + aver;
        f(r);
        ///este f(r) se hace en la instancia agregar modulo, accion=1
        hb();
        setTimeout(function () {
          SB();
        }, 500);
        m('calmao' + lan);
      }
    });
  } else
    alert(
      'Lo sentimos, el video ' +
        depo +
        ' debe pesar menos de ' +
        menosde +
        'MB...'
    );
}

nf = 1;
function espere_audio() {
  if (accion_audio == 1)
    ihs(
      'conteaudio',
      '<div class="card espere" style="height:94vw">Cargando Audio, Por favor espere...</div>'
    );
  if (accion_audio == 2) {
    coto(1);
    idf = 'f' + nf;
    ihm(
      'gale',
      '<div id="' +
        idf +
        '" class="espere" style="order:' +
        nf +
        '"></div><span id="a' +
        idf +
        '"></span>'
    );
  }
  if (accion_audio == 3) {
    mflex('espea');
    o('agdu');
    //////seta('agdu','onclick','');ihs('agdu',``)
  }
}

function audiok(auu) {
  if (accion_audio == 1)
    ihs(
      'conteaudio',
      `<audio src="${auu}" controls></audio><div class="card"><b class="link" onclick="usau('${auu}')">Usar este Audio</b></div>`
    );
  if (accion_audio == 2) {
    fra =
      'https://rie2024.s3.amazonaws.com/51_i_186189734.efb653e.1730497813109687.full.webp';
    seta(idf, 'class', '');
    axff = `
<input style="display:none" type="file" name="img" id="if${nf}" onchange="foto_principal(this.id)" accept="image/*">
<input type="hidden" id="i_foto_${id_publi}_f${nf}" value="${fra}" formu${l}>
<input type="hidden" id="i_audio_${id_publi}_f${nf}" value="${auu}" formu${l}>
<input type="hidden" id="i_text_${id_publi}_f${nf}" value="">
<input type="hidden" id="i_conte_${id_publi}_f${nf}" value="">
`;
    axff = parset(axff);
    ihs('a' + idf, axff);
    seta(
      idf,
      'style',
      'order:' +
        nf +
        ';background:url(' +
        fra +
        ') top center!important;background-size:cover!important'
    );
    seta(idf, 'onclick', `noe=0;gnf='${nf}';gidf='${idf}';instancia(15,0,0)`);
    nf++;
    pumul();
    coto(2);
    vava('audio0', '');
  }

  if (accion_audio == 3) {
    ihm('efo', `<audio id="auli" src="${auu}" controls></audio>`);
    vava('audiolibro', auu);
    o('espea');
    o('agdu');
    mflex('sadu');
  }
}

function cambia_prin(clase) {
  ///alert(fovo+' -- '+clase);
  try {
    if (fovo == 0) G(1, varyy, foto_subida);
    if (fovo == 1) G(2, varyy, video_subido);
    if (fovo == 2) {
      G(22, varyy, '');
    }
  } catch (e) {}
  if (fovo == 2)
    ihs('prin0', '<div class="card espere" style="height:94vw"></div>');
  setTimeout(function () {
    r = `accion=10&clase=` + clase + `&ya=` + va('ya' + l) + `&fovo=` + fovo;
    f(r);
  }, 1000);
}

function sufi(id) {
  vap = document.querySelector('#' + id);
  fileName = vap.value;
  extension = fileName.split('.').pop();
  const myInput = vap;
  const formData = new FormData();
  formData.append('img', myInput.files[0]);
  espefi();
  fetch(
    'https://rie.cl/1/0/src/file.php?extension=' +
      extension +
      '&medio=' +
      medio,
    {
      method: 'POST',
      body: formData,
    }
  )
    .then(response => {
      return response.text();
    })
    .then(text => {
      eval(text);
    });
}

function filok(archi) {
  if (accion_file == 2) {
    fra =
      'https://rie2024.s3.amazonaws.com/51_i_186189734.efb686f.1730498630462124.full.webp';
    seta(idf, 'class', '');
    axff = `
<input style="display:none" type="file" name="img" id="if${nf}" onchange="foto_principal(this.id)" accept="image/*">
<input type="hidden" id="i_foto_${id_publi}_f${nf}" value="${fra}" formu${l}>
<input type="hidden" id="i_archi_${id_publi}_f${nf}" value="${archi}" formu${l}>
<input type="hidden" id="i_text_${id_publi}_f${nf}" value="">
<input type="hidden" id="i_conte_${id_publi}_f${nf}" value="">
`;
    axff = parset(axff);
    ihs('a' + idf, axff);
    seta(
      idf,
      'style',
      'order:' +
        nf +
        ';background:url(' +
        fra +
        ') top center!important;background-size:cover!important'
    );
    seta(idf, 'onclick', `noe=0;gnf='${nf}';gidf='${idf}';instancia(15,0,0)`);
    nf++;
    pumul();
    coto(2);
    vava('fil', '');
  }
  //
}

function espefi(archi) {
  if (accion_file == 2) {
    coto(1);
    idf = 'f' + nf;
    ihm(
      'gale',
      '<div id="' +
        idf +
        '" class="espere" style="order:' +
        nf +
        '"></div><span id="a' +
        idf +
        '"></span>'
    );
  }
}

function syt() {
  p = prompt('Ingrese el link del video en Youtube:', vayt);
  if (p != null) {
    if (accion_yt == 1) {
      r = `accion=1&tipo=3&vurl=` + p + `&ya=` + va('ya' + l);
      f(r);
      ///este f(r) se hace en la instancia agregar modulo, accion=1
      hb();
      setTimeout(function () {
        SB();
      }, 500);
      m('calmao');
    }

    if (accion_yt == 2) {
      r = `accion=8&vurl=` + p + `&idm=` + idm + `&ya=` + va('ya' + l);
      f(r);
    }
  }
}

function usebloba(blob) {
  //if(accion_audio==1)
  //alert(va('pwa'+l));
  eval(`audio_portada_${va('pwa' + l)}=blob;`);
  clase = document.querySelector('#prin' + l + ' .p').className;
  nca = clase.split('p ').join('');
  cargaprin(nca);
}

function useblob(blob) {
  lan = l - 1;
  if (accion_foto == 101) {
    r = `accion=1&tipo=1&vurl=` + blob;
    f(r);
    ///este f(r) se hace en la instancia agregar modulo, accion=1
    hb();
    setTimeout(function () {
      SB();
    }, 500);
    m('calmao' + lan);
  }

  if (accion_foto == 102) {
    document.querySelector('#' + idm + ' .foto').style =
      'background:url(' + blob + ') center center;background-size:cover';
  }

  if (accion_foto == 1) {
    ihs(
      'conte',
      '<div class="card espere" style="height:94vw">Cargando Imagen, Por favor espere...</div>'
    );
    eval(`fov_${va('pwa' + l)}=0;`);
    /*
eval(`foto_portada_${va('pwa'+l)}=blob;`);
seta('portada','style','background:url('+blob+') center center;background-size:cover');
ihs('vavi','');
FM(5);
*/
  }

  if (accion_foto == 1001) {
    ihs('fatt1', '');
    seta('fatt1', 'class', 'espere');
  }
  if (accion_foto == 1002) {
    ihs('fatt2', '');
    seta('fatt2', 'class', 'espere');
  }
  if (accion_foto == 1003) {
    ihs('fatt3', '');
    seta('fatt3', 'class', 'espere');
  }
  if (accion_foto == 1004) {
    ihs('fatt4', '');
    seta('fatt4', 'class', 'espere');
  }
}

function fotok(foto, yy) {
  if (accion_foto == 101) {
    r = `accion=6&foto=` + foto + `&ym=` + ym + `&ya=` + va('ya' + l);
    f(r);
  }
  if (accion_foto == 102) {
    r = `accion=7&foto=` + foto + `&idm=` + idm + `&ya=` + va('ya' + l);
    f(r);
  }
  if (accion_foto == 103) {
    r = `accion=103&foto=` + foto + `&yf=` + yy + `&idf=` + gidf;
    f(r);
  }
  ///update foto app_publicaciones multi
  //if(accion_foto==3){r=`accion=11&foto=`+foto+`&ya=`+va('ya'+l);f(r);}

  if (accion_foto == 1) {
    eval(`foto_portada_${app}=foto`);
    foto_subida = foto;
    varyy = yy;
    fovo = 0;
    FM(5);
  }
  /////G(1,yy,foto);G(1,varyy,foto_subida);
  if (accion_foto == 1001) {
    vava('iportada0', '');
    sefatt(1, foto);
  }
  if (accion_foto == 1002) {
    vava('iportada0', '');
    sefatt(2, foto);
  }
  if (accion_foto == 1003) {
    vava('iportada0', '');
    sefatt(3, foto);
  }
  if (accion_foto == 1004) {
    vava('iportada0', '');
    sefatt(4, foto);
  }
}

function videok(vide, yy, fra) {
  //alert(accion_video);
  if (accion_video == 1) {
    eval(`video_portada_${app}=vide`);
    fovo = 1;
    FM(5);
    video_subido = vide;
    varyy = yy;
  }

  if (accion_video == 100) {
    var och = db
      .transaction('multimedia_recurso', 'readwrite')
      .objectStore('multimedia_recurso');
    var rch = och.get(idmr);
    rch.onsuccess = function (event) {
      var da = rch.result;
      da.img = imgvideo;
      var upch = och.put(da);
    };

    coto(2);
    seta(idf, 'class', '');
    axff = `
<input style="display:none" type="file" name="img" id="if${nf}" onchange="foto_principal(this.id)" accept="image/*">
<input type="hidden" id="i_foto_${id_publi}_f${nf}" value="${fra}" formu${l}>
<input type="hidden" id="i_video_${id_publi}_f${nf}" value="${vide}" formu${l}>
<input type="hidden" id="i_text_${id_publi}_f${nf}" value="">
<input type="hidden" id="i_conte_${id_publi}_f${nf}" value="">
`;

    axff = parset(axff);
    ihs('a' + idf, axff);
    seta(
      idf,
      'style',
      'order:' +
        nf +
        ';background:url(' +
        fra +
        ') top center!important;background-size:cover!important'
    );
    seta(idf, 'onclick', `noe=0;gnf='${nf}';gidf='${idf}';instancia(15,0,0)`);
    nf++;
    pumul();
    vava('ivideo0', '');
  }
}

function ecrop(fo250) {
  fetch('https://rie.cl/1/0/src/crop.php', {
    body: 'fo250=' + fo250,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=iso-8859-1',
    },
    method: 'POST',
  })
    .then(response => {
      return response.text();
    })
    .then(text => {
      eval(text);
    });

  seta(
    'perfil',
    'style',
    'background:url(' + fo250 + ') center center;background-size:cover'
  );
  seta(
    'fot' + va('yu'),
    'style',
    'background:url(' + fo250 + ') center center;background-size:cover'
  );
}

function cropok(fot) {
  hb();
  setTimeout(function () {
    r = `accion=5&foto_perfil=` + fot + `&ya=` + va('ya' + l);
    f(r);
  }, 777);
}

function delmo(y) {
  orden = geta(y, 'orden');
  if (confirm('Confirma Eliminar?!') == true) {
    hb();
    Xx('paki' + orden);

    if (medio == 2)
      ihs(
        y,
        '<span class="ts" style="float:left;padding:1vw"><h1>Eliminando Publicación</h1><pre class="b">por favor espere...</pre></span>'
      );
    if (medio == 1)
      ihs(
        y,
        '<span class="ts"><h1>Eliminando Publicación</h1><pre class="b">por favor espere...</pre></span>'
      );

    ls('que_hago', `Xx('${y}');saca_modulos(0);parsele()`);

    r = `accion=2&y=` + y + `&orden=` + orden + `&ya=` + llave_app;
    ////f(r);
    ti(500, 'f(r)');
  }
}

function fmod(id, vale) {
  nid = id.split('mod').join('');
  tipo = geta(id, 'tipo');
  oo = geta(id, 'orden');
  if (vale == 1) sube(id, oo);
  if (vale == 2) baja(id, oo);
  if (vale == 3) delmo(id);

  if (vale == 100) {
    editar = nid;
    instancia(3, 0, va('ya' + l));
  }

  if (vale == 10 || vale == 11) {
    idm = id;
    funcion = vale;
    instancia(84, 0, '' + va('ya' + l) + '');
  }

  if (vale == 12) {
    ti(333, `id_publi=nid;pwa=va('pwa'+l);instancia(88,0,va('ya'+l))`);
  }

  if (vale == 13) {
    idm = id;
    funcion = vale;
    instancia(85, 0, '' + va('ya' + l) + '');
  }

  if (vale == 20) {
    idm = id;
    accion_foto = 102;
    yx = 0;
    cli('iportada' + l);
  }

  if (vale == 21) {
    vayt = 'https://www.youtube.com/watch?v=' + geta('yt' + nid, 'yt');
    idm = id;
    accion_yt = 2;
    syt();
  }
}

function replamo(mod) {
  b3p = `<u onclick="vaya3p(this.closest('div').id)">${i_1162}</u>`;
  publicaciones = mod.split('<u></u>').join(b3p);
  return publicaciones;
}

function vaya3p(id) {
  idm = id;
  pwa = va('pwa' + l);
  nid = id.split('mod').join('');
  tipo = geta(id, 'tipo');
  oo = geta(id, 'orden');
  editar = nid;
  instancia(3, 0, va('ya' + l));
}

function ajuse(id) {
  nmod = va('npub');
  orden = geta(id, 'orden');
  tipo = geta(id, 'tipo');
  emo = `<option value="0">Opciones</option>`;
  emo += `<option value="100">Editar</option>`;

  if (tipo == -1) emo += `<option value="20">Cambiar Foto</option>`;
  if (tipo == -3) emo += `<option value="21">Cambiar Video</option>`;
  if (tipo == -1) emo += `<option value="10">Categoría</option>`;
  if (tipo == -1) emo += `<option value="11">Textos</option>`;

  if (tipo != 3) emo += `<option value="12">Botones</option>`;

  if (tipo == -1) emo += `<option value="13">Estilos</option>`;

  if (nmod > 1) {
    if (orden > 1) emo += `<option value="1">Bajar</option>`;
    if (orden < nmod) emo += `<option value="2">Subir</option>`;
  }
  emo += `<option value="3">Eliminar</option>`;
  document.querySelector('#' + id + ' .si').innerHTML = emo;
}

function parsele() {
  els = document.getElementsByClassName('si');
  for (i = 0; i < els.length; i++) ajuse(els[i].closest('div').id);
}

function sube(id, sorden) {
  hb();
  Xx('paki' + sorden);
  ihs(
    id,
    '<span class="ts"><h1>Realizando cambio de posición...</h1><pre class="b">por favor espere...</pre></span>'
  );
  ls('que_hago', `saca_modulos(0);parsele()`);
  r = `accion=3&y=` + id + `&orden=` + sorden + `&ya=` + llave_app;
  ////f(r);
  ti(500, 'f(r)');
}

function baja(id, sorden) {
  /////alert(sorden);
  hb();

  Xx('paki' + sorden);
  ihs(
    id,
    '<span class="ts"><h1>Realizando cambio de posición...</h1><pre class="b">por favor espere...</pre></span>'
  );
  ls('que_hago', `saca_modulos(0);parsele()`);
  r = `accion=4&y=` + id + `&orden=` + sorden + `&ya=` + llave_app;
  /////f(r);
  ti(500, 'f(r)');
}
