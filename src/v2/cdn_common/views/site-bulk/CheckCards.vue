<template>
  <div>
    <ants-form-card
      v-for="(card, key) in cards"
      :key="key"
      :tips-title="(card.tips || {}).title"
      :tips-arr="(card.tips || {}).list"
      :hide-content="!hideCheck && !checkForm[key]"
    >
      <template slot="title">
        <strong v-if="hideCheck" class="text-ants-text-3">
          {{ antsT(card.title) }}
        </strong>

        <el-checkbox v-model="checkForm[key]" v-else>
          <strong>
            {{ antsT(card.title) }}
          </strong>
        </el-checkbox>
      </template>

      <template slot="info">
        {{ antsT(card.info) }}
      </template>

      <template slot="content">
        <slot name="content" :card="key" />
      </template>
    </ants-form-card>
  </div>
</template>

<script>
export default {
  props: {
    hideCheck: {
      type: Boolean,
      default: false
    },
    cards: {
      type: Object,
      default: () => ({})
    },
    // 是否需要提示错误信息
    hideTips: Boolean
  },
  data() {
    return {
      checkForm: {}
    }
  },
  created() {
    this.$nextTick(() => {
      const checkForm = {}
      Object.keys(this.cards).forEach((key) => {
        checkForm[key] = false
      })
      this.checkForm = checkForm
    })
  },
  methods: {
    submit() {
      if (this.hideCheck) {
        return Object.keys(this.checkForm)
      }

      // 判断 checkForm 是否存在勾选，若没有勾选中则提示需要勾选
      // const hasCheck = Object.values(this.checkForm).some(val => val)

      const checkFormKeys = Object.keys(this.checkForm).filter(
        (key) => this.checkForm[key]
      )

      if (!checkFormKeys.length) {
        if (!this.hideTips) {
          this.$msg.error('请勾选需要修改的配置')
        }
        return false
      }

      return checkFormKeys
    }
  }
}
</script>
