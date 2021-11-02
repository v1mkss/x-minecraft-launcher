import { ServiceKey, ServiceTemplate, StatefulService } from './Service'
import { InstanceSave, InstanceSaveMetadata } from '../entities/save'

export interface ExportSaveOptions {
  /**
   * The instance directory path, e.g. the path of .minecraft folder.
   *
   * This will be the active instance by default.
   */
  instancePath?: string
  /**
   * The save folder name to export.
   */
  saveName: string
  /**
   * The destination full file path.
   */
  destination: string
  /**
   * Should export as zip
   * @default true
   */
  zip?: boolean
}
export interface ImportSaveOptions {
  /**
   * The source path of the zip or folder of the save to import
   */
  source: string
  /**
   * The destination instance directory path, e.g. the path of .minecraft folder.
   *
   * This will be the active instance by default.
   */
  instancePath?: string
  /**
   * The destination save folder name will be imported into.
   *
   * It will be the basename of the source file path if this is not present.
   */
  saveName?: string
}
export interface DeleteSaveOptions {
  /**
   * The save name will be deleted
   */
  saveName: string
  /**
   * The instance path of this save. If this is not presented, it will use selected instance.
   */
  instancePath?: string
}
export interface CloneSaveOptions {
  /**
   * The source instance path. If it is not presented, it will use selected instance.
   */
  srcInstancePath?: string
  /**
   * The destination instance path. If it is not presented, it will use selected instance.
   */
  destInstancePath?: string | string[]
  /**
   * The save name to clone
   */
  saveName: string
  /**
   * The new save name.
   * @default Generated name from the `saveName`
   */
  newSaveName?: string
}

export class SaveState {
  saves = [] as InstanceSaveMetadata[]
  instanceSaves(saves: InstanceSaveMetadata[]) {
    this.saves = saves
  }

  instanceSaveAdd(save: InstanceSaveMetadata) {
    this.saves.push(save)
  }

  instanceSaveRemove(save: string) {
    this.saves = this.saves.filter((s) => s.path !== save)
  }
}

/**
 * Provide the ability to preview saves data of an instance
 */
export interface InstanceSavesService extends StatefulService<SaveState> {
  /**
   * Read all registered instances' saves metadata
   */
  readAllInstancesSaves(): Promise<InstanceSave[]>
  /**
   * Return the instance's screenshots urls.
   *
   * If the provided path is not a instance, it will return empty array.
   */
  getScreenshotUrls(path?: string): Promise<string[]>
  /**
   * Mount and load instances saves
   * @param path
   */
  mountInstanceSaves(path: string): Promise<void>
  /**
   * Clone a save under an instance to one or multiple instances.
   *
   * @param options
   */
  cloneSave(options: CloneSaveOptions): Promise<void>
  /**
   * Delete a save in a specific instance.
   */
  deleteSave(options: DeleteSaveOptions): Promise<void>
  /**
   * Import a zip or folder save to the target instance.
   *
   * If the instancePath is not presented in the options, it will use the current selected instancePath.
   *
   * @returns The imported save path
   */
  importSave(options: ImportSaveOptions): Promise<string>
  /**
   * Export a save from a managed instance to an external location.
   *
   * You can choose export the save to zip or a folder.
   */
  exportSave(options: ExportSaveOptions): Promise<void>
}

export const InstanceSavesServiceKey: ServiceKey<InstanceSavesService> = 'InstanceSavesService'
export const InstanceSavesServiceMethods: ServiceTemplate<InstanceSavesService> = {
  readAllInstancesSaves: undefined,
  getScreenshotUrls: undefined,
  mountInstanceSaves: undefined,
  cloneSave: undefined,
  deleteSave: undefined,
  importSave: undefined,
  exportSave: undefined,
  state: undefined
}