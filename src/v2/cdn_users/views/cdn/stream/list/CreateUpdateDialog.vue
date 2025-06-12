<template>
  <ants-dialog
    :title="`${form.id ? '修改' : '添加'}转发`"
    v-model="dialogVisible"
    width="1000px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <ants-form
      :model="form"
      :rules="rules"
      space-class="space-y-6"
      ref="formRef"
      label-width="110px"
    >
      <div class="rounded-xl p-sm px-df bg-ants-bg-3 -mt-sm">
        <TitleBorder title="选择套餐" />
      </div>
      <!-- 添加 -->
      <ants-form-item label="选择套餐" prop="serialNumber">
        <QueryPlanSelect
          v-model="form.serialNumber"
          ref="QueryPlanSelectRef"
          :disabled="!!form.id"
        />
      </ants-form-item>

      <!-- 修改 -->
      <!-- <ants-form-item v-else label="绑定套餐" required>
        <ants-input v-model="form.plan" disabled/>
      </ants-form-item> -->

      <ants-form-item label="监听端口" prop="listen">
        <ants-input
          v-model.trim="form.listen"
          placeholder="多个监听端口用“|”分隔，如：80|443"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="选择协议" prop="protocol">
        <ants-radio-group v-model="form.protocol">
          <ants-radio label="TCP" text="TCP" />
          <ants-radio label="UDP" text="UDP" />
          <ants-radio label="TCP/UDP" text="TCP/UDP" />
        </ants-radio-group>
      </ants-form-item>

      <div class="rounded-xl p-sm px-df bg-ants-bg-3" style="margin-top: 10px">
        <TitleBorder title="源站设置" />
      </div>

      <ants-form-item label="均衡方式" required prop="server_mode">
        <ants-radio-group v-model="form.server_mode">
          <ants-radio label="weight" text="权重" />
          <ants-radio label="hash" text="哈希" />
          <ants-radio label="polling" text="轮询" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="请求超时时间" required prop="proxy_timeout">
        <ants-input-number
          v-model="form.proxy_timeout"
          size="small"
          :step="1"
          :min="1"
          :max="1000"
          :precision="0"
          placeholder="超时时间"
        />
        <span class="ml-sm text-sm">S</span>
      </ants-form-item>

      <ants-form-item
        label="连接超时时间"
        required
        prop="proxy_connect_timeout"
      >
        <ants-input-number
          v-model="form.proxy_connect_timeout"
          size="small"
          :step="1"
          :min="1"
          :max="75"
          :precision="0"
          placeholder="连接超时时间"
        />
        <span class="ml-sm text-sm">S</span>
      </ants-form-item>

      <ants-form-item label="PP协议" required prop="proxy_protocol">
        <template slot="label">
          <strong>PP协议</strong>
          <el-tooltip
            effect="dark"
            content="通过proxy_protocol协议，服务器端可以获得客户端的真实IP地址和端口"
            placement="top-start"
          >
            <span class="el-icon-info pl-2 cursor-color text-primary"></span>
          </el-tooltip>
        </template>
        <ants-radio-group v-model="form.proxy_protocol">
          <ants-radio :label="0" text="关闭" />
          <ants-radio :label="1" text="协议V1" />
          <ants-radio :label="2" text="协议V2" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item class="ants-table_form_error" style="margin: 0">
        <ants-form :model="tableForm" :rules="rules" ref="tableFormRef">
          <el-table
            :data="tableForm.severTableData"
            size="small"
            style="margin: 0"
          >
            <ants-table-column label="源站IP地址" min-width="160">
              <template #default="{ row, $index }">
                <ants-form-item
                  :prop="`severTableData.${$index}.ip`"
                  :rules="rules.ip"
                >
                  <ants-input
                    style="width: 100%"
                    size="small"
                    v-model="row.ip"
                    placeholder="请输入源站IP地址"
                  />
                </ants-form-item>
              </template>
            </ants-table-column>

            <ants-table-column label="回源端口" min-width="140">
              <template #default="{ row, $index }">
                <ants-form-item
                  :prop="`severTableData.${$index}.sPort`"
                  :rules="rules.sPort"
                >
                  <ants-input
                    style="width: 100%"
                    size="small"
                    v-model="row.sPort"
                    placeholder="回源端口"
                  />
                </ants-form-item>
              </template>
            </ants-table-column>

            <ants-table-column
              label="权重"
              min-width="120"
              v-if="form.server_mode === 'weight'"
            >
              <template #default="{ row }">
                <ants-form-item>
                  <ants-input-number
                    style="width: 100%"
                    v-model="row.weight"
                    controls-position="right"
                    size="small"
                    :min="1"
                    :max="999"
                  />
                </ants-form-item>
              </template>
            </ants-table-column>
            <ants-table-column label="操作" width="60" align="right">
              <template #default="{ row, $index }">
                <span
                  class="el-icon-delete-solid text-2xl text-error cursor-pointer"
                  :class="{
                    'text-ants-text-4 cursor-not-allowed': $index === 0
                  }"
                  @click="deleteLineItem(row, $index)"
                ></span>
              </template>
            </ants-table-column>
          </el-table>
        </ants-form>

        <div class="text-center pt-df">
          <span
            class="text-primary el-icon-plus cursor-pointer"
            @click="addNewRow"
          >
            {{ antsT('新增一行') }}</span
          >
        </div>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { doCreateUpdateStream } from '@/v2/cdn_users/api/cdn/stream'

