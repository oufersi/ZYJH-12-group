function formatDate(v: Date) {
  const year = v.getFullYear();
  const month = v.getMonth() + 1;
  const date = v.getDate();
  return `${year}/${month}/${date}`;
}

function getRunningEnv(): 'mobile' | 'pc' {
  const os = (function() {
    const ua = navigator.userAgent,
      isWindowsPhone = /(?:Windows Phone)/.test(ua),
      isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
      isAndroid = /(?:Android)/.test(ua),
      isFireFox = /(?:Firefox)/.test(ua),
      // isChrome = /(?:Chrome|CriOS)/.test(ua),
      isTablet =
        /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
      isPhone = /(?:iPhone)/.test(ua) && !isTablet,
      isPc = !isPhone && !isAndroid && !isSymbian;
    return {
      isTablet: isTablet,
      isPhone: isPhone,
      isAndroid: isAndroid,
      isPc: isPc
    };
  })();
  if (os.isAndroid || os.isPhone) {
    return 'mobile';
  } else if (os.isTablet) {
    return 'mobile';
  } else if (os.isPc) {
    return 'pc';
  }
  return 'pc';
}

/**
 * 获取俩点之间的距离
 * @param point0 第一个点位置
 * @param point1 第二个点位置
 */
function getPointsDistance(point0: { x: number; y: number }, point1: { x: number; y: number }) {
  const x = Math.abs(point1.x - point0.x);
  const y = Math.abs(point1.y - point0.y);
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function bindLongTag(elem: HTMLElement, handler: (e: TouchEvent) => never) {
  elem.addEventListener('touchstart', touchFn);
  elem.addEventListener('touchmove', touchFn);
  elem.addEventListener('touchend', touchFn);
  let timer = 0;
  function touchFn(e: TouchEvent) {
    switch (e.type) {
      case 'touchstart':
        timer = setTimeout(function() {
          handler(e);
        }, 500);
        break;
      case 'touchmove':
        clearInterval(timer);
        break;
      case 'touchend':
        clearTimeout(timer);
        break;
    }
  }
}

function filetoDataURL(file: File, fn: (base64: string) => never) {
  const reader = new FileReader();
  reader.onloadend = e => {
    if (e.target) {
      fn(e.target.result as string);
    }
  };
  reader.readAsDataURL(file);
}

export default {
  formatDate,
  getRunningEnv,
  getPointsDistance,
  bindLongTag,
  filetoDataURL
};
