<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request demo</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

    <form action="request.php" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" id="file">
        <input type="submit" value="Submit">
    </form>
    <form >
      <input type="file" name="chunks" id="chunks">
      <input type="button" value="Submit" onclick="submitChunks()">
    </form>

    <script>
      var crc32=function(r){for(var a,o=[],c=0;c<256;c++){a=c;for(var f=0;f<8;f++)a=1&a?3988292384^a>>>1:a>>>1;o[c]=a}for(var n=-1,t=0;t<r.length;t++)n=n>>>8^o[255&(n^r.charCodeAt(t))];return(-1^n)>>>0};

      // convert file (chunks) to base64 and split content into 100 chunks
      function submitChunks(){
        const file = document.getElementById('chunks').files[0];
        const x = 2

        fileToBase64(file).then(base64 => {
          const chunkSize = Math.ceil(base64.length / x);
          const chunks = [];
          const base64crc = crc32(base64)

          while(base64.length > 0) {
            chunks.push(base64.substring(0, chunkSize));
            base64 = base64.substring(chunkSize);
          }

          console.log({chunks, chunkSize})

          const json = []
          chunks.forEach((chunk, index) => {
          fetch('http://localhost:8099/upload-chunk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chunk,
              max: chunks.length,
              index:index+1,
              id: '34e6rftyv87',
              crc: base64crc
            })
          }).then(response => response.json())
            .then(data => {
              console.log({data})
              if (data.success) {
                console.log('success')
              } else {
                console.log('error')
              }
            })
            .catch(error => {
              console.log('error', error)
            })
          })
        })
      }
      function fileToBase64(file) {
          return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = error => reject(error);
          });
      }
    </script>

    <form >
        <input type="file" name="ivideo0" id="ivideo0">
        <input type="button" value="Submit" onclick="sube_video()">
        <input type="hidden" formu0="" id="pwa0" value="10">
    </form>
    <script src="sube_video.js"></script>
</body>

</html>
