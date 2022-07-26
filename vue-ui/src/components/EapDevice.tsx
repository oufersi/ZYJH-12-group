import { Component, Prop, Vue } from 'vue-property-decorator';
import style from '@/styles/components/device.module.less';

@Component({})
export default class EapDevice extends Vue {
  @Prop({ default: false }) waterActive?: boolean;
  @Prop({ default: false }) sensorOneActive?: boolean;
  @Prop({ default: false }) sensorTwoActive?: boolean;

  public render() {
    return (
      <div class={style['device']}>
        <div class={[style['device-img-water'], this.waterActive && style['device-img-water-selected']]} onClick={() => this.$emit('water')}></div>
        <div class={[style['device-dot-water'], this.waterActive && style['device-dot-water-active']]}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div class={style['device-edger']}></div>
        <div class={[
          style['device-dot-sensor'], 
          this.sensorOneActive && style['device-dot-sensor-active'],
          this.sensorOneActive && style['device-dot-sensor-active']
          ]}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div class={[style['device-img-sensor-one'], this.sensorOneActive && style['device-img-sensor-one-selected']]} onClick={() => this.$emit('sensorOne')}></div>
        <div class={[style['device-img-sensor-two'], this.sensorTwoActive && style['device-img-sensor-two-selected']]} onClick={() => this.$emit('sensorTwo')}></div>     
      </div>
    );
  }
}
