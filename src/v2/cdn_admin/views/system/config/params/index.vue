<template>
  <div class="work_item_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索配置名称',
            key: 'key',
            value: queryInfo.key
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
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加配置"
          />

          <!-- <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="batchDelete"
            text="批量删除"
          /> -->
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
        ></ants-table-column>
        <ants-table-column prop="id" label="ID" width="70"> </ants-table-column>
        <ants-table-column prop="remark" label="配置名称" min-width="120">
          <template #default="{ row }">
            {{ antsT(row.remark) }}
          </template>
        </ants-table-column>

        <ants-table-column prop="paramKey" label="参数" min-width="120">
        </ants-table-column>

        <!-- <ants-table-column prop="paramValue" label="参数值" min-width="120">
          <template #default="{ row }">
            <div class="overflow-y-auto" style="max-height:150px;">
              {{row.paramValue}}
            </div>
          </template>
        </ants-table-column> -->

        <ants-table-column prop="weight" label="排序" min-width="80">
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="60">
          <template #default="{ row }">
            <span v-if="row.status === 1" class="text-success el-icon-success">
              {{ antsT('开启') }}</span
            >
            <span v-else class="text-error el-icon-remove">
              {{ antsT('停用') }}</span
            >
          </template>
        </ants-table-column>

        <!-- <ants-table-column
            prop="paramValue"
            label="配置名值"
            min-width="300"
            
          >
            <template #default="{ row }">
              <div class="param_value_div">
                {{ row.paramValue }}
              </div>
            </template>
          </ants-table-column> -->

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="success"
              size="mini"
              @click="goDetail(row)"
              text="详情"
            />
            <ants-button
              type="primary"
              size="mini"
              @click="showCreateUpdateDialog(row)"
              text="编辑"
            />
            <!-- <ants-button
              type="danger"
              size="mini"
              @click="singleDelete(row)"
              text="删除"
            /> -->
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加修改配置名对话框弹窗 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      :params-key-list="paramsKeyList"
    />
  </div>
</template>

<script>
// api
import {
  getConfigList,
  getConfigById,
  doDeleteConfig
} from '@/v2/cdn_admin/api/system/config'

import CreateUpdateDialog from './components/CreateUpdateDialog'

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 配置名标题
        page: 1, // 当前的页数
        limit: 20 // 当前每页显示多少条数据
      },

      selectArr: [],
      tableData: [],
      btnLoading: false,
      // 所有配置名名列表
      paramsKeyList: []
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    // 获取配置名列表数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getConfigList({
          key: this.queryInfo.key,
          page: this.queryInfo.page + '',
          limit: this.queryInfo.limit + ''
        })

        if (res.code !== 1) return
        const obj = res.page || {}
        const arr = obj.list || []

        if (this.$mode['176_179']) {
          this.tableData = arr
        } else {
          this.tableData = arr.filter(
            item =>
              !['STRIPE_PAY_CONF', 'TOKEN_PAY_CONF'].includes(item.paramKey)
          )
        }

        this.paramsKeyList = res.allFields || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 添加修改对话框展示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 点击查看详情
     */

    goDetail({ paramKey }) {
      const ROUTE_OBJ = {
        WEB_DIR_CONF: 'site/dir',
        WEB_SITE_CONFIG_KEY: 'site/basic',
        WEB_AGREEMENT: 'site/agreement',
        WXLOGIN_CONFIG_KEY: 'wechatCode',
        MAIL_CONFIG_KEY: 'email/config',
        SMS_CONFIG_KEY: 'sms',
        SMS_BAO: 'sms',
        ALIYUN_SMS_CONFIG_KEY: 'sms',
        TENCENTUSERCERTIFY_CONFIG_KEY: 'verification/wechat',
        ALIPAYUSERCERTIFY_CONFIG_KEY: 'verification/ali',
        WXPAY_CONFIG_KEY: 'payment/wechat',
        ALIPAY_CONFIG_KEY: 'payment/alipay',
        STRIPE_PAY_CONF: 'payment/stripe',
        TOKEN_PAY_CONF: 'payment/tokenpay',
        CCCYUN_PAY_CONF: 'payment/cccyun',
        ALLINPAY_PAY_CONF: 'payment/allinpay',
        SYS_APP_LOGIN: 'token',
        DNS_USER_API_ROOT_URI: 'other-url'
      }
      if (ROUTE_OBJ[paramKey]) {
        this.$router.push(`/system/config/${ROUTE_OBJ[paramKey]}`)
      } else {
        this.$msg.warning('该配置暂未设置！！！')
      }
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '配置'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => {
        return e.id
      })
      this.btnLoading = false

      const { data: res } = await doDeleteConfig({
        ids: idsArr + ''
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + '个配置已成功删除')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ remark, id }) {
      const result = await this.$doDelete({
        name: remark,
        tag: '配置'
      })
      if (!result) return

      this.btnLoading = true
      const { data: res } = await doDeleteConfig({
        ids: id
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除配置成功')
    }
  }
}
</script>
