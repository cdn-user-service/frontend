export default {
    // 批量操作 - 菜单
    添加记录: 'Add Record',
    取回域名: 'Reclaim Domain',
    导入记录: 'Import Records',
    导出记录: 'Export Records',
    操作日志: 'Operation Logs',

    // 批量操作 - 添加域名
    一级域名: 'Top Level Domain',
    批量添加: 'Bulk Add',
    '重 置': 'Reset',
    备注信息: 'Remarks',
    请输入备注信息: 'Please enter remarks',
    记录值: 'Record Value',
    请输入记录值: 'Please enter record value',
    '域名格式不正确：': 'The domains format is incorrect ',
    '域名不能重复：': 'The domains cannot be repeated ',
    '请输入一级域名，每行一个': 'Please enter the top level domains, one per line',
    '请填写您服务器 IPv4地址': 'Please fill in your server IPv4 address',
    '同时为新域名添加 @ 和 www 的 A 记录': 'Add both @ and www A records for the new domains',
    '输入一级域名，每行一个，最多可输入500个域名。例如：': 'Enter up to 500 domains, one per line, E.g:',

    // 批量操作 - 取回域名
    输入域名: 'Enter Domains',
    设置记录: 'Set Records',
    主机记录: 'Host',
    批量取回: 'Bulk Reclaim',
    '如果您的域名已被其他账号添加，可在此验证取回，支持多个域名批量操作': 'If your domains have been added by other accounts, you can verify and reclaim them here. You can reclaim multiple domains at a time.',
    '域名取回后，将进行 DNS 重置，并影响域名当前解析服务，请谨慎操作（如不希望影响解析，请使用账号间转移功能）': 'After a domain is reclaimed, its DNS queries will be reset and the DNS service will be affected. (To avoid DNS service interruptions, use Cross-Account Transfer.)',
    '请输入需要取回的域名，每行一个，最多可输入500个域名。例如：': 'Enter up to 500 domains, one per line, E.g:',
    '请为以上所有域名添加如下 TXT 记录值, 便于系统验证域名权限；': 'Please add the following TXT record value for all of the above domain names to enable the system to verify domain permissions.',
    '注意这需要在域名当前其他解析商处进行设置；': 'Note that this setting should be done at the DNS service providers of the domain names.',
    '如果域名未在其他账号下, 则无需取回, 将直接添加成功。': 'You can add a domain name directly without the need to reclaim it if it is not under other accounts.',

    // 批量操作 添加记录
    选择域名: 'Select Domain',
    请选择域名: 'Please Select Domain',
    请输入主机记录: 'Enter Host',
    记录类型: 'Record Type',
    请选择记录类型: 'Select Record Type',
    线路类型: 'Split Zone',
    权重: 'Weight',
    请输入权重: 'Enter Weight',
    请输入MX: 'Enter MX',
    秒: 'second',
    请输入TTL: 'Enter TTL',
    添加一行: 'Add a row',

    // 批量操作 导入记录
    '导入记录成功，请勿重复导入': 'The import record is successful, please do not import agai',
    请选择要上传的JSON文件: 'Please select a JSON file to upload',
    上传JSON文件: 'Upload JSON file',
    '将文件拖到此处，或': 'Drag the file here, or ',
    点击上传: 'Click to upload',
    '使用说明：': 'Instructions: ',
    '现在只支持上传 JSON 文件，建议先参考模板格式。': 'Currently only supports uploading JSON files, it is recommended to refer to the template format first.',
    下载模板: 'Download template',
    批量导入: 'Bulk Import',

    // 批量操作 导出记录
    选择导出格式: 'Select Export Format',
    'XLSX 表格': 'XLSX',
    'TXT 文本': 'TXT',
    导出文件: 'Export',

    // 批量操作 操作日志
    操作类型: 'Operation Type',
    操作内容: 'Operation Content',
    批量添加域名: 'Bulk Add Domain',
    添加解析记录: 'Bulk Add Records',
    操作日志详情: 'Operation Log Details',
    成功: 'success',
    失败: 'error'
}
