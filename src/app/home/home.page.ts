import { Component } from '@angular/core'
import { Camera, CameraResultType } from '@capacitor/camera'
import { UtilityService } from 'src/services/utility/utility.service'
import { HttpClient } from '@angular/common/http'
import { finalize } from 'rxjs/operators'

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
    private http: HttpClient
  ) {}

  async takePicture(data: any) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    })

    this.on_upload_image = true

    const imageUrl: any = image.webPath

    const base64Data = await this.utility.readAsBase64(image)
    const fileName = new Date().getTime() + '.jpeg'

    data.src = imageUrl
    data.file = base64Data
    data.name = fileName

    this.output_image = imageUrl.toString()

    this.hitApi()
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
    const url = "http://localhost:8000/upload_image"
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
      this.on_upload_image = false
    })
  }

  async saveFile(){
    const a = document.createElement('a');
    a.href = this.output_image;
    a.download = 'remover_bg_output.png';
    document.body.appendChild(a);
    a.click();
  }


}
