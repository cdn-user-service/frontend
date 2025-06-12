import {
  getGlobalAttrList,
  getGlobalAttrDetail,
  doSaveGlobalAttr,
  doDeleteGlobalAttr,
  doChangeGlobalAttrStatus,
  doChangeGlobalAttrWeight
} from '@/v2/cdn_admin/api/cdn/global'

// 推送数据接口
import { pushByInputInfo } from '@/v2/cdn_admin/api/cdn/push'

/** 格式说明
 *  int = 数值
 *  bool = true 或者 0 1
 *  text = '' 字符串
 *  m_text = [{},{},{}] 多个 Object 或者 ['', '', '']
 *  c_m_text = [{}]
 *  mm_text = [{}] 一个 Object
 *  l_text = {} 或者字符串
 */

export default {
  data() {
    return {
      btnLoading: false
    }
  },
  created() {},
  methods: {
    /**
     * @description: 推送数据，增删改操作之后，都需要调用该接口推送数据
     * @param {*} public_chunk 表示推送全局修改的所有公共数据，这里直接传这个参数
     */
    async pushGlobalData() {
      // TODO: 这个接口现在由后台来推送，前端就不推送了
      // const { data: res } = await pushByInputInfo({
      //     public_chunk: 'null'
      // })
    },

    /**
     * @description: 分组获取全局属性
     * @param {*} groups 多个分组名称，以逗号分隔
     * @return {*}
     */
    async getGlobalAttr(groups = '') {
      this.$root.loading = true
      const { data: res } = await getGlobalAttrList({
        groups
      })
      this.$root.loading = false
      if (res.code !== 1) return
      return res
    },

    /**
     * @description: 根据 key 获取单个属性，(c_m_text 类型需要传 parentId)
     * @param {*} key
     * @return {*}
     */
    async getGlobalKeyDetail(key = '', parentId = null) {
      this.$root.loading = true
      const obj = { key }
      // 由于没有 parentId，不能传空，所以判断是否需要 parentId 这个参数
      if (parentId) obj.parentId = parentId
      const { data: res } = await getGlobalAttrDetail(obj)
      this.$root.loading = false
      if (res.code !== 1) return
      return res
    },

    /**
     * @description: 保存全局属性，多个保存
     * @param {*} dataObj
     * @return {*}
     */
    async saveGlobalAttr(dataObj = {}) {
      this.btnLoading = true
      const { data: res } = await doSaveGlobalAttr({
        ...dataObj
      })
      this.btnLoading = false
      if (res.code !== 1) return false
      this.$msg.success('操作成功')

      // 统一推送数据
      this.pushGlobalData()
      return res
    },

    /**
     * @description: 批量删除全局属性，以逗号分隔
     * @param {*} ids
     */
    async deleteGlobalAttr(ids = '', tag = '属性', length = null) {
      let result = false
      // 单个删除
      if (length === null) {
        result = await this.$doDelete({
          tag
        })
      }
      // 批量删除
      if (length >= 0 && length != null) {
        console.log('first')
        result = await this.$batchDelete(length, {
          tag
        })
      }

      if (!result) return

      this.btnLoading = true
      const { data: res } = await doDeleteGlobalAttr({
        ids
      })
      this.btnLoading = false
      if (res.code !== 1) return false
      this.$msg.success(this.antsT('删除成功'))

      // 统一推送数据
      this.pushGlobalData()

      return res
    },

    /**
     * @description: 全局属性状态修改，优先取ID，无id 取KEY，id 返回单个，KEY 返回list
     * @param {*} status
     * @param {*} key
     * @param {*} id
     * @return {*}
     */
    async changeGlobalAttrStatus(status = 0, key = '', id = null) {
      this.btnLoading = true
      const { data: res } = await doChangeGlobalAttrStatus({
        id,
        // 该属性的键名
        key,
        // 状态 0 = 关闭， 1 = 开启
        status
      })
      this.btnLoading = false
      if (res.code !== 1) return false
      this.$msg.success('操作成功')

      // 统一推送数据
      this.pushGlobalData()
      return res
    },

    /**
     * @description: 修改权重
     * @param {*} id
     * @param {*} opMode
     */

    async changeGlobalAttrWeight(id = null, opMode) {
      const { data: res } = await doChangeGlobalAttrWeight({
        id,
        // 权重 0 = 置顶， 1 = 前 ， -1 = 后
        opMode
      })
      if (res.code !== 1) return false
      this.$msg.success('操作成功')

      // 统一推送数据
      this.pushGlobalData()
      return res
    }
  }
}
