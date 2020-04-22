import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getHouse, getHouses, getUploadUrl, uploadFile } from '../api/houses-api'
import { Home } from '../types/Home'

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
  file: any
  uploadState: UploadState
}

export class EditHome extends React.PureComponent<EditHomeProps,EditHomeState> {

  state: EditHomeState = {
    home: undefined,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  async componentDidMount() {
    try {
      const actualHome = await getHouse(this.props.match.params.homeId, this.props.auth.getIdToken())
      this.setState({
        home: actualHome,
        file: undefined,
        uploadState: UploadState.NoUpload
      })
    } catch (e) {
      alert(`Failed to fetch home: ${e.message}`)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

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
    return (
      <div>
        {this.state.home != undefined &&
        <h2>this.state.home!.name - this.state.home!.description</h2>
        }
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
