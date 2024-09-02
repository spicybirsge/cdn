function replaceUrlExtension(url) {

  let newUrl = url.replace(/\.[^/.]+$/, ".mpd");


return newUrl
}


module.exports = replaceUrlExtension;