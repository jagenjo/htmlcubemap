# htmlcubemap
A simple class to embed a panoramic view in a website from six pictures.
It uses CSS with transforms.

[Demo here](https://tamats.com/projects/htmlcubemap/demo/)

## Usage

Just call from javascript:
```js
var cubemap = new HTMLCubemap("imgs/301_01_01_",".png","cubemap", {low_post_url: "_tn.png", width: 512,height: 512});
```

Where params are:
- prefix to url of images
- postfix of url of images
- DOM container where to insert the cubemap


