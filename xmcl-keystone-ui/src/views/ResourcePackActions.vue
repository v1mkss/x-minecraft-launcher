<template>
  <div class="flex items-center justify-end gap-3">
    <v-btn
      v-shared-tooltip="_ => 'Alt'"
      icon
      large
      :class="{ 'v-btn--active': isEnabledState }"
      @click="isEnabledState = !isEnabledState"
    >
      <v-icon>translate</v-icon>
    </v-btn>
    <v-btn
      v-shared-tooltip="() => isInstanceLinked ? t('resourcepack.shared') : t('resourcepack.independent')"
      icon
      :loading="loading"
      large
      @click="onLinkClicked"
    >
      <v-icon>{{ isInstanceLinked ? 'account_tree' : 'looks_one' }}</v-icon>
    </v-btn>
    <v-btn
      v-shared-tooltip="() => t('resourcepack.showDirectory')"
      icon
      large
      @click="showDirectory(path)"
    >
      <v-icon>folder</v-icon>
    </v-btn>
  </div>
</template>
<script lang="ts" setup>
import { useService } from '@/composables'
import { kInstance } from '@/composables/instance'
import { kLocalizedContent } from '@/composables/localizedContent'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { injection } from '@/util/inject'
import { InstanceResourcePacksServiceKey } from '@xmcl/runtime-api'
import useSWRV from 'swrv'

const { showDirectory, link, unlink, isLinked } = useService(InstanceResourcePacksServiceKey)
const { path } = injection(kInstance)

const { isEnabledState } = injection(kLocalizedContent)

const { data: isInstanceLinked, isValidating, mutate } = useSWRV(computed(() => path.value), isLinked)
const linking = ref(false)
const loading = computed(() => linking.value || isValidating.value)
const onLinkClicked = async () => {
  linking.value = true
  const instPath = path.value
  if (isInstanceLinked.value) {
    unlink(instPath).finally(() => {
      linking.value = false
      mutate()
    })
  } else {
    await link(instPath, true).finally(() => {
      linking.value = false
      mutate()
    })
  }
}

const { t } = useI18n()
</script>
