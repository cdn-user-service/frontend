<template>
  <div>
    <el-divider>{{ antsT('其他设置') }}</el-divider>
    <div
      class="flex justify-between items-center my-lg"
      v-for="(item, idx) in otherSettingList"
      :key="idx"
    >
      <span>{{ antsT(item.key) }}</span>
      <el-switch
        v-model="headerActionItem[item.name]"
        inactive-color="#DCDFE6"
        :active-value="true"
        :inactive-value="false"
        @change="
          changeOtherSetting({
            [item.name]: headerActionItem[item.name]
          })
        "
      >
      </el-switch>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'OtherSetting',
  data() {
    return {
      otherSettingList: Object.freeze([
        {
          key: '消息',
          name: 'showMessage'
        },
        {
          key: '全屏',
          name: 'showFullScreen'
        },
        {
          key: '锁屏',
          name: 'showLockScreen'
        },
        {
          key: '刷新',
          name: 'showRefresh'
        },
        {
          key: '国际化',
          name: 'showI18n'
        }
      ])
    }
  },
  computed: {
    ...mapState(['headerActionItem'])
  },
  methods: {
    ...mapMutations(['changeHeaderActionItem']),

    changeOtherSetting(val) {
      this.changeHeaderActionItem(val)
    }
  }
}
</script>

<style lang="scss">
.el-divider__text.is-center {
  white-space: nowrap;
}
</style>
