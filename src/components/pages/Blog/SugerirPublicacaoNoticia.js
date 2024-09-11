import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import axios from 'axios';
import AuthService from '../../auth.service';
import { notification, Input, Button, DatePicker, FloatButton } from 'antd';
import { MdOutlineFileUpload } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import './PaginasBlog.css';


export default function SugerirNoticia() {
    const navigate = useNavigate();
    const [descricao, setDescricao] = useState('');
    const [noticia, setNoticia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataNoticia, setDataNoticia] = useState('');
    const [titulo_publicacao, setTituloPublicacao] = useState('');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [user, setUser] = useState({});
    const [imagemSelecionada, setImagemSelecionada] = useState(null);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.id) {
            setUser(currentUser);
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit.' });
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackgroundImage(file);
            setImagemSelecionada(URL.createObjectURL(file));
        }
    };

    const handleSubmitNoticia = () => {
        const url = "http://localhost:8080/noticia/create";
        const data = new FormData();
        data.append('descricao', descricao);
        data.append('id_user', user.id);
        data.append('titulo_publicacao', titulo_publicacao);
        data.append('data_noticia', dataNoticia);

        if (backgroundImage) {
            data.append('imagem', backgroundImage);
        }

        setLoading(true);

        axios.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                if (res.data.success === true) {
                    const novaNoticia = res.data.data;
                    setNoticia([...noticia, novaNoticia]);
                    setDescricao('');
                    setTituloPublicacao('');
                    setDataNoticia('');
                    setBackgroundImage(null);
                    setImagemSelecionada(null);
                    notification.success({ message: 'Notícia sugerida com sucesso!' });
                    navigate('/blog/minhasPublicacoes');
                } else {
                    notification.error({ message: 'Erro ao sugerir notícia' });
                }
            })
            .catch(error => {
                notification.error({ message: 'Erro ao sugerir notícia' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <NavBar />
            <div className="banner" style={{ backgroundImage: `url(${imagemSelecionada})` }}>
                <input type="file" accept="image/*" id="banner-upload" onChange={handleImageChange} hidden />
                <label htmlFor="banner-upload" className="banner-upload-btn" >
                    <MdOutlineFileUpload />
                </label>
            </div>
            <div className="blog">
            <>
                <Input
                    className="title-blog"
                    placeholder="Insira um título"
                    value={titulo_publicacao}
                    onChange={(e) => setTituloPublicacao(e.target.value)}
                />
                <DatePicker
                    value={dataNoticia}
                    onChange={(date) => setDataNoticia(date)}
                    className="date-noticia-blog"
                />
                <Input.TextArea
                    className="description-blog"
                    placeholder="Insira a descrição"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                />
                 </>
                <Button
                    onClick={handleSubmitNoticia}
                    loading={loading}
                    className="btn-submit-noticia"
                >
                    Sugerir Notícia
                </Button>
            </div>
            <FloatButton.BackTop/>
        </div>
    );
}
