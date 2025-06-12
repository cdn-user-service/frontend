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
      mode="stream"
      :is-show-step="!isOrigin"
    >
      <!-- 统计来源数据显示 -->
      <template slot="front" v-if="isOrigin">
        <QueryArea ref="QueryAreaRef" class="mr-lg" @getChart="getChart" />
      </template>

      <!-- 统计端口 -->
      <template>
        <QueryPort ref="QueryPortRef" @getChart="getChart" />
      </template>
    </QueryForm>

    <router-view ref="chartMainRef" @getFormData="getFormData"></router-view>
  </el-card>
</template>

<script>
import QueryForm from '../components/QueryForm'
// 查询区域
import QueryArea from '../components/QueryArea'
// 查询端口
import QueryPort from '../components/QueryPort'

export default {
  components: {
    QueryForm,
    QueryArea,
    QueryPort
  },
  data() {
    return {
      rootPath: '/cdn/stream/monitor/',
      menuList: Object.freeze([
        {
          title: '流量带宽',
          path: 'flow'
        },
        {
          title: '来源数据',
          path: 'origin'
        },
        {
          title: '状态码监控',
          path: 'code'
        }
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
      formObj.port = this.getQueryPort()
      console.log(formObj.port)

      // 来源数据，查询 区域 area
      if (this.isOrigin) {
        formObj.area = this.$refs.QueryAreaRef.area
      }
      return formObj
    },

    /**
     * @description: 查询端口
     */
    getQueryPort() {
      let portArr = this.$refs.QueryPortRef.checkPort
      // 如果没有选择端口，则默认选择全部端口
      if (!portArr.length) {
        portArr = this.$refs.QueryPortRef.portAllArr
      }
      // 如果没有任何端口，则提示没有端口
      if (!portArr.length) {
        //  this.$msg.error('没有任何端口111')
      }
      return portArr
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
