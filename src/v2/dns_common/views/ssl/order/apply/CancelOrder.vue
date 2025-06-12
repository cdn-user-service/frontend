<template>
  <el-card class="content-box">
    <div slot="header">
      <TitleBorder :title="`订单${title}`" />
    </div>

    <div class="flex justify-center">
      <el-result
        icon="warning"
        :title="`订单${title}`"
        :subTitle="`该订单${title}，您可以返回重新购买`"
      >
        <template slot="extra">
          <ants-button
            type="primary"
            size="medium"
            icon="el-icon-back"
            text="返回"
            @click="handleBack()"
          />
        </template>
      </el-result>
    </div>
  </el-card>

</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '已取消'
    }
  },
  data() {
    return {}
  },
  methods: {
    handleBack() {
      this.$router.replace('/dns/ssl/order')
    }
  }
}
</script>
