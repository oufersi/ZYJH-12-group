import Device from 'device';
import intenal from 'edgeros:permission';
import EventEmitter from 'events';
import { IBrandConfig, IController, IDevice, IDeviceType, ISimpleDevice } from './type';

class DeviceManager extends EventEmitter {
  private devMap: Map<string, ISimpleDevice>;
  private controllerMap: Map<string, IController>;

  constructor() {
    super();
    this.devMap = new Map();
    this.controllerMap = new Map();
    this.init();
  }

  private init() {
    // 获取当前所有所有设备！
    Device.list(true, (error, list) => {
      if (error) {
        console.error('Device.list error!' + error);
        return this.emit('error', '页面异常，请刷新或退出页面重试！');
      } else {
        this.devMap.clear();
        list.map((item) => {
          Device.info(item.devid, (error, info) => {
            if (error) {
              console.error('Device.info error!' + error);
              this.emit('error', `设备 ${item.alias} 信息初始化失败, 请刷新重试！`);
            } else {
              console.info(JSON.stringify(info, undefined, 2));
              const config = this.getBrandConfig(info);
              this.devMap.set(item.devid, {
                devid: item.devid,
                alias: info.alias || info.report.name,
                ...config
              });
            }
          });
        });
      }
    });

    Device.on('join', (devid, info) => {
      console.info('SDDC device join: ', devid);
      const config = this.getBrandConfig(info);
      const dev = {
        devid: devid,
        alias: info.alias || info.report.name,
        ...config
      };
      this.devMap.set(devid, dev);
      this.emit('join', dev);
    });

    Device.on('lost', (devid) => {
      console.error('SDDC device lost: ', devid);
      // 删除控制器
      if (this.controllerMap.has(devid)) {
        this.controllerMap.delete(devid);
      }
      const lostDev = this.devMap.get(devid);
      if (!devid || !lostDev) {
        /* 这里的话，有时候会为空 */
        console.error('SDDC device lost error: ', devid, lostDev);
        // this.emit('error', '设备丢失出错异常，请刷新页面！');
        return;
      }
      this.devMap.delete(devid);
      this.emit('lost', lostDev);
    });
  }

  /* 构建设备控制对象 */
  generateController(devid: string): Promise<Device> {
    if (this.controllerMap.has(devid)) {
      return Promise.resolve(this.controllerMap.get(devid));
    }
    const controller = new Device();
    return new Promise((resolve, reject) => {
      controller.request(devid, (error) => {
        if (error) {
          console.error('Failed to build device control object', error);
          reject(error);
        } else {
          this.controllerMap.set(devid, controller);
          resolve(controller);
        }
      });
    });
  }

  /* 删除控制器 */
  destroyController(devid: string) {
    this.controllerMap.delete(devid);
  }

  /* 获取设备控制器 */
  getController(devid: string) {
    return this.controllerMap.get(devid);
  }

  /* 获取设备信息 */
  getDevice(devid: string) {
    return this.devMap.get(devid);
  }

  /* 获取设备列表信息 */
  getDeviceList(type?: IDeviceType) {
    if (type) {
      return [...this.devMap.values()].filter((item) => item.type === type);
    } else {
      return [...this.devMap.values()];
    }
  }

  /* 发送设备消息 */
  sendDeviceInfo(devid: string, data: any, retries = 0): Promise<any> {
    const controller = this.controllerMap.get(devid);
    if (!controller) {
      return Promise.reject('Device control object does not exist!');
    }
    return new Promise((resolve, reject) => {
      controller.send(
        data,
        (err) => {
          if (err) {
            reject('Failed to send device message!');
          } else {
            resolve(null);
          }
        },
        retries
      );
    });
  }

  /**
   * 获取设备品牌配置信息
   * @param info 设备信息
   * @returns 设备配置
   */
  private getBrandConfig(info: any): IBrandConfig | undefined {
    const {
      report: { type, model }
    } = info || {};
    if (type === 'device.humidity' && model === 'IDHUMIDITY01B') {
      return { brand: 'lgzm', type: 'humidity' };
    }
    if (type === 'device.watering' && model === 'IDWATERING01B') {
      return { brand: 'lgzm', type: 'water' };
    }
    if (type === 'device.turbidity' && model === 'IDTURBIDITY01B'){
      return {brand: 'lgzm', type: 'turbidity'}
    }
    return { brand: 'other', type: 'other' };
  }
}

const devManager = new DeviceManager();

export default devManager;
