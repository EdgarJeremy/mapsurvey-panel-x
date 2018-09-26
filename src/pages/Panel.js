import React from 'react';
import { Container, Segment, Menu, Icon, Button } from 'semantic-ui-react';
import { Link, Switch, Route } from 'react-router-dom';

import ObjectSub from './subpages/ObjectSub';
import { Public } from '../services/requests';
import Wait from '../components/Wait';
import UserSub from './subpages/UserSub';
import SurveyorSub from './subpages/SurveyorSub';
import RentSub from './subpages/RentSub';

export default class Panel extends React.Component {

    state = {
        loading: true,
        loadingText: 'Mengecek session..',
        user: null
    }

    componentDidMount() {
        document.title = "Panel MapSurvey";
        let { history } = this.props;
        Public.check().then((res) => {
            if (!res.status) {
                history.push('/');
            } else {
                this.setState({
                    user: res.data
                });
                this._setLoading(false);
            }
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _onLogout() {
        let { history } = this.props;
        this._setLoading(true, 'Menghubungi server..');
        Public.logout().then(() => {
            this._setLoading(false);
            history.push('/');
        });
    }

    _currentRoute() {
        let path = this.props.location.pathname;
        let thispath = this.props.match.path;
        return path.replace(thispath, '');
    }

    render() {
        const { loading, loadingText } = this.state;
        this._currentRoute();
        return (
            <div className="container-panel">
                <Wait visible={loading} text={loadingText} />
                <Container>
                    {/* Header */}
                    <Segment color="black" style={{ borderRadius: 0, borderBottomColor: '#ecf0f1', borderBottomWidth: 1, borderBottomStyle: 'solid' }} inverted>
                        <h1 style={{ textAlign: 'center', fontWeight: 'lighter' }}>MapSurvey Panel</h1>
                    </Segment>
                    {/* Menu */}
                    <Menu style={{ borderRadius: 0 }} pointing inverted>
                        <Menu.Item content={(<Link to={`${this.props.match.path}/`}>Objek</Link>)} active={this._currentRoute() === '/' || this._currentRoute() === ''} />
                        <Menu.Item content={(<Link to={`${this.props.match.path}/rents`}>Sewaan</Link>)} active={this._currentRoute() === '/rents'} />
                        <Menu.Item content={(<Link to={`${this.props.match.path}/users`}>Pengguna</Link>)} active={this._currentRoute() === '/users'} />
                        <Menu.Item content={(<Link to={`${this.props.match.path}/surveyors`}>Surveyor</Link>)} active={this._currentRoute() === '/surveyors'} />
                        <Menu.Menu position="right">
                            <Menu.Item>
                                <Button animated color="red" onClick={this._onLogout.bind(this)}>
                                    <Button.Content visible>Keluar</Button.Content>
                                    <Button.Content hidden>
                                        <Icon name="sign out" />
                                    </Button.Content>
                                </Button>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                    {/* Content */}
                    <Switch>
                        <Route exact path={`${this.props.match.path}/`} render={(props) => <ObjectSub {...props} me={this.state.user} setLoading={this._setLoading.bind(this)} socket={this.props.socket} />} />
                        <Route path={`${this.props.match.path}/rents`} render={(props) => <RentSub {...props} me={this.state.user} setLoading={this._setLoading.bind(this)} socket={this.props.socket} />} />
                        <Route path={`${this.props.match.path}/users`} render={(props) => <UserSub {...props} me={this.state.user} setLoading={this._setLoading.bind(this)} socket={this.props.socket} />} />
                        <Route path={`${this.props.match.path}/surveyors`} render={(props) => <SurveyorSub {...props} me={this.state.user} setLoading={this._setLoading.bind(this)} socket={this.props.socket} />} />
                    </Switch>
                </Container>
            </div>
        );
    }

}