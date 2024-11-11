<?php

$data = $_POST['data'];
var_dump($data);
file_put_contents('data.json', $data);

echo 'ok';
