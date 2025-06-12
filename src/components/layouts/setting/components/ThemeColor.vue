<template>
  <div class="theme-color-box pb-lg">
    <el-divider>{{ antsT('主题颜色') }}</el-divider>
    <div class="flex justify-between pt-df">
      <el-radio-group
        class="theme-radio"
        v-model="nowColor"
        @change="changeColor"
        size="small"
      >
        <el-radio
          :style="'background:' + colorItem"
          v-for="colorItem in predefineColors"
          :key="colorItem"
          :label="colorItem"
        ></el-radio>
      </el-radio-group>

      <colorPicker
        defaultColor="#177DFF"
        v-model="nowColor"
        @change="changeColor"
      />
    </div>
  </div>
</template>

<script>
import { changeThemeColor } from '@/global/change-theme-color'
import { elementColor, lightArr, darkArr } from '@/global/colors'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'ThemeColor',
  props: {},
  data() {
    return {
      predefineColors: Object.freeze([
        '#e6005c',
        '#ff8c00',
        '#ffd700',
        '#00AF57',
        '#00ced1',
        '#5F3AFC',
        '#9565b1'
      ]),

      nowColor: elementColor.primary // 当前主题色
    }
  },
  computed: {
    ...mapState(['layoutTheme'])
  },
  methods: {
    // 改变主题颜色
    changeColor() {
      changeThemeColor(
        this.nowColor,
        this.layoutTheme.mainTheme === 'dark' ? darkArr : lightArr
      ).then(() => {
        console.log('切换颜色成功')
      })
    }
  }
}
</script>

<style lang="scss">
.theme-color-box {
  .m-colorPicker .box {
    right: 0;
    top: 25px;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0px 0px 15px 8px rgba(0, 0, 0, 0.2);
    border: none;
    .colorView {
      border-radius: 4px;
    }
    .hd {
      margin-bottom: 20px;
      .defaultColor {
        border-radius: 4px;
        color: theme('colors.primary');
        border-color: theme('colors.primary');
      }
    }
    .bd {
      h3 {
        display: none;
      }
      h3:last-of-type {
        display: block;
        color: theme('colors.primary');
      }
    }
  }
  .m-colorPicker .colorBtn {
    height: 22px !important;
    width: 20px !important;
    border-radius: 4px;
    cursor: pointer;
  }

  .theme-radio {
    .el-radio {
      margin-right: 10px;
      border-radius: 4px;
    }
    .el-radio__label {
      display: none;
    }
    .el-radio__inner {
      height: 20px;
      width: 20px;
      background-color: inherit;
      border: none;
    }
    .el-radio__inner::after {
      display: none;
    }
    .el-radio__input.is-checked {
      border: none;
      border-radius: 4px;
      box-shadow: 0px 0px 6px 2px rgba(23, 125, 255, 0.8);
    }
  }
}
.el-color-picker__trigger {
  border: 0;
}
</style>
