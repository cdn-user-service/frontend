<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '菜单'"
    width="1100px"
    @close="resetForm"
    @submit="submitForm"
    top="5vh"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      label-position="right"
    >
      <el-row :gutter="20">
        <el-col :span="9" class="space-y-df">
          <ants-form-item label="Sub菜单" prop="isSub">
            <el-radio-group size="mini" v-model="form.meta.isSub">
              <ants-radio-button :label="false" text="否" />
              <ants-radio-button :label="true" text="是" />
            </el-radio-group>
          </ants-form-item>

          <ants-form-item label="菜单标题" required prop="meta.title">
            <ants-input
              v-model="form.meta.title"
              placeholder="请输入菜单标题"
              maxlength="20"
            />
          </ants-form-item>

          <ants-form-item label="菜单路径" required prop="url">
            <ants-input
              v-model="form.url"
              placeholder="请输入菜单路径"
              maxlength="200"
            />
          </ants-form-item>

          <ants-form-item label="组件名" prop="name" required>
            <ants-input
              v-model="form.name"
              placeholder="请输入组件名"
              maxlength="50"
            />
          </ants-form-item>

          <ants-form-item label="重定向" prop="redirect">
            <ants-input
              v-model="form.meta.redirect"
              placeholder="请输入重定向"
              maxlength="30"
            />
          </ants-form-item>

          <ants-form-item label="图标" prop="icon">
            <el-popover
              ref="iconPopper"
              popper-class="menu_icon_popper"
              placement="top"
              width="760"
              trigger="click"
            >
              <el-row>
                <el-col
                  :xs="6"
                  :sm="4"
                  :md="4"
                  :lg="4"
                  :xl="4"
                  v-for="(item, idx) in iconMenu"
                  :key="idx"
                >
                  <div class="icon_item" @click="changeIconName(item)">
                    <span :class="['icon_span', item]"></span>
                    <span class="icon_name">{{ item }}</span>
                  </div>
                </el-col>
              </el-row>

              <el-button
                :icon="form.meta.icon ? form.meta.icon : 'el-icon-plus'"
                plain
                slot="reference"
                style="width: 100%"
              >
                {{ form.meta.icon }}</el-button
              >
            </el-popover>
          </ants-form-item>

          <ants-form-item label="排序" prop="orderNum">
            <ants-input-number
              v-model="form.orderNum"
              :precision="0"
              :step="1"
              :min="1"
              size="small"
              placeholder="排序"
            />
          </ants-form-item>
        </el-col>

        <el-col :span="6" class="space-y-df">
          <ants-form-item label="水平菜单" prop="hSub">
            <el-radio-group size="mini" v-model="form.meta.hSub">
              <ants-radio-button :label="false" text="否" />
              <ants-radio-button :label="true" text="是" />
            </el-radio-group>
          </ants-form-item>

          <ants-form-item label="面包屑" prop="hiddenBreadcrumb">
            <el-radio-group size="mini" v-model="form.meta.hiddenBreadcrumb">
              <ants-radio-button :label="false" text="显示" />
              <ants-radio-button :label="true" text="隐藏" />
            </el-radio-group>
          </ants-form-item>
          <ants-form-item label="是否隐藏" prop="hidden">
            <el-radio-group size="mini" v-model="form.meta.hidden">
              <ants-radio-button :label="false" text="显示" />
              <ants-radio-button :label="true" text="隐藏" />
            </el-radio-group>
          </ants-form-item>

          <ants-form-item label="noToken" prop="noToken">
            <el-radio-group size="mini" v-model="form.meta.noToken">
              <ants-radio-button :label="false" text="否" />
              <ants-radio-button :label="true" text="是" />
            </el-radio-group>
          </ants-form-item>
          <ants-form-item label="管理可访问" prop="allowAdmin">
            <el-radio-group size="mini" v-model="form.meta.allowAdmin">
              <ants-radio-button :label="false" text="否" />
              <ants-radio-button :label="true" text="是" />
            </el-radio-group>
          </ants-form-item>
          <ants-form-item label="开启缓存" prop="cache">
            <el-radio-group size="mini" v-model="form.meta.cache">
              <ants-radio-button :label="false" text="否" />
              <ants-radio-button :label="true" text="是" />
            </el-radio-group>
          </ants-form-item>
          <ants-form-item label="小圆点" prop="dot">
            <el-radio-group size="mini" v-model="form.meta.dot">
              <ants-radio-button :label="false" text="否" />
              <ants-radio-button :label="true" text="是" />
            </el-radio-group>
          </ants-form-item>
          <ants-form-item label="固定Affix" prop="affix">
            <el-radio-group size="mini" v-model="form.meta.affix">
              <ants-radio-button :label="false" text="否" />
              <ants-radio-button :label="true" text="是" />
            </el-radio-group>
          </ants-form-item>
        </el-col>

        <el-col :span="9" class="space-y-df">
          <ants-form-item label="返回路径" prop="backUrl">
            <ants-input
              v-model="form.meta.backUrl"
              placeholder="请输入返回路径"
              maxlength="50"
            />
          </ants-form-item>
          <ants-form-item label="高亮菜单" prop="selectMenu">
            <ants-input
              v-model="form.meta.selectMenu"
              placeholder="请输入高亮菜单的路径"
              maxlength="50"
            />
          </ants-form-item>
          <ants-form-item label="数字标签" prop="badge">
            <ants-input
              v-model="form.meta.badge"
              placeholder="请输入数字标签"
              maxlength="50"
            />
          </ants-form-item>
          <ants-form-item label="定制页面" prop="custom">
            <ants-input
              v-model="form.meta.custom"
              placeholder="请输入定制页面"
              maxlength="50"
            />
          </ants-form-item>

          <ants-form-item label="其他meta" prop="other">
            <div
              v-for="(item, idx) in form.meta.other"
              :key="idx"
              class="other-prepend-input space-y-sm"
            >
              <ants-input placeholder="VALUE" v-model="item.value">
                <ants-input
                  v-model="item.key"
                  slot="prepend"
                  placeholder="KEY"
                  maxlength="20"
                  style="width: 100px"
                />
                <el-button
                  slot="append"
                  size="small"
                  icon="el-icon-delete"
                  type="danger"
                  plain
                  @click="toDelRow(idx)"
                />
              </ants-input>
            </div>

            <div class="pt-2">
              <ants-button
                icon="el-icon-plus"
                text="添加"
                type="primary"
                size="small"
                @click="toAddRow()"
              />
            </div>
          </ants-form-item>
        </el-col>
      </el-row>
    </ants-form>
  </ants-dialog>
