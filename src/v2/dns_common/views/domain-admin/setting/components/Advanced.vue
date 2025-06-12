
<template>
  <div>
    <el-card class="mb-lg">
      <div slot="header">
        <TitleBorder :title="title" />
        <div class="mt-xs text-ants-text-3 text-sm">
          启用更多功能，保护和加速您的网站与应用
        </div>
      </div>

      <ul class="p-lg bg-ants-bg-3 rounded-2xl space-y-lg">
        <li
          class="p-lg bg-ants-bg-1 rounded-2xl flex justify-between"
          v-for="(item, key) in setObj"
          :key="key"
        >
          <div>
            <div class="font-bold">{{ item.title }}</div>
            <div class="mt-lg text-ants-text-3 text-sm">
              {{ item.info }}
            </div>
          </div>

          <div v-if="key === 'confDefaultTtl'">
            <!-- <el-select
              v-model="form.confDefaultTtl"
              placeholder="TTL"
              size="small"
              style="width: 90px;"
              @change="changeTtl(key)"
            >
              <el-option
                v-for="item in [600, 1800, 3600]"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select> -->
            <el-popover
              placement="bottom-end"
              trigger="click"
              width="210"
              ref="popoverRef"
              @show="showPopover"
            >
              <el-button
                slot="reference"
                type="default"
                size="small"
              >{{ form.confDefaultTtl }}
                <i class="el-icon-arrow-down ml-sm"></i>
              </el-button>
              <ants-input-number
                v-model="ttl"
                :min="domainInfo.minTtl || 1"
                :max="86400"
                :step="1"
                :precision="0"
                :disabled="loading"
              />
              <div class="mt-df">
                <ants-button
                  type="info"
                  size="mini"
                  text="取消"
                  @click="closePopover"
                />
                <ants-button
                  type="primary"
                  size="mini"
                  icon="el-icon-check"
                  text="保存"
                  :loading="loading"
                  @click="changeTtl(key)"
                />
              </div>
            </el-popover>

          </div>
          <ants-switch
            v-else
            v-model="form[key]"
            active-color="#13ce66"
            inactive-color="#DCDFE6"
            :active-value="1"
            :inactive-value="0"
            @change="changeStatus(key)"
            v-loading="loading"
          />
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSaveDomainAttr } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const setObj = {
  confDefaultTtl: {
    title: 'TTL 默认值 （秒）',
    info: '添加记录时所使用的 TTL 默认值，可根据您的需要进行设置'
  },
  confCnameAccelerate: {
    title: 'CNAME 加速',
    info: '开启后可有效提升解析速度，当域名设置多级 CNAME 记录时减少解析次数'
  },
  confRecursiveStatus: {
    title: '递归解析加速',
    info: '开启后可实现权威 DNS 与递归 DNS 的解析数据联动，有效提升递归解析效率及安全性'
  },
  confSeoStatus: {
    title: '搜索引擎优化',
    info: '与各大主流搜索引擎深度合作，开启后可优化当前域名的站点收录'
  }
}

export default {
  name: 'Advanced',
  props: {
    title: {
      type: String,
      default: '设置'
    },
    domainInfo: {
      type: Object,
      default: () => ({
        // 套餐可设置的最小TTL
        minTtl: 1
      })
    }
  },
  data() {
    return {
      loading: false,
      form: {
        confDefaultTtl: 600,
        confCnameAccelerate: 0,
        confSeoStatus: 0,
        confRecursiveStatus: 0
      },
      ttl: 600,
      setObj
    }
  },
  mounted() {},
  methods: {
    // 数据初始化
    initData({
      confDefaultTtl = 600,
      confCnameAccelerate = 0,
      confRecursiveStatus = 0,
      confSeoStatus = 0
    }) {
      this.form.confDefaultTtl = confDefaultTtl
      this.form.confCnameAccelerate = confCnameAccelerate
      this.form.confRecursiveStatus = confRecursiveStatus
      this.form.confSeoStatus = confSeoStatus
    },

    // 切换状态
    changeStatus(key) {
      this.doSave(key, {
        fail: () => {
          this.form[key] = this.form[key] === 1 ? 0 : 1
        }
      })
    },

    showPopover() {
      this.ttl = this.form.confDefaultTtl
    },

    // 修改TTL
    async changeTtl(key) {
      this.form.confDefaultTtl = this.ttl
      this.doSave(key, {
        success: () => {
          this.closePopover()
        }
      })
    },

    // 关闭popover
    closePopover() {
      this.$refs.popoverRef[0].doClose()
    },

    // 保存
    async doSave(key, { success, fail }) {
      if (!key) return
      this.loading = true
      try {
        const { data: res } = await doSaveDomainAttr({
          id: this.domainInfo.id,
          [key]: this.form[key]
        })
        if (res.code !== 1) {
          fail && fail()
          return
        }
        success && success()
        this.$msg.success('操作成功')
        this.$emit('refresh')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
