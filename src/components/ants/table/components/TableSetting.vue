<template>
  <el-popover placement="bottom-end" trigger="click">
    <ul class="p-sm">
      <li>
        <el-radio-group v-model="tabelConfig.size" @change="changeData('size')">
          <el-radio label="medium">{{ antsT('大') }}</el-radio>
          <el-radio label="small">{{ antsT('中') }}</el-radio>
          <el-radio label="mini">{{ antsT('小') }}</el-radio>
        </el-radio-group>
      </li>

      <li class="my-lg">
        <el-checkbox
          :true-label="1"
          :false-label="0"
          v-model="tabelConfig.stripe"
          @change="changeData('stripe')"
          >{{ antsT('斑马纹') }}</el-checkbox
        >
      </li>
      <li class="my-lg">
        <el-checkbox
          :true-label="1"
          :false-label="0"
          v-model="tabelConfig.border"
          @change="changeData('border')"
          >{{ antsT('边框（可拉伸列）') }}</el-checkbox
        >
      </li>

      <li>
        <el-radio-group
          v-model="tabelConfig.align"
          @change="changeData('align')"
        >
          <el-radio label="left">{{ antsT('居左') }}</el-radio>
          <el-radio label="center">{{ antsT('居中') }}</el-radio>
          <el-radio label="right">{{ antsT('居右') }}</el-radio>
        </el-radio-group>
      </li>
    </ul>
    <span slot="reference" class="el-icon-more"></span>
  </el-popover>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'TableSetting',
  data() {
    return {}
  },
  computed: {
    ...mapState(['tabelConfig'])
  },
  methods: {
    ...mapMutations(['changeTabelConfig']),
    changeData(val) {
      this.changeTabelConfig({
        [val]: this.tabelConfig[val]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-icon-more {
  display: inline-block;
  width: 30px;
  height: 31px;
  line-height: 31px;
  text-align: center;
  // vertical-align: middle;
  color: #fefefe;
  background-color: theme('colors.primary');
  border-radius: 4px;
  cursor: pointer;
}
</style>
