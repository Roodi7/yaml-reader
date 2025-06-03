<?php // scan.php
function scanDirRecursive($dir) {
  $result = [];
  $files = scandir($dir);
  foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    $fullPath = $dir . DIRECTORY_SEPARATOR . $file;
    if (is_dir($fullPath)) {
      $result[] = [
        'type' => 'folder',
        'name' => $file,
        'children' => scanDirRecursive($fullPath)
      ];
    } else {
      $result[] = [
        'type' => 'file',
        'name' => $file,
        'path' => str_replace(__DIR__ . DIRECTORY_SEPARATOR, '', $fullPath)
      ];
    }
  }
  return $result;
}

header('Content-Type: application/json');
echo json_encode(scanDirRecursive(__DIR__));
