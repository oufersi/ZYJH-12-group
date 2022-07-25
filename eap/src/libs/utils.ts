const advnwc = require('advnwc');
const permission = require('permission');
console.inspectEnable = true;

/**
 * 检测权限
 * @param {string[]} perms 检测的权限数组
 * @returns {boolean}
 */
function checkPerm(keys) {
  if (!keys || !keys.length) {
    return Promise.reject(false);
  }
  return new Promise((resolve, reject) => {
    const needCheckPerms = keys.reduce((res, item) => {
      res[item] = true;
      return res;
    }, {});
    permission.check(needCheckPerms, (res) => {
      console.log(`checkPerm(${JSON.stringify(keys)}):`, res);
      if (res) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
}

/* 获取局域网和广域网中包含的网络接口信息 */
function getIfnames() {
  return new Promise((resolve, reject) => {
    advnwc.netifs(true, function (error, list) {
      if (error) {
        reject(error);
      } else {
        console.info('LAN port interface:', list);
        resolve(list[0]);
      }
    });
  }).then((ifname) => {
    return new Promise((resolve, reject) => {
      advnwc.netifs(false, function (error, list) {
        if (error) {
          reject(error);
        } else {
          console.info('WAN port interface:', list);
          resolve({ lan: ifname, wan: list[0] });
        }
      });
    });
  });
}

// 生成指定长度随机字符串
function generateRandomString(num: number = 10) {
  let arr = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];
  let str = '';
  for (let index = 0; index < num; index++) {
    str += arr[Math.floor(Math.random() * arr.length)];
  }
  return str;
}

// 格式化日期
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return `${year}/${month}/${day} ${h}:${m}:${s}`;
}

/**
 * 获取当前的日期和时间
 * @returns 当前的日期和时间
 */
function getCurDateTime() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = now.getMonth() + 1;
  const dd = now.getDate();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const ss = now.getSeconds();
  return {
    date: `${yyyy}-${MM < 10 ? '0' + MM : MM}-${dd < 10 ? '0' + dd : dd}`,
    time: `${hh < 10 ? '0' + hh : hh}:${mm < 10 ? '0' + mm : mm}:${ss < 10 ? '0' + ss : ss}`
  };
}

function isFunction(param: any) {
  return Object.prototype.toString.call(param) === '[object Function]';
}

function isString(param: any) {
  return Object.prototype.toString.call(param) === '[object String]';
}

function isObject(param: any) {  
  return Object.prototype.toString.call(param) === '[object Object]';
}

export default {
  checkPerm,
  getIfnames,
  generateRandomString,
  formatDate,
  getCurDateTime,
  isFunction,
  isString,
  isObject
};
