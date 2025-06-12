<template>
  <div v-loading="$root.loading">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 6 }"
        :md="{ span: 5 }"
        :lg="{ span: 4 }"
        :xl="{ span: 4 }"
      >
        <ul class="
            py-lg pr-lg mb-lg rounded-2xl bg-ants-bg-1 shadow">
          <li
            v-for="(item, key) in menuObj"
            :key="key"
            class="left-menu-item text-ants-text-2 cursor-color font-bold"
            :class="{ 'menu-active': key === activeMenu }"
            @click="toggleMenu(key)"
          >
            {{ item }}
          </li>
        </ul>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 18 }"
        :md="{ span: 19 }"
        :lg="{ span: 20 }"
        :xl="{ span: 20 }"
      >
        <component
          :is="activeMenu"
          :title="menuObj[activeMenu]"
          :domain-info="domainInfo"
          @refresh="getDomainInfo"
          ref="childRef"
          class="animated fadeInUp"
        ></component>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Basic from './components/Basic'
import Advanced from './components/Advanced'
import Domain from './components/Domain'
import DNSSEC from './components/DNSSEC'

const menuObj = {
  Basic: '域名信息',
  Advanced: '高级设置',
  // Meal: '套餐服务',
  Domain: '域名管理',
  DNSSEC: 'DNSSEC'
}
export default {
  components: {
    Basic,
    Advanced,
    Domain,
    DNSSEC
  },
  props: {
    domainInfo: {
      type: Object,
      default: () => ({
        id: '',
        domain: '',
        // 套餐信息
        product: {},
        // 增值业务
        increment: [],

        // 服务器状态
        whoisStatus: 0,
        whoisInfo: '',

        // 备注信息
        remarks: '',
        // 是否已锁定 1 = 已锁定 0 = 未锁定
        locked: 0,
        // 解析状态 1 = 开启，0 = 关闭
        status: 0
      })
    }
  },
  data() {
    return {
      id: this.$route.params.id,
      domain: this.$route.params.domain,

      activeMenu: this.$route.query.menu || 'Basic',
      menuObj
    }
  },
  created() {
    console.log('setting')
    this.getDomainInfo()
  },
  methods: {
    // 获取域名信息
    async getDomainInfo() {
      this.$emit('getDomainInfo', () => {
        this.initChildData()
      })
    },

    initChildData() {
      this.$nextTick(() => {
        this.$refs.childRef &&
          this.$refs.childRef.initData &&
          this.$refs.childRef.initData(this.domainInfo)
      })
    },

    toggleMenu(key = '') {
      this.activeMenu = key
      this.$router.push({
        query: {
          menu: key
        }
      })
      this.initChildData()
    }
  }
}
</script>

<style lang="scss" scoped>
.left-menu-item {
  padding: 14px 14px 14px 30px;
  font-size: 15px;
  border-radius: 0 10px 10px 0;
  transition: all 0.3s;
}
.menu-active.left-menu-item {
  background-color: theme('colors.primary-light');
  color: theme('colors.primary');
}
@media screen and (max-width: 767px) {
  .left-card-tab {
    display: flex;
    padding-left: 10px;
    padding-right: 10px;
    .left-menu-item {
      padding: 10px 15px;
      font-size: 13px;
      border-radius: 10px;
    }
  }
}
</style>
