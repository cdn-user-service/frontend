<template>
  <div class="users-list-box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索用户名',
            key: 'username',
            value: queryInfo.username
          },
          {
            name: '检索手机号',
            key: 'mobile',
            value: queryInfo.mobile
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
            :disabled="btnLoading || $root.loading"
            @click="showCreateUserDialog"
            text="添加用户"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :row-key="addRowKey"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column type="expand" label="#" width="40">
          <template #default="{ row }">
            <UserDetailExpend :user-row-data="row" />
          </template>
        </ants-table-column>
        <ants-table-column label="ID" prop="userId" width="60">
        </ants-table-column>
        <ants-table-column label="用户账号" prop="username" min-width="150">
        </ants-table-column>

        <ants-table-column prop="mobile" label="手机|邮箱|微信" min-width="320">
          <template #default="{ row }">
            <div class="" style="margin: -5px 0;">
              <div class="flex">
                <span class="inline-block" style="min-width:40px;">手机：</span>
                <div>
                  <i class="el-icon-phone-outline" style="font-size:14px;"></i>
                  <span class="pl-2">{{ row.mobile || '-' }}</span>
                </div>
              </div>
              <div class="flex">
                <span class="inline-block" style="min-width:40px;">邮箱：</span>
                <div>
                  <i class="el-icon-message" style="font-size:14px;"></i>
                  <span class="pl-2">{{ row.mail || '-' }}</span>
                </div>
              </div>
              <div class="flex">
                <span class="inline-block" style="min-width:40px;">微信：</span>
                <div>
                  <i
                    class="aicon icon-weixin1 text-success"
                    style="font-size:12px;"
                  ></i>
                  <span class="pl-2">{{ row.wechatOpenid || '-' }}</span>
                </div>
              </div>
            </div>
          </template>
        </ants-table-column>

        <!-- <ants-table-column
              label="IP 地址"
              prop="ip"
              min-width="140"
              show-overflow-tooltip
              
            >
              <template #default="{ row }">
                {{ row.ip || '--' }}
              </template>
            </ants-table-column> -->

        <!-- <ants-table-column label="备注信息" prop="info" min-width="100">
            <template #default="{ row }">
              <span v-if="!row.info">--</span>
              <span v-else>{{ row.info }}</span>
            </template>
          </ants-table-column> -->

        <ants-table-column label="用户类型" min-width="100">
          <template #default="{ row }">
            <el-tag type="primary" size="small" v-if="row.userType == 2">
              普通用户
            </el-tag>
            <el-tag type="success" size="small" v-else>
              {{ userTypeName[row.userType] }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column label="账户余额" min-width="100">
          <template #default="{ row }">
            <span>
              {{ row.propertyBalance | priceFormat }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="realnameStatus"
          label="实名认证"
          min-width="80"
        >
          <template #default="{ row }">
            <el-tag size="small" type="success" v-if="row.realnameStatus === 1"
              >已实名</el-tag
            >
            <el-tag size="small" type="danger" v-else>未实名</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          label="创建时间"
          sortable
          prop="createTime"
          show-overflow-tooltip
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column prop="status" label="启用" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              active-color="#13ce66"
              :ref="`tableSwitchRef${$index}`"
              @change="toggleStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="220">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="goUsersClient(row)"
              text="客户端"
            />
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showUpdateUserDialog(row)"
              text="修改"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="deleteUser(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加用户对话框弹窗 -->
    <CreateDialog ref="CreateDialogRef" @refresh="toQuery" />

    <!-- 修改用户对话框弹窗 -->
    <UpdateDialog
      ref="UpdateDialogRef"
      @refresh="getTableData"
      :userTypeName="userTypeName"
    />
  </div>
</template>

<script>
// api
import {
  getUserList,
  doUpdateUser,
  doDeleteUser,
  goUserClientConsole
} from '@/v2/dns_admin/api/account/user'
import CreateDialog from './CreateDialog'
import UpdateDialog from './UpdateDialog'
import UserDetailExpend from './UserDetailExpend'
import { getLocation, openUrl } from '@/utils/env'

const userTypeName = {
  3: '一级代理',
  4: '二级代理',
  5: '三级代理',
  6: '四级代理',
  7: '五级代理',
  8: '六级代理',
  9: '七级代理',
  10: '八级代理',
  11: '九级代理'
}

export default {
  components: {
    CreateDialog,
    UpdateDialog,
    UserDetailExpend
  },
  data() {
    return {
      userTypeName,
      total: 0,
      btnLoading: false,
      queryInfo: {
        mobile: null, // 检索手机号
        username: null, // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 获取用户数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getUserList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.page || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 指定要当前展开行的值为 id
    addRowKey(row) {
      return row.userId
    },

    // 添加用户对话框显示
    showCreateUserDialog() {
      this.$refs.CreateDialogRef.dialogVisible = true
    },

    // 修改用户对话框显示
    showUpdateUserDialog(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    // 删除用户
    async deleteUser(row) {
      const result = await this.$doDelete({
        name: row.username,
        tag: '用户'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data } = await doDeleteUser({
          ids: row.userId
        })

        if (data.code !== 1) return
        this.getTableData()
        this.$msg.success('删除用户成功')
      } finally {
        this.btnLoading = false
      }
    },

    // 启动冻结用户
    async toggleStatus(row, switchRef) {
      let txt = '启用'
      if (row.status == 0) {
        // 冻结代理
        const confirmResult = await this.$confirm(
          '此操作将冻结用户“ <strong style="color: #F78989;"> ' +
            (row.username || row.mail || row.mobile) +
            ' </strong> ”，是否继续？',
          '友情提示',
          {
            dangerouslyUseHTMLString: true,
            type: 'warning',
            center: true
          }
        ).catch(err => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          return this.$msg.info('已取消冻结该用户')
        }
        txt = '冻结'
      }

      this.$refs[switchRef].loading = true
      try {
        const { data: res } = await doUpdateUser({
          user_id: row.userId,
          key: 'status',
          value: row.status
        })

        if (res.code !== 1) {
          if (row.status == 1) {
            row.status = 0
          } else {
            row.status = 1
          }
          return
        }

        this.$msg.success(
          '已成功' + txt + '用户：' + (row.username || row.mail || row.mobile)
        )
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    // 前往用户控制
    async goUsersClient({ userId }) {
      this.btnLoading = true
      try {
        const { data: res } = await goUserClientConsole({
          userId
        })
        if (res.code !== 1) return

        // token
        const TOKEN = res.token

        // 获取协议
        const { protocol, host, hostname } = getLocation()

        const rootPath = `${protocol}//${hostname}/users`

        // 拼接 url 地址
        const URL = `${rootPath}#/dns/dashboard?token=${TOKEN}`
        openUrl(URL)
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
.users-list-box {
  .ants-table__expanded-cell {
    padding: 0;
  }
}
</style>
