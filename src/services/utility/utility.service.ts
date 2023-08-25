import { Injectable } from '@angular/core'
import { Platform } from '@ionic/angular'
import { Filesystem } from '@capacitor/filesystem'

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private plt: Platform
  ) { }

  async readAsBase64(photo: any) {
    if (this.plt.is('hybrid')) {
        const file = await Filesystem.readFile({
            path: photo.path
        })
        return 'data:image/jpeg;base64,' + file.data
    }
    else {
        const response = await fetch(photo.webPath)
        const blob = await response.blob()

        return await this.convertBlobToBase64(blob) as string
    }
  }


  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader
    reader.onerror = reject
    reader.onload = () => {
        resolve(reader.result)
    }
    reader.readAsDataURL(blob)
  })
}
