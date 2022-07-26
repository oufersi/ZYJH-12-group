import { Component, Prop, Vue } from 'vue-property-decorator';
import style from '@/styles/components/wave-ball.module.less';

@Component({})
export default class EapWaveBall extends Vue {
  @Prop({ default: false }) disabled?: boolean;
  @Prop({ default: 60 }) value!: number;
  @Prop({ default: false }) lowLimit?: boolean;
  @Prop({ default: false }) highLimit?: boolean;
  
  public render() {
    return (
      <div class={[style['wave-ball'], this.disabled && style['wave-ball-disabled']]}>
        <div class={style['wave-ball-wave']}>
          <div
            class={[
              style['wave-ball-wave-img'],
              this.lowLimit && style['wave-ball-wave-img-humidity-limit'],
              this.highLimit && style['wave-ball-wave-img-turbidity-limit'],
              (this.value < 10 || this.value > 90) && style['wave-ball-wave-img-disabled']
            ]}
            style={{ top: 106 - (this.value / 100) * 212 + 'px' }}></div>
        </div>
        <div class={style['wave-ball-content']}>
          {/* {this.$slots.default} */}
          {/* 数据显示 */}
          <div class={style['status']}>
            <h5 class={this.value < 70 && style['status-color-black']}>
              土壤湿度<span>(%)</span>
            </h5>
            <div class={[style['status-value'], this.value < 55 && style['status-color-black']]}>
              <span>{this.value || ''}</span>
              <span>%</span>
            </div>
            <div class={[style['status-text'], this.lowLimit && style['status-text-humidity-warning'], this.highLimit && style['status-text-turbidity-warning']]}>{this.lowLimit ? '湿度干燥' : '湿度适宜'}</div>
            <div class={[style['status-text'], this.lowLimit && style['status-text-humidity-warning'], this.highLimit && style['status-text-turbidity-warning']]}>{this.highLimit ? '水源浑浊' : '水源清澈'}</div>
          </div>
        </div>
      </div>
    );
  }
}
