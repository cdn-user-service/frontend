<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入管理名搜索',
            key: 'username',
            value: queryInfo.username
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="showCreateManagerDialog"
            text="添加管理"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="goodsList"
        @getTableData="getGoodsList"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          label="ID"
          prop="userId"
          width="50"
        ></ants-table-column>
        <ants-table-column label="管理名" prop="username" min-width="110">
        </ants-table-column>
        <ants-table-column label="手机号" prop="mobile" min-width="120">
          <template #default="{ row }">
            {{ row.mobile || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column label="邮箱号" prop="email" min-width="120">
          <template #default="{ row }">
            {{ row.email || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column label="角色" prop="roleIdList" min-width="120">
          <template #default="{ row }">
            <el-tag
              size="mini"
              type="primary"
              style="margin-right:4px;"
              v-for="item in row.roleNameList"
              :key="item.role_id"
            >
              {{ item.role_name }}
            </el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          label="创建时间"
          sortable
          prop="createTime"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column prop="starts" label="状态" min-width="60">
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

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              @click="showUpdateManagerDialog(row)"
              text="修改"
            />

            <ants-button
              size="mini"
              :type="$root.userinfo.userId === row.userId ? 'info' : 'danger'"
              :disabled="$root.userinfo.userId === row.userId"
              @click="deleteUser(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加管理对话框弹窗 -->
    <CreateDialog
      ref="CreateDialogRef"
      :role-list="roleList"
      :form-rules="formRules"
    />

    <!-- 修改管理信息对话框弹窗 -->
    <UpdateDialog
      ref="UpdateDialogRef"
      :role-list="roleList"
      :form-rules="formRules"
    />
  </div>
</template>

<script>
// api
import {
  getManagerList,
  getRoleList,
  doCreateManager,
  doUpdateManager,
  doDeleteManager
} from '@/v2/dns_admin/api/account/user'

import CreateDialog from './CreateDialog'
import UpdateDialog from './UpdateDialog'

export default {
  components: {
    CreateDialog,
    UpdateDialog
  },
  data() {
    // 验证管理名
    const checkUserName = (rule, value, callback) => {
      // 验证管理名的正则表达式，（字母，数字，下划线，减号）
      const regPassWord = /^[a-zA-Z0-9_-]{3,30}$/
      if (regPassWord.test(value)) {
        // 合法管理名
        return callback()
      }
      callback(new Error('请输入3 - 30位合法的管理账号'))
    }

    // 添加管理，验证密码
    const checkPassWord3 = (rule, value, callback) => {
      if (value === this.$refs.CreateDialogRef.form.password1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证规则
    const { isName, isEmail, isTel, isPassword } = this.$validator

    return {
      btnLoading: false,

      total: 0,
      queryInfo: {
        username: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      goodsList: [],
      roleList: [], // 角色列表数据

      formRules: {
        username: [
          {
            required: true,
            message: '管理账号不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: checkUserName,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '手机号不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: isTel(),
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '邮箱号不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: isEmail(),
            trigger: 'blur'
          }
        ],
        password1: [
          {
            required: true,
            message: '密码不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: ['change', 'blur']
          },
          {
            validator: checkPassWord3,
            trigger: 'blur'
          }
        ],
        roleIdList: [
          {
            required: true,
            message: '请选择角色',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.getGoodsList()
    this.getRoleListData()
  },
  methods: {
    /**
     * @description: 获取管理员列表数据
     */
    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getManagerList(this.queryInfo)

      this.$root.loading = false

      if (res.code !== 1) return

      this.goodsList = res.page.list || []
      this.total = res.page.totalCount || 0
    },

    /**
     * @description: 获取角色列表数据
     */

    async getRoleListData() {
      this.btnLoading = true
      const { data: res } = await getRoleList()
      this.btnLoading = false

      if (res.code !== 1) return
      this.roleList = res.list || []
    },

    /**
     * @description: 显示添加管理员对话框
     */

    showCreateManagerDialog() {
      this.$refs.CreateDialogRef.dialogVisible = true
    },

    showUpdateManagerDialog(row) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 启用禁用管理
     * @param {*} row
     */

    async toggleStatus(row, switchRef) {
      let txt = '启用'
      // 禁用
      if (!row.status) {
        const confirmResult = await this.$confirm('禁用管理员', {
          title: '禁用管理员',
          message: '该操作将禁用管理员：' + row.username + ' ，是否继续？',
          type: 'warning',
          center: true
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          this.$msg.info('已取消禁用该管理员')
          return
        }
        txt = '禁用'
      }
      this.$refs[switchRef].loading = true

      const { data: res } = await doUpdateManager({
        userId: row.userId,
        username: row.username,
        mobile: row.mobile,
        email: row.email,
        status: row.status // 传 1表示启用, 0表示禁用
      })
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status === 1 ? 0 : 1
        return
      }
      this.$msg.success(txt + '管理员成功')
    },

    /**
     * @description: 删除管理员
     * @param {*} row
     */

    async deleteUser(row) {
      const result = await this.$doDelete({
        name: row.username,
        tag: '管理员'
      })
      if (!result) return

      const { data: res } = await doDeleteManager([row.userId])

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success('删除管理账号成功')
    }
  }
}
</script>
