import { Vue, Component } from 'vue-property-decorator';
import style from '@/styles/views/water.module.less';
import {
  Button,
  Cell,
  CellGroup,
  Dialog,
  Field,
  NavBar,
  Picker,
  Popup,
  Radio,
  RadioGroup,
  Slider,
  Stepper,
  Tag
} from 'vant';
import { ISimpleDevice } from '@/interfaces/device.interface';
import { EapWaveBall, EapDevice, EapSlider } from '../components';
import { IResponse } from '@/interfaces/api.interface';

Vue.use(Dialog);

const DEFAULT_SETTINGS = [
  {
    id: 'Custom',
    label: '自定义',
    limit: 60
  },
  {
    id: 'Chlorophytum',
    label: '吊兰',
    limit: 64
  },
  {
    id: 'GreenRose',
    label: '绿萝',
    limit: 76
  },
  {
    id: 'Ivy',
    label: '常春藤',
    limit: 55
  }
];

@Component({
  components: {
    'eap-wave-ball': EapWaveBall,
    'eap-device': EapDevice,
    'eap-slider': EapSlider,
    'van-nav-bar': NavBar,
    'van-tag': Tag,
    'van-cell': Cell,
    'van-field': Field,
    'van-stepper': Stepper,
    'van-button': Button,
    'van-radio-group': RadioGroup,
    'van-radio': Radio,
    'van-cell-group': CellGroup,
    'van-slider': Slider,
    'van-picker': Picker,
    'van-popup': Popup
  },
  sockets: {
    devices(data = []) {
      this.$data.list = data;
    },
    join(dev: ISimpleDevice) {
      if (dev.type === 'humidity') {
        this.$data.humidifierId = dev.devid;
      } else if (dev.type === 'water') {
        this.$data.waterId = dev.devid;
      }
      // 加入新设备
    },
    lost(dev: ISimpleDevice) {
      if (dev.type === 'humidity') {
        this.$data.humidifierId = '';
        this.$edger.notify.error('土壤湿度探测设备丢失！');
      } else if (dev.type === 'water') {
        this.$data.waterId = '';
        this.$edger.notify.error('智能浇水设备丢失！');
      }
    },
    error(msg) {
      this.$edger.notify.error(msg);
    },
    humidity(data) {
      this.$data.hygrometer = data;
    },
    setting(data: { id: string; limit: number }) {
      const setting = DEFAULT_SETTINGS.find(item => item.id === data.id);
      if (setting) {
        this.$data.setting = { ...setting, ...data };
      }
    }
  }
})
export default class Water extends Vue {
  private list: ISimpleDevice[] = []; // 设备列表
  private humidifierId = ''; // 湿度感应设备id
  private waterId = ''; // 浇水器设备id
  private turbidityId = ''; // 水浊度检测设备id
  // 新属性和新设备id
  private hygrometer = 93; // 当前湿度值
  private turbidity = 15; // 当前水浊度
  private model = {
    show: false,
    type: 'humidifier', // humidifier || water || turbidity ||其他新设备
    title: '湿度检测器'
  };
  private setting = {
    id: 'Custom',
    label: '自定义',
    limit: 60
  };

  created() {
    this.$socket?.client.emit('init');
  }

  public render() {
    return (
      <div class={style['water']}>
        <h4>绿植保姆</h4>
        <div class={style['water-content']}>
          {/* 当前数据显示 */}
          <div class={[style['water-viewport'], !this.humidifierId && style['water-viewport-disabled']]}>
            <eap-wave-ball
              disabled={!this.humidifierId}
              value={this.hygrometer}
              lowLimit={this.hygrometer < this.setting.limit}
            />
          </div>
          
          <div class={}>

          </div>

          {/* 设备选择 */}
          <h4>设备选择</h4>
          <div class={style['water-dev']}>
            {/* left right 什么意思 */}
            <eap-device
              leftActive={this.humidifierId}
              rightActive={this.waterId}
              on={{ left: () => this.showModel('humidifier'), right: () => this.showModel('water') }}
            />
          </div>

          {/* 数据设定 */}
          <h4>数据设定</h4>
          <div class={style['water-operation']}>
            <div class={style['water-operation-tabbar']} on-click={this.handleChangeSettings}>
              {DEFAULT_SETTINGS.map(item => (
                <div
                  class={[
                    style['water-operation-tabbar-item'],
                    this.setting?.id === item.id && style['water-operation-tabbar-item-selected']
                  ]}
                  data-id={item.id}>
                  {item.label}
                </div>
              ))}
            </div>
            <eap-slider
              disabled={!this.waterId || !this.humidifierId}
              readonly={this.setting && this.setting.id !== 'Custom'}
              value={this.setting.limit}
              on-change={this.handleChangeLimit}
            />
          </div>
        </div>
        {this.renderDevModel()}
      </div>
    );
  }

  private renderDevModel() {
    return (
      <van-dialog
        v-model={this.model.show}
        title={this.model.title}
        showConfirmButton={false}
        closeOnClickOverlay
        class={style['model']}>
        <div class={style['model-list']}>{this.renderSelectDevList()}</div>
      </van-dialog>
    );
  }

  private renderSelectDevList() {
    return (
      <van-radio-group value={this.model.type === 'humidifier' ? this.humidifierId : this.waterId}>
        <van-cell-group>
          {this.list.map((item: ISimpleDevice) => {
            return (
              <van-cell
                title={item.alias}
                clickable
                on-click={() => {
                  this.selectDevice(item);
                }}>
                <van-radio name={item.devid} slot='right-icon' />
              </van-cell>
            );
          })}
        </van-cell-group>
      </van-radio-group>
    );
  }

  private showModel(type: 'humidifier' | 'water') {
    this.model = {
      type,
      show: true,
      title: type === 'humidifier' ? '湿度检测器' : '浇水设备'
    };
  }

  private handleChangeSettings(e: TouchEvent) {
    const target = e.target as HTMLDivElement;
    if (target && target.dataset.id) {
      const setting = DEFAULT_SETTINGS.find(item => item.id === target.dataset.id) as any;
      this.$socket?.client.emit('change-scene-setting', { id: setting.id, limit: setting.limit }, (res: IResponse) => {
        if (!res.result) {
          this.$edger.notify.error(res.message);
        }
      });
    }
  }

  private handleChangeLimit(v: number) {
    this.$socket?.client.emit('change-scene-setting', { id: this.setting.id, limit: v }, (res: IResponse) => {
      if (!res.result) {
        this.$edger.notify.error(res.message);
      }
    });
  }

  // 选择场景设备
  private async selectDevice(dev: ISimpleDevice) {
    let delete_id = '';
    if (this.model.type === 'humidifier') {
      if (this.humidifierId === dev.devid) {
        return;
      }
      if (dev.type !== 'humidity') {
        return this.$edger.notify.error('请选择湿度检测器设备！');
      }
      delete_id = this.humidifierId;
    } else if (this.model.type === 'water') {
      if (this.waterId === dev.devid) {
        return;
      }
      if (dev.type !== 'water') {
        return this.$edger.notify.error('请选择浇水设备！');
      }
      delete_id = this.waterId;
    }
    this.$socket.client.emit('change-scene-devices', { add_id: dev.devid, delete_id }, (res: IResponse) => {
      if (!res || !res.result) {
        this.$edger.notify.error(res?.message || '操作失败！');
      }
    });
    this.model.show = false;
  }
}
