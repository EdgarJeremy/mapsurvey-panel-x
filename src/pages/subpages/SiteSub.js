import React from 'react';
import { Segment, Divider, Button, Icon, Card, Label, Modal, Form, Grid, Select } from 'semantic-ui-react';
import fileDownload from 'js-file-download';
import { Site } from '../../services/requests';
import swal from 'sweetalert';
import Wait from '../../components/Wait';

export default class SiteSub extends React.Component {

    state = {
        sites: [],

        addSiteName: '',
        popupAdd: false,
        addFields: [{ name: 'nama', type: 'string' }],

        editSiteName: '',
        popupEdit: false,
        editFields: [{ name: 'nama', type: 'string' }],
        editId: null,

        loading: false,
        loadingText: ''
    }

    componentDidMount() {
        this._fetchSites();
    }

    _onAddPopup() {
        this.setState({ popupAdd: true });
    }

    _fetchSites() {
        this._setLoading(true, 'Mengambil data site..');
        Site.index().then((res) => {
            this.setState({
                sites: res.data.rows
            });
            this._setLoading(false);
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _onChangeAddFieldName(e, i) {
        let { addFields } = this.state;
        addFields[i].name = e.target.value;
        this.setState({ addFields });
    }

    _onChangeAddFieldType(e, t, i) {
        let { addFields } = this.state;
        addFields[i].type = t.value;
        this.setState({ addFields });
    }

    _onChangeEditFieldName(e, i) {
        let { editFields } = this.state;
        editFields[i].name = e.target.value;
        this.setState({ editFields });
    }

    _onChangeEditFieldType(e, t, i) {
        let { editFields } = this.state;
        editFields[i].type = t.value;
        this.setState({ editFields });
    }

    _onSubmitAdd(e) {
        let data = {
            name: this.state.addSiteName,
            fields: {}
        };
        this.state.addFields.forEach((field) => {
            data.fields[field.name] = field.type;
        });
        this.setState({ popupAdd: false });
        this._setLoading(true, 'Mengirim data site..');
        Site.save(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._fetchSites.bind(this));
            } else {
                swal('Error', res.message, 'error').then(this._fetchSites.bind(this));
            }
            this.setState({
                popupAdd: false, addFields: [{ name: 'nama', type: 'string' }],
                addSiteName: '',
            });
        });
    }


