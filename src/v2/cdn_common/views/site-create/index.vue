<template>
  <el-card class="content-box animated fadeIn">
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      :label-width="labelWidth"
      space-class="space-y-6"
    >
      <ants-form-item label="添加方式：" prop="mode">
        <ants-radio-group size="small" v-model="form.mode">
          <ants-radio
            v-for="(item, key) in {
              Single: '单个添加',
              Bulk: '批量添加方式一',
              BulkOld: '批量添加方式二'
            }"
            :key="key"
            :label="key"
            :text="item"
          />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="选择用户：" prop="userId" v-if="isAdmin">
        <QueryUserSelect v-model="form.userId" style="max-width: 360px" />
      </ants-form-item>

      <ants-form-item label="选择套餐：" prop="serialNumber">
        <QueryPlanSelect
          v-model="form.serialNumber"
          :user-id="form.userId"
          :init="!isAdmin"
          style="max-width: 360px"
        />
      </ants-form-item>

      <ants-form-item label="选择分组：" prop="groupId" v-if="!isAdmin">
        <QueryGroupSelect
          v-model="form.groupId"
          :init="!isAdmin"
          style="max-width: 360px"
        />
      </ants-form-item>

      <component :is="form.mode" :labelWidth="labelWidth" ref="childRef" />

      <div class="my-lg border-t border-ants-border-3"></div>

      <ants-form-item>
        <ants-button
          text="确认添加"
          type="primary"
          :loading="loading"
          icon="el-icon-check"
          @click="doSave()"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import Single from './Single'
import Bulk from './Bulk'
import BulkOld from './BulkOld'
import QueryUserSelect from '@/v2/cdn_admin/components/QueryUserSelect'
import QueryGroupSelect from '@/v2/cdn_users/components/QueryGroupSelect'

const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const {
  doCreateSite,
  doBatchCreateSite
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  components: {
    Single,
    Bulk,
    BulkOld,
    QueryUserSelect,
    QueryGroupSelect,
    QueryPlanSelect:
      PROCESS_NAME === 'cdn_admin'
        ? () => import('@/v2/cdn_admin/components/QueryPlanSelect')
        : () => import('@/v2/cdn_users/components/QueryPlanSelect')
  },
  props: {},
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      loading: false,
      labelWidth: '110px',
      form: {
        mode: 'Single',
        userId: '',
        serialNumber: '',
        groupId: ''
      },
      rules: {
        mode: [
          {
            required: true,
            message: '请选择添加方式',
            trigger: 'change'
          }
        ],
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ],
        serialNumber: [
          {
            required: true,
            message: '请选择套餐',
            trigger: ['change']
          }
        ]
        // groupId: [
        //   {
        //     required: true,
        //     message: '请选择分组',
        //     trigger: ['change']
        //   }
        // ]
      }
    }
  },
  create() {},

  methods: {
    // 保存提交
    doSave() {
      // 验证第一次表单
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        // 验证子表单
        try {
          const childRes = await this.$refs.childRef.doSave()
          console.log('childRes', childRes)

          const { mode, userId, serialNumber, groupId } = this.form
          this[`create${mode}`]({
            userId,
            serialNumber,
            ...childRes,
            groupId
          })
        } catch (err) {
          this.$msg.error('请检查表单数据是否填写正确！')
          throw err
        }
      })
    },

    // 批量添加方式二
    async createBulkOld(formData = {}) {
      await this.createBulk(formData)
    },

    // 批量添加
    async createBulk(formData = {}) {
      this.loading = true
      try {
        const { data: res } = await doBatchCreateSite(formData)
        if (res.code !== 1) return

        const total = res.total || 0
        const success = res.success || 0

        // 全部成功
        if (total === success) {
          this.$msg.success(total ? `${total}个站点添加成功` : '站点添加成功')
          this.goBack()
          return
        }

        // 部分失败
        if (success > 0 && total > success) {
          this.$alert(
            `<div class="text-left">
              <div>添加成功：<span class="text-success">${
                success || 0
              }</span> 个</div>
              <div>添加失败：<span class="text-error">${
                total - success
              }</span> 个</div>
            </div>`,
            '站点添加情况',
            {
              dangerouslyUseHTMLString: true,
              center: true,
              type: 'info',
              callback: (action) => {
                this.goBack()
              }
            }
          )
          return
        }

        // 全部失败
        if (success == 0) {
          this.$alert(
            `<div class="text-left">
              <div>1、请检查站点是否已存在；</div>
              <div>2、请检查站点数是否超过套餐限制；</div>
              <div>3、或者其他原因，请联系我们！</div>
            </div>`,
            '站点添加失败',
            {
              dangerouslyUseHTMLString: true,
              center: true,
              type: 'error'
            }
          )
        }
      } finally {
        this.loading = false
      }
    },

    // 单个添加
    async createSingle(formData = {}) {
      console.log('单个添加', formData)
      this.loading = true
      try {
        const { data: res } = await doCreateSite(formData)
        if (res.code !== 1) return
        this.$msg.success('添加成功')
        this.goBack()
      } finally {
        this.loading = false
      }
    },

    // 返回上一页
    goBack() {
      this.$router.replace('/cdn/site/domain')
    }
  }
}
</script>

<style lang="scss" scoped></style>
