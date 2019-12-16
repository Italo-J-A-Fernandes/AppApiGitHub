import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  TextMsgRepo,
  ContMsg,
  ContLoadingRepo,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTapys = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 2,
    loading: false,
    loadingRepo: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({
      stars: response.data,
      loading: false,
    });
  }

  loadMore = async () => {
    const { loadingRepo, stars } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    if (loadingRepo) return;

    const { page } = this.state;

    this.setState({ loadingRepo: true });

    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({
      stars: [...stars, ...response.data],
      page: page + 1,
      loadingRepo: false,
    });
  };

  renderFooter = () => {
    const { loadingRepo } = this.state;
    if (!loadingRepo) return null;
    return (
      <ContLoadingRepo>
        <ActivityIndicator color="#000" />
      </ContLoadingRepo>
    );
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('StarRepo', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ContMsg>
            <TextMsgRepo>Repositorios Favoritos</TextMsgRepo>
            <ActivityIndicator color="#000" />
          </ContMsg>
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReached={this.loadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={this.renderFooter}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
