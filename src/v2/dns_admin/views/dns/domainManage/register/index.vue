<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <div>
        <ants-input
          v-model="form.domain"
          placeholder="请输入你要注册的域名"
          style="width: 300px"
          class="mr-1"
        >
        </ants-input>
        <el-popover
          placement="bottom"
          :width="600"
          trigger="click"
          ref="suffixPopoverRef"
        >
          <template #reference>
            <el-button style="margin-right: 16px">{{
              form.suffix || '.com'
            }}</el-button>
          </template>
          <template #default>
            <el-tabs
              v-model="activeName"
              class="demo-tabs"
              @tab-click="handleClick"
              @tab-change="handleChange"
            >
              <el-tab-pane
                v-for="item in tabList"
                :key="item.value"
                :label="item.label"
                :name="item.value"
              >
                <div
                  style="
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                  "
                >
                  <el-button
                    v-for="(item, index) in list"
                    :key="index"
                    style="width: 100px; margin-bottom: 5px; margin-right: 5px"
                    @click="saveForm(item)"
                    >{{ item }}</el-button
                  >
                </div>
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-popover>
        <!-- <ants-select v-model="form.suffix" style="width: 120px" class="mr-1">
          <ants-option
            v-for="(item, index) in list"
            :key="index"
            :label="item"
            :value="item"
          />
        </ants-select> -->

        <el-button type="primary" @click="toQuery()">查询</el-button>
      </div>
    </el-card>
    <ants-form-card v-show="isSearchFlag">
      <template slot="title">{{ antsT('搜索结果') }}</template>
      <template slot="content">
        <div
          v-for="(item, index) in queryList"
          :key="index"
          style="line-height: 26px"
        >
          <span class="mr-5" style="font-weight: bold">{{ item }}</span>
          <span>已被注册</span>
        </div>
      </template>
    </ants-form-card>

    <ants-form-card v-show="isSearchFlag">
      <template slot="title">{{ antsT('推荐域名') }}</template>
      <template slot="content">
        <el-table
          :data="domainList"
          v-loading="$root.loading"
          border
          style="margin: 0"
        >
          <ants-table-column
            min-width="140"
            prop="domain"
            label="域名"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row.domain }}</span>
            </template>
          </ants-table-column>
          <ants-table-column
            min-width="140"
            prop="domain"
            label="价格"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row.price }}</span>
            </template>
          </ants-table-column>
          <ants-table-column label="操作" width="250" align="center">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              text="购买"
            />
          </ants-table-column>
        </el-table>
      </template>
    </ants-form-card>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      form: {
        domain: '',
        suffix: '.com'
      },
      list: ['.com', '.cn', '.top', '.xyz', '.net', '.work'],
      isSearchFlag: false,
      queryList: [],
      domainList: [],
      activeName: '0',
      tabList: [
        {
          label: '热门域名',
          value: '0'
        },
        {
          label: '新顶级域名',
          value: '1'
        },
        {
          label: 'CN 域名',
          value: '2'
        },
        {
          label: '中文域名',
          value: '3'
        },
        {
          label: '其他域名',
          value: '4'
        },
        {
          label: '全部',
          value: '5'
        }
      ]
    }
  },
  created() {},
  methods: {
    toQuery() {
      if (!this.form.domain) {
        this.$msg.warning(this.antsT('请输入要查询的域名'))
        return
      }
      console.log('查询')
      this.queryList = [`${this.form.domain}.ren`, `${this.form.domain}.vip`]
      this.domainList = [
        {
          domain: `${this.form.domain}.com`,
          price: '￥100'
        },
        {
          domain: `${this.form.domain}.cn`,
          price: '￥200'
        },
        {
          domain: `${this.form.domain}.top`,
          price: '￥300'
        },
        {
          domain: `${this.form.domain}.xyz`,
          price: '￥400'
        },
        {
          domain: `${this.form.domain}.net`,
          price: '￥500'
        },
        {
          domain: `${this.form.domain}.work`,
          price: '￥600'
        }
      ]
      this.isSearchFlag = true
      //   this.$emit('query', this.form)
    },
    handleClick(tab) {
      switch (tab.index) {
        case '0':
          this.list = ['.com', '.cn', '.top', '.xyz', '.net', '.work']
          break
        case '1':
          this.list = ['.email', '.club', '.site', '.live', '.wang', '.group']
          break
        case '2':
          this.list = [
            '.online',
            '.mobi',
            '.cc',
            '.mom',
            '.ink',
            '.biz',
            '.pro'
          ]
          break
        case '3':
          this.list = ['.中国', '.企业', '.集团', '.网址', '.在线', '.游戏']
          break
        case '4':
          this.list = ['.yoge', '.city', '.love', '.ltd', '.chart', '.fun']
          break
        default:
          this.list = [
            '.com',
            '.cn',
            '.top',
            '.xyz',
            '.net',
            '.work',
            '.email',
            '.club',
            '.site',
            '.live',
            '.wang',
            '.group',
            '.online',
            '.mobi',
            '.cc',
            '.mom',
            '.ink',
            '.biz',
            '.pro',
            '.中国',
            '.企业',
            '.集团',
            '.网址',
            '.在线',
            '.游戏',
            '.yoge',
            '.city',
            '.love',
            '.ltd',
            '.chart',
            '.fun'
          ]
      }
    },
    handleChange(tab, event) {
      console.log(tab, event)
    },
    saveForm(val) {
      console.log('val', val)
      this.form.suffix = val
      //  触发suffixPopoverRef 弹框隐藏
      // this.$refs.suffixPopoverRef.hide()
    }
  },
  destroyed() {}
}
</script>
<style lang="scss">
.el-button + .el-button {
  margin-left: 0;
}
</style>
