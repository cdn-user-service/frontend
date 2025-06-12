
<template>
  <div class="dns_log_box">
    <el-card class="content-box animated fadeIn">
        <div class="mb-lg">
            <el-button type="info" size="small">下载当前数据</el-button>
        </div>
      <div class="log_main">
        <el-scrollbar style="height:100%;width:100%;">
          <div class="log_item">
            <ul>
              <!-- <li>
                2020-12-23 15:28:22: (121.62.106.170) 暂停解析 NS 记录 默认 线路
                @ 值 radian.domain.net. (enabled) (723990333)
                Acloud_Uin:100015278264 Real Client IP:121.62.106.170 API
                FROM:CONSOLE
              </li>
              <li>
                2020-12-23 15:28:22: (121.62.106.170) 暂停解析 NS 记录 默认 线路
                @ 值 radian.domain.net. (enabled) (723990333)
                Acloud_Uin:100015278264 Real Client IP:121.62.106.170 API
                FROM:CONSOLE
              </li>
              <li>
                2020-12-23 09:15:00: (121.62.106.170) 添加新域名 yijianzq.com
                (85617551), 帐户:acloud_uin_10001@acloud.com (7436189)
                Acloud_Uin:100015278264 Real Client IP:121.62.106.170 API
                FROM:CONSOLE
              </li>
              <li>
                2020-12-23 15:28:22: (121.62.106.170) 暂停解析 NS 记录 默认 线路
                @ 值 radian.domain.net. (enabled) (723990333)
                Acloud_Uin:100015278264 Real Client IP:121.62.106.170 API
                FROM:CONSOLE
              </li> -->
            </ul>
          </div>
        </el-scrollbar>
      </div>
    </el-card>
  </div>
</template>

<script>
// api
// import { getList } from '@/v2/dns_admin/api/dns/log'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        key: 'AppDnsController', // 类型
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      goodsList: []
    }
  },
  created() {},
  methods: {
    async getGoodsList() {
      // const { data: res } = await getList(this.queryInfo)
      // if (res.code !== 1) return
      // this.goodsList = res.data.list || []
      // this.total = res.data.totalCount || 0
    }
  }
}
</script>
<style lang="scss">
.dns_log_box {
  .el-card__body {
    // padding: 35px;
  }
}
</style>

<style lang="scss" scoped>
.downLoad_box {
  display: flex;
  justify-content: flex-end;
}
.log_main {
  border: 1px solid theme('colors.ants-border-2');
  border-radius: 6px;
  .log_item {
    min-height: 400px;
    max-height: 700px;
  }
  ul {
    height: 100%;
    padding: 20px 20px 30px;
    li {
      font-size: 13px;
      margin-bottom: 5px;
      line-height: 25px;
      word-break: keep-all;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
