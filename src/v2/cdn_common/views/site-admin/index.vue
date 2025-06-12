<template>
  <horizontal-menu
    :parent-path="`/cdn/site/domain/admin/`"
    :menu-list="menuList"
    :title="domain"
    backPath="/cdn/site/domain"
    @getSiteDetail="getSiteDetail"
    @saveSiteAttr="saveSiteAttr"
    @deleteSiteAttr="deleteSiteAttr"
    @changeSiteAttrStatus="changeSiteAttrStatus"
    @changeSiteAttrWeight="changeSiteAttrWeight"
    @preheatSite="preheatSite"
    @getRecordListV2="getRecordListV2"
    @getlineList="getlineList"
    @doCreateUpdateDns="doCreateUpdateDns"
    @doCreateDns="doCreateDns"
    @doDeleteDns="doDeleteDns"
    :btnLoading="btnLoading"
  >
  </horizontal-menu>
</template>

<script>
// import { getSiteDetailById, doCreateUpdateSiteAttr, changeAttrStatus, doDeleteSiteAttr } from '@/v2/cdn_admin/api/cdn/site'
const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const {
  getSiteDetailById,
  doCreateUpdateSiteAttr,
  changeAttrStatus,
  doDeleteSiteAttr,
  changeAttrWeight
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)
// 推送数据API
const {
  pushSiteConfToNode,
  pushByInputInfo
} = require(`@/v2/${PROCESS_NAME}/api/cdn/push`)
// 获取dns解析详情
const {
  getRecordListV2,
  getlineListV1,
  doUpdateRecord,
  doCreateRecord,
  doDeleteRecord
} = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)

const menuList = [
  {
    title: '基础配置',
    path: 'basic'
  },
  {
    title: '套餐服务',
    path: 'plan'
  },
  {
    title: '回源配置',
    path: 'backsource'
  },
  {
    title: '缓存优化',
    path: 'performance'
  },
  {
    title: '线路配置',
    path: 'line'
  },
  {
    title: '高级配置',
    path: 'advanced'
  },
  {
    title: '内容安全',
    path: 'content-secure'
  },
  {
    title: '业务安全',
    path: 'business-secure'
  },
  // {
  //   title: '网络安全',
  //   path: 'network-secure'
  // },
  {
    title: '应用安全',
    path: 'application-secure'
  },
  {
    title: '精准访问控制',
    path: 'waf'
  },
  {
    title: '请求日志',
    path: 'log-access'
  },
  {
    title: '封禁日志',
    path: 'log-block'
  },
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
  },
  {
    title: '回源监控',
    path: 'upstream'
  }
]

/** 格式说明
 *  int = 数值
 *  bool = true 或者 0 1
 *  text = '' 字符串
 *  m_text = [{},{},{}] 多个 Object 或者 ['', '', ''], id, value(JSON字符串)
 *  mm_text = [{}] Object，不是JSON字符串，直接就是对象
 *  l_text = {} 或者字符串
 */

