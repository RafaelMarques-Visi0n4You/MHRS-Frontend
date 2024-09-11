import './PaginasBlog.css';
import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import { notification, Button, Modal, Table, FloatButton, Input, DatePicker } from 'antd';
import { FaPlus } from "react-icons/fa";
import AuthService from '../../auth.service';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MdOutlineFileUpload } from 'react-icons/md';

export default function MinhasPublicacoes() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const navigate = useNavigate();
    const [isVisitaModalOpen, setIsVisitaModalOpen] = useState(false);
    const [descricao, setDescricao] = useState('');
    const [user, setUser] = useState({});
    const [visita, setVisita] = useState([]);
    const [dataVisita, setDataVisita] = useState('');
    const [localVisita, setLocalVisita] = useState('');
    const [duracaoVisita, setDuracaoVisita] = useState('');
    const [motivoVisita, setMotivoVisita] = useState('');
    const [minhasPublicacoes, setMinhasPublicacoes] = useState([]);


    const [todasPublicacoes, setTodasPublicacoes] = useState([]);
    const [isModalPublicacaoIndividual, setIsModalPublicacaoIndividual] = useState(false);
    const [selectedPublicacao, setSelectedPublicacao] = useState(null);
    const [isModalReenviarPublicacao, setIsModalReenviarPublicacao] = useState(false);
    const [tipoPublicacao, setTipoPublicacao] = useState('');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [imagemSelecionada, setImagemSelecionada] = useState('');

    const columns = tipo_user === "administrador" ? [

        {
            title: 'Título', dataIndex: 'titulo_publicacao', key: 'titulo_publicacao',

        },
        { title: 'Autor', dataIndex: 'autor', key: 'autor' },
        {
            title: 'Tipo', dataIndex: 'tipo_publicacao', key: 'tipo_publicacao', filters: [
                { text: 'Notícia', value: 'Notícia' },
                { text: 'Visita', value: 'Visita' },
            ],
            onFilter: (value, record) => {
                return record.tipo_publicacao.trim() === value;
            }
            ,
            sorter: (a, b) => a.tipo_publicacao.localeCompare(b.tipo_publicacao),

        },
        {
            title: 'Estado', dataIndex: 'estado', key: 'estado', filters: [
                { text: 'Publicada', value: 'Publicada' },
                { text: 'Não Publicada', value: 'Não Publicada' },
                { text: 'Rejeitada', value: 'Rejeitada' },
                { text: 'Em avaliação', value: 'Em avaliação' },
            ],
            onFilter: (value, record) => {
                return record.estado.trim() === value;
            }
            ,
            sorter: (a, b) => a.estado.localeCompare(b.estado),
        },
    ] : [{
        title: 'Título', dataIndex: 'titulo_publicacao', key: 'titulo_publicacao',

    },
    {
        title: 'Tipo', dataIndex: 'tipo_publicacao', key: 'tipo_publicacao', filters: [
            { text: 'Notícia', value: 'Notícia' },
            { text: 'Visita', value: 'Visita' },
        ],
        onFilter: (value, record) => {
            return record.tipo_publicacao.trim() === value;
        }
        ,
        sorter: (a, b) => a.tipo_publicacao.localeCompare(b.tipo_publicacao),

    },
    {
        title: 'Estado', dataIndex: 'estado', key: 'estado', filters: [
            { text: 'Publicada', value: 'Publicada' },
            { text: 'Rejeitada', value: 'Rejeitada' },
            { text: 'Em avaliação', value: 'Em avaliação' },
        ],
        onFilter: (value, record) => {
            return record.estado.trim() === value;
        }
        ,
        sorter: (a, b) => a.estado.localeCompare(b.estado),
    },
    ];
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        try {
            if (currentUser && currentUser.id) {
                setUser(currentUser);
                if (tipo_user === 'administrador') {
                    loadTodasPublicacoes();
                } else if (tipo_user === 'colaborador') {
                    loadMinhasPublicacoes(currentUser.id);
                }
            } else {
                notification.error({ message: 'User is not logged in. Please log in to submit.' });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            notification.error({ message: 'Failed to fetch user data.' });
        }
    }, []);

    const handleNaoPublicar = async (record) => {
        try {
            const res = await axios.put(`http://localhost:8080/blog/naoPublicar/${record.id_publicacao}`);
            if (res.data.success === true) {
                setTodasPublicacoes(res.data.publicacao);
                loadTodasPublicacoes();
                setIsModalPublicacaoIndividual(false);
                notification.success({ message: 'Publicação não publicada com sucesso' });
            } else {
                notification.error({ message: 'Erro ao não publicar publicação' });
            }
        } catch (error) {
            console.error('Erro ao não publicar publicação:', error);
            notification.error({ message: 'Erro ao não publicar publicação' });
        }
    };

    const handlePublicar = async (record) => {
        try {
            const res = await axios.put(`http://localhost:8080/blog/Publicar/${record.id_publicacao}`);
            if (res.data.success === true) {
                setTodasPublicacoes(res.data.publicacao);
                loadTodasPublicacoes();
                setIsModalPublicacaoIndividual(false);
                notification.success({ message: 'Publicação publicada com sucesso' });
            } else {
                notification.error({ message: 'Erro ao publicar publicação' });
            }
        } catch (error) {
            console.error('Erro ao publicar publicação:', error);
            notification.error({ message: 'Erro ao publicar publicação' });
        }
    };

    const handleReenviar = async () => {
        try {
            const formData = new FormData();
            formData.append('titulo_publicacao', selectedPublicacao?.titulo_publicacao);
            formData.append('descricao', selectedPublicacao?.descricao);
            if (selectedPublicacao?.tipo_publicacao === 'Notícia') {
                formData.append('data_noticia', selectedPublicacao?.data_noticia);
            } else if (selectedPublicacao?.tipo_publicacao === 'Visita') {
                formData.append('data_visita', selectedPublicacao?.data_visita);
                formData.append('motivo_visita', selectedPublicacao?.motivo_visita);
                formData.append('duracao_visita', selectedPublicacao?.duracao_visita);
                formData.append('local_visita', selectedPublicacao?.local_visita);
            }

            if (backgroundImage) {
                formData.append('imagem', backgroundImage);
            }

            const url = selectedPublicacao?.tipo_publicacao.trim() === 'Notícia'
                ? `http://localhost:8080/noticia/reenviar/${selectedPublicacao?.id_publicacao}`
                : `http://localhost:8080/visita/reenviar/${selectedPublicacao?.id_publicacao}`;

            const response = await axios.put(url, formData)

            if (response.data.success) {
                notification.success({ message: `${selectedPublicacao?.tipo_publicacao} reenviada com sucesso!` });
                navigate('/blog/minhasPublicacoes');
                loadMinhasPublicacoes();
                loadTodasPublicacoes();
                setIsModalPublicacaoIndividual(false);
                setIsModalReenviarPublicacao(false);
                
            } else {
                notification.error({ message: `Erro ao reenviar ${selectedPublicacao?.tipo_publicacao}.` });
            }
        } catch (error) {
            console.error('Erro ao reenviar publicação:', error);
            notification.error({ message: 'Erro ao reenviar publicação.' });
        }
    };

    const handleSubmitVisita = () => {
        const url = "http://localhost:8080/visita/create";
        const data = new FormData();

        data.append('descricao', descricao);
        data.append('id_user', user.id);
        data.append('local_visita', localVisita);
        data.append('data_visita', dataVisita);
        data.append('duracao_visita', duracaoVisita);
        data.append('motivo_visita', motivoVisita);

        axios.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                if (res.data.success === true) {
                    const novaVisita = res.data.data;
                    setVisita([...visita, novaVisita]);
                    notification.success({ message: 'Visita sugerida com sucesso!' });
                    loadMinhasPublicacoes();
                    loadTodasPublicacoes();
                    setDataVisita('');
                    setDuracaoVisita('');
                    setLocalVisita('');
                    setMotivoVisita('');
                    setDescricao('');
                    setIsVisitaModalOpen(false);
                } else {
                    notification.error({ message: 'Erro ao sugerir visita' });
                    setIsVisitaModalOpen(false);
                }
            })
            .catch(error => {
                notification.error({ message: 'Erro ao sugerir visita' });
            })
    };


    const loadTodasPublicacoes = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/blog/listAll`);
            setTodasPublicacoes(response.data.PublicacoesComAutores);
            console.log(response.data.PublicacoesComAutores);
        } catch (error) {
            console.error('Erro ao encontrar publicações:', error);
            notification.error({ message: 'Erro ao encontrar publicações' });
        }
    };

    const loadMinhasPublicacoes = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/blog/list/minhasPublicacoes/${currentUser.id}`);
            setMinhasPublicacoes(response.data.publicacoes);
        } catch (error) {
            console.error('Erro ao encontrar publicações:', error);
            notification.error({ message: 'Erro ao encontrar publicações' });
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            setBackgroundImage(file);
            setImagemSelecionada(URL.createObjectURL(file));
        }
    };

    switch (tipo_user) {
        case 'administrador':
            return (
                <div>
                    <NavBar />
                    <section className='publicacoes'>
                        <h1>Publicações</h1>
                        <div>
                            <Button className='btn-publicacao' onClick={() => navigate(`/blog/adicionarNoticia/`)}>
                                <FaPlus /> Notícia
                            </Button>
                            <Button className='btn-publicacao' onClick={() => setIsVisitaModalOpen(true)}>
                                <FaPlus /> Visita
                            </Button></div>
                        <Modal
                            className='visita-modal'
                            open={isVisitaModalOpen}
                            title=" + Visita"
                            onCancel={() => setIsVisitaModalOpen(false)}
                            width={1000}
                            footer={[
                                <Button className='btn-cancel' key="back" onClick={() => setIsVisitaModalOpen(false)}>
                                    Cancelar
                                </Button>,
                                <Button
                                    className='btn-submit'
                                    onClick={handleSubmitVisita}
                                >
                                    Sugerir Visita
                                </Button>,
                            ]}
                        >
                            <DatePicker
                                value={dataVisita}
                                onChange={(date) => setDataVisita(date)}
                                className="date-visita-blog"
                            />
                            <Input
                                className="duracao-visita-blog"
                                placeholder="Qual a duração?"
                                value={duracaoVisita}
                                onChange={(e) => setDuracaoVisita(e.target.value)}
                            />
                            <Input
                                className="local-visita-blog"
                                placeholder="Qual o local?"
                                value={localVisita}
                                onChange={(e) => setLocalVisita(e.target.value)}
                            />
                            <Input
                                className="motivo-visita-blog"
                                placeholder="Qual o motivo?"
                                value={motivoVisita}
                                onChange={(e) => setMotivoVisita(e.target.value)}
                            />
                            <Input.TextArea
                                type="text"
                                className="description-blog"
                                placeholder="Insira a descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </Modal>
                    </section>
                    <Table className='tabela-minhas-publicacoes' dataSource={todasPublicacoes} columns={columns} onRow={(record) => ({
                        onClick: () => {
                            setSelectedPublicacao(record);
                            setIsModalPublicacaoIndividual(true);


                        },
                    })} />
                    <Modal
                        className='publicacao-modal'
                        open={isModalPublicacaoIndividual}
                        title={selectedPublicacao?.titulo_publicacao}
                        onCancel={() => setIsModalPublicacaoIndividual(false)}
                        width={700}
                        footer={
                            selectedPublicacao?.estado?.trim() === 'Rejeitada' ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <Button
                                            className='btn-reenviar-publicacao'
                                            onClick={() => setIsModalReenviarPublicacao(true)}
                                        >
                                            Reenviar
                                        </Button>
                                        <Modal
                                            className='publicacao-modal'
                                            open={isModalReenviarPublicacao}
                                            title={"Reenviar Publicação"}
                                            onCancel={() => setIsModalReenviarPublicacao(false)}
                                            width={1000}
                                            footer={
                                                <>
                                                    <Button
                                                        className='btn-cancel'
                                                        onClick={() => setIsModalReenviarPublicacao(false)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        className='btn-reenviar-publicacao'
                                                        onClick={handleReenviar}>
                                                        Reenviar Publicação
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <>
                                                <div className="banner">
                                                    <img
                                                        className="banner"
                                                        src={imagemSelecionada || `http://localhost:8080/${selectedPublicacao?.imagem}`} />
                                                    <input type="file" accept="image/*" id="banner-upload-noticia" onChange={handleFileUpload} hidden />
                                                    <label htmlFor="banner-upload-noticia" className="banner-upload-btn">
                                                        <MdOutlineFileUpload />
                                                    </label>
                                                </div>
                                                <Input
                                                    value={selectedPublicacao?.titulo_publicacao}
                                                    onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, titulo_publicacao: e.target.value })}
                                                    className="title-blog"
                                                    placeholder="Título da Publicação"
                                                />
                                                <Input.TextArea
                                                    value={selectedPublicacao?.descricao}
                                                    onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, descricao: e.target.value })}
                                                    className="description-blog"
                                                    placeholder="Descrição"
                                                />

                                                {selectedPublicacao?.tipo_publicacao?.trim() === 'Notícia' && (
                                                    <DatePicker
                                                        value={selectedPublicacao?.data_noticia ? moment(selectedPublicacao.data_noticia) : null}
                                                        onChange={(date) => setSelectedPublicacao({ ...selectedPublicacao, data_noticia: date ? date.format('YYYY-MM-DD') : null })}
                                                        className="date-noticia-blog"
                                                        placeholder="Data da Notícia"
                                                    />
                                                )}

                                                {selectedPublicacao?.tipo_publicacao?.trim() === 'Visita' && (
                                                    <>
                                                        <DatePicker
                                                            value={selectedPublicacao?.data_visita ? moment(selectedPublicacao?.data_visita) : null}
                                                            onChange={(date) => setSelectedPublicacao({ ...selectedPublicacao, data_visita: date ? date.format('YYYY-MM-DD') : null })}
                                                            className="date-visita-blog"
                                                            placeholder="Data da Visita"
                                                        />
                                                        <Input
                                                            value={selectedPublicacao?.motivo_visita}
                                                            onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, motivo_visita: e.target.value })}
                                                            className="motivo-visita-blog"
                                                            placeholder="Motivo da Visita"
                                                        />
                                                        <Input
                                                            value={selectedPublicacao?.duracao_visita}
                                                            onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, duracao_visita: e.target.value })}
                                                            className="duracao-visita-blog"
                                                            placeholder="Duração da Visita"
                                                        />
                                                        <Input
                                                            value={selectedPublicacao?.local_visita}
                                                            onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, local_visita: e.target.value })}
                                                            className="local-visita-blog"
                                                            placeholder="Local da Visita"
                                                        />
                                                    </>
                                                )}
                                            </>
                                        </Modal>
                                    </div>
                                    <div>
                                        <Button
                                            className='btn-ok'
                                        >
                                            OK
                                        </Button>
                                    </div>
                                </div>
                            ) : selectedPublicacao?.estado?.trim() === 'Publicada' ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <Button
                                            className='btn-nao-publicar'
                                            onClick={() => handleNaoPublicar(selectedPublicacao)}
                                        >
                                            Não publicar
                                        </Button>
                                        <Button
                                            className='btn-editar-publicacao'
                                            onClick={() => navigate(`/blog/editarPublicacao/${selectedPublicacao?.id_publicacao}`)}
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                    <div>

                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalPublicacaoIndividual(false)}
                                        >
                                            OK
                                        </Button>
                                    </div>
                                </div>
                            ) : selectedPublicacao?.estado.trim() === 'Não Publicada' ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <Button
                                            className='btn-publicar'
                                            onClick={() => handlePublicar(selectedPublicacao)}

                                        >
                                            Publicar
                                        </Button>
                                        <Button
                                            className='btn-editar-publicacao'
                                            onClick={() => navigate(`/blog/editarPublicacao/${selectedPublicacao?.id_publicacao}`)}
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                    <div>

                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalPublicacaoIndividual(false)}
                                        >
                                            OK
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginRight: '10px' }}>
                                    <Button
                                        className='btn-ok'
                                        onClick={() => setIsModalPublicacaoIndividual(false)}
                                    >
                                        OK
                                    </Button>
                                </div>
                            )
                        }
                    >
                        <div>
                            <p><strong>Descrição:</strong></p>
                            <p>{selectedPublicacao?.descricao}</p>
                        </div>
                    </Modal>

                    <FloatButton.BackTop />
                </div>
            );
        case 'colaborador':
            return (
                <div>
                    <NavBar />
                    <section className='publicacoes'>
                        <h1>Publicações</h1>
                        <div>
                            <Button className='btn-publicacao' onClick={() => navigate(`/blog/adicionarNoticia/`)}>
                                <FaPlus /> Notícia
                            </Button>
                            <Button className='btn-publicacao' onClick={() => setIsVisitaModalOpen(true)}>
                                <FaPlus /> Visita
                            </Button></div>
                        <Modal
                            className='visita-modal'
                            open={isVisitaModalOpen}
                            title=" + Visita"
                            onCancel={() => setIsVisitaModalOpen(false)}
                            width={1000}
                            footer={[
                                <Button className='btn-cancel' key="back" onClick={() => setIsVisitaModalOpen(false)}>
                                    Cancelar
                                </Button>,
                                <Button
                                    className='btn-submit'
                                    onClick={handleSubmitVisita}
                                >
                                    Sugerir Visita
                                </Button>,
                            ]}
                        >
                            <DatePicker
                                value={dataVisita}
                                onChange={(date) => setDataVisita(date)}
                                className="date-visita-blog"
                            />
                            <Input
                                className="duracao-visita-blog"
                                placeholder="Qual a duração?"
                                value={duracaoVisita}
                                onChange={(e) => setDuracaoVisita(e.target.value)}
                            />
                            <Input
                                className="local-visita-blog"
                                placeholder="Qual o local?"
                                value={localVisita}
                                onChange={(e) => setLocalVisita(e.target.value)}
                            />
                            <Input
                                className="motivo-visita-blog"
                                placeholder="Qual o motivo?"
                                value={motivoVisita}
                                onChange={(e) => setMotivoVisita(e.target.value)}
                            />
                            <Input.TextArea
                                type="text"
                                className="description-blog"
                                placeholder="Insira a descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </Modal>
                    </section>
                    <Table className='tabela-minhas-publicacoes' dataSource={minhasPublicacoes} columns={columns} onRow={(record) => ({
                        onClick: () => {
                            setSelectedPublicacao(record);
                            setIsModalPublicacaoIndividual(true);


                        },
                    })} />
                    <Modal
                        className='publicacao-modal'
                        open={isModalPublicacaoIndividual}
                        title={selectedPublicacao?.titulo_publicacao}
                        onCancel={() => setIsModalPublicacaoIndividual(false)}
                        width={700}
                        footer={
                            selectedPublicacao?.estado?.trim() === 'Rejeitada' ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <Button
                                            className='btn-reenviar-publicacao'
                                            onClick={() => setIsModalReenviarPublicacao(true)}
                                        >
                                            Reenviar
                                        </Button>
                                        <Modal
                                            className='publicacao-modal'
                                            open={isModalReenviarPublicacao}
                                            title={"Reenviar Publicação"}
                                            onCancel={() => setIsModalReenviarPublicacao(false)}
                                            width={1000}
                                            footer={
                                                <>
                                                    <Button
                                                        className='btn-cancel'
                                                        onClick={() => setIsModalReenviarPublicacao(false)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        className='btn-reenviar-publicacao'
                                                        onClick={handleReenviar}>
                                                        Reenviar Publicação
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <>
                                                <div className="banner">
                                                    <img
                                                        className="banner"
                                                        src={imagemSelecionada || `http://localhost:8080/${selectedPublicacao?.imagem}`} />
                                                    <input type="file" accept="image/*" id="banner-upload-noticia" onChange={handleFileUpload} hidden />
                                                    <label htmlFor="banner-upload-noticia" className="banner-upload-btn">
                                                        <MdOutlineFileUpload />
                                                    </label>
                                                </div>
                                                <Input
                                                    value={selectedPublicacao?.titulo_publicacao}
                                                    onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, titulo_publicacao: e.target.value })}
                                                    className="title-blog"
                                                    placeholder="Título da Publicação"
                                                />
                                                <Input.TextArea
                                                    value={selectedPublicacao?.descricao}
                                                    onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, descricao: e.target.value })}
                                                    className="description-blog"
                                                    placeholder="Descrição"
                                                />

                                                {selectedPublicacao?.tipo_publicacao?.trim() === 'Notícia' && (
                                                    <DatePicker
                                                        value={selectedPublicacao?.data_noticia ? moment(selectedPublicacao.data_noticia) : null}
                                                        onChange={(date) => setSelectedPublicacao({ ...selectedPublicacao, data_noticia: date ? date.format('YYYY-MM-DD') : null })}
                                                        className="date-noticia-blog"
                                                        placeholder="Data da Notícia"
                                                    />
                                                )}

                                                {selectedPublicacao?.tipo_publicacao?.trim() === 'Visita' && (
                                                    <>
                                                        <DatePicker
                                                            value={selectedPublicacao?.data_visita ? moment(selectedPublicacao?.data_visita) : null}
                                                            onChange={(date) => setSelectedPublicacao({ ...selectedPublicacao, data_visita: date ? date.format('YYYY-MM-DD') : null })}
                                                            className="date-visita-blog"
                                                            placeholder="Data da Visita"
                                                        />
                                                        <Input
                                                            value={selectedPublicacao?.motivo_visita}
                                                            onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, motivo_visita: e.target.value })}
                                                            className="motivo-visita-blog"
                                                            placeholder="Motivo da Visita"
                                                        />
                                                        <Input
                                                            value={selectedPublicacao?.duracao_visita}
                                                            onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, duracao_visita: e.target.value })}
                                                            className="duracao-visita-blog"
                                                            placeholder="Duração da Visita"
                                                        />
                                                        <Input
                                                            value={selectedPublicacao?.local_visita}
                                                            onChange={(e) => setSelectedPublicacao({ ...selectedPublicacao, local_visita: e.target.value })}
                                                            className="local-visita-blog"
                                                            placeholder="Local da Visita"
                                                        />
                                                    </>
                                                )}
                                            </>
                                        </Modal>
                                    </div>
                                    <div>
                                        <Button
                                            className='btn-cancel'
                                            onClick={() => setIsModalPublicacaoIndividual(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            className='btn-ok'
                                        >
                                            OK
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Button
                                        className='btn-ok'
                                        onClick={() => setIsModalPublicacaoIndividual(false)}
                                    >
                                        OK
                                    </Button>
                                </>
                            )

                        }
                    >
                        <div>
                            <p><strong>Descrição:</strong></p>
                            <p>{selectedPublicacao?.descricao}</p>
                        </div>
                    </Modal>

                    <FloatButton.BackTop />
                </div>
            );
    }
}
