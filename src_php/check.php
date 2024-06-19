<?php

header('Content-Type: application/json');

if (isset($_POST['token'])) {
  $token = $_POST['token'];
  /**
   * TODO: Do the data check
   */
  if ($token == '123456') {
    $random_key = dechex(rand(9999, 99999));
    $random_value = dechex(rand(9999, 99999));

    echo json_encode(
      [
        'status' => 'success',
        'message' => 'Token is valid',
        'data' => ['k' => $random_key, 'v' => $random_value, 't' => time()]
      ]
    );
  } else {
    echo json_encode(array('status' => 'error', 'message' => 'Token not valid'));
  }
} else {
  echo json_encode(array('status' => 'error', 'message' => 'Token not found'));
}
