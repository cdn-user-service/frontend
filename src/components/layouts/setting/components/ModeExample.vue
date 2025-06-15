<template>
  <div>
    <el-divider>{{ antsT('主题风格') }}</el-divider>
    <el-row :gutter="0">
      <el-col :span="8" v-for="item in exampleList" :key="item">
        <div
          class="flex example-box"
          :class="item === activeMode ? 'active' : ''"
          v-if="item.split('-')[0] === 'ltr'"
          @click="changeMode(item)"
        >
          <span class="el-icon-success" v-if="item === activeMode"></span>
          <div
            class="example-aside-width example-main-height"
            :class="'aside-bgc-' + item.split('-')[2]"
          ></div>
          <div class="flex-1 example-main-height">
            <div
              class="example-header-height"
              :class="'header-bgc-' + item.split('-')[1]"
            ></div>
            <div
              class="example-main-height"
              :class="'main-bgc-' + item.split('-')[3]"
            ></div>
          </div>
        </div>

        <div
          class="example-box"
          :class="item === activeMode ? 'active' : ''"
          v-else
          @click="changeMode(item)"
        >
          <span class="el-icon-success" v-if="item === activeMode"></span>
          <div
            class="example-header-height"
            :class="'header-bgc-' + item.split('-')[1]"
          ></div>
          <div class="flex example-main-height">
            <div
              class="example-aside-width example-main-height"
              :class="'aside-bgc-' + item.split('-')[2]"
            ></div>
            <div
              class="example-main-height flex-1"
              :class="'main-bgc-' + item.split('-')[3]"
            ></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

// 主题js
import { changeThemeColor } from '@/global/change-theme-color'
import { lightArr, darkArr } from '@/global/colors'

export default {
  name: 'ModeExample',
  data() {
    return {
      exampleList: [
        'ttb-dark-light-light', // 上黑下白
        'ltr-light-dark-light', // 左黑右白
        'ltr-dark-dark-light', // 左黑上黑
        'ttb-light-light-light', // 全白
        'ttb-dark-dark-dark' // 全黑
      ]
    }
  },
  computed: {
    ...mapState(['layoutTheme']),
    onLayoutTheme() {
      const LAYOUT_THEME = this.layoutTheme
      return `${LAYOUT_THEME.layoutMode}-${LAYOUT_THEME.headerTheme}-${LAYOUT_THEME.asideTheme}-${LAYOUT_THEME.mainTheme}`
    },
    activeMode() {
      return this.onLayoutTheme
    }
  },
  methods: {
    ...mapMutations(['changeLayoutTheme']),
    /**
     * @description: 切换布局-主题
     * @param {*} val
     */

    changeMode(val) {
      const ON_MODE = val.split('-')
      // 切换 header、aside主题色和布局
      this.changeLayoutTheme({
        layoutMode: ON_MODE[0],
        headerTheme: ON_MODE[1],
        asideTheme: ON_MODE[2],
        mainTheme: ON_MODE[3]
      })

      // 切换 main 主题色
      this.changeMainThemeMode(ON_MODE[3])
    },

    /**
     * @description: 切换主题模块 ====================
     */
    // <main> 浅色深色切换
    changeMainThemeMode(themeMode = 'light') {
      localStorage.setItem('themeMode', themeMode)

      // 添加过渡效果
      if (themeMode === 'dark') {
        document.getElementById('app').classList.add('light-to-dark')
        setTimeout(() => {
          document.getElementById('app').classList.remove('light-to-dark')
        }, 500)
      }

      changeThemeColor(
        window.localStorage.theme_color,
        themeMode === 'dark' ? darkArr : lightArr
      ).then(() => {
        console.log('切换深浅模式成功')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.example-box {
  position: relative;
  width: 55px;
  height: 45px;
  margin: 15px auto;
  box-shadow: 0px 1px 6px 2px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    top: -1px;
    box-shadow: 0px 1px 6px 2px rgba(23, 125, 255, 0.4);
  }
  .el-icon-success {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    margin: -5px 0 0 -5px;
    color: theme('colors.primary');
  }
}
.active.example-box {
  box-shadow: 0px 1px 6px 2px rgba(23, 125, 255, 0.4);
}

.aside-bgc-dark {
  background-color: #222;
}
.aside-bgc-light {
  background-color: #fefefa;
}

.header-bgc-dark {
  background-color: #333;
}
.header-bgc-light {
  background-color: #fefefa;
}

.main-bgc-dark {
  background-color: #444;
}
.main-bgc-light {
  background-color: #f1f1f1;
}

.example-aside-width {
  width: 18px;
}
.example-header-height {
  height: 10px;
}
.example-main-height {
  height: 100%;
}
</style>
