(function (root, name, factory) {
  try { return module.exports = factory(); } catch(e) {}
  try { return define         ( factory ); } catch(e) {}
  try { return root[name]     = factory(); } catch(e) {}
})(this, 'util', function () { 'use strict';
  return {
    each: function (object, callback) {
      if(Object.prototype.toString.call(object) === '[object Array]')
        for(var i = 0, l = object.length; i < l; i++)
          callback(object[i], i, object);
      else
        for(var i in object)
          if(Object.prototype.hasOwnProperty.call(object, i))
            callback(object[i], i, object);
    },
    extend: function () {
      for(var i = 1, a = arguments, o = a[0], s, p; s = a[i++];) for(p in s)
        if(Object.prototype.hasOwnProperty.call(s, p)) o[p] = s[p];
      return o;
    },
    inherits: function (child, parent) {
      child.prototype = new parent();
      child.prototype.constructor = child;
      child._super_ = parent.prototype;
      return child;
    },
    format: function (string, object) {
      var o = typeof object === 'object' ? object : arguments;
      return string.replace(/{(.*?)}/g, function(m, n) {
        return typeof o[n] !== 'undefined' ? o[n] : m;
      });
    },
    rand: {
      float: function (min, max) {
        return Math.random() * (max - min) + min;
      },
      int: function (min, max) {
        return Math.random() * (max - min + 1) + min | 0;
      },
      item: function (array) {
        return array[Math.random() * array.length | 0];
      },
      hash: function (length) {
        for(var r, s = '', l = length || 1; l--;)
          s += (r = Math.random() * 62 | 0) < 10 ? r
            : String.fromCharCode(r + (r < 36 ? 87 : 29));
        return s;
      }
    },
    math: {
      clamp: function (value, min, max) {
        return value < min ? min : value > max ? max : value;
      },
      mod: function (value, min, max) {
        return (value -= min) % (max - min) + (value < 0 ? max : min);
      },
      map: function (value, min1, max1, min2, max2) {
        return (value - min1) * (max2 - min2) / (max1 - min1) + min2;
      },
      lerp: function (value, min, max) {
        return min + value * (max - min);
      },
      angle: function (a, b, full) {
        return 2 * (a = (a < b ? b - a : a - b) % full) > full ? full - a : a;
      }
    },
    str: {
      pad: function (string, length, pad) {
        var s = String(string);
        var l = Math.max(0, Math.abs(length) - s.length);
        var p = new Array(++l).join(pad != null ? pad : ' ');
        return length < 0 ? s + p : p + s;
      }
    },
    array: {
      cross: function (array, callback) {
        var i, j, l = array.length;
        for(i = 0; i < l; i++) for(j = i + 1; j < l;)
          callback(array[i], array[j], i, j++);
        return array;
      }
    },
    fn: {
      wrap: function (fn, wrapper) {
        return function () {
          return wrapper.call(this, arguments, fn);
        };
      },
      log: function (fn, logger) {
        return function () {
          logger.call(this, arguments, fn);
          return fn.apply(this, arguments);
        };
      }
    },
    color: {
      rgba: function (rgba) {
        if(typeof rgba !== 'object') rgba = arguments;
        return 'rgba('
          + (rgba[0] * 255 + 0.5 | 0) + ','
          + (rgba[1] * 255 + 0.5 | 0) + ','
          + (rgba[2] * 255 + 0.5 | 0) + ','
          + (rgba[3] != null ? rgba[3] : 1).toFixed(3) + ')';
      },
      hsla: function (hsla) {
        if(typeof hsla !== 'object') hsla = arguments;
        return 'hsla('
          + (hsla[0] * 360 + 0.5 | 0) + ','
          + (hsla[1] * 100 + 0.5 | 0) + '%,'
          + (hsla[2] * 100 + 0.5 | 0) + '%,'
          + (hsla[3] != null ? hsla[3] : 1).toFixed(3) + ')';
      }
    },
    gradient: function (colors, position) {
      var a, b, c, i, l, t = position;
      for(i = 0; c = colors[i++];) {
        if(t-c[0] >= 0 && (!a || t-c[0] < t-a[0])) a = c;
        if(t-c[0] <= 0 && (!b || t-c[0] > t-b[0])) b = c;
      }
      t = (t-a[0]) / (b[0]-a[0]) || 0;
      for(c = [], i = 0, l = a[1].length; i < l;)
        c[i] = a[1][i] + (b[1][i] - a[1][i++]) * t;
      return c;
    },
    loop: function (callback, interval) {
      var n = Date.now(), s = n, l = n, i = 0;
      var loop = function () {
        !callback(i++, (n = Date.now()) - s, n - l, l = n) && next();
      };
      var next = interval == null
        ? requestAnimationFrame.bind(null, loop)
        : setTimeout.bind(null, loop, interval);
      return loop();
    },
    perf: function (times) {
      for(var t, f, j, i = 1, r = []; f = arguments[i++];) {
        t = Date.now(); for(j = 0; j < times; f(j++));
        r.push((Date.now() - t) / 1000);
      }
      return r;
    },
    fps: (function (h, l, s) {
      return function (int) {
        l = h.push(Date.now()) - 1;
        s = l / (h[l] - h[0]) * 1000 || 0;
        l > s && h.splice(0, ++l - s | 0);
        return int ? s + 0.5 | 0 : s;
      };
    })([]),
    bind: (function (fn) {
      return { on: fn.bind('add'), off: fn.bind('remove') };
    })(function (elements, events, listeners, capture) {
      var a = [].concat(elements), b = [].concat(events), c = [].concat(listeners);
      for(var k, j, i = 0; a[i]; i++) for(j = 0; b[j]; j++) for(k = 0; c[k]; k++)
        a[i][this + 'EventListener'](b[j], c[k], capture);
    }),
    ajax: (function (fn) {
      return { get: fn.bind(0), post: fn.bind(1) };
    })(function (url, data, callback, timeout) {
      var p, q = '', xhr = new XMLHttpRequest();
      for(p in data) if(data.hasOwnProperty(p))
        q += '&' + [p, data[p]].map(encodeURIComponent).join('=');
      if(q && !this) url += ~url.indexOf('?') ? q : q.replace('&', '?');
      xhr.open(this ? 'POST' : 'GET', url, true);
      xhr.timeout = timeout ? timeout * 1000 : 0;
      xhr.onreadystatechange = function () {
        this.readyState === 4 && callback(this.response, this);
      };
      if(!url.match(/^(https?:)?\/\//i)) {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }
      xhr.send(this && q ? q.substr(1) : null);
      return xhr;
    }),
    load: {
      docs: function (list, callback, progress) {
        var item, i, j = 0, e = function () {
          if(this.readyState !== 4) return;
          list[list.indexOf(this)] = this.response;
          j++; progress && progress(j, list.length);
          j === list.length && callback(list);
        }
        progress && progress(0, list.length);
        for(i = 0; i < list.length; i++) {
          item = new XMLHttpRequest();
          item.onreadystatechange = e;
          item.open('GET', list[i], true);
          item.send(null);
          list[i] = item;
        }
        return list;
      },
      imgs: function (list, callback, progress) {
        var item, i, j = 0, e = function () {
          j++; progress && progress(j, list.length);
          j === list.length && callback(list);
        }
        progress && progress(0, list.length);
        for(i = 0; i < list.length; i++) {
          item = new Image();
          item.onload = e;
          item.src = list[i];
          list[i] = item;
        }
        return list;
      }
    },
    select: function (selector, where) {
      if(selector = /(^[.#]?)([\w-]+$)/.exec(selector)) switch(selector[1]) {
        case '#': return (where || document).getElementById(selector[2]);
        case '.': return (where || document).getElementsByClassName(selector[2]);
        default:  return (where || document).getElementsByTagName(selector[2]);
      } else      return (where || document).querySelectorAll(selector);
    },
    tag: function (element, options, target, prepend) {
      var e = element, o = options, i = e || '', j;
      if(e == null || e.nodeType == null) {
        e = document.createElement(String(i.match(/^[^#.]+/) || 'div'));
        if(j = i.match(/#([^#.]+)/)) e.id = j[1];
        if(j = i.match(/\.[^#.]+/g)) e.className = j.join(' ').replace(/\./g, '');
      }
      if(o != null) if(o.nodeType != null) e.appendChild(o);
      else if(typeof o !== 'object') e.textContent = o;
      else if(o[i = 0]) while(o[i]) e.appendChild(o[i++]);
      else for(i in o) if(o.hasOwnProperty(i)) e[i] = o[i];
      if(target) if(!prepend) target.appendChild(e);
      else target.insertBefore(e, target.firstChild);
      return e;
    },
    breadcrump: function (element, url, sub, last, separator) {
      url = decodeURI(url || location.href);
      url = url.match(/[^?#]+/)[0].split('/');
      sub = /^[\d.]+$/.test(url[2]) ? 0 : sub;
      var e, i, host = url[2].split('.');
      while(host.length) {
        e = document.createElement('a');
        e.href = url[0] + '//' + host.join('.') + '/';
        e.textContent = sub && host.length > sub && host[0] !== 'www'
          ? host.splice(0, 1) + '.' : host.splice(0).join('.');
        element.appendChild(e);
      }
      for(i = 3; url[i]; i++) {
        element.appendChild(document.createTextNode(separator || ' › '));
        e = document.createElement(!url[i + 1] && !last ? 'span' : 'a');
        if('href' in e) e.href = encodeURI(url.slice(0, i + 1).join('/'));
        if('href' in e && url[i + 1] != null) e.href += '/';
        e.textContent = url[i];
        element.appendChild(e);
      }
      return element;
    },
    form: function (form) {
      var i, e, o = {}, c = form.querySelectorAll('*');
      for(i = 0; e = c[i]; i++) if(e.name) switch(e.type) {
        case 'radio': if(e.checked) o[e.name] = e.value; break;
        case 'checkbox': o[e.name] = e.checked ? 1 : 0; break;
        default: o[e.name] = e.value; break;
      }
      return o;
    },
    favicon: function (url) {
      var e = document.head.querySelector('link[rel*=icon]');
      e && document.head.removeChild(e);
      e = document.createElement('link');
      e.rel = 'shortcut icon'; e.href = url;
      document.head.appendChild(e);
    }
  };
});