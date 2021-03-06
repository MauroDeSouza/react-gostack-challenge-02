import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import Container from '../../components/Container';
import { Form, SubmitButton, List, Delete } from './styles';

import api from '../../services/api';

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newRepo: '',
      repositories: [],
      loading: false,
      err: false,
      message: 'Adicionar repositório',
    };
  }

  componentDidMount() {
    const repositories = localStorage.getItem('repositoreis');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositoreis', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  deleteRepo = repo => {
    const { repositories } = this.state;
    this.setState({
      repositories: repositories.filter(r => r.name !== repo),
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    const { newRepo, repositories } = this.state;

    this.setState({ loading: true });

    const repoExit = repositories.find(({ name }) => name === newRepo);

    try {
      if (repoExit) throw new Error();

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      return this.setState({
        repositories: [data, ...repositories],
        newRepo: '',
        loading: false,
      });
    } catch (err) {
      this.setState(
        {
          err: true,
          newRepo: '',
          message: err.request
            ? 'Repositório não encontrado !'
            : 'Esse repositório já foi adicionado !',
        },
        () => {
          setTimeout(() => {
            this.setState({
              err: false,
              loading: false,
              message: 'Adicionar repositório',
            });
          }, 1300);
        }
      );
      return null;
    }
  };

  render() {
    const { newRepo, loading, repositories, err, message } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} err={err ? 1 : 0}>
          <input
            type="text"
            placeholder={message}
            value={newRepo}
            onChange={this.handleInputChange}
          />
          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(({ name }) => (
            <li key={name}>
              <span> {name} </span>
              <div>
                <Link to={`/repository/${encodeURIComponent(name)}`}>
                  Detalhes
                </Link>
                <Delete onClick={() => this.deleteRepo(name)} />
              </div>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
