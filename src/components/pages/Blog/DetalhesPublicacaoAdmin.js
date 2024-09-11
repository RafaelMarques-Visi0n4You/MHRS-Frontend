import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import { MdOutlineFileUpload } from 'react-icons/md';
import axios from 'axios';
import AuthService from '../../auth.service';
import { notification, Modal, Input, Button, DatePicker, FloatButton } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import './PaginasBlog.css';

export default function DetalhesPublicacaoAdmin() {
    const { id_publicacao } = useParams();
    const [publicacao, setPublicacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRejeitadaPublicacaoModalOpen, setIsRejeitadaPublicacaoModalOpen] = useState(false);
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [comentarios, setComentarios] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataNoticia, setDataNoticia] = useState(null);
    const [tituloPublicacao, setTituloPublicacao] = useState('');
    const [tipoPublicacao, setTipoPublicacao] = useState('');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [imagemSelecionada, setImagemSelecionada] = useState('');
    const [visitaData, setVisitaData] = useState({
        dataVisita: null,
        motivoVisita: '',
        duracaoVisita: '',
        localVisita: ''
    });
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            loadPublicacao();
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit.' });
        }
    }, [id_publicacao]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            setBackgroundImage(file);
            setImagemSelecionada(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            formData.append('validador', currentUser.nome_utilizador);
            formData.append('descricao', descricao);
            formData.append('titulo_publicacao', tituloPublicacao);

            if (backgroundImage) {
                formData.append('imagem', backgroundImage);
            }
            if (tipoPublicacao === 'Notícia') {
                formData.append('data_noticia', dataNoticia);
                const response = await axios.put(`http://localhost:8080/noticia/aprovar/${id_publicacao}`, formData
                );

                if (response.data.success) {
                    notification.success({ message: 'Notícia aprovada com sucesso!' });
                    navigate('/blog/admin/gerirPublicacoes');
                } else {
                    notification.error({ message: 'Erro ao aprovar Notícia.' });
                }
            } else if (tipoPublicacao === 'Visita') {
                formData.append('data_visita', visitaData.dataVisita);
                formData.append('motivo_visita', visitaData.motivoVisita);
                formData.append('duracao_visita', visitaData.duracaoVisita);
                formData.append('local_visita', visitaData.localVisita);
                const response = await axios.put(`http://localhost:8080/visita/aprovar/${id_publicacao}`, formData);
                if (response.data.success) {
                    notification.success({ message: 'Visita aprovada com sucesso!' });
                    navigate('/blog/admin/gerirPublicacoes');
                } else {
                    notification.error({ message: 'Erro ao aprovar Visita.' });
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar publicação:', error);
            notification.error({ message: 'Erro ao atualizar publicação.' });
        } finally {
            setLoading(false);
        }
    };

    const loadPublicacao = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/blog/list/${id_publicacao}`);
            if (response.data.success) {
                const fetchedPublicacao = response.data.publicacao;
                const tipoPublicacao = response.data.tipo_publicacao;
                setPublicacao({ ...fetchedPublicacao, tipo_publicacao: tipoPublicacao });
                setDescricao(fetchedPublicacao.descricao);
                setTituloPublicacao(fetchedPublicacao.titulo_publicacao);
                setTipoPublicacao(tipoPublicacao);
                if (tipoPublicacao === 'Notícia') {
                    setDataNoticia(moment(fetchedPublicacao.data_noticia));
                } else if (tipoPublicacao === 'Visita') {
                    setVisitaData({
                        dataVisita: moment(fetchedPublicacao.data_visita),
                        motivoVisita: fetchedPublicacao.motivo_visita,
                        duracaoVisita: fetchedPublicacao.duracao_visita,
                        localVisita: fetchedPublicacao.local_visita,
                    });
                }
                if (fetchedPublicacao.imagem) {
                    setImagemSelecionada(`http://localhost:8080/${fetchedPublicacao.imagem}`);
                }
            } else {
                notification.error({ message: 'Erro ao encontrar publicação' });
            }
        } catch (error) {
            console.error('Erro ao encontrar publicação:', error);
            notification.error({ message: 'Erro ao encontrar publicação' });
        } finally {
            setLoading(false);
        }
    };

    const handleRejectPublication = async () => {
        try {
            const today = new Date();
            const dataValidacao = today.toISOString().split('T')[0];
            const user = currentUser.nome_utilizador;

            const url = `http://localhost:8080/blog/rejeitar/${id_publicacao}`;
            const res = await axios.put(url, {
                data_validacao: dataValidacao,
                comentarios: comentarios,
                validador: user
            });
            if (res.data.success) {
                notification.success({ message: "Publicação rejeitada com sucesso!" });
                setIsRejeitadaPublicacaoModalOpen(false);
                navigate('/blog/admin/gerirPublicacoes');
            } else {
                notification.error({ message: "Erro ao rejeitar a publicação" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavBar />
            <div className="banner">
                <img
                    className="banner"
                    src={imagemSelecionada}
                />
                <input type="file" accept="image/*" id="banner-upload-noticia" onChange={handleFileUpload} hidden />
                <label htmlFor="banner-upload-noticia" className="banner-upload-btn">
                    <MdOutlineFileUpload />
                </label>
            </div>
            <div className="blog">
                <Input
                    value={tituloPublicacao}
                    onChange={(e) => setTituloPublicacao(e.target.value)}
                    placeholder="Título da Publicação"
                    className="title-blog"
                />
                <Input.TextArea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição"
                    className="description-blog"
                />

                {tipoPublicacao === 'Notícia' && (
                    <>
                        <DatePicker
                            value={dataNoticia ? moment(dataNoticia) : null}
                            onChange={(date) => setDataNoticia(date ? date.format('YYYY-MM-DD') : null)}
                            className="date-noticia-blog"
                        />
                    </>
                )}

                {tipoPublicacao === 'Visita' && (
                    <>
                        <DatePicker
                            value={visitaData.dataVisita ? moment(visitaData.dataVisita) : null}
                            onChange={(date) => setVisitaData({ ...visitaData, dataVisita: date ? date.format('YYYY-MM-DD') : null })}
                            className="date-visita-blog"
                        />
                        <Input
                            value={visitaData.motivoVisita}
                            onChange={(e) => setVisitaData({ ...visitaData, motivoVisita: e.target.value })}
                            placeholder="Motivo da Visita"
                            className="motivo-visita-blog"
                        />
                        <Input
                            value={visitaData.duracaoVisita}
                            onChange={(e) => setVisitaData({ ...visitaData, duracaoVisita: e.target.value })}
                            placeholder="Duração da Visita"
                            className="duracao-visita-blog"
                        />
                        <Input
                            value={visitaData.localVisita}
                            onChange={(e) => setVisitaData({ ...visitaData, localVisita: e.target.value })}
                            placeholder="Local da Visita"
                            className="local-visita-blog"
                        />
                    </>
                )}

                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    className="btn-submit-aprovar"
                >
                    Aprovar Publicação
                </Button>
                <Button className='btn-submit-rejeitar' type="primary" onClick={() => setIsRejeitadaPublicacaoModalOpen(true)}>
                    Rejeitar Publicação
                </Button>
                <Modal
                    open={isRejeitadaPublicacaoModalOpen}
                    title="Rejeitar Publicação"
                    onCancel={() => setIsRejeitadaPublicacaoModalOpen(false)}

                    footer={[
                        <Button className='btn-cancel' key="back" onClick={() => setIsRejeitadaPublicacaoModalOpen(false)}>
                            Cancelar
                        </Button>,
                        <Button
                            id='btn-eliminar'
                            onClick={handleRejectPublication}
                        >
                            Rejeitar Publicação
                        </Button>,
                    ]}
                >
                    <Input.TextArea
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        placeholder="Comentários"
                    />
                </Modal>
            </div>
            <FloatButton.BackTop />
        </div>
    );
}
