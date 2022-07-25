import { Component, Vue } from 'vue-property-decorator';
import style from '@/styles/components/loading.module.less';

@Component({})
export default class EapLoading extends Vue {
  public render() {
    return (
      <div class={style['sk-cube-grid']}>
        <div class={[style['sk-cube'], style['sk-cube1']]}></div>
        <div class={[style['sk-cube'], style['sk-cube2']]}></div>
        <div class={[style['sk-cube'], style['sk-cube3']]}></div>
        <div class={[style['sk-cube'], style['sk-cube4']]}></div>
        <div class={[style['sk-cube'], style['sk-cube5']]}></div>
        <div class={[style['sk-cube'], style['sk-cube6']]}></div>
        <div class={[style['sk-cube'], style['sk-cube7']]}></div>
        <div class={[style['sk-cube'], style['sk-cube8']]}></div>
        <div class={[style['sk-cube'], style['sk-cube9']]}></div>
      </div>
    );
  }
}
