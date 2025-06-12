<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <div>
        <div class="p-lg bg-ants-bg-3 rounded-2xl switch-loading">
          <strong class="mr-lg text-ants-text-3">开启递归</strong>
          <el-switch
            v-model="form.recursiveEnable"
            active-color="#02B340"
            :active-value="1"
            :inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
            @change="(val) => changeStatus(val, 'recursiveEnable')"
            v-loading="switchLoading"
            element-loading-spinner="el-icon-loading"
          />
          <div v-if="form.recursiveEnable" class="mt-lg" style="width: 500px">
            <ants-form :model="form" ref="formRef" label-width="80px">
              <ants-form-item label="根服务器IP" prop="rootIps">
                <ants-input
                  v-model="form.rootIps"
                  placeholder="请输入起始IP，一行一个"
                  type="textarea"
                  :autosize="{ minRows: 5, maxRows: 15 }"
                />
              </ants-form-item>
              <ants-form-item>
                <ants-button
                  size="mini"
                  type="primary"
                  text="提交"
                  :disabled="form.recursiveEnable == 0"
                  @click="submitForm(form.rootIps, 'recursiveEnable')"
                />
              </ants-form-item>
            </ants-form>
          </div>
        </div>

        <div class="p-lg my-lg bg-ants-bg-3 rounded-2xl switch-loading">
          <strong class="mr-lg text-ants-text-3">开启转发</strong>
          <el-switch
            v-model="form.forwardEnable"
            active-color="#02B340"
            :active-value="1"
            :inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
            @change="(val) => changeStatus(val, 'forwardEnable')"
            v-loading="switchLoading"
            element-loading-spinner="el-icon-loading"
          />
        </div>
        <div>
          <div class="p-lg bg-ants-bg-3 rounded-2xl">
            <table-query-form
              :queryInfo="queryInfo"
              @changeInput="getTableData"
              :search-arr="[
                {
                  name: '检索备注信息',
                  key: 'remark',
                  value: queryInfo.remark
                }
              ]"
            >
              <template slot="buttons">
                <ants-button
                  size="mini"
                  icon="el-icon-plus"
                  text="添加IP段"
                  type="primary"
                  :disabled="$root.loading || form.recursiveEnable == 0"
                  @click="showCreateDialog()"
                />
                <ants-button
                  type="info"
                  size="mini"
                  icon="el-icon-delete"
                  :disabled="$root.loading || form.recursiveEnable == 0"
                  :loading="btnLoading"
                  @click="bulkDelete()"
                  text="批量删除"
                />
              </template>
            </table-query-form>

            <ants-table
              :data="ipTableData"
              :total="total"
              :queryInfo="queryInfo"
              size="mini"
              border
              max-height="400px"
              @getTableData="getTableData"
              @selection-change="handleSelectionChange"
            >
              <ants-table-column
                type="selection"
                align="center"
                width="45"
              ></ants-table-column>
              <ants-table-column
                width="100"
                label="ID"
                prop="id"
              ></ants-table-column>
              <ants-table-column
                min-width="140"
                label="起始IP"
                prop="sourceIpS"
              >
              </ants-table-column>
              <ants-table-column
                min-width="140"
                label="截止IP"
                prop="sourceIpE"
              >
              </ants-table-column>
              <ants-table-column
                min-width="150"
                label="备注信息"
                prop="remark"
              ></ants-table-column>
              <ants-table-column
                min-width="150"
                label="创建时间"
                prop="createTime"
              ></ants-table-column>
              <ants-table-column width="150" label="操作">
                <template #default="{ row }">
                  <ants-button
                    size="mini"
                    type="primary"
                    text="修改"
                    :disabled="form.recursiveEnable == 0"
                    @click="showCreateDialog(row)"
                  />
                  <ants-button
                    size="mini"
                    type="danger"
                    text="删除"
                    :disabled="form.recursiveEnable == 0"
                    @click="singleDelete(row)"
                  />
                </template>
              </ants-table-column>
            </ants-table>
          </div>
        </div>
      </div>
    </el-card>

    <CreateIpsDialog ref="CreateIpsDialogRef" :serverId="form.serverId" />
  </div>
</template>