</template>

<script>
import iconMenu from '../js/icon-menu'

// api
import { doCreateMenu, doUpdateMenu } from '@/v2/cdn_admin/api/account/menu'

const defaultMeta = {
  // redirect: '', // 重定向路径【string】
  // title: '', // 名称【string】
  // icon: '', // string 图标【string】
  // hidden: false, // 隐藏不显示【bool】
  // requiresFlag: false, // 保存分页数据【bool】
  // levelHidden: false, // 独立的el-menu-item【bool】
  // breadcrumb: true, // 显示页头面包屑【bool】
  // breadcrumbBackPath: '', // 页头面包屑带返回路径【string】
  // dot: false, // 小圆点【bool】
  // badge: '', // 标签，数字或字符串【string】
  // custom: '', // 定制的页面，值为页面标志字符串：rewrite = URL转发【string】
  // // 其他meta参数
  // other: [
  //   {
  //     key: '',
  //     value: ''
  //   }
  // ],

  redirect: '', // 重定向路径 | string
  title: '', // 菜单标题 | string
  icon: '', // 菜单图标 | string
  isSub: false, // 是否为sub菜单 | bool
  hSub: false, // 是否为水平的菜单 | bool
  hidden: false, // 隐藏菜单 | bool
  hiddenBreadcrumb: false, // 隐藏面包屑 | bool
  noToken: false, // 不需要验证token | bool
  allowAdmin: false, // 允许管理员访问 | bool
  backUrl: '', // 返回上一页的url | string
  selectMenu: '', // 选中的菜单 | string
  badge: '', // 在图标右上角展示数字 | string
  custom: '', // 定制的页面，值为页面标志字符串：rewrite = URL转发【string】
  // 其他meta参数
  other: [
    // {
    //   key: '',
    //   value: ''
    // }
  ],

  // 下面的保留
  cache: false, // 是否开启缓存 | bool
  affix: false, // 是否固定在标签页上 | bool,
  dot: false // 小圆点 | bool
}
const defaultForm = {
  // 为添加菜单时 menuId = 0
  menuId: 0, // id
  type: 0, // 菜单等级， 0 = 顶级菜单， 1 = 非顶级菜单
  parentId: 0, // 父ID
  // icon: '', // 图标
  orderNum: 999, // 排序
  perms: '',

  url: '/', // 菜单路径
  name: '', // 组件名称

  // meta
  meta: {
    ...defaultMeta
  }
}

