import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getHouses, patchHome } from '../api/houses-api'
import Auth from '../auth/Auth'
import { Home } from '../types/Home'

interface HomesProps {
  auth: Auth
  history: History
}

interface HomesState {
  homes: Home[]
  newHomeName: string
  loadingHomes: boolean
}

export class Homes extends React.PureComponent<HomesProps, HomesState> {
  state: HomesState = {
    homes: [],
    newHomeName: '',
    loadingHomes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newHomeName: event.target.value })
  }

  onEditButtonClick = (homeId: string) => {
    this.props.history.push(`/homes/${homeId}/edit`)
  }

  onHomeCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newHomeName,
        description: dueDate
      })
      this.setState({
        homes: [...this.state.homes, newTodo],
        newHomeName: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onHomeDelete = async (homeId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), homeId)
      this.setState({
        homes: this.state.homes.filter(home => home.homeId != homeId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getHouses(this.props.auth.getIdToken())
      this.setState({
        homes: todos,
        loadingHomes: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Home Finder</Header>

        {this.renderCreateHomeInput()}

        {this.renderHomes()}
      </div>
    )
  }

  renderCreateHomeInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Home',
              onClick: this.onHomeCreate
            }}
            fluid
            actionPosition="left"
            placeholder="A House, a dream..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderHomes() {
    if (this.state.loadingHomes) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.homes.map((home, pos) => {
          return (
            <Grid.Row key={home.homeId}>
              <Grid.Column width={1} verticalAlign="middle">

              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {home.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {home.createdAt}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(home.homeId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onHomeDelete(home.homeId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {home.previewImage && (
                <Image src={home.previewImage} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
