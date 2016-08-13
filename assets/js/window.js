(function() {
  window.isTouchDevice = !!("ontouchstart" in window);
  window.DEBUG = window.DEBUG || true; // TODO: Should default to false?

  window.isMobile = function() {
    return navigator.userAgent.match(/Android|iPad|iPhone|iPod|webOS|Windows Phone/i);
  };

  window.nextTick = function(cb) { setTimeout(cb, 1); };

  window.addEventListener("resize", function() {
    if (window.resizeTid) return;
    window.resizeTid = setTimeout(function() {
      window.resizeTid = null;
      Convos.settings.screenHeight = window.innerHeight;
      Convos.settings.screenWidth = window.innerWidth;
    }, 100);
  });

  NodeList.prototype.$forEach = Array.prototype.forEach;

  Element.prototype.$remove = function() {
    this.parentElement.removeChild(this);
  };

  Element.prototype.focusOnDesktop = function() {
    var elem = this;
    if (!isMobile()) window.nextTick(function() { elem.focus(); });
  };

  if (!Object.values) {
    Object.values = function(obj) {
      return Object.keys(obj).map(function(k) { return obj[k]; });
    };
  }
})();
