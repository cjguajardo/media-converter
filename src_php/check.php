<?php

header('Content-Type: application/json');
$token = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $json = json_decode(file_get_contents('php://input'));
  $token = $json->token ?? null;
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $token = $_GET['token'] ?? null;
}

if (isset($token)) {
  /**
   * TODO: Do the data check
   */
  if ($token == '123456') {
    $random_key = dechex(rand(9999999, 999999999) . rand(9999999, 999999999));
    $random_value = dechex(rand(9999999, 999999999) . rand(9999999, 999999999));

    header('HTTP/1.1 200 OK');
    echo json_encode(
      [
        'status' => 'success',
        'message' => 'Token is valid',
        'data' => ['k' => $random_key, 'v' => $random_value, 't' => time()]
      ]
    );
  } else {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(array('status' => 'error', 'message' => 'Token not valid'));
  }
} else {
  header('HTTP/1.1 400 Bad Request');
  echo json_encode(array('status' => 'error', 'message' => 'Token not found'));
}
