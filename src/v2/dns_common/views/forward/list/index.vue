<template>
  <el-card class="animated fadeIn content-box">
    <table-query-form
      :search-arr="
        isAdmin
          ? [
              {
                name: '检索域名',
                key: 'domain',
                value: queryInfo.domain
              },
              {
                name: '检索用户',
                key: 'user',
                value: queryInfo.user
              }
            ]
          : [
              {
                name: '检索域名',
                key: 'domain',
                value: queryInfo.domain
              }
            ]
      "
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          size="small"
          type="primary"
          icon="el-icon-plus"
          :disabled="$root.loading"
          @click="toSave()"
          text="添加URL转发"
        />
        <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          :loading="btnLoading"
          :disabled="$root.loading"
          @click="batchDelete"
          text="批量删除"
        />
      </template>

      <template slot="inputs">
        <el-select
          v-model="queryInfo.group"
          style="width: 150px;"
          placeholder="选择分组"
        >
          <el-option
            v-for="item in 5"
            :key="item"
            :label="`转发分组${item}`"
            :value="item"
          />
        </el-select>
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
        align="center"
        width="45"
      ></ants-table-column>
      <ants-table-column width="80" label="ID" prop="id" />
      <ants-table-column min-width="80" label="主机头" prop="top">
      </ants-table-column>
      <ants-table-column min-width="150" label="域名" prop="domain">
      </ants-table-column>

      <ants-table-column min-width="80" label="转发方式" prop="forward_type">
        <template #default="{ row }">
          <el-tag size="small">
            {{ forwardType[row.forward_type] }}
          </el-tag>
        </template>
      </ants-table-column>

      <ants-table-column
        min-width="140"
        label="跳转地址"
        prop="forward_url"
      ></ants-table-column>

      <ants-table-column
        min-width="140"
        label="CNAME"
        prop="cname"
      ></ants-table-column>

      <ants-table-column
        min-width="140"
        label="套餐"
        prop="plan"
      ></ants-table-column>

      <ants-table-column
        min-width="140"
        label="用户"
        prop="username"
        v-if="isAdmin"
      ></ants-table-column>

      <ants-table-column label="操作" width="150">
        <template #default="{ row }">
          <ants-button
            size="mini"
            type="primary"
            :disabled="btnLoading"
            @click="toSave(row)"
            text="修改"
          />
          <ants-button
            size="mini"
            type="danger"
            :disabled="btnLoading"
            @click="singleDelete(row)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME

const forwardType = {
  1: '强制跳转',
  2: '显性URL',
  3: '隐性URL'
}
export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      total: 0,
      btnLoading: false,
      queryInfo: {
        group: '',
        type: 1,
        domain: '',
        username: null, // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      forwardType
    }
  },
  created() {},
  methods: {
    async getTableData() {
      const arr = []
      for (let i = 0; i < 10; i++) {
        arr.push({
          id: 0 + 1,
          top: 'www',
          domain: 'www.domain.com',
          line: '电信',
          forward_type: 1,
          forward_url: 'https://www.baidu.com',
          cname: 'sdsads.wiwiw.www',
          plan: '转发服务定制套餐',
          username: 'demo@dns.com',
          userId: i
        })
      }
      this.tableData = arr
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    toSave(row = {}) {},

    async batchDelete() {
      //   const selectLength = this.selectArr.length
      //   const result = await this.$batchDelete(selectLength, {
      //     tag: '网段'
      //   })
      //   if (!result) return
      //   this.btnLoading = true
      //   const idsArr = this.selectArr.map(e => e.id)
      //   const { data: res } = await doBatckDeletePtr({
      //     ids: idsArr + ''
      //   })
      //   this.btnLoading = false
      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success('删除成功')
      //   this.selectArr = [] // 释放
    },

    async singleDelete() {
      //   const result = await this.$doDelete({
      //     name: groupName,
      //     tag: '网段'
      //   })
      //   if (!result) return
      //   this.btnLoading = true
      //   const { data: res } = await doBatckDeletePtr({
      //     ids: id
      //   })
      //   this.btnLoading = false
      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success('删除成功')
    }
  }
}
</script>
