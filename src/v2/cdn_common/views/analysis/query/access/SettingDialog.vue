<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="自定义列表字段"
    width="500px"
    top="5vh"
    @submit="submit"
  >
    <div
      class="mx-auto rounded-2xl bg-ants-bg-5"
      style="max-width: 400px;"
    >
      <div class="pl-lg py-sm border-b border-ants-border-2">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          @change="handleCheckAllChange"
          >全选</el-checkbox
        >
      </div>
      <div class="pl-lg py-sm overflow-y-auto" style="max-height: 500px;">
        <el-checkbox-group
          v-model="checkList"
          class="space-y-xs"
          @change="changeItem"
        >
          <el-checkbox
            v-for="(item, key) in kName"
            :key="key"
            :label="key"
            style="display: block;"
          >
            {{ item }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </ants-dialog>
</template>

<script>
export default {
  props: {
    kName: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogVisible: false,
      checkList: [],
      checkAll: false,
      isIndeterminate: true
    }
  },
  computed: {
    kNameList() {
      return Object.keys(this.kName)
    }
  },
  methods: {
    show(checks = []) {
      this.dialogVisible = true
      this.checkList = checks
      if (checks.length === this.kNameList.length) {
        this.checkAll = true
        this.isIndeterminate = false
      } else {
        this.checkAll = false
        this.isIndeterminate = true
      }
    },
    submit() {
      this.$emit('change', this.checkList)
      this.dialogVisible = false
    },

    handleCheckAllChange(val) {
      this.checkList = val ? this.kNameList : []
      this.isIndeterminate = false
    },

    changeItem(val) {
      const checkedCount = val.length
      this.checkAll = checkedCount === this.kNameList.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.kNameList.length
    }
  }
}
</script>
