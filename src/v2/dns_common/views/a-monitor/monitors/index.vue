<template>
  <div class="relative">
    <horizontal-menu
      parent-path="/dns/a-monitor/monitors/"
      :menu-list="menuList"
      title="A 监控"
      ref="HorizontalMenuRef"
    >
      <template slot="title-right">
        <CreateDialog @refresh="refresh" />
      </template>
    </horizontal-menu>

    <div class="absolute" style="right: 20px;top:60px">
      <RuleInfoDialog />
    </div>
  </div>
</template>

<script>
import CreateDialog from './CreateDialog'
import RuleInfoDialog from './RuleInfoDialog'

const menuList = [
  // {
  //   title: '实时监控',
  //   path: 'ontime'
  // },
  {
    title: '监控设置',
    path: 'settings'
  }
  // {
  //   title: '报警信息',
  //   path: 'counts'
  // }
]

export default {
  components: {
    CreateDialog,
    RuleInfoDialog
  },
  data() {
    return {
      menuList
    }
  },
  mounted() {},
  methods: {
    // 刷新列表
    refresh() {
      if (
        typeof this.$refs.HorizontalMenuRef.$children[1].refresh === 'function'
      ) {
        this.$refs.HorizontalMenuRef.$children[1].refresh()
      }
    }
  }
}
</script>
