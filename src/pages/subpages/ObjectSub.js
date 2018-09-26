import React from 'react';
import { Segment, Divider, Button, Icon, Card, Label, Modal, Form, Grid, Select } from 'semantic-ui-react';
import { Objects } from '../../services/requests';
import swal from 'sweetalert';

export default class ObjectSub extends React.Component {

    state = {
        objects: [],

        addObjectName: '',
        popupAdd: false,
        addFields: [{ name: 'nama', type: 'string' }],

        editObjectName: '',
        popupEdit: false,
        editFields: [{ name: 'nama', type: 'string' }],
        editId: null
    }

    componentDidMount() {
        this._fetchObjects();
    }

    _onAddPopup() {
        this.setState({ popupAdd: true });
    }

    _fetchObjects() {
        this._setLoading(true, 'Mengambil data objek..');
        Objects.index().then((res) => {
            this.setState({
                objects: res.data.rows
            });
            this._setLoading(false);
        });
    }

    _setLoading(loading, loadingText) {
        this.props.setLoading(loading, loadingText);
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
            type: this.state.addObjectName,
            fields: {}
        };
        this.state.addFields.forEach((field) => {
            data.fields[field.name] = field.type;
        });
        this.setState({ popupAdd: false });
        this._setLoading(true, 'Mengirim data objek..');
        Objects.save(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._fetchObjects.bind(this));
            } else {
                swal('Error', 'Data gagal disimpan', 'error').then(this._fetchObjects.bind(this));
            }
            this.setState({
                popupAdd: false, addFields: [{ name: 'nama', type: 'string' }],
                addObjectName: '',
            });
        });
    }

    
    _onSubmitEdit(e) {
        let data = {
            type: this.state.editObjectName,
            fields: {}
        };
        this.state.editFields.forEach((field) => {
            data.fields[field.name] = field.type;
        });
        data.id = this.state.editId;
        this.setState({ popupEdit: false });
        this._setLoading(true, 'Menupdate data objek..');
        Objects.edit(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._fetchObjects.bind(this));
            } else {
                swal('Error', 'Data gagal disimpan', 'error').then(this._fetchObjects.bind(this));
            }
            this.setState({
                popupEdit: false, 
                editFields: [{ name: 'nama', type: 'string' }],
                editObjectName: ''
            });
        });
    }

    _onDeleteObject(id) {
        swal({
            title: "Anda yakin?",
            text: "Anda akan menghapus objek ini",
            icon: "warning",
            buttons: [
                'Tidak',
                'Ya'
            ],
            dangerMode: true,
        }).then((isConfirm) => {
            if (isConfirm) {
                this._setLoading(true, 'Menghapus objek..');
                Objects.delete(id).then((res) => {
                    this._setLoading(false);
                    if (res.status) {
                        swal('Konfirmasi', 'Data berhasil dihapus', 'success').then(this._fetchObjects.bind(this));
                    } else {
                        swal('Error', 'Data gagal disimpan', 'error').bind(this._fetchObjects.bind(this));
                    }
                    this.setState({ popupAdd: false });
                });
            }
        });
    }

    _onEditPopup(object) {
        let fields = [];
        Object.keys(object.fields).forEach((field, i) => {
            let data = {};
            data.name = field;
            data.type = object.fields[field];
            fields.push(data);
        });
        this.setState({ popupEdit: true, editObjectName: object.type, editFields: fields, editId: object.id });
    }

    render() {
        const { objects, popupAdd, addFields, popupEdit, editFields } = this.state;

        return (
            <div>
                <Segment>
                    <Divider />
                    <h2>Manajemen Objek</h2>
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
                        {(objects.map((object, i) => (
                            <Card key={i}>
                                <Card.Content>
                                    <Card.Header>{object.type}</Card.Header>
                                    <Card.Meta>Objek</Card.Meta>
                                    <Card.Description>
                                        {(Object.keys(object.fields).map((field, k) => {
                                            return (
                                                <Label key={k} as='a'>{field} </Label>
                                            );
                                        }))}
                                    </Card.Description>
                                </Card.Content>
                                <Card.Content extra>
                                    <div className='ui two buttons'>
                                        <Button animated='vertical' color="green" basic onClick={() => this._onEditPopup(object)}>
                                            <Button.Content visible>Edit</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='edit' />
                                            </Button.Content>
                                        </Button>
                                        <Button animated='vertical' color="red" basic onClick={() => this._onDeleteObject(object.id)}>
                                            <Button.Content visible>Hapus</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='trash' />
                                            </Button.Content>
                                        </Button>
                                    </div>
                                </Card.Content>
                            </Card>
                        )))}
                    </Card.Group>
                </Segment>
                {/* Add Popup */}
                <Modal open={popupAdd} onClose={() => this.setState({ popupAdd: false })} closeIcon>
                    <Modal.Header>Tambah Objek Baru</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this._onSubmitAdd.bind(this)}>
                            <Form.Field>
                                <label>Nama Objek</label>
                                <input onChange={(e) => {
                                    this.setState({
                                        addObjectName: e.target.value
                                    });
                                }} value={this.state.addObjectName} placeholder='Nama' />
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
                {/* Edit Popup */}
                <Modal open={popupEdit} onClose={() => this.setState({ popupEdit: false })} closeIcon>
                    <Modal.Header>Edit Objek {this.state.editObjectName}</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this._onSubmitEdit.bind(this)}>
                            <Form.Field>
                                <label>Nama Objek</label>
                                <input onChange={(e) => {
                                    this.setState({
                                        editObjectName: e.target.value
                                    });
                                }} value={this.state.editObjectName} placeholder='Nama' />
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
        );
    }

}