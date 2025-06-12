<template>
  <div>
    <el-card class="content-box">
      <el-row
        :gutter="20"
        slot="header"
      >
        <el-col
          :span="4"
          v-for="(item, key) in sumObj"
          :key="key"
        >
          <div class="rounded-2xl  border-ants-border-3 py-df px-lg bg-ants-bg-5">
            <div class="font-semibold pb-df">
              {{ item.name }}
            </div>
            <div
              :class="item.color"
              class="text-4xl"
            >
              {{ item.value }}
            </div>
          </div>
        </el-col>
      </el-row>

      <table-query-form
        :search-arr="[
          {
            name: '检索域名',
            key: 'domain',
            value: queryInfo.domain
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            text="购买SSL证书"
            :disabled="$root.loading"
            :loading="loading"
          />
          <ants-button
            type="success"
            size="small"
            icon="el-icon-finished"
            :disabled="$root.loading"
            :loading="loading"
            text="批量购买"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-download"
            text="下载验证文件"
            :disabled="$root.loading"
            :loading="loading"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-upload2"
            text="上传文件"
            :disabled="$root.loading"
            :loading="loading"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>
        <ants-table-column
          prop="name"
          label="产品名称"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column
          prop="domain"
          label="主域名"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column
          prop="order"
          label="CA订单号"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column
          prop="shilie"
          label="实例号"
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column
          prop="date"
          label="购买日期"
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column
          prop="youxioaqi"
          label="有效期"
          min-width="80"
        >
        </ants-table-column>
        <ants-table-column
          prop="price"
          label="金额"
          min-width="80"
        >
        </ants-table-column>

        <ants-table-column
          prop="status"
          label="状态"
          min-width="80"
        >
          <template>
            <el-tag
              size="small"
              type="success"
            >已签发</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          label="操作"
          width="210"
        >
          <template #default="{ row }">
            <ants-button
              type="success"
              size="mini"
              @click="goDetail(row)"
              text="下载证书"
            />

            <ants-button
              type="primary"
              size="mini"
              @click="goDetail(row)"
              text="详情"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
const sumObj = {
  total: {
    name: '证书总数',
    value: 17,
    color: 'text-ants-text-1'
  },
  success: {
    name: '已签发',
    value: 4,
    color: 'text-success'
  },
  primary: {
    name: '待申请',
    value: 1,
    color: 'text-info'
  },
  applying: {
    name: '申请中',
    value: 12,
    color: 'text-info'
  },
  expiring: {
    name: '即将过期',
    value: 0,
    color: 'text-warning'
  },
  expired: {
    name: '已过期',
    value: 0,
    color: 'text-error'
  }
}
export default {
  data() {
    return {
      sumObj,
      total: 0,
      queryInfo: {
        domain: '', // 消息标题
        pagenum: 1, // 当前的页数
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        pagesize: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      loading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    async getTableData() {
      const arr = []
      for (let i = 0; i < 10; i++) {
        arr.push({
          id: i,
          name: 'DV 多域名SSL证书',
          domain: 'www.vedns.com',
          order: '123456789',
          shilie: '123456789dshjah',
          date: '2020-12-12',
          youxioaqi: '1年',
          price: '100.00',
          status: '已签发'
        })
      }
      this.tableData = arr
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    goDetail(row = {}) {
      //   this.$router.push({
      //     path: `/dns/message/list/${id}`
      //   })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
