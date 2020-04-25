import * as React from 'react'
import { Form, Button, Image } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getHouse, getHouses, getUploadUrl, uploadFile } from '../api/houses-api'
import { Home } from '../types/Home'
import { Photo } from '../types/Photo'
import { getPhotos } from '../api/photos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditHomeProps {
  match: {
    params: {
      homeId: string
    }
  }
  auth: Auth
}

interface EditHomeState {
  home?: Home
  photos?: Photo[]
  file: any
  uploadState: UploadState
}

export class EditHome extends React.PureComponent<EditHomeProps, EditHomeState> {

  state: EditHomeState = {
    home: undefined,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  async componentDidMount() {
    try {
      let home = await this.getHouseDetails()
      let photos = await this.getHousePhotos()

      console.log('Homes:', home)
      console.log('Photos:', photos)
    } catch (e) {
      alert(`Failed to fetch home: ${e.message}`)
    }
  }

  async getHouseDetails(): Promise<Home> {
    const actualHome = await getHouse(this.props.match.params.homeId, this.props.auth.getIdToken())
    this.setState({
      home: actualHome,
      file: this.state.file,
      uploadState: UploadState.NoUpload
    })
    return actualHome
  }

  async getHousePhotos(): Promise<Photo[]> {
    const photos = await getPhotos(this.props.match.params.homeId, this.props.auth.getIdToken())
    console.log(photos)
    console.log(photos[0])
    this.setState({
      home: this.state.home,
      file: this.state.file,
      photos: photos,
      uploadState: UploadState.NoUpload
    })
    return photos
  }


  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    console.log('Render')

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.homeId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    if (this.state.home == undefined) {
      return (<h2>"Loading"</h2>)
    }
    return (
      <div>

        <h1> {this.state.home!.name} </h1>
        <h2> {this.state.home!.description} </h2>

        <h1>Gallery</h1>
        {this.renderGallery()}
        <h1>Upload new image</h1>


        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderGallery() {
    if (!this.state.photos){
      return (<div>Loading Gallery</div>)
    }
    const photos =  this.state.photos.map((photo: Photo) => {
      return (<li key={photo.photoId}><Image src={photo.url} size="small" wrapped /></li>)
    })
    return (<ul>{photos}</ul>)
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
