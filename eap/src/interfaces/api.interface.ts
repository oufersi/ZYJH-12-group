export interface IResponse {
  result: boolean;
  message: string;
  data?: any;
}

export type ICallBack = (res: IResponse) => void;

export type IDeviceCategory = 'device' | 'lora' | 'mqtt' | 'coap'