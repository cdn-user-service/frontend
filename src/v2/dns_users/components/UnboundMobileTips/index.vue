<template>
  <div class="content-box" style="margin-top:0;margin-bottom:0;">
    <el-alert show-icon type="error">
      <div slot="title">
        {{ antsT('温馨提示：根据相关规定，您需要') }}
        <router-link
          to="/dns/account/info"
          class="font-bold"
          style="color:#f52443;text-decoration: underline;"
          >{{ antsT('绑定手机号') }}</router-link
        >
        {{ antsT('才能进行相关操作！') }}
      </div>
    </el-alert>
  </div>
</template>

<script>
export default {
  name: 'UnboundMobileTips',
  data() {
    return {}
  }
}
</script>
