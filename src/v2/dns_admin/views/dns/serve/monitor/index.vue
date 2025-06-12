<template>
  <AntsTabCard
    ref="AntsTabCardRef"
    :tab-arr="groupList"
    value-key="id"
    label-key="name"
    @change="changeGroup"
  >
    <ul class="menu-wrap flex items-center rounded-2xl flex-wrap">
      <li
        class="menu-item one_show_h rounded-2xl cursor-color"
        :class="{
          'active-menu': $route.path === `/dns/serve/monitor/${item.path}`
        }"
        v-for="item in menuList"
        :key="item.path"
        @click="$router.push(`/dns/serve/monitor/${item.path}`)"
      >
        {{ item.title }}
      </li>
    </ul>

    <router-view
      :dns-client-arr="dnsClientArr"
      ref="chartMainRef"
    ></router-view>
  </AntsTabCard>
</template>

<script>
// API
import {
  getSeverGroupNav,
  getHostListByGroupId
} from '@/v2/dns_admin/api/dns/serve'

const groupClientObj = {}
export default {
  data() {
    return {
      menuList: Object.freeze([
        // {
        //   title: '流量监控',
        //   path: 'flow'
        // },
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
      ]),

      groupList: [],
      dnsClientArr: []
    }
  },
  created() {
    this.getSeverGroupList()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取分组列表
     */

    async getSeverGroupList() {
      this.$root.loading = true
      try {
        const { data: res } = await getSeverGroupNav()
        this.$root.loading = false
        if (res.code !== 1) {
          this.$root.loading = false
          return
        }
        this.groupList = res.data || []
        if (this.groupList.length) {
          // this.getHostListByGroupIdData(this.groupList[0].id)
          this.groupList.forEach(item => {
            groupClientObj[item.id] = item.childNodeList || []
          })
          this.getChildNodeList(this.groupList[0].id)
        } else {
          this.$root.loading = false
        }
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    // 获取分组下的主机列表
    getChildNodeList(groupId) {
      const childNodeList = groupClientObj[groupId] || []
      this.dnsClientArr = childNodeList.map(item => {
        return {
          ip: item.ip,
          loading: false
        }
      })
      this.$refs.chartMainRef.getTimeLineChart(this.dnsClientArr)
    },

    /**
     * @description: 切换分组
     * @param {*} val
     */

    changeGroup(val) {
      this.getChildNodeList(val)
    },

    /**
     * @description: 根据业务分组ID获取 dns_host 列表
     */

    async _getHostListByGroupIdData(groupId) {
      try {
        const { data: res } = await getHostListByGroupId({
          groupId
        })
        this.$root.loading = false

        if (res.code !== 1) return

        const dnsClientIpArr = []
        if (res.data && res.data[1]) {
          res.data[1].forEach(item => {
            const clientArr =
              item.dnsClientList && JSON.parse(item.dnsClientList)
            if (!clientArr) return
            const clientIpArr = clientArr.map(item2 => {
              return {
                ip: item2.ip,
                loading: false
              }
            })
            if (clientIpArr.length) {
              dnsClientIpArr.push(...clientIpArr)
            }
          })
        }

        this.dnsClientArr = dnsClientIpArr
        this.$refs.chartMainRef.getTimeLineChart(dnsClientIpArr)
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-wrap {
  padding: 6px;
  background-color: theme('colors.ants-bg-3');
  .menu-item {
    width: 120px;
    padding: 10px 0;
    font-size: 12px;
    font-weight: 600;
    color: theme('colors.ants-text-3');
    text-align: center;
    white-space: nowrap;
    &:hover {
      color: theme('colors.primary');
    }
  }
  .menu-item.active-menu {
    background-color: theme('colors.ants-bg-1');
    color: theme('colors.primary');
    box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.1);
  }
}
</style>
