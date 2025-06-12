<template>
  <div class="user_list_box">
    <el-card class="box-card content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索用户名/手机号/邮箱',
            key: 'user',
            value: queryInfo.user
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
            :disabled="btnLoading"
            @click="showCreateUpdateDialog()"
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
          <template #default="{ row }">
            <ants-copy :text="row.username" />
          </template>
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

        <!-- <ants-table-column prop="mobile" label="手机号" min-width="130">
          <template #default="{ row }">
            {{ row.mobile || '-' }}
          </template>
        </ants-table-column>
        <ants-table-column prop="mail" label="邮箱" min-width="130">
          <template #default="{ row }">
            {{ row.mail || '-' }}
          </template>
        </ants-table-column>
        <ants-table-column prop="wechatOpenid" label="微信号" min-width="130">
          <template #default="{ row }">
            {{ row.wechatOpenid || '-' }}
          </template>
        </ants-table-column> -->

        <!-- <ants-table-column label="注册 IP" prop="registIp" min-width="140">
          <template #default="{ row }">
            {{ row.registIp || '-' }}
          </template>
        </ants-table-column> -->

        <!-- <ants-table-column label="备注信息" prop="note" min-width="100">
          <template #default="{ row }">
            <span v-if="!row.info">--</span>
            <span v-else>{{ row.info }}</span>
          </template>
        </ants-table-column> -->

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
            <el-tag
              size="small"
              type="success"
              v-if="row.realnameStatus === 1"
              >{{ antsT('已实名') }}</el-tag
            >
            <el-tag size="small" type="danger" v-else>{{
              antsT('未实名')
            }}</el-tag>
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
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="170">
          <template #default="{ row }">
            <!-- <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="deleteUser(row)"
              text="删除"
            /> -->
            <ants-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="goUsersClient(row)"
              text="客户端"
            />

            <el-dropdown
              placement="bottom"
              :show-timeout="100"
              @command="clickMore"
            >
              <ants-button
                type="primary"
                size="mini"
                style="padding:7px 9px;"
                class="ml-sm"
                text="更多"
                :disabled="btnLoading"
                ><i class="el-icon-caret-bottom el-icon--right"></i
              ></ants-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="handleCommand('update', row)">{{
                  antsT('修改')
                }}</el-dropdown-item>
                <el-dropdown-item :command="handleCommand('delete', row)">{{
                  antsT('删除')
                }}</el-dropdown-item>
                <el-dropdown-item :command="handleCommand('power', row)">{{
                  antsT('菜单')
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加用户对话框弹窗 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />

    <!-- 修改用户菜单权限 -->
    <UpdatePowerMenuDialog ref="UpdatePowerMenuDialogRef" />
  </div>
</template>

<script>
// API
import {
  getUserList,
  getUserDetail,
  doUpdateUser,
  doDeleteUser,
  goUserClientConsole
} from '@/v2/cdn_admin/api/account/users'
import CreateUpdateDialog from './components/CreateUpdateDialog'
import UserDetailExpend from './components/UserDetailExpend'
import UpdatePowerMenuDialog from './components/UpdatePowerMenuDialog.vue'
import { getLocation, openUrl } from '@/utils/env'

export default {
  components: {
    CreateUpdateDialog,
    UserDetailExpend,
    UpdatePowerMenuDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        mobile: '', // 检索手机号
        user: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取用户数据
     */
    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getUserList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      this.tableData = (res.data && res.data.list) || []
      this.total = (res.data && res.data.totalCount) || 0
    },

    // 指定要当前展开行的值为 id
    addRowKey(row) {
      return row.userId
    },

    /**
     *  获取下拉框指令参数，用于自定义参数
     */
    handleCommand(flag, row) {
      return {
        flag,
        row
      }
    },

    // 选择更多下拉框内容
    clickMore(command) {
      switch (command.flag) {
        // 修改
        case 'update':
          this.showCreateUpdateDialog(command.row)
          break
        // 删除
        case 'delete':
          this.deleteUser(command.row)
          break
        // 菜单权限
        case 'power':
          this.showPowerMenuDialog(command.row)
          break
      }
    },

    /**
     * @description: 修改用户菜单权限
     */

    showPowerMenuDialog(row = {}) {
      this.$refs.UpdatePowerMenuDialogRef.showDialog(row)
    },

    /**
     * @description: 添加用户对话框显示
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 前往用户控制
     */

    async goUsersClient({ userId }) {
      this.btnLoading = true
      const { data: res } = await goUserClientConsole({
        userId
      })
      this.btnLoading = false
      if (res.code !== 1) return
      console.log(res)

      // 获取协议
      const { protocol } = getLocation()

      // token
      const TOKEN = res.token
      const { userDir } = this.$root.webConfig

      let obj = {}
      if (typeof res.env === 'object') {
        obj = res.env.paramValue && JSON.parse(res.env.paramValue)
      }
      const frontAddress = obj.frontAddress || ''

      const rootPath = frontAddress || `${protocol}//${userDir}`

      // 拼接 url 地址
      const URL = `${rootPath}#/cdn/dashboard?token=${TOKEN}`
      openUrl(URL)
    },

    /**
     * @description: 删除用户
     * @param {*} row
     */

    async deleteUser(row) {
      const result = await this.$doDelete({
        name: row.username || row.mail || row.mobile || row.wechatOpenid,
        tag: '用户'
      })
      if (!result) return

      this.btnLoading = true
      const { data } = await doDeleteUser({
        ids: row.userId
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success('删除用户成功')
    },

    /**
     * @description: 启动冻结用户
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '冻结用户',
          content: `此操作将冻结用户“ <strong style="color: #F78989;">${row.username ||
            row.mail ||
            row.mobile ||
            row.wechatOpenid}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const { data: res } = await doUpdateUser({
        userId: row.userId,
        status: row.status
      })
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }

      // this.getTableData()
      this.$msg.success('操作成功')
    }
  }
}
</script>

<style lang="scss">
.user_list_box {
  .el-table__expanded-cell {
    padding: 0;
  }
}
</style>
