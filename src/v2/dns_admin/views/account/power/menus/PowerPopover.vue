<template>
  <el-popover
    placement="left"
    width="500"
    trigger="click"
    popper-class="perms_popper_box"
  >
    <div class="flex justify-between items-center">
      <strong>{{ menuRowData.name }}</strong>
      <el-button
        size="mini"
        icon="el-icon-plus"
        type="primary"
        @click="addPerms(menuRowData.type2list, menuRowData.menuId)"
        >添加权限</el-button
      >
    </div>
    <el-form
      :model="form"
      :rules="formRules"
      class="add_persms_form"
      ref="formRef"
    >
      <el-table
        :data="menuRowData.type2list"
        style="margin: 0 0 10px"
        :row-key="addRowKey"
        max-height="600px"
      >
        <el-table-column min-width="100" prop="name" label="权限名称">
          <template #default="{ row }">
            <div v-if="isShoweEditInputIndex != row.menuId">
              {{ row.name }}
            </div>
            <el-form-item v-else required prop="name">
              <el-input
                size="small"
                v-model="form.name"
                ref="nameRef"
                placeholder="输入权限名称"
              ></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column min-width="120" prop="perms" label="权限标识">
          <template #default="{ row }">
            <ul v-if="isShoweEditInputIndex != row.menuId">
              <li
                v-for="item in row.perms.split(',')"
                :key="item"
                style="line-height: 1.5"
              >
                {{ item }}
              </li>
            </ul>
            <el-form-item v-else required prop="perms">
              <el-select
                size="small"
                v-model="form.perms"
                ref="permsRef"
                filterable
                placeholder="选择权限"
                popper-class="x_type_select"
              >
                <el-option
                  v-for="(item, index) in permissionsList"
                  :key="index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column width="90" label="操作">
          <template #default="{ row, $index }">
            <div v-if="isShoweEditInputIndex != row.menuId">
              <el-link
                :underline="false"
                type="primary"
                @click="clickTable(menuRowData.type2list, row)"
                >修改</el-link
              >
              <el-divider direction="vertical"></el-divider>
              <el-link
                @click="deletePermissions(menuRowData.type2list, row, $index)"
                :underline="false"
                type="danger"
                >删除</el-link
              >
            </div>
            <div v-else>
              <el-link
                :underline="false"
                type="primary"
                @click="confirmChangeTb(menuRowData)"
                >确认</el-link
              >
              <el-divider direction="vertical"></el-divider>
              <el-link
                type="info"
                :underline="false"
                @click="cancelChangeTb(menuRowData.type2list, row)"
                >取消</el-link
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>

    <el-button
      slot="reference"
      size="mini"
      type="warning"
      icon="el-icon-star-off"
      circle
      style="margin-right: 10px"
    ></el-button>
  </el-popover>
</template>

<script>
// api
import {
  doCreateMenu,
  doUpdateMenu,
  doDeleteMenu
} from '@/v2/dns_admin/api/account/power'

export default {
  name: 'PowerPopover',
  props: {
    // 当前菜单行数据
    menuRowData: {
      type: Object,
      default: () => ({
        name: '',
        menuId: null,
        type2list: []
      })
    },
    // 权限数组
    permissionsList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 表格当前行表单显示隐藏
      isShoweEditInputIndex: null,
      form: {
        menuId: 0, // id
        parentId: 0, // 父ID
        name: '', // 权限名称
        type: 2, // tyep 2 表示添加权限
        perms: '' // 权限标识
      },
      formRules: {
        name: [
          {
            required: true,
            message: '权限名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        perms: [
          {
            required: true,
            message: '请选择权限',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 添加-修改权限
     * @param {*} row
     */

    confirmChangeTb(row) {
      if (!this.form.name) return this.$msg.error('请输入权限名称')
      if (!this.form.perms) return this.$msg.error('请选择权限标识')
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        const { data: res } = await (!this.form.menuId
          ? doCreateMenu(this.form)
          : doUpdateMenu(this.form))

        if (res.code !== 1) return
        this.$emit('getMenuList')
        this.isShoweEditInputIndex = null
        this.$msg.success(`${!this.form.menuId ? '添加' : '修改'}权限成功`)
      })
    },

    /**
     * @description: 删除权限
     * @param {*} permsArr
     * @param {*} row
     * @param {*} idx
     */

    async deletePermissions(permsArr, row, idx) {
      const { data: res } = await doDeleteMenu(row.menuId)

      if (res.code !== 1) return
      permsArr.splice(idx, 1)
      this.$msg.success('删除菜单权限成功')
    },

    // 指定要当前展开行的值为 id
    addRowKey(row) {
      return row.menuId
    },

    // 点击添加权限
    addPerms(permsArr, parentId) {
      // 限制一次只允许添加一行
      if (permsArr.length && permsArr[0].menuId === 0) {
        return
      }

      // 给 tabelForm 赋值
      this.form = {
        menuId: 0, // id
        parentId: parentId, // 父ID
        name: '', // 权限名称
        type: 2, // tyep 2 表示添加权限
        perms: '' // 权限标识
      }

      // 表格添加第一行
      permsArr.unshift({
        ...this.form
      })

      // 展示添加输入框
      this.isShoweEditInputIndex = 0
    },

    // 点击修改展示输入框
    clickTable(permsArr, row) {
      // 如果已打开行为新增行，则移除新增行，解除禁止添加记录按钮
      if (this.isShoweEditInputIndex === 0) {
        permsArr.shift()
      }

      // 展示修改输入框
      this.isShoweEditInputIndex = row.menuId

      // 给 tabelForm 赋值
      this.form = {
        menuId: row.menuId, // id
        parentId: row.parentId, // 父ID
        name: row.name, // 权限名称
        type: 2, // tyep 2 表示添加权限
        perms: row.perms // 权限标识
      }
    },

    // 修改一行或者新增一行数据后，点击取消
    cancelChangeTb(permsArr, row) {
      // 删除改行
      // 如果为新添加的记录，然后点击取消，则直接删除该行，解除禁止添加记录按钮
      if (row.menuId === 0) {
        permsArr.shift()
      }
      this.isShoweEditInputIndex = null
    }
  }
}
</script>

<style lang="scss">
.perms_popper_box {
  .x_type_select {
    min-width: 200px !important;
  }

  // 权限表格样式
  .add_persms_form {
    .el-button {
      transition: all 0s ease 0s !important;
    }

    .el-table,
    .el-table__body-wrapper {
      overflow: visible;
    }
    .el-table__body-wrapper {
      .el-input__inner {
        padding: 0 5px;
      }
    }

    .cell {
      overflow: visible;
    }
    .el-form-item__content {
      line-height: 32px;
    }
    .el-form-item {
      margin: 0;
    }
    .el-form-item__error {
      white-space: nowrap;
      top: -44px;
      left: 50%;
      transform: translateX(-50%);
      -ms-transform: translateX(-50%);
      -moz-transform: translateX(-50%);
      -webkit-transform: translateX(-50%);
      -o-transform: translateX(-50%);
      padding: 12px;
      border-radius: 4px;
      background-color: theme('colors.ants-bg-4');
      text-align: center;
      font-size: 14px;
      z-index: 9;
    }
    .el-form-item__error::before {
      content: '';
      position: absolute;
      top: 38px;
      left: 50%;
      margin-left: -8px;
      border: 8px solid rgba(0, 0, 0, 0);
      border-top-color: theme('colors.ants-bg-4');
    }
  }
}
</style>
