<template>
  <div>
    <!-- <el-card
      class="animated fadeIn content-box"
      style="margin-top:0;"
    >
      <div
        slot="header"
        class="flex items-center justify-between"
      >
        <div>
          <strong>鉴权信息</strong>
          <span class="ml-df text-ants-text-4 text-sm">
            客户需要使用下面提供的密钥或token对查询信息进行加密。
          </span>
        </div>
        <span
          class="text-primary cursor-pointer"
          @click="toShowDocs()"
        >
          开发说明
          <i class="el-icon-link"></i>
        </span>

      </div>
      <el-row
        :gutter="20"
        style="font-size:12px;"
      >
        <el-col :span="6">
          <div>
            <span class="card-info-span">
              状态
            </span>
            <span class="text-success">
              <i class="el-icon-success"></i>
              解析中
            </span>

            <el-popover
              hide-icon
              trigger="click"
              width="270"
              placement="bottom-start"
              ref="popoverRef"
            >
              <div class="font-semibold mb-sm">
                确定要暂停解析？
              </div>
              <div class="">
                请确认暂停当前账号下所有域名的解析
              </div>
              <div class="mt-df">
                <ants-button
                  type="primary"
                  size="mini"
                  text="确定"
                  :loading="btnLoading"
                  @click="changeStatus()"
                />
                <ants-button
                  type="info"
                  size="mini"
                  text="取消"
                  @click="() => $refs.popoverRef.doClose()"
                />
              </div>
              <span
                slot="reference"
                class="text-primary cursor-pointer pl-sm"
              >暂停解析</span>
            </el-popover>
          </div>

          <div class="pt-lg">
            <span class="card-info-span">
              备注
            </span>
            <span>
              -
            </span>
            <span
              class="cursor-pointer el-icon-edit pl-sm"
              style="font-size:16px;"
            >
            </span>
          </div>
        </el-col>

        <el-col
          :span="6"
          v-for="item in tokenKeyList"
          :key="item.name"
        >
          <div class="pl-lg border-l border-ants-border-3">
            <div>
              <span class="card-info-span">
                {{ item.name }}加密
              </span>
              <span class="text-success">
                支持中
              </span>
            </div>

            <div class="pt-lg">
              <span class="card-info-span">
                {{ item.name === 'HTTPS' ? 'Token' : '密钥' }}
              </span>
              <span>
                {{ item.show ? item.key : '*******' }}
              </span>
              <span
                class="cursor-pointer el-icon-view pl-sm"
                @click="item.show = !item.show"
                style="font-size:16px;"
              >
              </span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card> -->

    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="isAdmin ? [
                {
                  name: '检索应用名称',
                  key: 'remark',
                  value: queryInfo.remark
                },
                {
                  name: '检索用户',
                  key: 'user',
                  value: queryInfo.user
                }
              ] :
              [
                {
                  name: '检索应用名称',
                  key: 'remark',
                  value: queryInfo.remark
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
            @click="toAdd()"
            text="添加应用"
          />
          <ants-button
            type="info"
            size="small"
            text="批量删除"
            :loading="btnLoading"
            :disabled="$root.loading"
            icon="el-icon-delete"
            @click="doBatchDel()"
          />
          <span
            class="text-primary cursor-pointer ml-sm "
            @click="toShowDocs()"
          >
            开发说明
            <i class="el-icon-link"></i>
          </span>
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
        <ants-table-column
          width="80"
          label="授权ID"
          prop="id"
        />
        <ants-table-column
          min-width="150"
          label="应用名称"
          prop="remark"
        />
        <ants-table-column
          min-width="220"
          label="AES密钥"
          prop="aesKey"
        />
        <ants-table-column
          min-width="160"
          label="DES密钥"
          prop="desKey"
        />

        <ants-table-column
          min-width="160"
          label="HTTPS Token"
          prop="httpsToken"
        />
        <!-- <ants-table-column
          min-width="150"
          label="IOS APPID"
          prop="iosAppid"
        />
        <ants-table-column
          min-width="150"
          label="安卓 APPID"
          prop="androidAppid"
        /> -->
        <ants-table-column
          min-width="150"
          label="创建时间"
          prop="createTime"
        />

        <ants-table-column
          min-width="100"
          label="状态"
          prop="status"
        >
          <template #default="{ row }">
            <el-tag
              v-if="statusObj[+row.status]"
              size="small"
              :type="statusObj[+row.status].type"
            >
              {{ statusObj[+row.status].text }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          min-width="150"
          label="用户"
          prop="userId"
          v-if="isAdmin"
        >
          <template #default="{ row }">
            <div>
              ID：{{ row.userId }}
            </div>
            <div>
              {{ row.userName }}
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          label="操作"
          width="80"
          fixed="right"
        >
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="toDel(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <FormDialog
      ref="FormDialogRef"
      @refresh="getTableData"
    />

    <DocsDialog ref="DocsDialogRef" />
  </div>
</template>

<script>
// 组件
import FormDialog from './FormDialog.vue'
import DocsDialog from '../docs'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getConfigureData,
  getAppList,
  doDeleteApp
} = require(`@/v2/${PROCESS_NAME}/api/dns/httpdns`)

const statusObj = {
  0: {
    type: 'danger',
    text: '关闭'
  },
  1: {
    type: 'success',
    text: 'DES开启'
  },
  2: {
    type: 'success',
    text: 'AES开启'
  },
  3: {
    type: 'success',
    text: 'DES-AES开启'
  },
  4: {
    type: 'success',
    text: 'HTTPS开启'
  },
  5: {
    type: 'success',
    text: 'DES-HTTPS开启'
  },
  7: {
    type: 'success',
    text: '全部开启'
  }
}

export default {
  components: {
    FormDialog,
    DocsDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      statusObj,
      tokenKeyList: [
        {
          name: 'DES',
          key: 'UIOIUOI78787DH78',
          show: false
        },
        {
          name: 'AES',
          key: 'HJHK789789DSGAHD',
          show: false
        },
        {
          name: 'HTTPS',
          key: 'DSHUWNS1453DSSHD',
          show: false
        }
      ],

      btnLoading: false,
      total: 0,
      queryInfo: {
        remark: '',
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getAppList(this.queryInfo)
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 显示隐藏KEY
    hideAndShowKey(key) {},

    // 暂停、启用解析
    changeStatus() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
        this.$msg.success('操作成功')
        // 隐藏 popover
        this.$refs.popoverRef.doClose()
      }, 500)
    },

    // 前往添加
    toAdd() {
      this.$refs.FormDialogRef.show()
    },

    // 查看开发文档
    toShowDocs() {
      this.$refs.DocsDialogRef.show()
    },

    // 删除
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '应用'
      })
      if (!result) return
      const { data: res } = await doDeleteApp({
        ids: row.id
      })
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.toQuery()
    },

    // 批量删除
    async doBatchDel() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '应用'
      })
      if (!result) return

      this.btnLoading = true

      try {
        const { data: res } = await doDeleteApp({
          ids: this.selectArr.map((item) => item.id) + ''
        })
        this.btnLoading = false
        if (res.code !== 1) return
        this.$msg.success('删除成功')
        this.toQuery()
        this.selectArr = []
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card-info-span {
  display: inline-block;
  width: 80px;
  color: theme('colors.ants-text-5');
}
</style>
