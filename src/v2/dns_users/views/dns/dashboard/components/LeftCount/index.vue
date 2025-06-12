<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 6 }"
      :lg="{ span: 6 }"
      :xl="{ span: 6 }"
      v-for="(item, key) in countList"
      :key="key"
    >
      <div
        class="p-lg shadow bg-ants-bg-1 pr-0 mb-lg flex items-center cursor-pointer rounded-2xl"
        @click="$router.push(item.url)"
      >
        <span
          :class="item.icon"
          class="text-6xl text-success"
          :style="{ color: item.color }"
        ></span>
        <div class="pl-lg">
          <div class="mb-lg text-2xl">{{ antsT(item.name) }}</div>
          <div>
            <span class="text-4xl mr-xs">{{ item.num || 0 }}</span
            >{{ antsT('个') }}
            <span class="ml-sm text-error" v-if="item.error"
              >{{ antsT('异常') }} <strong>{{ item.error }}</strong></span
            >
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  props: {
    countObj: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  computed: {
    countList() {
      const { domain, domainErr, ptr, httpdns, monitor } = this.countObj
      return {
        domain: {
          name: 'DNS解析',
          num: domain,
          icon: 'el-icon-s-flag',
          color: '#177DFF',
          error: 0,
          url: '/dns/domain'
        },
        ptr: {
          name: '反向解析',
          num: ptr,
          icon: 'el-icon-s-opportunity',
          color: '#02B340',
          url: '/dns/domain/ptr'
        },
        monitor: {
          name: '调度任务',
          num: monitor,
          icon: 'el-icon-s-marketing',
          color: '#FAC858',
          error: 0,
          url: '/dns/a-monitor/gtm'
        },
        httpdns: {
          name: 'HTTPDNS',
          num: httpdns,
          icon: 'el-icon-s-shop',
          color: '#FB9679',
          url: '/dns/httpdns/configure'
        }
      }
    }
  }
}
</script>
