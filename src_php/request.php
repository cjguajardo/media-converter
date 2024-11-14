<?php

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
  $file = $_FILES['file'];

  echo 'uploading file: ' . $file['name'] . "\n";
  $curl = curl_init();

  //$base_path = 'https://7134cb0322f400f44f7aaf9cb14e37b6.loophole.site';
  $base_path = 'http://localhost:8099';

  curl_setopt_array($curl, [
    CURLOPT_URL => $base_path . '/login',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => '{
        "key":"cj.guajardo@gmail.com",
        "secret":"c5f1f52509e00a979e34a5c765c31ebe4537021c15249b52c20b8600e1cbd170"
    }',
    CURLOPT_HTTPHEADER => [
      'Origin: https://*.rie.cl',
      'Content-Type: application/json',
    ],
  ]);

  $response = json_decode(curl_exec($curl));
  var_dump($response);
  curl_close($curl);

  $token = $response ? $response->token : null;

  if (!$token) {
    die('No token');
  }

  $curl = curl_init();

  curl_setopt_array($curl, [
    CURLOPT_URL => $base_path . '/convert',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => [
      'file' => new CURLFILE($file['tmp_name'], $file['type'], $file['name']),
      'path' => '/test3',
      'post_convert_output' => 'upload',
      'overlay_image_url' =>
        'https://cgcapps.cl/_other-assets/cgc-watermark.png',
    ],
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token],
  ]);

  $response = json_decode(curl_exec($curl));

  curl_close($curl);

  if (isset($response->file) && isset($response->duration)) { ?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Result</title>
      <link rel="stylesheet" href="style.css">
    </head>

    <body>

      <div style="display:flex;flex-direction:column;">
        <div>File uploaded: <?= $response->file ?></div>
        <div>Duration: <?= $response->duration ?></div>
        <?php if (isset($response->dimensions)) { ?>
          <div>Width: <?= $response->dimensions->width ?></div>
          <div>Height: <?= $response->dimensions->height ?></div>
        <?php } ?>
        <?php if (isset($response->orientation)) { ?>
          <div>Orientation: <?= $response->orientation ?></div>
        <?php } ?>
        <img src="<?= $response->frame ?>" alt="">
        <video width="<?= $response->dimensions->width ??
          320 ?>" height="<?= $response->dimensions->height ?? 320 ?>" controls>
          <source src="<?= $response->file ?>" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    </body>

    </html>
<?php } else {var_dump($response);}
} else {
  echo 'Method not allowed';
}
