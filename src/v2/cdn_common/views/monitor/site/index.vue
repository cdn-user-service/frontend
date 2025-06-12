<template>
  <el-card class="content-box" style="margin-top:0;">
    <ul
      class="menu-wrap flex items-center flex-wrap mb-lg rounded-2xl bg-ants-bg-3 p-3"
    >
      <li
        class="menu-item py-sm px-xl text-center text-sm font-bold text-ants-text-3
         rounded-2xl cursor-color"
        :class="{
          'active-menu': $route.path === rootPath + item.path
        }"
        v-for="item in menuList"
        :key="item.path"
        @click="$router.push(rootPath + item.path)"
      >
        {{ antsT(item.title) }}
      </li>
    </ul>

    <QueryForm
      ref="QueryFormRef"
      @getChart="getChart"
      mode="site"
      :is-show-step="!isOrigin"
    >
      <!-- 统计来源数据显示 -->
      <template slot="front" v-if="isOrigin">
        <QueryArea ref="QueryAreaRef" class="mr-lg" @getChart="getChart" />
      </template>

      <!-- 查询域名 -->
      <template>
        <QueryDomain ref="QueryDomainRef" @getChart="getChart" />
      </template>
    </QueryForm>

    <router-view ref="chartMainRef" @getFormData="getFormData"></router-view>
  </el-card>
</template>

<script>
import QueryForm from '../components/QueryForm'
// 查询区域
import QueryArea from '../components/QueryArea'

// 查询域名
import QueryDomain from '../components/QueryDomain'
export default {
  components: {
    QueryForm,
    QueryArea,
    QueryDomain
  },
  data() {
    return {
      rootPath: '/cdn/site/monitor/',
      menuList: Object.freeze([
        {
          title: '流量带宽',
          path: 'flow'
        },
        // {
        //   title: '访问监控',
        //   path: 'access'
        // },
        {
          title: '来源数据',
          path: 'origin'
        },
        {
          title: '状态码监控',
          path: 'code'
        },
        {
          title: '回源监控',
          path: 'upstream'
        },
        {
          title: '热点监控',
          path: 'hotspot'
        }
        // {
        //   title: '漏洞入侵监控',
        //   path: 'leak'
        // },
        // {
        //   title: 'AI智能拦截',
        //   path: 'ai'
        // },
        // {
        //   title: '精准访问控制',
        //   path: 'waf'
        // }
      ])
    }
  },
  computed: {
    // 是否为来源数据页面
    isOrigin({ $route }) {
      return $route.path.replace(this.rootPath, '') === 'origin'
    }
  },
  watch: {
    // 监听路由地址的改变
    '$route.path': function(newPath, oldPath) {}
  },
  created() {},
  mounted() {},

  methods: {
    /**
     * @description: 获取查询表单数据
     */

    getFormData() {
      const formObj = this.$refs.QueryFormRef.getQueryData()
      // 查询域名
      formObj.host = this.getQueryDomain()
      // 来源数据，查询 区域 area
      if (this.isOrigin) {
        formObj.area = this.$refs.QueryAreaRef.area
      }
      return formObj
    },

    /**
     * @description: 查询域名
     */
    getQueryDomain() {
      // *.通配符要转换成 .*.  不然没有数据
      let domainArr = this.$refs.QueryDomainRef.checkDomain.map(item =>
        item.replace(/\*/g, '.*')
      )
      console.log(domainArr)
      // 如果没有选择域名，则默认选择全部域名
      if (!domainArr.length) {
        domainArr = this.$refs.QueryDomainRef.domainAllArr
      }
      // 如果没有任何域名，则提示没有域名
      if (!domainArr.length) {
        //  this.$msg.error('没有任何域名11')
      }
      // [JSON.stringify({ id: 3126, domain: '.*.cdn.com' })]
      return domainArr
    },

    /**
     * @description: 绘制图表
     */

    getChart() {
      this.$refs.chartMainRef.renderChart()
    }
  },
  destroyed() {}
}
</script>

<style lang="scss" scoped>
.menu-item {
  // width: 120px;
}
.menu-item.active-menu {
  background-color: theme('colors.ants-bg-1');
  color: theme('colors.primary');
  box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.1);
}
</style>
