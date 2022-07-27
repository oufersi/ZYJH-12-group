import { Component, Prop, Vue } from 'vue-property-decorator';
import style from '@/styles/components/turbidity-bar.module.less';

@Component({})
export default class EapTurbidityBar extends Vue {
  @Prop({ default: false }) disabled?: boolean;
  @Prop({ default: false }) highLimit?: boolean;

  public render() {
    console.log(this.highLimit);
    return (
      <div class={[style['turbidity-bar'], this.disabled && style['turbidity-disabled']]}>
        <div class={[style['status-color'], this.highLimit && style['status-color-limit']]}>水浊度情况</div>
        <div class={[style['status-color'], this.highLimit && style['status-color-limit']]}>{this.highLimit ? '水源浑浊' : '水源清澈'}</div>
      </div>
    );
  }
}