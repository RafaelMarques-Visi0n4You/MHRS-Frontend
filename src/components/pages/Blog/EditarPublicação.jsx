import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import { MdOutlineFileUpload } from 'react-icons/md';
import axios from 'axios';
import AuthService from '../../auth.service';
import { notification, Input, Button, DatePicker, FloatButton } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import './PaginasBlog.css';

export default function EditarPublicacao() {
    const { id_publicacao } = useParams();
    const [publicacao, setPublicacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState({});
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

    const handleEditar = async () => {
        try {
            const formData = new FormData();
            formData.append('titulo_publicacao', tituloPublicacao);
            formData.append('descricao', descricao);

            if (backgroundImage) {
                formData.append('imagem', backgroundImage);
            }
            if (tipoPublicacao === 'Notícia') {
                formData.append('data_noticia', dataNoticia);
            } else if (tipoPublicacao === 'Visita') {
                formData.append('data_visita', visitaData.dataVisita);
                formData.append('motivo_visita', visitaData.motivoVisita);
                formData.append('duracao_visita', visitaData.duracaoVisita);
                formData.append('local_visita', visitaData.localVisita);
            }

            const url = tipoPublicacao === 'Notícia'
                ? `http://localhost:8080/noticia/update/${id_publicacao}`
                : `http://localhost:8080/visita/update/${id_publicacao}`;

            const response = await axios.put(url, formData);

            if (response.data.success) {
                notification.success({ message: `${tipoPublicacao} editada com sucesso!` });
                navigate('/blog/minhasPublicacoes');
            } else {
                notification.error({ message: `Erro ao editar ${tipoPublicacao}.` });
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
                    className="title-blog"
                />
                <Input.TextArea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="description-blog"
                />

                {tipoPublicacao === 'Notícia' && (
                    <>
                        <DatePicker
                            value={dataNoticia ? moment(dataNoticia) : null}
                            onChange={(date) => setDataNoticia(date  ? date.format('YYYY-MM-DD') : null)}
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
                            className="motivo-visita-blog"
                        />
                        <Input
                            value={visitaData.duracaoVisita}
                            onChange={(e) => setVisitaData({ ...visitaData, duracaoVisita: e.target.value })}
                            className="duracao-visita-blog"
                        />
                        <Input
                            value={visitaData.localVisita}
                            onChange={(e) => setVisitaData({ ...visitaData, localVisita: e.target.value })}
                            className="local-visita-blog"
                        />
                    </>
                )}

                <Button
                    onClick={handleEditar}
                    loading={loading}
                    className="btn-submit-editar"
                >
                    Editar Publicação
                </Button>
            </div>
            <FloatButton.BackTop />
        </div>
    );
}
