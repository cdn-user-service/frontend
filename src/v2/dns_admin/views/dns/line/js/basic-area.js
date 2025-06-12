// api
import {
    getAreaList,
    getLineAreaLEnum,
    getAreaParentList
} from '@/v2/dns_admin/api/dns/line'

export default {
    data: {
        typeList: [], // 分类数据

        // 表格数据
        total: 0,
        queryInfo: {
            group_id: window.sessionStorage.getItem('areaType') || 1,
            parentId: '', // 检索父级
            name: '', // 当前级别
            page: 1, // 当前的页数
            limit: 50 // 当前每页显示多少条数据
        },
        baseAreaList: [], // 区域列表数据
        parentList: [], // 父级查询数据
        selectBaseValue: '' // 批量操作绑定值
    },
    methods: {
        /**
     * @description: 获取分类数据
     */
        async getTypeList() {
            const { data: res } = await getLineAreaLEnum()
            this.typeList = res.data || {}

            // for (let key in res.data) {
            //   this.typeList[key - 1] = res.data[key]
            // }
            // this.typeList.pop()
        },

        /**
      * @description: 获取表格数据
      */

        async getGoodsList() {
            this.$root.loading = true
            const { data: res } = await getAreaList(this.queryInfo)

            this.$root.loading = false
            if (res.code !== 1) return
            this.baseAreaList = res.data.list || []
            this.total = res.data.totalCount || 0
        },

        /**
         * @description: 点击添加获取父级列表
         */

        async getParentList() {
            const { data: res } = await getAreaParentList({
                group_id: this.queryInfo.group_id
            })

            if (res.code !== 1) return
            this.parentList = res.data || []
        },

        // 查询type
        changeType() {
            this.queryInfo.parentId = ''
            this.queryInfo.name = ''
            // 如果当前分类不为大洲，发起请求父级数据
            if (this.queryInfo.group_id != 1) {
                this.getParentList()
            }

            this.changeUsers()
        },

        // 检索
        changeUsers() {
            this.queryInfo.name = this.queryInfo.name.trim()

            // 保存当前查询数据到本地
            window.sessionStorage.setItem('areaType', this.queryInfo.group_id)

            // 检索重置分页到第一页
            this.queryInfo.page = 1
            this.getGoodsList()
        },

        // 列表勾选操作
        handleSelectionChange(val) {
            this.selectBaseValue = val
        },

        // 监听limit 改变事件
        handleSizeChange(newSize) {
            this.queryInfo.limit = newSize
            this.getGoodsList()
        },
        // 监听 页码值 改变事件
        handleCurrentChange(newPage) {
            this.queryInfo.page = newPage
            this.getGoodsList()
        }
    }
}