<script>
// API
import {
  getDnsRecursive,
  saveDnsRecursive,
  deleteDnsRecursive
} from '@/v2/dns_admin/api/dns/recursion'

import CreateIpsDialog from './CreateIpsDialog.vue'

export default {
  components: {
    CreateIpsDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        // 1 = 递归开关， 2 = 递归IP段， 3 = 转发IP段， 4 = 转发域名
        mode: 2,
        page: 1,
        limit: 20,
        remark: ''
      },

      form: {
        serverId: null,
        // 开启递归
        recursiveEnable: 0,
        // 开启转发
        forwardEnable: 0,
        recursive_ipset_add: [],
        rootIps: ''
      },
      switchLoading: false,
      btnLoading: false,
      ipTableData: [],

      serveList: [],
      selectArr: []
    }
  },
  created() {
    // this.getRecursiveStatus()
    this.getTableData()
  },
  methods: {
    // 查询递归开关
    async _getRecursiveStatus() {
      this.switchLoading = true
      const { data: res } = await getDnsRecursive({
        mode: 1
      })
      this.switchLoading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      obj.list.forEach((item) => {
        this.form.recursiveEnable = +item.targetValue || 0
      })
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 获取递归IP段表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getDnsRecursive(this.queryInfo)
      this.$root.loading = false

      if (res.code !== 1) return
      const obj = res.data || {}
      const arr = (obj.list || []).map((item) => {
        return {
          ...item,
          sourceIpS: this.numToIp(item.sourceIpS),
          sourceIpE: this.numToIp(item.sourceIpE)
        }
      })
      this.ipTableData = arr
      this.total = obj.totalCount

      // 递归开关
      // 将statusObj.recursive_root_ips字符串的逗号 转换成 换行符

      const statusObj = res.status || {}
      this.form.recursiveEnable = +statusObj.recursive_enable
      this.form.forwardEnable = +statusObj.forward_enable
      this.form.rootIps = statusObj.recursive_root_ips.split(',').join('\n')
    },

    // 整数转IP
    numToIp(num) {
      const tt = []
      tt[0] = (num >>> 24) >>> 0
      tt[1] = ((num << 8) >>> 24) >>> 0
      tt[2] = (num << 16) >>> 24
      tt[3] = (num << 24) >>> 24

      return tt.join('.')
    },

    ipGetInt(ip) {
      let num = 0
      if (!ip) {
        return num
      }
      ip = ip.trim().split('.')
      num =
        Number(ip[0]) * 256 * 256 * 256 +
        Number(ip[1]) * 256 * 256 +
        Number(ip[2]) * 256 +
        Number(ip[3])
      num = num >>> 0 // 这个很关键，不然可能会出现负数的情况
      return num
    },

    // 开关
    async changeStatus(val, key) {
      if (!val) {
        const result = await this.$doDelete({
          title: '友情提示',
          content: `该操作将会关闭${
            key === 'recursiveEnable' ? '递归' : '转发'
          }功能，是否继续？`
        })

        if (!result) {
          this.form[key] = 1
          return
        }
      }

      this.switchLoading = true
      const { data: res } = await saveDnsRecursive({
        mode: key === 'forwardEnable' ? 6 : 1,
        targetValue: val
      })
      this.switchLoading = false
      if (res.code !== 1) return
      this.$msg.success('操作成功')
    },

    // 提交添加IP段
    async submitForm(val, key) {
      val = val.trim().replace(/[\r\n]+/g, ',')
      const { data: res } = await saveDnsRecursive({
        mode: 1,
        targetValue: this.form.recursiveEnable,
        rootIps: val
      })
      if (res.code !== 1) return
      this.$msg.success('操作成功')
    },

    showCreateDialog(row = {}) {
      this.$refs.CreateIpsDialogRef.showDialog(row)
    },

    // 批量删除
    async bulkDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'IP段'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((e) => e.id)
      const { data: res } = await deleteDnsRecursive({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
      this.selectArr = [] // 释放
    },

    // 删除
    async singleDelete(row = {}) {
      const result = await this.$doDelete({
        tag: 'IP段'
      })
      if (!result) return
      // 发起请求
      const { data } = await deleteDnsRecursive({
        ids: row.id
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>
