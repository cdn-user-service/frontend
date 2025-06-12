<template>
  <div style="margin-top:-20px;">
    <div class="ants-tab-card">
      <el-scrollbar class="scrollbar-box" style="width:100%;height:100%">
        <ul class="flex tab-box">
          <li
            class="tab-box-item flex"
            v-for="item in tabArr"
            :key="item[valueKey]"
            :class="{
              'tab-item-active': item[valueKey] === activeItem
            }"
            @click="toggleTab(item)"
          >
            <div class="tab-item-text one_show_h">{{ antsT(item[labelKey]) }}</div>
            <span class="tab-item-span"></span>
          </li>
        </ul>
      </el-scrollbar>
    </div>

    <div class="tab-main-outer shadow">
      <div class="tab-main-inner p-lg">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AntsTabCard',
  props: {
    tabArr: {
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
    },
    active: [String, Number]
  },
  data() {
    return {
      nowValue: this.tabArr[0] && this.tabArr[0][this.valueKey]
    }
  },
  computed: {
    activeItem() {
      if (this.active) return this.active
      let active = null
      if (this.nowValue) {
        active = this.nowValue
      } else {
        active = this.tabArr[0] && this.tabArr[0][this.valueKey]
      }
      return active
    }
  },
  methods: {
    toggleTab(item) {
      this.nowValue = item[this.valueKey]

      this.$emit('change', item[this.valueKey])
    }
  }
}
</script>

<style lang="scss" scoped>
$radius: 15px;
$border-color: theme('colors.primary-light');
.tab-box {
  padding-top: 20px;
}
.tab-box-item {
  position: relative;
  z-index: 1;
  padding: 12px 30px 14px;
  box-sizing: border-box;
  background-color: theme('colors.ants-bg-1');
  color: theme('colors.ants-text-1');
  font-size: 12px;
  font-weight: 700;
  border-radius: $radius $radius 0 0;
  cursor: pointer;
  border: 2px solid theme('colors.ants-bg-1');
  margin-bottom: -2px;
  margin-right: 10px;
  box-shadow: 0px -5px 15px 1px rgba(0, 0, 0, 0.05);
  @media screen and (max-width: 992px) {
      padding: 12px 20px 14px;
   }
   @media screen and (max-width: 768px) {
      padding: 12px 15px 14px;
   }

  .tab-item-text {
    max-width: 120px;
    line-height: 12px;
    white-space: nowrap;
  }

  &:hover {
    color: theme('colors.primary');
  }
  &:first-child {
    &::before {
      content: '';
      position: absolute;
      bottom: -15px;
      left: -2px;
      right: 0;
      height: 20px;
      background-color: theme('colors.ants-bg-1');
      border-left: 2px solid theme('colors.ants-bg-1');
    }
  }

  .tab-item-span {
    position: absolute;
    right: -9px;
    bottom: -6px;
    width: 15px;
    height: 36px;
    padding-right: 2px;
    transform: rotate(-25deg);
    background-color: theme('colors.ants-bg-1');

    &::before {
      content: '';
      position: absolute;
      top: -1px;
      right: 2px;
      width: 100%;
      height: 48px;
      background-color: theme('colors.ants-bg-1');
    }
  }
}

.tab-item-active.tab-box-item {
  z-index: 3;
  border-color: $border-color;
  color: theme('colors.primary');
  border-bottom-color: theme('colors.ants-bg-1') !important;

  &:first-child {
    &::before {
      border-left-color: $border-color;
    }
  }

  .tab-item-span {
    background-color: $border-color;
  }
}

.tab-main-outer {
  position: relative;
  z-index: 2;
  padding: 2px;
  border-radius: $radius;

  background-image: -webkit-linear-gradient(
    180deg,
    $border-color,
    theme('colors.ants-bg-1') 240px
  );
  background-image: -moz-linear-gradient(
    180deg,
    $border-color,
    theme('colors.ants-bg-1') 240px
  );
  background-image: linear-gradient(
    180deg,
    $border-color,
    theme('colors.ants-bg-1') 240px
  );

  .tab-main-inner {
    position: relative;
    z-index: 4;
    min-height: 300px;
    background-color: theme('colors.ants-bg-1');
    color: theme('colors.ants-text-1');
    border-radius: $radius;
    @media screen and (max-width: 767px) {
      padding: 20px 10px;
    }
  }
}
</style>

<style lang="scss">
.ants-tab-card {
  height: 86px;
  margin-bottom: -26px;
  .el-scrollbar__wrap {
    overflow-x: auto;
    overflow-y: hidden;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .scrollbar-box {
  }
}
</style>
