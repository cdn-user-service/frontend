<template>
  <div class="qr_code_box verified-success-box">
    <span
      class="qr_icon_span aicon icon-zhifuchenggong"
      style="color:#3ac26a"
    ></span>
    <ul class="flex-1 pt-lg">
      <li class="font-bold text-3xl">
        {{ antsT('恭喜您，已完成实名认证！') }}
      </li>
      <li class="space-y-12 mt-xxl">
        <div class="ver-item">
          <span>{{ antsT('认证姓名') }}</span>
          <span>{{ verifiedSuccess.realnameName }}</span>
        </div>
        <div class="ver-item">
          <span>{{ antsT('身份证号') }}</span>
          <span>{{ verifiedSuccess.realnameCertificateid }}</span>
        </div>
        <div class="ver-item">
          <span>{{ antsT('认证方式') }}</span>
          <span>
            {{
              verifiedSuccess.realnameMode == 2
                ? antsT('微信人脸核身认证')
                : antsT('支付宝人脸核身认证')
            }}
          </span>
        </div>
        <div class="ver-item">
          <span>{{ antsT('认证时间') }}</span>
          <span>{{ verifiedSuccess.realnameTime }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 第三步、认证成功返回的数据
      verifiedSuccess: {
        realnameName: '你的名字',
        realnameCertificateid: '565656568989898989',
        realnameMode: 2,
        realnameTime: '2020-10-10 10:00:00'
      }
    }
  },
  created() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.verified-success-box.qr_code_box {
  border: none;
  max-width: 600px; 
  margin: 20px auto 30px;
  .ver-item {
    > span:first-child {
      color: theme('colors.ants-text-4');
      display: inline-block;
      width: 130px;
    }
  }
}
</style>