const rules = {
  title: [
    {
      required: true,
      message: '请输入菜单名称',
      trigger: ['change', 'blur']
    }
  ],
  url: [
    {
      required: true,
      message: '请输入菜单路径',
      trigger: ['change', 'blur']
    }
  ],
  _name: [
    {
      required: true,
      message: '请输入组件名称',
      trigger: ['change', 'blur']
    }
  ],
  _icon: [
    {
      required: true,
      message: '请选择图标',
      trigger: ['change', 'blur']
    }
  ],
  _orderNum: [
    {
      required: true,
      message: '请输入排序',
      trigger: ['change', 'blur']
    }
  ]
}

export default {
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      rules,
      ...iconMenu
    }
  },
  methods: {
    // 对话框显示
    showDialog(row, type) {
      this.dialogVisible = true
      // 添加
      if (type === 'create') {
        this.form = {
          ...defaultForm,
          parentId: row.menuId, // 父ID
          type: !row.parentId && !row.menuId ? 0 : 1, // 菜单等级
          url: row.url, // 菜单路径
          // 组件名称
          // name: (row.url || '/').slice(1).replace('/', '-')
          name: (row.trueUrl || '/').slice(1).replace(/\//g, '-') + '-aaaa'
        }
        this.title = '添加'

        console.log(this.form)
      }

      // 修改
      if (type === 'update') {
        this.title = '修改'
        this.form = {
          ...row,
          meta: {
            ...row.meta
          }
        }
      }
    },

    // 保存
    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const postApi = this.form.menuId ? doUpdateMenu : doCreateMenu

          // 构造数据
          const { meta } = this.form
          const { data: res } = await postApi({
            ...this.form,
            meta: JSON.stringify(meta),
            list: []
          })

          if (res.code !== 1) return
          this.$parent.getTableData()
          this.dialogVisible = false
          this.$msg.success(this.antsT(this.title + '菜单成功'))
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    resetForm() {
      this.form = {
        ...defaultForm,
        meta: {
          ...defaultMeta
        }
      }
      this.$refs.formRef.resetFields()
    },

    changeIconName(icon) {
      this.form.meta.icon = icon
      this.$nextTick(() => {
        // 关闭 popper
        this.$refs.iconPopper.showPopper = false
      })
    },

    toDelRow(idx) {
      if (idx === 0) return
      this.form.meta.other.splice(idx, 1)
    },
    toAddRow() {
      if (this.form.meta.other.length > 2) return
      this.form.meta.other.push({
        key: '',
        value: ''
      })
    }
  }
}
</script>

<style lang="scss">
.menu_icon_popper {
  max-height: 650px;
  padding: 20px 10px 0;
  overflow-y: auto;
  .icon_item {
    padding: 25px 10px 0px;
    text-align: center;
    line-height: normal;
    height: 120px;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.3s;
    position: relative;
    top: 0;
    &:hover {
      color: theme('colors.primary');
      box-shadow: 0px 1px 15px 1px rgba(0, 0, 0, 0.1);
      top: -3px;
      .icon_name {
        color: theme('colors.primary');
      }
    }
    .icon_span {
      font-size: 28px;
    }
    .icon_name {
      display: block;
      font-size: 12px;
      color: theme('colors.ants-text-4');
      height: 1em;
      margin-top: 10px;
    }
  }
}

.other-prepend-input {
  .el-input-group__prepend {
    padding: 0;
    .el-input__inner {
      border: 0;
      height: 34px;
    }
  }
}
</style>
