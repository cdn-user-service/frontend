<template>
  <ants-dialog
    :title="`${form.id ? '修改' : '添加'}${groupName}组`"
    v-model="dialogVisible"
    width="700px"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
    :top="form.id ? '15vh' : '5vh'"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      space-class="space-y-df"
      class="-mt-df"
    >
      <ants-form-item prop="taskType" label="切换类型">
        <ants-radio-group
          v-model="form.taskType"
          size="small"
          @change="changeTaskType"
        >
          <ants-radio :label="3" text="定时切换" />
          <ants-radio :label="4" text="预设切换" />
          <ants-radio :label="2" text="备用切换" />
        </ants-radio-group>
      </ants-form-item>

      <!-- 定时轮询 -->
      <template v-if="form.taskType == 3">
        <ants-form-item prop="intervalTime" label="轮询间隔">
          <ants-input-number
            v-model="form.intervalTime"
            size="small"
            :precision="0"
            :min="1"
            :max="7200"
            placeholder="间隔"
            class="mr-2"
          />
          <span class="text-ants-text-4 text-sm">秒（1~7200）</span>
        </ants-form-item>
      </template>

      <!-- 指定时间范围 -->
      <template v-if="form.taskType == 4">
        <ants-form-item prop="timeRange" label="时间范围">
          <el-time-picker
            is-range
            v-model="form.timeRange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            :clearable="false"
            value-format="timestamp"
            format="HH:mm"
            :picker-options="{
              format: 'HH:mm'
            }"
            size="small"
            style="width:200px;"
          />

          <!-- <el-time-picker
            v-model="form.start"
            :clearable="false"
            value-format="timestamp"
            format="HH:mm"
            :picker-options="{
              format: 'HH:mm'
            }"
            placeholder="开始"
            size="small"
            style="width:100px;"
          />
          <span class="mx-xs">~</span>
          <el-time-picker
            v-model="form.end"
            :clearable="false"
            value-format="timestamp"
            format="HH:mm"
            :picker-options="{
              format: 'HH:mm'
            }"
            placeholder="结束"
            size="small"
            style="width:100px;"
          /> -->
        </ants-form-item>
      </template>

      <ants-form-item label="防御级别" prop="level">
        <ants-input-number
          v-model="form.level"
          size="small"
          :precision="0"
          :min="0"
          :max="9"
          placeholder="防御"
        />
        <span class="text-sm text-ants-text-4">
          数值越大表示防御越高（0 ~ 9）
        </span>
      </ants-form-item>

      <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
          maxlength="17"
          show-word-limit
        />
      </ants-form-item>

      <ants-form-item :label="`${groupName}组`" required v-if="!form.id">
        <div class="ants-table_form_error">
          <el-form :model="tableForm" :rules="rules" ref="tableFormRef">
            <el-table
              size="mini"
              :data="tableForm.ips"
              style="line-height:1;margin-top:0;"
            >
              <ants-table-column :label="`${groupName}组`" min-width="150">
                <template #default="{ $index }">
                  <ants-form-item :prop="`ips.${$index}`" :rules="rules.ips">
                    <ants-input
                      v-model="tableForm.ips[$index]"
                      :placeholder="`一行一个${groupName}，不能重复`"
                      type="textarea"
                      :autosize="{ minRows: 3, maxRows: 6 }"
                    />
                  </ants-form-item>
                </template>
              </ants-table-column>

              <ants-table-column label="操作" width="70" align="center">
                <template #default="{ $index }">
                  <el-button
                    size="small"
                    :type="$index === 0 ? 'info' : 'danger'"
                    :disabled="$index === 0"
                    icon="el-icon-delete"
                    circle
                    @click="delRow($index)"
                  />
                </template>
              </ants-table-column>
            </el-table>
          </el-form>
        </div>

        <div class="text-center -mb-lg" v-if="form.taskType != 4">
          <span class="text-primary cursor-pointer" @click="addRow()">
            <i class="el-icon-plus" />
            添加一组
          </span>
        </div>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 验证规则
import { isIp, isDomain } from '@/utils/validate'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSaveIps } = require(`@/v2/${PROCESS_NAME}/api/dns/gtm`)

