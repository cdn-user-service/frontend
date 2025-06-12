<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 6 }"
      :md="{ span: 5 }"
      :lg="{ span: 4 }"
      :xl="{ span: 4 }"
    >
      <ul
        class="padding-tb padding-right-lg margin-bottom border-radius shadow ants-bg-1"
      >
        <li
          v-for="item in menuArr"
          :key="item[valueKey]"
          class="left-menu-item ants-font-2 text-bold cursor"
          :class="{ 'menu-active': item[valueKey] === activeItem }"
          @click="toggleMenu(item[valueKey])"
        >
          {{ item[labelKey] }}
        </li>
      </ul>
    </el-col>
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 18 }"
      :md="{ span: 19 }"
      :lg="{ span: 20 }"
      :xl="{ span: 20 }"
    >
      <slot name="main" class="animated fadeInUp"></slot>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'AntsLeftMenu',
  props: {
    menuArr: {
      type: Array,
      default: () => []
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
    }
  },
  data() {
    return {
      nowValue: this.menuArr[0] && this.menuArr[0][this.valueKey]
    }
  },
  computed: {
    activeItem() {
      let active = null
      if (this.nowValue) {
        active = this.nowValue
      } else {
        active = this.menuArr[0] && this.menuArr[0][this.valueKey]
      }
      return active
    }
  },
  methods: {
    toggleMenu(val) {
      this.nowValue = val

      this.$emit('change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.left-menu-item {
  padding: 14px 14px 14px 30px;
  font-size: 15px;
  border-radius: 0 10px 10px 0;
  transition: all 0.3s;
}
.menu-active.left-menu-item {
  background-color: theme('colors.primary-light');
  color: theme('colors.primary');
}
</style>
