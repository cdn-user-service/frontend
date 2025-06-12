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
        {{ item.title }}
      </li>
    </ul>

    <QueryForm ref="QueryFormRef" @getChart="getChart">
      <!-- 查询节点 -->
      <QueryNode ref="QueryNodeRef" @getChart="getChart" />
    </QueryForm>

    <router-view ref="chartMainRef" @getFormData="getFormData"></router-view>
  </el-card>
</template>

<script>
import QueryForm from '../components/QueryForm'
import QueryNode from '../components/QueryNode'
export default {
  components: {
    QueryForm,
    QueryNode
  },
  data() {
    return {
      rootPath: '/cdn/node/monitor/',
      menuList: Object.freeze([
        {
          title: '流量监控',
          path: 'flow'
        },
        {
          title: '带宽监控',
          path: 'bandwidth'
        },
        {
          title: '请求数',
          path: 'request'
        },
        {
          title: '连接数',
          path: 'connect'
        },
        {
          title: '负载情况',
          path: 'nodeload'
        },
        {
          title: 'CPU监控',
          path: 'cpu'
        },
        {
          title: '内存监控',
          path: 'memory'
        },
        {
          title: '磁盘监控',
          path: 'disk'
        },
        {
          title: '磁盘IO',
          path: 'diskio'
        },
        {
          title: '网络IO',
          path: 'networkio'
        }
      ])
    }
  },
  watch: {
    // 监听路由地址的改变
    '$route.path': (newPath, oldPath) => {
      // console.log(newPath)
      // this.getChart()
    }
  },
  created() {},
  mounted() {},

  methods: {
    /**
     * @description: 获取查询表单数据
     */

    getFormData() {
      const formObj = this.$refs.QueryFormRef.getQueryData()
      // 查询节点
      formObj.node = this.getQueryNode()

      return formObj
    },

    /**
     * @description: 查询节点
     */
    getQueryNode() {
      let nodeArr = this.$refs.QueryNodeRef.checkNode
      // 如果没有选择节点，则默认选择全部节点
      if (!nodeArr.length) {
        nodeArr = this.$refs.QueryNodeRef.nodeAllArr
      }
      // 如果没有任何节点，则提示没有节点
      if (!nodeArr.length) {
        this.$msg.error('没有任何节点')
      }
      return nodeArr
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