const defaultForm = {
  // 分组ID，追加的时候需要
  pollId: 0,
  // 任务ID，必须
  taskId: 0,
  id: 0,
  // 组，用逗号分隔
  // ips: [
  //   // 组一：1.1.1.1,1.1.1.2
  //   // 组二：2.2.2.2,2.2.2.3
  // ],
  // 分组名称
  remark: '',
  // 防御级别 0 ~ 9
  level: 0,

  // 切换类型：3 = 定时切换 | 4 = 预设切换 | 2 = 备用切换
  taskType: 3,
  // 定时切换：轮询间隔
  intervalTime: 900,
  // 预设切换：开始时间
  start: new Date().getTime(),
  // 预设切换：结束时间
  end: new Date().getTime(),
  timeRange: [new Date().getTime(), new Date().getTime() + 1000 * 3600]
}

export default {
  props: {
    groupName: {
      type: String,
      default: 'IP'
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      btnLoading: false,

      form: {
        ...defaultForm
      },
      tableForm: {
        ips: ['']
      }
    }
  },
  computed: {
    rules() {
      const validMethod = this.groupName == 'IP' ? isIp : isDomain
      return {
        taskType: [
          {
            required: true,
            message: '请选择切换类型',
            trigger: ['change', 'blur']
          }
        ],
        intervalTime: [
          {
            required: true,
            message: '请输入轮询间隔',
            trigger: ['change', 'blur']
          }
        ],
        timeRange: [
          {
            required: true,
            message: '请选择时间范围',
            trigger: ['change', 'blur']
          }
        ],
        level: [
          {
            required: true,
            message: '请选择防御级别',
            trigger: ['change', 'blur']
          }
        ],
        ips: [
          {
            required: true,
            message: `请输入${this.groupName}，一行一个`,
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              // 将数据拆分成一行一个
              const newArr = (value || '').trim().split(/[\r\n]+/)
              // 是否正确的格式
              let isOk = false
              // 临时数组，用于判读是否重复
              const nowArr = []

              // 遍历数组
              newArr.every((e, i) => {
                isOk = validMethod(e.trim())
                if (!isOk) {
                  callback(new Error(`${this.groupName}格式错误：${e}`))
                  return false
                }

                // 判断是否重复
                nowArr[i] = e.trim() // 将数据存入临时数组
                if (nowArr.indexOf(e.trim()) != i) {
                  isOk = false
                  callback(new Error(`${this.groupName}不能重复：${e}`))
                }
                return isOk
              })

              if (isOk) callback()
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        ...row,
        children: null,
        timeRange: row.id
          ? [row.start * 1000, row.end * 1000]
          : defaultForm.timeRange
      }
      this.tableForm.ips = ['']
      console.log(this.form)
    },

    // 保存
    async submit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        if (this.form.id) {
          this.doSave()
          return
        }

        this.$refs.tableFormRef.validate(async valid2 => {
          if (!valid2) return
          this.doSave()
        })
      })
    },

    async doSave() {
      this.$refs.dialogRef.btnLoading = true
      try {
        const { timeRange, id } = this.form

        const { data: res } = await doSaveIps({
          ...this.form,
          timeRange: null,
          start: this.resetTime(timeRange[0]),
          end: this.resetTime(timeRange[1]),
          ips: id
            ? null
            : this.tableForm.ips.map(item =>
                item.trim().replace(/[\r\n]+/g, ',')
              )
        })
        if (res.code !== 1) return
        this.$msg.success('保存成功')
        this.$emit('refresh')
        this.dialogVisible = false
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 由于手动输入时间会导致时间戳初始化到 1月1日，需要重置。返回以秒为单位的时间戳
    resetTime(val = 0) {
      // 零点时间戳
      const todayTime =
        new Date(new Date().toLocaleDateString()).getTime() / 1000
      const newVal = new Date(val)
      const hours = newVal.getHours()
      const min = newVal.getMinutes()
      return hours * 3600 + min * 60 + todayTime
    },

    changeTaskType(val) {
      if (val == 4) {
        this.tableForm.ips = ['']
      }
    },

    // 添加一行
    addRow() {
      this.tableForm.ips.push('')
    },

    // 删除一行
    delRow(idx) {
      this.tableForm.ips.splice(idx, 1)
    },

    // 表单重置
    closed() {
      this.$refs.formRef.resetFields()
      this.$refs.tableFormRef && this.$refs.tableFormRef.resetFields()
    }
  }
}
</script>
