import { Component } from '@angular/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { UtilityService } from 'src/services/utility/utility.service'
import { HttpClient } from '@angular/common/http'
import { finalize } from 'rxjs/operators'
import { Platform, ActionSheetController } from '@ionic/angular'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  image_to_remove_bg = {
    src: '',
    file: '',
    name: '',
    title: 'Upload Profile Picture',
    type: 'profile'
  }

  output_image = ''
  base_64_image = ''
  on_upload_image = false

  constructor(
    public utility: UtilityService,
    private http: HttpClient,
    private plt: Platform,
    private actionSheetCtrl: ActionSheetController 
  ) {}

  getImageAction(data: any){
    if(this.plt.is('android') || this.plt.is('ios')){
      this.presentActionSheet(data)
    }else{
      this.takePicture(data)
    }
  }

  async takePicture(data: any, source: CameraSource = CameraSource.Photos) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source
    })

    const base64Data = await this.utility.readAsBase64(image)

    const base64Length = base64Data.length
    const imageSizeInBytes = (base64Length * 3) / 4
    const imageSizeInKB = imageSizeInBytes / 1024
    
    if(Number(imageSizeInKB.toFixed(2)) > 2048){
      this.utility.showToast('top', 'image size must be less than or equal to 2MB')
      this.resetImageData()
    }else{  
      this.on_upload_image = true
      const imageUrl: any = image.webPath
  
      const fileName = new Date().getTime() + '.jpeg'
  
      data.src = imageUrl
      data.file = base64Data
      data.name = fileName
  
      this.output_image = imageUrl.toString()
  
      this.hitApi()
    }
  }

  async hitApi(){
    if(this.image_to_remove_bg.src){
      let response = null
      let blob = null
      const formData = new FormData()

      response = await fetch(this.image_to_remove_bg.file)
      blob = await response.blob()
      formData.append('file', blob, this.image_to_remove_bg.name)
      this.uploadData(formData)
    }
  }

  async uploadData(formData: FormData) {
    const url = "https://srv740783.hstgr.cloud:8300/upload-image"
    this.http.post(url, formData)
    .pipe(
        finalize(() => {
          
        })
    ).subscribe((res : any) => {
      if (res['status'] == 200) {
        this.on_upload_image = false
        this.output_image = 'data:image/png;base64, '+res.data
        this.base_64_image = res.data.toString();
      } 
    }, err => {
      this.utility.showToast('top', err ? err.statusText.toLowerCase() : 'internal server error')
      this.on_upload_image = false
      this.resetImageData()
    })
  }

  async presentActionSheet(data: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Actions',
      mode: 'ios',
      buttons: [
        {
          text: 'Take a Picture',
          handler: () => {
            this.takePicture(data, CameraSource.Camera);
          }
        },
        {
          text: 'Select From File',
          handler: () => {
            this.takePicture(data);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  resetImageData(){
    this.image_to_remove_bg = {
      src: '',
      file: '',
      name: '',
      title: 'Upload Profile Picture',
      type: 'profile'
    }
    this.output_image = ''
    this.base_64_image = ''
  }


  async saveFile(){
    const a = document.createElement('a');
    a.href = this.output_image;
    a.download = 'remover_bg_output.png';
    document.body.appendChild(a);
    a.click();
  }


}
