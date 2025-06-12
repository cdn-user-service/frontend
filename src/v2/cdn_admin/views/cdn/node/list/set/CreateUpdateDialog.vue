<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '节点'"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
    :submit-btn-text="submitBtnText"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <!-- <ants-form-item
        label="节点类型"
        prop="clientType"
        v-if="this.form.clientType != 3"
      >
        <ants-radio-group size="small" v-model="form.clientType">
          <ants-radio :label="1" text="节点" />
          <ants-radio :label="2" text="中间源" />
        </ants-radio-group>
      </ants-form-item> -->
      <ants-form-item label="节点 IP" prop="clientIp">
        <ants-input
          v-model="form.clientIp"
          placeholder="请输入节点IP"
          disabled
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="缓存级别" prop="clientType">
        <ants-select
          v-model="form.clientType"
          placeholder="请选择缓存级别"
          filterable
        >
          <el-option
            v-for="item in clientTypeList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="节点分组" prop="areaId">
        <ants-select
          v-model="form.areaId"
          placeholder="请选择节点分组"
          filterable
        >
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="主机区域" prop="area">
        <ants-input
          v-model="form.area"
          placeholder="请输入主机区域"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="选择线路" prop="line">
        <ants-select
          v-model="form.line"
          placeholder="请选择线路（可自定义）"
          filterable
          allow-create
        >
          <ants-option
            v-for="item in lineList"
            :key="item"
            :label="item"
            :value="item"
          />
        </ants-select>
      </ants-form-item>
      <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateUpdateNode, doEnableNode } from '@/v2/cdn_admin/api/cdn/node'

const defaultForm = {
  // id = 0 表示添加，否则为修改
  id: 0,
  clientIp: '',
  // 缓存级别
  clientType: '1',
  // 分组id
  areaId: '',
  // 节点类型
  // clientType: '1',
  // 区域，默认为主ip的区域
  area: '',
  // 线路，默认为主ip的线路
  line: '',
  // 备注信息
  remark: ''
}

const lineList = ['中国移动', '中国电信', '中国联通', '中国铁通', '其他']

export default {
  props: {
    // 节点分组列表
    groupList: {
      type: Array,
      default: () => []
    },
    // 缓存级别列表
    clientTypeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 验证规则
    const { isIp } = this.$validator

    return {
      title: '添加',
      submitBtnText: '确定',
      dialogVisible: false,
      lineList,
      form: {
        ...defaultForm
      },
      formRules: {
        clientIp: [
          {
            required: true,
            message: '请输入节点IP',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
            trigger: 'blur'
          }
        ],
        areaId: [
          {
            required: true,
            message: '请选择节点分组',
            trigger: 'change'
          }
        ],
        area: [
          {
            required: true,
            message: '请输入主机区域',
            trigger: ['change', 'blur']
          }
        ],
        line: [
          {
            required: true,
            message: '请选择线路',
            trigger: 'change'
          }
        ],
        // remark: [
        //   {
        //     required: true,
        //     message: '请输入备注信息',
        //     trigger: ['change', 'blur']
        //   }
        // ],
        clientType: [
          {
            required: true,
            message: '请选择缓存级别',
            trigger: 'change'
          }
        ]
      },
      clientRow: {}
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row) {
      this.dialogVisible = true
      this.title = '添加'
      this.submitBtnText = '确 定'
      this.clientRow = row
      if (row.id) {
        this.title = row.effectiveEndingTime ? '修改' : '注册'
        if (!row.effectiveEndingTime) {
          this.submitBtnText = '立即注册'
        }
      }
      this.form = {
        ...defaultForm,
        ...row,
        clientType: String(row.clientType)
      }
    },

    /**
     * @description: 添加节点 提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data } = await doCreateUpdateNode(this.form)
        this.$refs.dialogRef.btnLoading = false

        if (data.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(
          this.title +
            '节点成功' +
            (!this.clientRow.effectiveEndingTime
              ? '，正在获取节点授权时间'
              : '')
        )

        // 如果为注册，备用节点没有注册
        if (
          this.clientRow.clientType != 3 &&
          !this.clientRow.effectiveEndingTime
        ) {
          this.enableNode()
          // setTimeout(() => {
          //   this.$parent.refreshNodeSync()
          // }, 5000)
        }
      })
    },

    /**
     * @description: 修改节点后需要 主控向ants发起注册
     */

    async enableNode() {
      const { res: data } = await doEnableNode({
        id: this.form.id
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