    _onSubmitEdit(e) {
        let data = {
            name: this.state.editSiteName,
            fields: {}
        };
        this.state.editFields.forEach((field) => {
            data.fields[field.name] = field.type;
        });
        data.id = this.state.editId;
        this.setState({ popupEdit: false });
        this._setLoading(true, 'Mengupdate data site..');
        Site.edit(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._fetchSites.bind(this));
            } else {
                swal('Error', 'Data gagal disimpan', 'error').then(this._fetchSites.bind(this));
            }
            this.setState({
                popupEdit: false,
                editFields: [{ name: 'nama', type: 'string' }],
                editSiteName: ''
            });
        });
    }

    _onDeleteSite(id) {
        swal({
            title: "Anda yakin?",
            text: "Anda akan menghapus site ini",
            icon: "warning",
            buttons: [
                'Tidak',
                'Ya'
            ],
            dangerMode: true,
        }).then((isConfirm) => {
            if (isConfirm) {
                this._setLoading(true, 'Menghapus site..');
                Site.delete(id).then((res) => {
                    this._setLoading(false);
                    if (res.status) {
                        swal('Konfirmasi', 'Data berhasil dihapus', 'success').then(this._fetchSites.bind(this));
                    } else {
                        swal('Error', 'Data gagal disimpan', 'error').bind(this._fetchSites.bind(this));
                    }
                    this.setState({ popupAdd: false });
                });
            }
        });
    }

    _onExport(id) {
        this._setLoading(true, 'Membuat query..');
        Site.export(id).then((res) => {
            this._setLoading(false);
            if (res.status) {
                fileDownload(res.data.sql, `[${res.data.data.name}][MapSurvey Export] - ${new Date().toDateString()}.sql`);
            } else {
                swal('Error', res.message, 'error')
            }
        });
    }

    _onEditPopup(site) {
        let fields = [];
        Object.keys(site.fields).forEach((field, i) => {
            let data = {};
            data.name = field;
            data.type = site.fields[field];
            fields.push(data);
        });
        this.setState({ popupEdit: true, editSiteName: site.name, editFields: fields, editId: site.id });
    }

    render() {
        const { sites, popupAdd, addFields, popupEdit, editFields, loading, loadingText } = this.state;

        return (
            <div>
                {loading ? <Wait visible={true} text={loadingText} /> :
                    (
                        <div>
                            <Segment>
                                <Divider />
                                <h2>Manajemen Site</h2>
                                <Divider />
                                <Button animated='vertical' color="green" onClick={this._onAddPopup.bind(this)}>
                                    <Button.Content hidden>Tambah</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='plus' />
                                    </Button.Content>
                                </Button>
                                <Button animated='vertical' color="blue">
                                    <Button.Content hidden>List</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='list' />
                                    </Button.Content>
                                </Button>
                                <Divider />
                                <Card.Group>
                                    {(sites.map((site, i) => (
                                        <Card key={i}>
                                            <Card.Content>
                                                <Card.Header>{site.name}</Card.Header>
                                                <Card.Meta>Site</Card.Meta>
                                                <Card.Description>
                                                    {(Object.keys(site.fields).map((field, k) => {
                                                        return (
                                                            <div key={k}>
                                                                <Label ribbon as='a'><Icon color={site.fields[field] === "string" ? "yellow" : "green"} name={site.fields[field] === "string" ? "font" : "hashtag"} /> {field}</Label>
                                                            </div>
                                                        );
                                                    }))}
                                                </Card.Description>
                                            </Card.Content>
                                            <Card.Content extra>
                                                <div className='ui two buttons'>
                                                    <Button animated='vertical' color="green" basic onClick={() => this._onEditPopup(site)}>
                                                        <Button.Content visible>Edit</Button.Content>
                                                        <Button.Content hidden>
                                                            <Icon name='edit' />
                                                        </Button.Content>
                                                    </Button>
                                                    <Button animated='vertical' color="red" basic onClick={() => this._onDeleteSite(site.id)}>
                                                        <Button.Content visible>Hapus</Button.Content>
                                                        <Button.Content hidden>
                                                            <Icon name='trash' />
                                                        </Button.Content>
                                                    </Button>
                                                </div>
                                                <div className="ui divider" style={{
                                                    marginTop: 5,
                                                    marginBottom: 5
                                                }}></div>
                                                <div className="ui">
                                                    <Button animated='vertical' color="teal" fluid basic onClick={() => this._onExport(site.id)}>
                                                        <Button.Content visible>Export</Button.Content>
                                                        <Button.Content hidden>
                                                            <Icon name='download' />
                                                        </Button.Content>
                                                    </Button>
                                                </div>
                                            </Card.Content>
                                        </Card>
                                    )))}
                                </Card.Group>
                            </Segment>

                            <Modal open={popupAdd} onClose={() => this.setState({ popupAdd: false })} closeIcon>
                                <Modal.Header>Tambah Site Baru</Modal.Header>
                                <Modal.Content>
                                    <Form onSubmit={this._onSubmitAdd.bind(this)}>
                                        <Form.Field>
                                            <label>Nama Site</label>
                                            <input onChange={(e) => {
                                                this.setState({
                                                    addSiteName: e.target.value
                                                });
                                            }} value={this.state.addSiteName} placeholder='Nama' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Fields</label>
                                            <Grid columns={3} divided>
                                                {(addFields.map((field, i) => (
                                                    <Grid.Row key={i}>
                                                        <Grid.Column>
                                                            <input disabled={i === 0} required value={this.state.addFields[i].name} onChange={(e) => this._onChangeAddFieldName(e, i)} placeholder='Nama Field' />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Select disabled={i === 0} required value={this.state.addFields[i].type} onChange={(e, t) => this._onChangeAddFieldType(e, t, i)} fluid placeholder='Tipe Data' options={[
                                                                { key: 0, value: 'string', text: 'String' },
                                                                { key: 1, value: 'number', text: 'Number' }
                                                            ]} />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Button icon="times" fluid color="red" disabled={i === 0} onClick={() => {
                                                                let { addFields } = this.state;
                                                                addFields.splice(i, 1);
                                                                this.setState({ addFields });
                                                            }} />
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                )))}
                                            </Grid>
                                            <Divider />
                                            <Button color="teal" icon="plus" onClick={() => {
                                                let { addFields } = this.state;
                                                addFields.push({
                                                    name: '',
                                                    type: ''
                                                });
                                                this.setState({ addFields });
                                            }} />
                                        </Form.Field>
                                        <Button type='submit'>Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>

                            <Modal open={popupEdit} onClose={() => this.setState({ popupEdit: false })} closeIcon>
                                <Modal.Header>Edit Site</Modal.Header>
                                <Modal.Content>
                                    <Form onSubmit={this._onSubmitEdit.bind(this)}>
                                        <Form.Field>
                                            <label>Nama Site</label>
                                            <input onChange={(e) => {
                                                this.setState({
                                                    editSiteName: e.target.value
                                                });
                                            }} value={this.state.editSiteName} placeholder='Nama' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Fields</label>
                                            <Grid columns={3} divided>
                                                {(editFields.map((field, i) => (
                                                    <Grid.Row key={i}>
                                                        <Grid.Column>
                                                            <input disabled={i === 0} required value={this.state.editFields[i].name} onChange={(e) => this._onChangeEditFieldName(e, i)} placeholder='Nama Field' />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Select disabled={i === 0} required value={this.state.editFields[i].type} onChange={(e, t) => this._onChangeEditFieldType(e, t, i)} fluid placeholder='Tipe Data' options={[
                                                                { key: 0, value: 'string', text: 'String' },
                                                                { key: 1, value: 'number', text: 'Number' }
                                                            ]} />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Button icon="times" fluid color="red" disabled={i === 0} onClick={() => {
                                                                let { editFields } = this.state;
                                                                editFields.splice(i, 1);
                                                                this.setState({ editFields });
                                                            }} />
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                )))}
                                            </Grid>
                                            <Divider />
                                            <Button color="teal" icon="plus" onClick={() => {
                                                let { editFields } = this.state;
                                                editFields.push({
                                                    name: '',
                                                    type: ''
                                                });
                                                this.setState({ editFields });
                                            }} />
                                        </Form.Field>
                                        <Button type='submit'>Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>
                        </div>
                    )
                }
            </div>
        );
    }

}