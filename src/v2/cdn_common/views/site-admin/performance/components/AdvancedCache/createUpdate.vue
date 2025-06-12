<template>
  <ants-dialog
    :title="title + '规则'"
    v-model="dialogVisible"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
      :status-icon="false"
    >
      <ants-form-item
        label="缓存方式"
        prop="mode"
        v-if="mode === 'cache_config'"
      >
        <ants-radio-group v-model="form.mode">
          <ants-radio label="cache" text="缓存" />
          <!-- <ants-radio label="gho" text="镜像" /> -->
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="缓存类型" prop="type">
        <ants-select
          v-model="form.type"
          placeholder="请选择缓存类型"
          @change="changeType"
        >
          <ants-option label="文件后缀" :value="1"> </ants-option>
          <ants-option label="精确匹配" :value="2"> </ants-option>
          <ants-option label="模糊匹配" :value="3"> </ants-option>
          <ants-option label="缓存目录" :value="4"> </ants-option>
          <ants-option label="所有类型" :value="5"> </ants-option>
        </ants-select>
      </ants-form-item>

      <ants-form-item label="匹配内容" prop="content">
        <div class="relative" v-if="form.type === 1">
          <template>
            <FileExtension ref="FileExtensionRef" v-model="form.content">
              <span
                style="line-height: 1"
                class="py-xs px-xs absolute text-sm right-0 top-0 bg-primary-light text-primary rounded-lg z-10 cursor-color"
              >
                <i class=""></i>
                选择
              </span>
            </FileExtension>

            <ants-input
              type="textarea"
              v-model.trim="form.content"
              :autosize="{ minRows: 6, maxRows: 20 }"
              placeholder="jpg|png|gif|css"
              @input="inputContent"
            ></ants-input>
          </template>
        </div>

        <ants-input
          v-else
          type="textarea"
          v-model="form.content"
          :autosize="{ minRows: 6, maxRows: 20 }"
          :placeholder="typeObj[`type_${form.type}`]"
          :disabled="form.type === 5"
        ></ants-input>
      </ants-form-item>

      <ants-form-item
        label="缓存时间"
        prop="time"
        v-if="mode === 'cache_config'"
      >
        <ants-input-number
          v-model="form.time"
          size="small"
          :min="1"
          :max="8760"
          class="mr-sm"
        ></ants-input-number>
        <ants-select
          v-model="form.unit"
          placeholder="单位"
          style="width: 90px"
          size="small"
        >
          <ants-option
            v-for="(value, key) in cacheTime"
            :key="key"
            :label="value"
            :value="key"
          >
          </ants-option>
        </ants-select>
        <!-- <span class="mx-sm">小时</span> -->
        <!-- <span class="text-sm text-ants-text-4">（1 ~ 8760）</span> -->
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import FileExtension from '@/v2/cdn_common/components/FileExtension'

const PROCESS_NAME = process.env.VUE_APP_NAME
const defaultForm = {
  id: 0,
  type: 1,
  content: '',
  time: 24,
  unit: 'h',

  // 缓存方式, gho = 镜像，cache =
  mode: 'cache'
}
export default {
  components: {
    FileExtension
  },
  props: {
    // 是否为批量操作，为批量操作是不需要提交请求
    bulk: Boolean
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      title: '添加缓存规则',
      dialogVisible: false,
      // cache_config = 缓存，un_cache_config = 不缓存
      mode: '',

      // 缓存类型对象
      typeObj: {
        type_1: 'js|css|png|jpg',
        type_2: '一行一个，不能有空格',
        type_3: '一行一个，不能有空格',
        type_4: '以 / 开头，一行一个，不能有空格',
        type_5: '多个 cookie 名以 “ | ” 分割'
      },

      // 缓存时间，仅添加缓存是有， 添加不缓存是没有
      cacheTime: {
        s: '秒',
        m: '分钟',
        h: '小时',
        d: '天',
        M: '月',
        y: '年'
      },

      form: {
        ...defaultForm
      },

      formRules: {
        mode: [
          {
            required: true,
            message: '请选择缓存类型',
            trigger: 'change'
          }
        ],
        type: [
          {
            required: true,
            message: '请选择缓存类型',
            trigger: 'change'
          }
        ],
        content: [
          {
            required: true,
            message: '请输入匹配内容',
            trigger: ['change', 'blur']
          }
        ],
        time: [
          {
            required: true,
            message: '请输入缓存时间',
            trigger: ['change', 'blur']
          }
        ],
        unit: [
          {
            required: true,
            message: '请输入缓存时间',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 匹配内容输入框改变，对应勾选值改变
     * @param {*} val
     */

    inputContent(val) {
      let arr = []
      if (val != '') {
        arr = val.split('|')
      }
      this.$refs.FileExtensionRef.content = arr
    },

    /**
     * @description: 对话框显示
     * @param {*} row
     */
    showDialog(row = {}, mode = '') {
      this.dialogVisible = true
      this.mode = mode
      const modeTitle = mode === 'cache_config' ? '缓存' : '不缓存'

      let title = '添加'
      // 添加
      if (row.id) {
        title = '编辑'
        this.form = {
          ...row,
          content:
            row.type === 1 ? row.content : row.content.replace(/\|+/g, '\n')
        }
      }
      this.title = title + modeTitle
    },

    /**
     * @description: 添加提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        const postObj = {
          ...this.form,
          content:
            this.form.type === 1
              ? this.form.content
              : this.form.content.trim().replace(/[\r\n]+/g, '|')
        }

        this.bulk ? this.submitByData(postObj) : this.submitByApi(postObj)
      })
    },

    // 提交方式一，发起请求
    async submitByApi(postObj = {}) {
      this.$refs.dialogRef.btnLoading = true
      try {
        const res = await this.$listeners.saveSiteAttr({
          [this.mode]: [postObj]
        })
        if (!res) return
        this.$listeners.refreshData()
        this.dialogVisible = false
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 提交方式二，输出数据，用于批量操作
    submitByData(postObj = {}) {
      this.$emit('save', {
        mode: this.mode,
        data: postObj
      })
      this.dialogVisible = false
      this.$msg.success('操作成功')
    },

    // 缓存类型切换
    changeType(val) {
      if (val === 5) {
        this.form.content = '/'
      } else {
        this.form.content = ''
      }
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
