<script lang="ts" setup>
import { useService } from '@/composables'
import { useLocalStorageCacheBool } from '@/composables/cache'
import { getCurseforgeProjectFilesModel, getCurseforgeProjectModel } from '@/composables/curseforge'
import { getCurseforgeChangelogModel } from '@/composables/curseforgeChangelog'
import { useDateString } from '@/composables/date'
import { useDialog } from '@/composables/dialog'
import { kInstance } from '@/composables/instance'
import { AddInstanceDialogKey } from '@/composables/instanceTemplates'
import { InstanceInstallDialog } from '@/composables/instanceUpdate'
import { useSWRVModel } from '@/composables/swrv'
import { kSWRVConfig } from '@/composables/swrvConfig'
import { getCurseforgeFileGameVersions, getCursforgeFileModLoaders } from '@/util/curseforge'
import { injection } from '@/util/inject'
import { getExpectedSize } from '@/util/size'
import { getSWRV } from '@/util/swrvGet'
import { CurseforgeUpstream, ModpackServiceKey } from '@xmcl/runtime-api'
import HomeUpstreamBase from './HomeUpstreamBase.vue'
import { UpstreamHeaderProps } from './HomeUpstreamHeader.vue'
import { ProjectVersionProps } from './HomeUpstreamVersion.vue'

const props = defineProps<{
  id: number
}>()

const { instance } = injection(kInstance)
const upstream = computed(() => instance.value?.upstream as CurseforgeUpstream)

const { t, te } = useI18n()
const { data: project } = useSWRVModel(getCurseforgeProjectModel(computed(() => props.id)))
const { getDateString } = useDateString()
const headerData = computed(() => {
  if (!project.value) return undefined
  const result: UpstreamHeaderProps = {
    url: project.value.links.websiteUrl,
    icon: project.value.logo.url || '',
    title: project.value.name || '',
    description: project.value?.summary || '',
    categories: project.value.categories.map((c) => {
      return {
        text: te(`curseforgeCategory.${c?.name}`) ? t(`curseforgeCategory.${c?.name}`) : c.name || '',
        icon: c.iconUrl || '',
        id: c.id.toString(),
      }
    }),
    type: 'curseforge',
    store: '/store/curseforge/' + project.value.id,
    infos: [{
      icon: 'file_download',
      name: t('modrinth.downloads'),
      value: getExpectedSize(project.value.downloadCount, ''),
    }, {
      icon: 'star_rate',
      name: t('modrinth.followers'),
      value: project.value.thumbsUpCount,
    }, {
      icon: 'event',
      name: t('modrinth.createAt'),
      value: getDateString(project.value.dateCreated, { dateStyle: 'long' }),
    }, {
      icon: 'update',
      name: t('modrinth.updateAt'),
      value: getDateString(project.value.dateModified, { dateStyle: 'long' }),
    }],
  }

  return result
})
const { data: files, isValidating: loadingFiles } = useSWRVModel(getCurseforgeProjectFilesModel(computed(() => props.id), ref(undefined), ref(undefined)))
const currentVersion = computed(() => {
  const val = upstream.value
  if (!val || val.type !== 'curseforge-modpack') return undefined
  const ver = files.value?.data?.find(v => v.id === val?.fileId)
  if (!ver) return undefined
  const result: ProjectVersionProps = reactive({
    id: ver.id.toString(),
    name: ver.displayName,
    versionType: ver.releaseType === 1 ? 'release' : ver.releaseType === 2 ? 'beta' : 'alpha',
    versionNumber: ver.fileName,
    loaders: getCursforgeFileModLoaders(ver),
    gameVersions: getCurseforgeFileGameVersions(ver),
    datePublished: (ver.fileDate),
    downloads: ver.downloadCount,
    changelog: '',
  })
  return result
})
const limit = ref(10)
const onlyCurrentVersion = useLocalStorageCacheBool(computed(() => `instanceUpstreamOnlyShowCurrentVersion/${instance.value.path}`), false)
const items = computed(() => {
  const result = {} as Record<string, ProjectVersionProps[]>

  let all = files.value?.data || []
  if (onlyCurrentVersion.value) {
    all = all.filter(d => d.gameVersions.includes(instance.value.runtime.minecraft))
  }
  for (const d of all.slice(0, limit.value)) {
    if (currentVersion.value?.id === d.id.toString()) continue
    const date = getDateString(d.fileDate, { dateStyle: 'long' })
    if (!result[date]) {
      result[date] = []
    }
    result[date].push(markRaw({
      id: d.id.toString(),
      name: d.displayName,
      versionType: d?.releaseType === 1 ? 'release' : d?.releaseType === 2 ? 'beta' : 'alpha',
      versionNumber: d.fileName,
      loaders: getCursforgeFileModLoaders(d),
      gameVersions: getCurseforgeFileGameVersions(d),
      datePublished: (d.fileDate),
      downloads: d.downloadCount,
      changelog: '',
    }))
  }

  return result
})

const state = inject('scroll', {
  bottom: false,
})

watch(computed(() => state.bottom), (reached) => {
  if (reached) {
    limit.value += 10
  }
})

const { show } = useDialog(InstanceInstallDialog)
const { installModapckFromMarket } = useService(ModpackServiceKey)
const updating = ref(false)
async function onUpdate(v: ProjectVersionProps) {
  updating.value = true

  try {
    const instancePath = instance.value.path
    const [modpack] = await installModapckFromMarket({
      market: 1,
      file: { fileId: Number(v.id), icon: project.value?.logo.url || '' },
    })
    show({
      type: 'upstream',
      modpack,
      instancePath,
      upstream: {
        type: 'curseforge-modpack',
        modId: Number(props.id),
        fileId: Number(v.id),
      }
    })
  } finally {
    updating.value = false
  }
}

const { show: showAddInstanceDialog } = useDialog(AddInstanceDialogKey)
const duplicating = ref(false)
const onDuplicate = async (v: ProjectVersionProps) => {
  duplicating.value = true
  try {
    const [modpack] = await installModapckFromMarket({
      market: 1,
      file: { fileId: Number(v.id), icon: project.value?.logo.url || '' },
    })
    showAddInstanceDialog({ type: 'modpack', path: modpack })
  } finally {
    duplicating.value = false
  }
}

const config = inject(kSWRVConfig)
const loadChangelog = async (v: ProjectVersionProps) => {
  const changelog = await getSWRV(getCurseforgeChangelogModel(ref(props.id), ref(Number(v.id))), { ...config, dedupingInterval: Infinity }).catch(() => '')
  if (changelog) {
    v.changelog = changelog
  }
}

</script>
<template>
  <HomeUpstreamBase
    :items="items"
    :current-version="currentVersion"
    :header="headerData"
    :duplicating="duplicating"
    :only-current-version.sync="onlyCurrentVersion"
    :updating="updating"
    :loading="loadingFiles"
    @duplicate="onDuplicate"
    @update="onUpdate"
    @changelog="loadChangelog"
  />
</template>
