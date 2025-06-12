<template>
  <ants-dialog
    :title="title + '镜像规则'"
    v-model="dialogVisible"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      :status-icon="false"
    >
      <ants-form-item label="文件类型" prop="type">
        <ants-select
          v-model="form.type"
          placeholder="请选择文件类型"
          @change="changeType"
        >
          <ants-option label="文件后缀" :value="1"> </ants-option>
          <ants-option label="精确匹配" :value="2"> </ants-option>
          <ants-option label="模糊匹配" :value="3"> </ants-option>
          <ants-option label="缓存目录" :value="4"> </ants-option>
          <!-- <ants-option label="游客" :value="5"> </ants-option> -->
        </ants-select>
      </ants-form-item>

      <ants-form-item label="匹配内容" prop="content">
        <FileExtension
          ref="FileExtensionRef"
          v-if="form.type === 1"
          v-model="form.content"
        >
          <ants-input
            type="textarea"
            v-model.trim="form.content"
            :autosize="{ minRows: 6, maxRows: 20 }"
            placeholder="jpg|png|gif|css"
            @input="inputContent"
          ></ants-input>
        </FileExtension>

        <ants-input
          v-else
          type="textarea"
          v-model.trim="form.content"
          :autosize="{ minRows: 6, maxRows: 20 }"
          :placeholder="typeObj[`type_${form.type}`]"
        ></ants-input>
      </ants-form-item>

      <ants-form-item
        label="时间"
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
          style="width: 90px;"
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

const defaultForm = {
  id: 0,
  type: 1,
  content: '',
  time: 24,
  unit: 'm'
}
export default {
  components: {
    FileExtension
  },
  data() {
    return {
      title: '添加镜像规则',
      dialogVisible: false,
      // cache_config = 缓存，un_cache_config = 不缓存
      mode: '',

      // 缓存类型对象
      typeObj: {
        type_1: 'js|css|png|jpg',
        type_2: '以 / 开头',
        type_3: '以 / 开头',
        type_4: '以 / 开头',
        type_5: '多个 cookie 名以 “ | ” 分割'
      },

      // 缓存时间，仅添加缓存是有， 添加不缓存是没有
      cacheTime: {
        s: '秒',
        m: '分钟',
        h: '小时',
        d: '天',
        M: '月'
      },

      form: {
        ...defaultForm
      },

      formRules: {
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

      let title = '添加'
      // 添加
      if (row.id) {
        title = '编辑'
        this.form = {
          ...row
        }
      }
      this.title = title 
    },

    /**
     * @description: 添加提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const res = await this.$listeners.saveSiteAttr({
          [this.mode]: [this.form]
        })
        this.$refs.dialogRef.btnLoading = false
        if (!res) return
        this.$listeners.refreshData()
        this.dialogVisible = false
      })
    },

    // 缓存类型切换
    changeType() {
      this.form.content = ''
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
