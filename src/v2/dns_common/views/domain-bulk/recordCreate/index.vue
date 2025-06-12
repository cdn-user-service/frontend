<template>
  <div class="bulk-record-create">
    <ul class="content-box space-y-2 ants-tips_box">
      <li>
        1、批量解析功能，适合多域名操作，群站SEO客户非常方便，可以为您节省不少时间！
      </li>
      <li>
        2、使用该功能必须把DNS修改为本站默认DNS，否则无法操作解析。
      </li>
    </ul>
    <el-card class="content-box animated fadeIn">
      <ants-form
        :model="form"
        :rules="formRules"
        label-width="110px"
        ref="formRef"
        class="mb-sm"
      >
        <ants-form-item
          label="解析方式"
          prop="addMode"
        >
          <ants-radio-group v-model="form.addMode">
            <ants-radio
              :label="1"
              text="方式一"
            />
            <ants-radio
              :label="2"
              text="方式二"
            />
            <ants-radio
              :label="3"
              text="方式三"
            />
          </ants-radio-group>
        </ants-form-item>
        <!-- <ants-form-item
          prop="userId"
          v-if="isAdmin"
          label="选择用户"
        >
          <UsersPopover
            v-model="form.userId"
            ref="UsersPopoverRef"
            @change="changeUser"
            width="400px"
          />
        </ants-form-item>

        <ants-form-item
          label="导入分组域名"
          prop="group"
          v-if="form.addMode !== 2"
        >
          <ants-select
            placeholder="请选择分组域名"
            v-model="form.group"
            style="width:400px;"
          >
            <ants-option
              v-for="(item, key) in groupObj"
              :key="key"
              :label="item"
              :value="key"
            />
          </ants-select>
        </ants-form-item> -->

        <component
          :is="`Mode${form.addMode}`"
          ref="ModeRef"
          @submit="submit"
        />

        <ants-form-item
          label="清空原解析"
          prop="insertMode"
        >
          <ants-radio-group v-model="form.insertMode">
            <ants-radio
              :label="1"
              text="不清空"
            />
            <ants-radio
              :label="2"
              text="清空"
            />
          </ants-radio-group>
          <span class="text-sm ml-df text-ants-text-4">这里指的意思是，在添加解析记录前，把以前解析过的记录全部删除掉。</span>
        </ants-form-item>

        <ants-form-item>
          <ants-button
            type="primary"
            size="small"
            :loading="loading"
            @click="doChildSubmit"
            icon="el-icon-check"
            text="批量添加"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            text="批量清空解析"
            @click="showEmptyDialog"
          />
        </ants-form-item>
      </ants-form>
    </el-card>

    <EmptyDialog ref="EmptyDialogRef" />

    <!-- 添加之后的消息提示，成功了多少个，失败了多少个，失败的原因是什么 -->
    <el-dialog
      title="批量添加记录结果"
      :visible.sync="msgVisible"
      width="450px"
      modal-append-to-body
      :close-on-click-modal="false"
      center
      @closed="closeMsgDialog"
    >
      <div class="text-center">
        已成功添加解析：
        <strong class="text-success">{{ msgSuccessNum || 0 }}</strong> 条
      </div>
      <div
        v-if="msgContent.length"
        class="mt-df bg-ants-bg-5 rounded-2xl p-df"
      >
        <div class="text-error mb-sm">
          添加失败：
          <strong class="text-danger">{{ msgContent.length }}</strong> 条
        </div>
        <ul
          class="overflow-y-auto text-sm space-y-xs"
          style="max-height:400px;"
        >
          <li
            v-for="(item, idx) in msgContent"
            :key="idx"
            class=""
          >
            {{ item }}
          </li>
        </ul>
      </div>
      <template slot="footer">
        <ants-button
          type="primary"
          size="small"
          @click="msgVisible = false"
          text="确 定"
        />
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 组件
import Mode1 from './Mode-1.vue'
import Mode2 from './Mode-2.vue'
import Mode3 from './Mode-3.vue'
import EmptyDialog from './EmptyDialog.vue'
import UsersPopover from '@/v2/dns_admin/components/UsersPopover'

// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const { batckInsertRecords } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

const formRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  group: [
    {
      required: true,
      message: '请选择分组域名',
      trigger: 'change'
    }
  ],
  addMode: [
    {
      required: true,
      message: '请选择解析方式',
      trigger: 'change'
    }
  ],
  insertMode: [
    {
      required: true,
      message: '请选择是否清空原解析',
      trigger: 'change'
    }
  ]
}
export default {
  components: {
    Mode1,
    Mode2,
    Mode3,
    EmptyDialog
    // UsersPopover
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      form: {
        userId: '',
        // 分组域名
        group: '',
        // 解析方式 1,2,3
        addMode: 1,
        // 清空原解析： 1 = 直接添加（不清空），2 = 删除 top后添加（清空）
        insertMode: 1
      },
      formRules,
      loading: false,
      groupObj: {},
      msgVisible: false,
      msgContent: [],
      msgSuccessNum: 0
    }
  },
  created() {},
  mounted() {},
  destroyed() {},
  methods: {
    /** 三种方式表单提交：
     *  方式一： 同时添加多个域名的相同记录
     *  方式二： 同时添加多个域名的不同记录，更自由
     *  方式三： 同时添加多个域名的多条不同记录
     */
    doChildSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.$refs.ModeRef.submit()
      })
    },

    // 发起提交数据请求
    async submit({ form = {}, success }) {
      this.loading = true
      try {
        const { addMode, insertMode } = this.form
        const { data: res } = await batckInsertRecords({
          // 解析方式
          add_mode: addMode,
          // 是否清空原解析
          insert_mode: insertMode,
          // 不同的解析方式，参数不同
          ...form
        })
        this.loading = false
        if (res.code !== 1) return

        this.msgVisible = true
        this.msgSuccessNum = res.success || 0
        this.msgContent = []
        if (res.error) {
          const errorArr = res.error.split('[')
          if (errorArr[0] == '') {
            errorArr.shift()
          }
          this.msgContent = errorArr
        }
        // 重置数据
        success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 选择用户
    changeUser(obj = {}) {
      console.log(obj)
      // 清除校验
      this.$refs.formRef.clearValidate('userId')
      // 重新查询用户的域名分组
      this.getDomainGroupByUserId(obj.userId)
    },

    // 根据用户ID查询域名分组
    async getDomainGroupByUserId(userId) {},

    // 批量清空解析对话框显示
    showEmptyDialog() {
      this.$refs.EmptyDialogRef.show()
    },

    // 关闭消息提示对话框
    closeMsgDialog() {
      this.msgVisible = false
      this.msgContent = []
    },

    // 表单重置
    resetForm() {
      if (this.$refs.UsersPopoverRef) {
        this.$refs.UsersPopoverRef.reset()
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
