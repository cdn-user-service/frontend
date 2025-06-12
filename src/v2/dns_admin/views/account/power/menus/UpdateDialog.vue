<template>
  <ants-dialog
    :title="dialogText + '菜单'"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      status-icon
    >
      <ants-form-item label="菜单名称" prop="name">
        <ants-input
          v-model="form.name"
          placeholder="请输入菜单名称"
          maxlength="30"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="菜单路径" prop="url">
        <ants-input
          v-model="form.url"
          placeholder="请输入菜单路径"
          maxlength="200"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="图 标" prop="icon">
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
            :icon="form.icon ? form.icon : 'el-icon-plus'"
            plain
            slot="reference"
            style="width:100%;"
          >
            {{ form.icon }}</el-button
          >
        </el-popover>
      </ants-form-item>
      <!-- <ants-form-item label="图 标" prop="icon">
          <ants-input
            v-model="form.icon"
            placeholder="请输入菜单图标"
            maxlength="200"
          ></ants-input>
        </ants-form-item> -->
      <ants-form-item label="排 序" prop="orderNum">
        <ants-input-number
          v-model="form.orderNum"
          :precision="0"
          :step="1"
          :min="0"
          placeholder="排序"
          size="small"
        >
        </ants-input-number>
        <span class="text-sm text-ants-text-4">（数值越小越靠前）</span>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import iconMenu from './js/icon-menu'

// api
import { doCreateMenu, doUpdateMenu } from '@/v2/dns_admin/api/account/power'

const defaultForm = {
  // 添加对话框的表单数据
  menuId: 0, // id
  parentId: 0, // 父ID
  name: '', // 菜单名称
  url: '', // 菜单路径
  icon: '', // 图标
  type: '', // 菜单等级
  orderNum: 0, // 排序
  perms: ''
}
export default {
  name: 'UpdateDialog',
  data() {
    return {
      dialogText: '添加',
      btnLoading: false,
      dialogVisible: false, // 添加角色对话框弹窗显示
      form: {
        ...defaultForm
      },

      formRules: {
        name: [
          {
            required: true,
            message: '菜单名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        url: [
          {
            required: true,
            message: '菜单路径不能为空',
            trigger: ['change', 'blur']
          }
        ],
        icon: [
          {
            required: true,
            message: '图标不能为空',
            trigger: ['change', 'blur']
          }
        ],
        orderNum: [
          {
            required: true,
            message: '排序不能为空',
            trigger: ['change', 'blur']
          }
        ]
      },
      ...iconMenu
    }
  },
  methods: {
    /**
     * @description: 点击添加菜单
     * @param {*} row
     */

    showUpdateDialog(row, type) {
      // 添加
      if (type === 'create') {
        this.form = {
          menuId: 0, // id
          parentId: row.menuId, // 父ID
          type: row.type, // 菜单等级
          name: '', // 菜单名称
          url: row.url, // 菜单路径
          icon: '', // 图标
          orderNum: 0, // 排序
          perms: ''
        }
        this.dialogText = '添加'
      }

      // 修改
      if (type === 'update') {
        this.form = {
          ...row
        }
        this.dialogText = '编辑'
      }
      this.dialogVisible = true
    },

    /**
     * @description: 添加-编辑提交
     */

     submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data: res } = await (!this.form.menuId
          ? doCreateMenu(this.form)
          : doUpdateMenu(this.form))

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getMenuList()
        this.dialogVisible = false
        this.$msg.success(this.dialogText + '菜单成功')
      })
    },

    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    changeIconName(icon) {
      this.form.icon = icon
      this.$nextTick(() => {
        // 关闭 popper
        this.$refs.iconPopper.showPopper = false
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
</style>
