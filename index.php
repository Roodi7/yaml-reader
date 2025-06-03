<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>YAML File Viewer</title>
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
  <script src="viewer.js"></script>

</head>

<body>
  <div class="container">
    <div class="sidebar">
      <h2>Files</h2>
      <ul id="file-tree"></ul>
    </div>
    <div class="content">
      <h2 >YAML Preview <span id="yaml-title"></span></h2>
      <div class="yaml-content" id="yaml-display"></div>
    </div>
  </div>

</body>

</html>