/* 完整设备信息 */
export interface IDevice {
  devid: string; // 设备ID
  join: boolean; // 是否加入网络
  alias: string; // 设备别名
  report: IDeviceReport;
  server?: {
    coap: Array<{
      port: number;
    }>;
  };
  addr?: string;
  probe?: boolean;
}

/* 简化设备信息 */
export interface ISimpleDevice {
  devid: string; // 设备ID
  alias: string; // 设备别名
  brand: IDeviceBrand; // 设备品牌
  type: IDeviceType; // 设备类型
}

/* 设备出厂报告信息 */
export interface IDeviceReport {
  desc: string; // 设备描述信息
  excl: boolean; // 此设备是App专有的
  model: string; // 设备型号
  name: string; // 当前机器的名称
  type: string; // 机器的类型。通常为：'monitor'，'edger'，'device'
  vendor: string; // 设备制造商
  version?: number[];
}

/* 设备厂家配置 */
export interface IBrandConfig {
  brand: IDeviceBrand;
  type: IDeviceType;
}

/* 设备品牌 */
export type IDeviceBrand = 'lumi' | 'jhkj' | 'lgzm' | 'other';

/* 设备类型 */
export type IDeviceType = 'humidity' | 'water' | 'turbidity' | 'other';

/* 设备控制对象 */
export { default as IController } from 'device';
