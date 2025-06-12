<template>
  <div class="animated fadeIn site-bulk">
    <horizontal-menu
      parent-path="/cdn/site/bulk?handle="
      :menu-list="menuList"
      title="批量操作"
      isFullPath
    />

    <el-card class="site-bulk-main">
      <template v-if="form.handle !== 'source-site'">
        <div class="font-semibold pb-sm text-ants-text-3">请选择域名</div>
        <SelectDomain
          v-model="form.siteIds"
          value-key="id"
          @change="changeSelectDomain"
          multiple
          width="320px"
          size="medium"
        />
      </template>

      <component :is="form.handle" ref="ChildFormRef" :siteIds="form.siteIds" />

      <div class="py-df" v-if="form.handle !== 'source-site'">
        <ants-button
          :disabled="$root.disabledCrud"
          type="primary"
          size="medium"
          :text="form.handle == 'cache-clear' ? '清理缓存' : '批量修改'"
          :loading="btnLoading"
          @click="doSave()"
        />

        <ants-button
          type="info"
          size="medium"
          text="重置配置"
          :disabled="btnLoading"
          @click="doReset()"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import basic from './basic'
import sourceSite from './source-site'
import backsource from './backsource'
import performance from './performance'
import advanced from './advanced'
import businessSecure from './business-secure'
import applicationSecure from './application-secure'
import waf from './waf'
import cacheClear from './cache-clear'
import SelectDomain from './SelectDomain'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doBulkUpdateSiteAttr } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const menuList = [
  {
    title: '基础配置', // 证书、日志记录模式
    path: 'basic'
  },
  {
    title: '源站配置',
    path: 'source-site'
  },
  {
    title: '回源配置', // 全部
    path: 'backsource'
  },
  {
    title: '缓存优化', // 全部
    path: 'performance'
  },
  // {
  //   title: '线路配置',
  //   path: 'lines'
  // },
  {
    title: '高级配置', // 全部
    path: 'advanced'
  },
  // {
  //   title: '内容安全',
  //   path: 'content-secure'
  // },
  {
    title: '业务安全', // 全部
    path: 'business-secure'
  },
  {
    title: '应用安全', // 全部
    path: 'application-secure'
  },
  {
    title: '精准访问控制',
    path: 'waf'
  },
  {
    title: '缓存清理',
    path: 'cache-clear'
  }
]

export default {
  components: {
    basic,
    sourceSite,
    backsource,
    performance,
    advanced,
    businessSecure,
    applicationSecure,
    waf,
    cacheClear,
    SelectDomain
  },
  data() {
    return {
      menuList,
      btnLoading: false,
      form: {
        // handle: this.$route.query.handle || 'basic',
        handle: 'basic',
        // 站点ID
        siteIds: []
      },
      rules: {
        siteIds: [
          {
            required: true,
            message: '请选择域名',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  watch: {
    '$route.query.handle': {
      handler(newVal) {
        this.form.handle = newVal || 'basic'
      },
      immediate: true
    }
  },
  created() {
    this.$router.replace({
      query: { handle: this.form.handle }
    })
  },
  methods: {
    // 批量修改提交
    async doSave() {
      const { siteIds, handle } = this.form
      if (!siteIds.length) {
        return this.$msg.error('请选择域名')
      }

      const { getForm = () => {} } = this.$refs.ChildFormRef
      const formData = getForm()
      // 判断formData 是否为对象
      if (!this.$valid.isObject(formData)) return

      const list = Object.keys(formData).map((key) => {
        return {
          // 站点属性名
          key,
          // 属性值
          value: formData[key]
        }
      })

      if (!list.length) return

      console.log(list)

      this.btnLoading = true
      try {
        const { data: res } = await doBulkUpdateSiteAttr({
          // 站点ID，多个用逗号分隔
          siteIds: siteIds + '',
          list
        })
        if (res.code !== 1) return
        this.$msg.success(handle == 'cache-clear' ? '清理缓存成功' : '修改成功')
      } finally {
        this.btnLoading = false
      }
    },

    // 手动重置表单数据，重新加载当前组件
    doReset() {
      const oldHandle = this.form.handle
      this.form.handle = null
      setTimeout(() => {
        this.form.handle = oldHandle
      })
    },

    changeSelectDomain() {}
  }
}
</script>

<style lang="scss">
.site-bulk {
  .el-tabs__item {
    font-weight: 600;
    color: theme('colors.ants-text-3');
  }
}
</style>

<style lang="scss" scoped>
.menu-item {
}
.menu-item.active-menu {
  background-color: theme('colors.ants-bg-1');
  color: theme('colors.primary');
  box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.1);
}
</style>

<style lang="scss">
.site-bulk {
  &-main {
    .el-card {
      box-shadow: none !important;
      border-radius: 0;
      .el-card__body {
        padding: 0;
      }
    }
  }
}
</style>
