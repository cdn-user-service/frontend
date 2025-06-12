<template>
  <div class="ptr-record-box">
    <div class="content-box ants-tips_box">
      <span class="el-icon-info"></span>
      注意：由于 PTR 反向解析需要向运行商服务器进行同步，记录添加或变更后需要 1
      ~ 2 个工作日才可完全生效，请您耐心等待。
    </div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索IP地址/记录值',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="
              showForm({
                id: 'add'
              })
            "
            text="添加 PTR 记录"
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
      </table-query-form>

      <el-form
        :model="form"
        :rules="formRules"
        class="table-form"
        ref="formRef"
        size="small"
      >
        <ants-table
          :data="tableData"
          @getTableData="getTableData"
          @selection-change="handleSelectionChange"
          empty-text="暂无PTR记录"
          row-key="id"
          :total="total"
          :queryInfo="queryInfo"
        >
          <ants-table-column
            type="selection"
            align="center"
            width="45"
          ></ants-table-column>
          <ants-table-column width="80" label="ID" prop="id">
            <template #default="{ row }">
              <span v-if="row.id != 'add'">{{ row.id }}</span>
            </template>
          </ants-table-column>

          <ants-table-column
            :width="isIpv6 ? 310 : 210"
            label="IP地址"
            prop="ip"
          >
            <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="ip">
                <ipv6-input
                  v-if="isIpv6"
                  v-model="form.ip"
                  :disabled-str="groupName"
                />

                <ip-input
                  v-else
                  v-model="form.ip"
                  size="small"
                  :disabled-arr="disabledIpInput"
                />
              </el-form-item>

              <span v-else>{{ row.ip }}</span>
            </template>
          </ants-table-column>
          <ants-table-column min-width="100" label="记录类型">
            <template>
              PTR
            </template>
          </ants-table-column>
          <ants-table-column min-width="100" label="线路" prop="line">
            默认
            <!-- <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="line">
                <ants-input v-model="form.line" placeholder="请选择线路" />
              </el-form-item>
              <span v-else>{{ row.line }}</span>
            </template> -->
          </ants-table-column>
          <ants-table-column min-width="140" label="记录值" prop="domain">
            <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="domain">
                <ants-input v-model="form.domain" placeholder="请输入记录值" />
              </el-form-item>

              <span v-else>{{ row.domain }}</span>
            </template>
          </ants-table-column>

          <!-- <ants-table-column min-width="130" label="权重" prop="weight">
            <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="weight">
                <ants-input-number
                  v-model="form.weight"
                  :min="1"
                  :max="9999"
                  controls-position="right"
                />
              </el-form-item>
              <span v-else>{{ row.weight }}</span>
            </template>
          </ants-table-column> -->

          <ants-table-column min-width="130" label="TTL" prop="ttl">
            <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="ttl">
                <ants-input-number
                  v-model="form.ttl"
                  :min="1"
                  :max="9999"
                  controls-position="right"
                />
              </el-form-item>
              <span v-else>{{ row.ttl }}</span>
            </template>
          </ants-table-column>
          <ants-table-column min-width="80" label="状态" prop="status">
            <template #default="{ row }">
              <span
                class="text-success el-icon-success"
                v-if="row.status === 1"
              >
                正常</span
              >
              <span v-else class="text-error el-icon-error"> 异常</span>
            </template>
          </ants-table-column>
          <ants-table-column
            min-width="140"
            label="用户"
            prop="userInfo"
            v-if="isAdmin"
          ></ants-table-column>
          <ants-table-column label="操作" width="180">
            <template #default="{ row }">
              <div v-if="isShowForm(row.id)">
                <ants-button
                  size="mini"
                  type="success"
                  :loading="btnLoading"
                  @click="submitForm()"
                  icon="el-icon-check"
                  text="保存"
                />
                <ants-button
                  size="mini"
                  type="info"
                  :disabled="btnLoading"
                  @click="cancelForm()"
                  text="取消"
                />
              </div>
              <div v-else>
                <ants-button
                  size="mini"
                  type="primary"
                  :disabled="btnLoading"
                  @click="showForm(row)"
                  text="修改"
                />
                <ants-button
                  size="mini"
                  type="danger"
                  :disabled="btnLoading"
                  @click="singleDelete(row)"
                  text="删除"
                />
              </div>
            </template>
          </ants-table-column>
        </ants-table>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import IpInput from './IpInput.vue'
import Ipv6Input from './Ipv6Input.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getPtrList,
  doSavePtr,
  doBatckDeletePtr
} = require(`@/v2/${PROCESS_NAME}/api/dns/ptr`)

