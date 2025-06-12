<template>
  <div style="min-width: 150px">
    <el-button
      :size="size"
      :type="type"
      style="width: 100%"
      @click="showDialog()"
    >
      {{ antsT(showText) }} <i class="el-icon-plus" />
    </el-button>
    <!-- 选择域名对话框 -->
    <SelectDomainDialog
      ref="SelectDomainDialogRef"
      @change="changeSelectDomain"
      :multiple="multiple"
      :layoutSizes="layoutSizes"
      :username="username"
      :disabledUser="disabledUser"
    />
  </div>
</template>

<script>
import SelectDomainDialog from './dialog'

export default {
  name: 'SelectDomain',
  components: {
    SelectDomainDialog
  },
  props: {
    size: {
      type: String,
      default: 'small'
    },
    type: {
      type: String,
      default: 'default'
    },
    text: {
      type: String,
      default: '请选择域名'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    layoutSizes: Boolean,
    // 管理端
    username: [String, Number],
    disabledUser: Boolean
  },
  data() {
    return {
      domains: [],
      domainIds: []
    }
  },
  computed: {
    showText() {
      let selectText = ''
      if (this.multiple && this.domains.length > 0) {
        selectText += `已选择${this.domains.length}个域名`
      }
      return selectText || this.text
    }
  },
  mounted() {},
  methods: {
    // 对话框显示
    showDialog() {
      this.$refs.SelectDomainDialogRef.showDialog()
    },

    // 重置数据
    reset() {
      this.domains = []
      this.domainIds = []

      if (this.$refs.SelectDomainDialogRef) {
        this.$refs.SelectDomainDialogRef.currentRow = {}
      }
    },

    /**
     * @description: 选中域名
     *   返回参数为一个对象
     *     {
     *         // 域名数组
     *          domains: [],
     *         // 域名 id 数组
     *          domainIds: []
     *     }
     */

    changeSelectDomain({ domains, domainIds }) {
      this.domains = domains || []
      this.domainIds = domainIds || []
      // 暴露方法
      this.$emit('change', {
        domains,
        domainIds
      })
    }
  }
}
</script>

<style scoped lang="scss"></style>
