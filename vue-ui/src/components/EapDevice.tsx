import { Component, Prop, Vue } from 'vue-property-decorator';
import style from '@/styles/components/device.module.less';

@Component({})
export default class EapDevice extends Vue {
  @Prop({ default: false }) leftActive?: boolean;
  @Prop({ default: false }) rightActive?: boolean;

  public render() {
    return (
      <div class={style['device']}>
        <div class={[style['device-img-left'], this.leftActive && style['device-img-left-selected']]} onclick={() => this.$emit('left')}></div>
        <div class={[style['device-dot-left'], this.leftActive && style['device-dot-left-active']]}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div class={style['device-edger']}></div>
        <div class={[style['device-dot-right'], this.rightActive && style['device-dot-right-active']]}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div class={[style['device-img-right'], this.rightActive && style['device-img-right-selected']]} onclick={() => this.$emit('right')}></div>
      </div>
    );
  }
}
