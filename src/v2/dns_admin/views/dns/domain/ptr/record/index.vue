<template>
  <div class="ptr-record-box">
    <div class="content-box ants-tips_box">
      <span class="el-icon-info"></span>
      注意：由于 PTR 反向解析需要向运行商服务器进行同步，记录添加或变更后需要 1
      ~ 2 个工作日才可完全生效，请您耐心等待。
    </div>
    <el-card class="animated fadeIn content-box">
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
          <ants-table-column width="80" label="ID" prop="id">
            <template #default="{ row }">
              <span v-if="row.id != 'add'">{{ row.id }}</span>
            </template>
          </ants-table-column>

          <ants-table-column min-width="140" label="IP地址" prop="ip">
            <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="ip">
                <ants-input v-model="form.ip" placeholder="请输入IP地址" />
              </el-form-item>

              <span v-else>{{ row.ip }}</span>
            </template>
          </ants-table-column>
          <ants-table-column min-width="100" label="记录类型">
            <template>
              PTR
            </template>
          </ants-table-column>
          <ants-table-column min-width="140" label="线路" prop="line">
            <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="line">
                <ants-input v-model="form.line" placeholder="请选择线路" />
              </el-form-item>
              <span v-else>{{ row.line }}</span>
            </template>
          </ants-table-column>
          <ants-table-column min-width="140" label="记录值" prop="domain">
            <template #default="{ row }">
              <el-form-item v-if="isShowForm(row.id)" prop="domain">
                <ants-input v-model="form.domain" placeholder="请输入记录值" />
              </el-form-item>

              <span v-else>{{ row.domain }}</span>
            </template>
          </ants-table-column>

          <ants-table-column min-width="130" label="权重" prop="weight">
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
          </ants-table-column>

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
            <template #default="row">
              <span
                class="text-success el-icon-success"
                v-if="row.status === 1"
              >
                正常</span
              >
              <span v-else class="text-error el-icon-error"> 异常</span>
            </template>
          </ants-table-column>
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
const defaultForm = {
  id: null,
  ip: null,
  domain: null,
  line: null,
  ttl: 60,
  weight: 1,
  status: 1
}
export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        domain: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      btnLoading: false,

      form: {
        ...defaultForm
      },
      formRules: {
        ip: [
          {
            required: true,
            message: '请输入IP地址',
            trigger: ['change', 'blur']
          }
        ],
        domain: [
          {
            required: true,
            message: '请输入域名',
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
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      const arr = []
      for (let i = 1; i < 5; i++) {
        arr.push({
          id: i,
          ip: '192.168.1.' + i,
          domain: 'www.test.domain',
          line: '默认',
          ttl: 600,
          weight: 1,
          status: 1
        })
      }
      this.tableData = arr
    },

    handleSelectionChange(val) {},

    // 表单显示
    showForm(row = {}) {
      // 添加
      if (row.id === 'add') {
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
        ...row
      }
    },

    // 表单提交
    submitForm() {},

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

    // 删除
    singleDelete(row) {}
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
      background-color: theme('colors.ants-bg-4');
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
      border-top-color: theme('colors.ants-bg-4');
    }
  }
}
</style>
