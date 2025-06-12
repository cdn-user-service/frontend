<template>
  <div class="payment-main">
    <el-card class="animated fadeIn mb-lg">
      <div style="margin-bottom:-10px;">
        <strong
          v-for="item in menuList"
          :key="item.MealBuy"
          @click="goPage(item.name, item.type)"
          class="pb-xs cursor-color inline-block mr-lg"
          :class="{ 'active-strong': onActive === item.name }"
          >{{ item.title }}</strong
        >
        <ants-button
          style="margin-top:-5px;"
          icon="el-icon-back"
          size="mini"
          type="info"
          @click="$router.go(-1)"
          class="float-right"
          text="返回重选"
        />
      </div>
    </el-card>

    <router-view> </router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: 'DNS解析套餐',
          url: 'plans',
          name: 'PurchasePlans',
          type: 1
        },
        {
          title: 'DNS增值业务',
          url: 'vas',
          name: 'PurchaseVas'
        }
      ]
    }
  },
  computed: {
    onActive({ $route }) {
      return $route.name
    }
  },
  methods: {
    goPage(name, type) {
      this.$router.replace({ name, params: { type } })
    }
  }
}
</script>

<style lang="scss" scoped>
.active-strong {
  color: theme('colors.primary');
  border-bottom: 2px solid theme('colors.primary');
}
</style>