import QueryPlanSelect from '@/v2/cdn_users/components/QueryPlanSelect'

// 线路表格初始化数据
const baseTableData = {
  ip: '',
  sPort: '',
  weight: 1
}

// 表单初始化数据
const defaultForm = {
  // 添加 id = 0
  id: 0,
  // 套餐ID
  serialNumber: '',
  // 监听端口
  listen: 88,
  // 协议
  protocol: 'TCP',
  // 均衡方式，轮询 和 权重时传空，权重时回源IP有weight
  server_mode: 'weight',
  // 超时时间
  proxy_timeout: 30,
  // 连接超时时间
  proxy_connect_timeout: 60,
  // 状态
  status: 1,
  // 代理协议 0 关 1 开
  proxy_protocol: 0
}

const rules = {
  serialNumber: [
    {
      required: true,
      message: '请选择套餐',
      trigger: 'change'
    }
  ],
  listen: [
    {
      required: true,
      message: '请输入监听端口',
      trigger: ['change', 'blur']
    }
  ],
  protocol: [
    {
      required: true,
      message: '请选择协议',
      trigger: 'change'
    }
  ],
  ip: [
    {
      required: true,
      message: '请输入IP地址',
      trigger: ['change', 'blur']
    }
  ],
  sPort: [
    {
      required: true,
      message: '请输入回源端口',
      trigger: ['change', 'blur']
    }
  ]
}

export default {
  components: {
    QueryPlanSelect
  },
  data() {
    return {
      dialogVisible: false,
      // 线路设置数据
      tableForm: {
        severTableData: [
          {
            ...baseTableData
          }
        ]
      },

      form: {
        ...defaultForm
      },

      rules
    }
  },
  mounted() {},
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.tableForm.severTableData = [
        {
          ...baseTableData
        }
      ]
      // 获取套餐列表
      this.$nextTick(() => {
        this.$refs.QueryPlanSelectRef.getPlanList()
      })

      if (row.id) {
        const serverArr = row.confInfo.server.map((item) => {
          const arr = item.split(' ')
          const ipPort = arr[0].split(':')
          let weight = 1
          if (arr[1]) {
            weight = +arr[1].replace('weight=', '')
          }
          return {
            ip: ipPort[0],
            sPort: ipPort[1],
            weight: weight
          }
        })
        this.tableForm.severTableData = [...serverArr]
        this.form = {
          // 修改时用于显示
          // 用户名
          user: row.user,
          // 套餐名称
          plan: row.productName,

          id: row.id,
          userId: row.userId,
          serialNumber: row.serialNumber,
          status: row.status,

          listen: row.confInfo.listen,
          protocol: row.confInfo.protocol,
          proxy_protocol: row.confInfo.proxy_protocol || 0,
          proxy_timeout: row.confInfo.proxy_timeout.replace('s', ''),
          proxy_connect_timeout: row.confInfo.proxy_connect_timeout.replace(
            's',
            ''
          ),
          server_mode: row.confInfo.server_mode
        }
        // console.log(this.form)
      }
    },

    /**
     * @description: 添加提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.tableFormRef.validate(async (valid) => {
          if (!valid) return

          this.$refs.dialogRef.btnLoading = true
          try {
            // 构造请求数据
            const postData = {
              id: this.form.id,
              userId: this.form.userId,
              serialNumber: this.form.serialNumber,
              status: this.form.status,
              confInfo: JSON.stringify({
                listen: this.form.listen,
                // 协议
                protocol: this.form.protocol,
                // 均衡方式，轮询 和 权重时传空，权重时回源IP有weight
                server_mode: this.form.server_mode,
                // 代理协议
                proxy_protocol: this.form.proxy_protocol,

                proxy_timeout: this.form.proxy_timeout + 's',
                proxy_connect_timeout: this.form.proxy_connect_timeout + 's',
                server: this.tableForm.severTableData.map((item) => {
                  // 数据之间已空格分隔开，TODO后面两个数据暂时没有写
                  // `${item.ip}:${item.sPort} weight=${item.weight} max_fails=3 fail_timeout=30s`
                  return `${item.ip}:${item.sPort}${
                    this.form.server_mode === 'weight'
                      ? ` weight=${item.weight}`
                      : ''
                  }`
                })
              })
            }
            console.log(postData)
            const { data: res } = await doCreateUpdateStream({
              ...postData
            })
            if (res.code !== 1) return
            this.$msg.success('保存成功')
            this.$emit('refresh')
            this.dialogVisible = false
          } finally {
            this.$refs.dialogRef.btnLoading = false
          }
        })
      })
    },

    /**
     * @description: 点击删除线路
     * @param {*} row
     */

    deleteLineItem(row, idx) {
      if (idx === 0) return
      this.tableForm.severTableData.splice(idx, 1)
    },

    /**
     * @description: 点击新增一行
     */

    addNewRow() {
      this.tableForm.severTableData.push({
        ...baseTableData
      })
    },

    // 添加表单重置
    resetForm() {
      this.form = { ...defaultForm }
      this.$refs.formRef.clearValidate()
      this.$refs.tableFormRef.clearValidate()
    }
  }
}
</script>
