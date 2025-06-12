<template>
  <div>
    <el-card class="mb-lg">
      <div slot="header">
        <TitleBorder :title="title" />
      </div>
      <ul class="p-lg rounded-2xl bg-ants-bg-3 space-y-lg">
        <li
          class="p-lg rounded-2xl bg-ants-bg-1 flex justify-between"
          v-for="(item, key) in setObj"
          :key="key"
        >
          <div>
            <div class="font-bold">{{ item.title }}</div>
            <div class="mt-lg text-ants-text-3 text-sm">
              {{ item.info }}
            </div>
          </div>

          <ants-switch
            v-if="key === 'locked'"
            v-model="form.locked"
            active-color="#F52443"
            inactive-color="#DCDFE6"
            :active-value="1"
            :inactive-value="0"
            @change="changeLocked"
            v-loading="loading"
          />

          <ants-switch
            v-if="key === 'status'"
            v-model="form.status"
            active-color="#F52443"
            inactive-color="#DCDFE6"
            :active-value="0"
            :inactive-value="1"
            @change="changeStatus"
            v-loading="loading"
          />

          <div v-if="key === 'delete'">
            <ants-button
              icon="el-icon-delete"
              size="small"
              type="danger"
              text="删除"
              @click="doDelete"
              :loading="loading"
            />
          </div>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doUpdateDomainAttr,
  doUpdateDomainStatus,
  doCreate
} = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const setObj = {
  locked: {
    title: '域名锁定',
    info: '域名锁定状态下将禁止任何修改操作，保护域名不被恶意篡改或误操作'
  },
  status: {
    title: '暂停解析',
    info: '将当前域名下全部解析记录暂停，停止域名解析服务，请谨慎操作（操作后全球生效时间最长需要 72 小时）'
  },
  delete: {
    title: '删除域名',
    info: '删除域名后，域名下所有解析记录将被删除，域名将无法正常解析，请谨慎操作'
  }
}
export default {
  name: 'Cname',
  props: {
    title: {
      type: String,
      default: '设置'
    },
    domainInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      form: {
        locked: 0,
        status: 1,
        delete: 0
      },
      setObj
    }
  },
  methods: {
    // 数据化获取数据
    initData({ locked = 0, status = 1 }) {
      this.form.locked = locked
      this.form.status = status
    },

    // 切换锁定状态
    async changeLocked(val) {
      if (val === 1) {
        const confirmResult = await this.$confirm(
          `${setObj.locked.info}，是否继续？`,
          setObj.locked.title,
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'error'
          }
        ).catch((err) => err)

        if (confirmResult !== 'confirm') {
          this.form.locked = 0
          this.$msg.info('已取消操作')
          return
        }
      }

      this.loading = true
      try {
        const { data: res } = await doUpdateDomainAttr({
          id: this.domainInfo.id,
          locked: val
        })
        if (res.code !== 1) {
          this.form.locked = val === 1 ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
        this.$emit('refresh')
      } finally {
        this.loading = false
      }
    },

    // 切换解析状态
    async changeStatus(val) {
      if (val === 0) {
        const confirmResult = await this.$confirm(
          `${setObj.status.info}，是否继续？`,
          setObj.status.title,
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'error'
          }
        ).catch((err) => err)

        if (confirmResult !== 'confirm') {
          this.form.status = 1
          this.$msg.info('已取消操作')
          return
        }
      }

      this.loading = true
      try {
        const { data: res } = await doUpdateDomainStatus({
          domainId: this.domainInfo.id,
          status: val
        })
        if (res.code !== 1) {
          this.form.status = val === 1 ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
        this.$emit('refresh')
      } finally {
        this.loading = false
      }
    },

    // 删除域名
    async doDelete() {
      const result = await this.$doDelete({
        name: this.domainInfo.domain,
        tag: '域名'
      })
      if (!result) return

      this.loading = true
      try {
        const { data: res } = await doCreate({
          domain: '',
          operation_type: 'delete',
          id: this.domainInfo.id
        })
        if (res.code !== 1) return
        this.$msg.success('删除成功')
        // 返回到域名列表
        this.$router.replace('/dns/domain/list')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
