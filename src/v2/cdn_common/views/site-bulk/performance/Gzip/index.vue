<template>
  <ul class="space-y-10">
    <li>
      <ants-switch
        v-model="form.gzip"
        active-text="ON"
        inactive-text="OFF"
        active-value="1"
        inactive-value="0"
      />
    </li>
    <li>
      <TitleBorder class="mb-df">
        {{ antsT('压缩级别') }}
        <span class="ml-xs mr-xl text-sm text-ants-text-4">
          {{ antsT('数字越大压缩的越好，也越占用CPU时间') }}
        </span>
      </TitleBorder>
      <ants-input-number
        v-model="form.gzip_comp_level"
        :precision="0"
        :step="1"
        :min="1"
        :max="9"
        size="small"
        class="mr-sm"
      />（1 ~ 9）
    </li>

    <li>
      <TitleBorder class="mb-df">
        {{ antsT('压缩的最小文件大小') }}
        <span class="ml-xs mr-xl text-sm text-ants-text-4">
          {{ antsT('小于设置值的文件将不会压缩') }}
        </span>
      </TitleBorder>
      <div class="flex items-center">
        <ants-input-number
          v-model="form.gzip_min_length"
          :precision="0"
          :step="1"
          :min="1"
          placeholder="压缩的最小文件大小"
          size="small"
          class="mr-sm"
        />
        <ants-select
          v-model="form.gzip_unit"
          placeholder="单位"
          style="width: 80px;"
          size="small"
        >
          <ants-option label="MB" value="m" />
          <ants-option label="KB" value="k" />
          <ants-option label="B" value=" " />
        </ants-select>
      </div>
    </li>

    <li>
      <TitleBorder class="mb-df">{{ antsT('压缩文件类型') }}</TitleBorder>
      <ants-checkbox-group v-model="form.gzip_types">
        <ants-checkbox
          v-for="(item, key) in {
            JS: 'application/javascript',
            CSS: 'text/css',
            HTML: 'text/html'
          }"
          :key="key"
          :label="item"
          :text="key"
        />
      </ants-checkbox-group>
    </li>

    <li>
      <TitleBorder class="mb-df">{{
        antsT('是否在http header中添加 Vary: Accept-Encoding')
      }}</TitleBorder>

      <ants-checkbox
        v-model="form.gzip_vary"
        true-label="1"
        false-label="0"
        text="建议开启"
      />
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      form: {
        // [bool] 开关,
        gzip: '0',
        // [int] 压缩级别，1-9，数字越大压缩的越好，也越占用CPU时间
        gzip_comp_level: 1,
        // [text] 压缩的最小文件，小于设置值的文件将不会压缩，值加单位
        gzip_min_length: '',
        gzip_unit: 'k',
        // [l_text] 进行压缩的文件类型, 传字符串
        gzip_types: [],
        // [bool] 否在http header中添加Vary: Accept-Encoding，建议开启
        gzip_vary: '0'
      }
    }
  },
  methods: {
    // 提交数据
    submit() {
      return {
        gzip: this.form.gzip,
        gzip_comp_level: this.form.gzip_comp_level,
        gzip_min_length: this.form.gzip_min_length + this.form.gzip_unit,
        gzip_vary: this.form.gzip_vary,
        gzip_types: this.form.gzip_types + ''
      }
    }
  }
}
</script>
