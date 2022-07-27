import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import style from '@/styles/components/slider.module.less';

@Component({})
export default class EapSlider extends Vue {
  @Prop({ default: 0 }) value?: number;
  @Prop({ default: false }) disabled?: boolean;
  @Prop({ default: false }) readonly?: boolean;

  private sliderLeft = 0;
  private sliderWidth = 0;
  private enable = false;
  private percent = 60;

  @Watch('value', { immediate: true })
  watchValue(v: number) {
    this.percent = v;
  }

  mounted() {
    const slider = this.$refs.slider as HTMLDivElement;
    this.sliderLeft = slider.offsetLeft;
    this.sliderWidth = slider.clientWidth;
  }

  public render() {
    return (
      <div
        ref='slider'
        class={[style['slider'], this.disabled && style['slider-disabled'], this.readonly && style['slider-readonly']]}>
        <div class={[style['slider-bar']]} style={{ width: this.percent + '%', background: 'linear-gradient(90deg , #d0e4fc, rgb(' + (201 - 2.01 * this.percent) + ', ' + (223 - 1.21 * this.percent) + ', 255)' }}>
          <span class={[style['slider-text'], this.percent < 20 && style['slider-text-right']]}>
            {this.percent}<span class={style['slider-text-percent']}>%</span>
          </span>
        </div>
        <div
          class={[style['slider-block'], this.enable && style['slider-block-active']]}
          style={{ left: this.percent + '%' }}
          onTouchstart = {this.handleTouchStart}
          onTouchmove = {this.handleTouchMove}
          onTouchend = {this.handleTouchEnd}
          ></div>
      </div>
    );
  }

  private handleTouchStart(e: TouchEvent) {
    console.log('touchstart: ', e);
    this.enable = e.touches.length === 1;
  }

  private handleTouchMove(e: TouchEvent) {
    if (this.enable && e.touches.length === 1) {
      console.log('touchmove: ', e.touches[0].clientX);
      const perc = (e.touches[0].clientX - this.sliderLeft) / this.sliderWidth;
      if (perc < 0) {
        this.percent = 0;
      } else if (perc > 1) {
        this.percent = 100;
      } else {
        this.percent = Number((perc * 100).toFixed(0));
      }
      this.$emit('input', this.percent);
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    console.log('touchend: ', e);
    if (this.enable) {
      this.enable = false;
      this.$emit('change', this.percent);
    }
  }
}
