import React from 'react';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react';
import { inspect } from '../services/utilities';
import { Public } from '../services/requests';
import Wait from '../components/Wait';

export default class Login extends React.Component {

    state = {
        loading: true,
        loadingText: 'Menghubungi server..',
        error: false
    }

    componentDidMount() {
        document.title = "Login ke MapSurvey";
        let { history } = this.props;
        this._setLoading(true, 'Mengecek session..');
        Public.check().then((res) => {
            if (res.status) {
                history.push('/panel');
            } else {
                this._setLoading(false);
            }
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _showError() {
        this.setState({ error: true });
    }

    _onLogin(e) {
        let data = inspect(e.target);
        let { history } = this.props;
        this._setLoading(true);
        Public.login(data).then((res) => {
            if (res.status) {
                history.push('/panel');
            } else {
                this._showError();
                this._setLoading(false);
            }
        });
    }

    render() {
        const { loading, loadingText, error } = this.state;

        return (
            <div>
                <Wait visible={loading} text={loadingText} />
                <div className='login-form'>
                    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                        <Grid.Column style={{ maxWidth: 450 }}>
                            <Header as='h2' color='blue' textAlign='center'>
                                MapSurvey Panel
                            </Header>
                            <Form size='large' onSubmit={this._onLogin.bind(this)}>
                                <Segment stacked>
                                    <Form.Input required name="username" fluid icon='user' iconPosition='left' placeholder='Username' />
                                    <Form.Input
                                        fluid
                                        name="password"
                                        icon='lock'
                                        iconPosition='left'
                                        placeholder='Password'
                                        type='password'
                                        required
                                    />
                                    <Button color='blue' fluid size='large'>
                                        Login
                            </Button>
                                </Segment>
                            </Form>
                            {(error) && (
                                <Message error>
                                    Login tidak valid
                                </Message>
                            )}
                            <Message>
                                Copyright &copy; {new Date().getFullYear()}
                            </Message>
                        </Grid.Column>
                    </Grid>
                </div>
            </div>
        )
    }

}