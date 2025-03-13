import { Injectable } from '@angular/core'
import { Platform, ToastController } from '@ionic/angular'
import { Filesystem } from '@capacitor/filesystem'

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  public toasts: Array<any> = [];
  public toastMsgs: Array<string> = [];

  constructor(
    private plt: Platform,
    private toastCtrl: ToastController
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

  public async showToast(position: any, msg: string) {
    let message = ''
    try {
      const newMsg = msg
      if(newMsg) {
        message = newMsg
      } else {
        message = msg
      }
    } catch(error) {
      message = msg
    }

    const toastDuration = 3000
    const toast = await this.toastCtrl.create({
        message: message,
        duration: toastDuration,
        position: position
    })
    this.toasts.push(toast)
    this.toastMsgs.push(message)
    if(this.toasts.length == 1){
      toast.present()
    } else {
      toast.present()
    }
    toast.onDidDismiss().then(() => {
      this.toasts.shift()
      this.toastMsgs.shift()
    })
  }


}