export default {
  data() {
    return {
      id: this.$route.query.id,
      domain: this.$route.query.domain,
      btnLoading: false,
      menuList
    }
  },
  watch: {
    '$route.path': function (newVal) {
      console.log('newVal', newVal)
      this.$router.replace({
        query: {
          id: this.id,
          domain: this.domain
        }
      })
    }
  },
  methods: {
    /**
     * @description: 推送站点数据，即预热更新
     */

    async preheatSite() {
      // const { data: res } = await pushSiteConfToNode({
      //   siteId: this.id
      // })
      const { data: res } = await pushByInputInfo({
        site_select_chunk: this.id
      })

      if (res.code !== 1) return
      // 设置任务列表数据
      this.$root.menuBadge.task = res.task || 0
    },

    /**
     * @description: 获取站点数据， 可分别根据 group、key 查询
     */

    async getSiteDetail(group = '', key = '') {
      this.$root.loading = true
      try {
        const { data: res } = await getSiteDetailById({
          id: this.id,
          group,
          key
        })
        if (res.code !== 1) return

        // 设置任务列表数据
        this.$root.menuBadge.task = res.task || 0

        return res
      } finally {
        this.$root.loading = false
      }
    },

    /**
     * @description: 保存站点配置数据
     */

    async saveSiteAttr(dataObj = {}, hideMsg = false) {
      this.btnLoading = true
      try {
        const { data: res } = await doCreateUpdateSiteAttr({
          siteId: this.id,
          ...dataObj
        })
        if (res.code !== 1) return
        // 推送数据
        this.preheatSite()

        if (!hideMsg) {
          this.$msg.success(this.antsT('操作成功'))
        }
        return res
      } finally {
        this.btnLoading = false
      }
    },

    /**
     * @description: 删除站点某个属性列表的一项值
     */

    async deleteSiteAttr(pkey = '', id) {
      const result = await this.$doDelete({
        tag: '数据'
      })
      if (!result) return

      const { data: res } = await doDeleteSiteAttr({
        // 该属性的键名
        pkey,
        // 属性某一项的ID
        id
      })
      if (res.code !== 1) return
      // 推送数据
      this.preheatSite()

      this.$msg.success(this.antsT('删除成功'))
      return res
    },

    /**
     * @description: 切换站点属性状态开关
     */

    async changeSiteAttrStatus({ pkey = '', attrId = 0, status }) {
      this.btnLoading = true
      try {
        const { data: res } = await changeAttrStatus({
          siteId: this.id,
          // 该属性的键名
          pkey,
          // 当前要修改属性的 ID，没有则为 0
          attrId,
          // 状态 0 = 关闭， 1 = 开启
          status
        })
        if (res.code !== 1) return
        // 推送数据
        this.preheatSite()

        this.$msg.success(this.antsT('操作成功'))
        return res
      } finally {
        this.btnLoading = false
      }
    },

    /**
     * @description: 修改站点属性的排序
     */

    async changeSiteAttrWeight(pkey = '', attrId, opMode) {
      const { data: res } = await changeAttrWeight({
        siteId: this.id,
        // 该属性的键名
        pkey,
        // 当前要修改属性的 ID
        attrId,
        // opMode: 1 = 升序、 -1 = 降序、0 = 置顶
        opMode
      })

      if (res.code !== 1) return false

      // 推送数据
      this.preheatSite()

      this.$msg.success(this.antsT('操作成功'))
      return res
    },

    // 获取 DNS 记录列表
    async getRecordListV2(params) {
      try {
        this.$root.dnsLoading = true
        const { data: res } = await getRecordListV2(params)
        return res
      } catch (error) {
        // 处理请求失败的情况
        this.$root.dnsLoading = false
        // throw error // 重新抛出错误以便调用方处理
      } finally {
        // 确保无论成功与否，加载状态都会被重置
        this.$root.dnsLoading = false
      }
    },
    // 获取线路列表
    async getlineList(params) {
      try {
        this.$root.dnsLoading = true
        const { data: res } = await getlineListV1(params)
        return res
      } catch (error) {
        // 处理请求失败的情况
        this.$root.dnsLoading = false
        // throw error // 重新抛出错误以便调用方处理
      }
    },
    // 修改or添加 DNS 记录
    async doCreateUpdateDns(data) {
      try {
        this.$root.dnsLoading = true
        const { data: res } = await doUpdateRecord(data)
        return res
      } catch (error) {
        // 处理请求失败的情况
        this.$root.dnsLoading = false
        // throw error // 重新抛出错误以便调用方处理
      } finally {
        this.$root.dnsLoading = false
      }
    },
    // 添加DNS 记录
    async doCreateDns(data) {
      try {
        this.$root.dnsLoading = true
        const { data: res } = await doCreateRecord(data)
        return res
      } catch (error) {
        // 处理请求失败的情况
        this.$root.dnsLoading = false
        // throw error // 重新抛出错误以便调用方处理
      } finally {
        this.$root.dnsLoading = false
      }
    },
    // 删除 DNS 记录
    async doDeleteDns(data) {
      try {
        this.$root.dnsLoading = true
        const { data: res } = await doDeleteRecord(data)
        return res
      } catch (error) {
        // 处理请求失败的情况
        this.$root.dnsLoading = false
        // throw error // 重新抛出错误以便调用方处理
      } finally {
        this.$root.dnsLoading = false
      }
    }
  }
}
</script>
