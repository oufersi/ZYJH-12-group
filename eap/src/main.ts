console.inspectEnable = true;
import WebApp from 'webapp';
import { ICallBack, IResponse } from './interfaces/api.interface';
import { SocketServer } from './libs/socket_server';
import devManager from './libs/sddc_device';
import { ISimpleDevice } from './libs/sddc_device/type';
import db from './data/lkv_db';
const app = WebApp.createApp();
app.use(WebApp.static('./public'));

let humidityDev = null; // 场景湿度探测设备
let waterDev = null; // 场景浇水设备
let watering = false; // 是否正在浇水
let humidityTimer: EdgerOS.Timeout; // 浇水期间加快获取湿度的定时器

const server = new SocketServer(app);
server.on('connection', (socket) => {
  console.log('server connect')
  socket.on('disconnect', () => {
    console.error('disconnect');
  });

  socket.on('init', () => {
    emitDevices();
    server.emitMessage('setting', db.setting)
    initScene();
  });

  // socket.on('init-scene', () => {
  //   initScene();
  // });

  socket.on('change-scene-devices', (data: { delete_id: string; add_id: string }, cb: ICallBack) => {
    const { add_id, delete_id } = data || {};
    // 替换新设备
    const dev = devManager.getDevice(add_id);
    if (!dev) {
      return;
    }
    generateDevController(add_id)
      .then(() => {
        try {
          let cacheDevids = [...db.devids, add_id]; // 保存新设备devid
          if (delete_id) {
            cacheDevids = cacheDevids.filter((id) => id !== delete_id); // 删除上一个设备devid
          }
          db.devids = cacheDevids; // 更新数据库
          devManager.destroyController(delete_id); // 删除设备控制对象
          setSceneDevice(dev);
          initDeviceValue(add_id);
          server.emitMessage('join', dev);
        } catch (error) {
          console.error(error);
          cb({result: false, message: '操作失败，检查应用权限或重启应用！'})
        }
      })
      .catch((error) => {
        console.error(error)
        cb({result: false, message: '操作失败，检查应用权限或重启应用！'})
      });
  });

  socket.on('change-scene-setting', (data: { id: string; limit: number }, cb: ICallBack) => {
    try {
      db.setting = data;
      server.emitMessage('setting', data);
    } catch (error) {
      console.error(error);
      return cb({result: false, message: '操作失败，请重试！'})
    }
    if (humidityDev) {
      initDeviceValue(humidityDev.devid);
    }
    return cb({result: true, message: '操作成功！'})
  });

  // socket.on('send-device-message', (params: { devid: string; data: any }, cb: ICallBack) => {
  //   const { devid, data } = params || {};
  //   devManager.sendDeviceInfo(devid, data).catch((err) => {
  //     cb({result: false, message: err || '操作失败！'})
  //   });
  // });
});

function emitDevices() {
  server.emitMessage('devices', devManager.getDeviceList())
}

function emitError(err: string) {
  server.emitMessage('error', err)
}

function initScene() {
  for (const devid of db.devids) {
    const dev = devManager.getDevice(devid);
    if (!dev) {
      continue;
    }
    generateDevController(dev.devid)
      .then(() => {
        setSceneDevice(dev);
        server.emitMessage('join', dev);
      })
      .catch((error) => {
        emitError(error);
      });
  }
}

// 构建设备控制对象
function generateDevController(devid: string) {
  const ctl = devManager.getController(devid);
  if (ctl) {
    initDeviceValue(devid);
    return Promise.resolve(ctl);
  }
  return new Promise((resolve, reject) => {
    const dev = devManager.getDevice(devid);
    devManager
      .generateController(devid)
      .then((controller) => {
        controller.on('message', (data) => {
          console.info('meessage: ', data);
          if (isSceneDev(devid)) {
            if (dev.type === 'humidity') {
              server.emitMessage('humidity', Number(data.data.soil_humidity.toFixed(1)) ); // 0-100
              if (!waterDev) {
                return;
              }
              if (data.data.soil_humidity < db.setting?.limit && !watering) {
                startWater(); // 浇水
              } else if (data.data.soil_humidity >= db.setting?.limit && watering) {
                stopWater(); // 停水
              }
            } else if (dev.type === 'water') {
              // watering = data.data.watering === 'ON';
              if (data.data.watering === 'ON' && watering && !humidityTimer && humidityDev) {
                setHumidityTimer(1000);
              } else if (data.data.watering === 'OFF' && !watering && humidityTimer) {
                clearInterval(humidityTimer);
                humidityTimer = undefined;
              }
            }
          }
        });
        resolve(controller);
      })
      .catch(() => {
        reject(`应用缺少控制${dev.alias}的权限！`);
      });
  });
}

function initDeviceValue(devid: string) {
  const { brand, type } = devManager.getDevice(devid) || {};
  if (brand === 'lgzm' && type === 'humidity') {
    devManager
      .sendDeviceInfo(devid, {
        method: 'get',
        obj: ['soil_humidity']
      })
      .catch((error) => {
        console.error('get soil_humidity:', error);
      });
  } else if (brand === 'lgzm' && type === 'water') {
    devManager.sendDeviceInfo(devid, {
      method: 'get',
      obj: ['watering']
    });
  }
}

/* 开始浇水 */
function startWater() {
  devManager
    .sendDeviceInfo(waterDev.devid, { method: 'set', watering: 'ON' })
    .then(() => {
      watering = true;
    })
    .catch((error) => {
      console.error('start watering:', error);
    });
}

/* 停止浇水 */
function stopWater() {
  devManager
    .sendDeviceInfo(waterDev.devid, { method: 'set', watering: 'OFF' })
    .then(() => {
      watering = false;
    })
    .catch((error) => {
      console.error('stop watering:', error);
    });
}

/* 开启湿度探测定时器，浇水期间加快获取湿度实时值 */
function setHumidityTimer(ms: number) {
  const controller = devManager.getController(humidityDev.devid);
  if (controller) {
    humidityTimer = setInterval(() => {
      controller.send(
        {
          method: 'get',
          obj: ['soil_humidity']
        },
        undefined,
        3
      );
    }, ms);
  }
}

// 是否是场景设备
function isSceneDev(devid: string) {
  return db.devids.findIndex((id) => id === devid) >= 0;
}

/* 设置场景设备 */
function setSceneDevice(dev: ISimpleDevice) {
  if (dev.type === 'humidity') {
    humidityDev = dev;
  } else {
    waterDev = dev;
  }
}

devManager.on('join', (dev: ISimpleDevice) => {
  emitDevices();
  if (isSceneDev(dev.devid)) {
    // 说明加入的设备是当前场景设备
    generateDevController(dev.devid)
      .then(() => {
        server.emitMessage('join', dev);
        initDeviceValue(dev.devid);
      })
      .catch((error) => {
        emitError(error);
      });
  }
});
devManager.on('lost', (dev: ISimpleDevice) => {
  emitDevices();
  if (isSceneDev(dev.devid)) {
    server.emitMessage('lost', dev);
    if (dev.type === 'humidity') {
      clearInterval(humidityTimer);
      humidityTimer = undefined;
    }
  }
});

devManager.on('error', (data) => {
  emitError(data);
});

app.start();
require('iosched').forever();
