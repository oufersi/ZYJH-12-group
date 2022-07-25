export interface IDevice {
  devid: string; // 设备ID
  alias: string; // 设备别名
  join: boolean; // 设备是否已加入网络
  probe: false; // 仅ZigBee设备包含此成员，指示是否允许对该设备进行探测。
  addr?: string; // 如果是网络设备，则表示目标设备的IP地址
  // server?: {};
  report: {
    desc: string; // 设备描述信息
    excl: boolean; // 此设备是App专有的
    model: string; // 设备型号
    name: string; // 当前机器的名称
    type: string; // 机器的类型。通常为：'monitor'，'edger'，'device'
    vendor: string; // 设备制造商
  };
}


/* 简化设备信息 */
export interface ISimpleDevice {
  devid: string; // 设备ID
  alias: string; // 设备别名
  brand: IDeviceBrand; // 设备品牌
  type: IDeviceType; // 设备类型
}

/* 设备品牌 */
export type IDeviceBrand = 'lumi' | 'jhkj' | 'lgzm' | 'other';

/* 设备类型 */
export type IDeviceType = 'humidity' | 'water' | 'other';

export type IScenes = 'relax' | 'night' | 'movies' | 'wakeup' | 'dinner' | 'reading';

export interface ILightState {
  channel0?: boolean; // 开关
  brightness?: number; // 1-255 亮度
  scenes?: IScenes | '-'; // 传感器耦控制亮度和色温
  colorTemperature?: number; // 1-x 色温
}