const defaultForm = {
  id: 0,
  ip: null,
  domain: null,
  line: null,
  ttl: 60,
  weight: 1,
  status: 1,
  parentId: null,
  userId: null
}
export default {
  components: {
    IpInput,
    Ipv6Input
  },
  data() {
    const checkIp = (rule, value, callback) => {
      if (this.isIpv6) {
        const regIpv6 = /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
        if (regIpv6.test(value)) {
          return callback()
        }
      } else {
        const ipArr = (value || '').split('.')
        if (ipArr.length === 4 && ipArr.every(item => item !== '')) {
          return callback()
        }
      }
      callback(new Error('请输入完整的IP地址'))
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      total: 0,
      queryInfo: {
        parentId: this.$route.query.id,
        key: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,

      groupName: '',
      isIpv6: false,
      disabledIpInput: [],
      form: {
        ...defaultForm
      },
      formRules: {
        ip: [
          {
            required: true,
            message: '请输入IP地址',
            trigger: ['change', 'blur']
          },
          {
            validator: checkIp,
            trigger: 'blur'
          }
        ],
        domain: [
          {
            required: true,
            message: '请输入记录值',
            trigger: ['change', 'blur']
          }
        ],
        ttl: [
          {
            required: true,
            message: '请输入TTL',
            trigger: ['change', 'blur']
          }
        ],
        line: [
          {
            required: true,
            message: '请选择线路',
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {
    // 表单显示
    isShowForm() {
      return id => {
        return this.form.id === id
      }
    }
  },
  created() {
    this.getTableData()
    this.groupName = this.$route.query.groupName || ''

    // 当前网段为 ipv4 还是 ipv6
    if (this.groupName.indexOf(':') != -1) {
      this.isIpv6 = true
    } else {
      this.isIpv6 = false
      const ipArr = this.groupName.trim().split('.')
      ipArr.forEach((item, idx) => {
        if (item !== '') {
          this.disabledIpInput.push(idx + 1)
        }
      })
    }
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getPtrList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.page || {}
      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 表单显示
    showForm(row = {}) {
      // 添加
      if (row.id === 'add') {
        // 控制只显示一行
        if (this.form.id === 'add') return
        this.tableData.unshift({
          ...defaultForm,
          ...row
        })
      } else {
        // 修改，如果当前已选择新增
        if (this.form.id === 'add') {
          this.tableData.shift()
        }
      }

      this.form = {
        ...defaultForm,
        ...row,
        ip: row.id == 'add' ? this.groupName : row.ip
      }
    },

    // 表单提交
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { id, parentId, userId } = this.form
        const { data: res } = await doSavePtr({
          ...this.form,
          id: id === 'add' ? 0 : id,
          parentId: parentId || this.$route.query.id,
          userId: userId || this.$route.query.userId
        })
        this.btnLoading = false
        if (res.code !== 1) return
        this.cancelForm()
        this.getTableData()
        this.$msg.success('保存成功')
      })
    },

    // 点击取消
    cancelForm() {
      // 如果为添加取消
      if (this.form.id === 'add') {
        this.tableData.shift()
      }
      this.form = {
        ...defaultForm
      }
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'PTR记录'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => e.id)
      const { data: res } = await doBatckDeletePtr({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     */

    async singleDelete({ groupName, id }) {
      const result = await this.$doDelete({
        name: groupName,
        tag: 'PTR记录'
      })
      if (!result) return
      this.btnLoading = true
      const { data: res } = await doBatckDeletePtr({
        ids: id
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>

<style lang="scss">
.ptr-record-box {
  .el-table__body-wrapper {
    padding-top: 50px;
    margin-top: -50px;
  }
  .table-form {
    .cell {
      overflow: visible;
    }
    .el-form-item__content {
      line-height: 32px;
    }
    .el-form-item {
      margin: 0;
    }
    .el-form-item__error {
      white-space: nowrap;
      top: -44px;
      left: 50%;
      transform: translateX(-50%);
      -ms-transform: translateX(-50%);
      -moz-transform: translateX(-50%);
      -webkit-transform: translateX(-50%);
      -o-transform: translateX(-50%);
      padding: 12px;
      border-radius: 4px;
      background-color: theme('colors.ants-bg-5');
      text-align: center;
      font-size: 14px;
      z-index: 9;
    }
    .el-form-item__error::before {
      content: '';
      position: absolute;
      top: 38px;
      left: 50%;
      margin-left: -8px;
      border: 8px solid rgba(0, 0, 0, 0);
      border-top-color: theme('colors.ants-bg-5');
    }
  }
}
</style>
