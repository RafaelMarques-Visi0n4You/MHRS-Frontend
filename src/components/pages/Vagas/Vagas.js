import './Vagas.css';
import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import axios from 'axios';
import { Button, Input, notification, Space, DatePicker, Modal, FloatButton } from 'antd';
import { CiCirclePlus } from 'react-icons/ci';
import AuthService from '../../auth.service';

export default function Vagas() {
    const currentUser = AuthService.getCurrentUser();

    const tipo_user = currentUser?.tipo_user?.trim().toLowerCase();
    const [vagas, setVagas] = useState([]);
    const [descricao, setDescricao] = useState("");
    const [titulo, setTitulo] = useState("");
    const [requisitos, setRequisitos] = useState([]);
    const [data_encerramento, setDataEncerramento] = useState("");
    const [user, setUser] = useState({});
    const [isModalVaga, setIsModalVaga] = useState(false);


    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            loadVagasEmAberto();
        } else {
            loadVagasEmAberto();
        }
    }, []);


    const loadVagasEmAberto = async () => {
        try {
            const response = await axios.get(`https://mhrs-frontend.onrender.com/vaga/listEmAberto`);
            if (response.data.success) {
                setVagas(response.data.data);
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar vagas!" });
        }
    }


    //SUBMETER VAGA
    const handleSubmitVaga = async () => {
        try {
            const response = await axios.post(`https://mhrs-frontend.onrender.com/vaga/create`,
                {
                    titulo_vaga: titulo,
                    descricao: descricao,
                    requisitos: JSON.stringify(requisitos.map(o => o.value)),
                    data_encerramento: data_encerramento
                });
            if (response.data.success) {
                notification.success({ message: "Vaga submetido com sucesso!" });
                console.log(response.data);
                loadVagasEmAberto();
                setIsModalVaga(false);
                setTitulo("");
                setDescricao("");
                setRequisitos([]);
                setDataEncerramento("");
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar adicionar vaga!" });
        }
    };

    /*ADICIONAR OS REQUSITOS*/
    const adicionarRequisito = () => {
        setRequisitos([...requisitos, { value: '' }]);
    };

    const removerRequisito = (index) => {
        setRequisitos(requisitos.filter((_, i) => i !== index));
    };

    const handleRequisitoChange = (value, index) => {
        const newRequisitos = [...requisitos];
        newRequisitos[index].value = value;
        setRequisitos(newRequisitos);
    };

    const truncateText = (text, limit) => {
        if (!text) return '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };


    switch (tipo_user) {
        case 'colaborador':
            return (
                <div>
                    <NavBar />
                    <section className="vagas">
                        <h1>Vagas</h1>
                        <section className="vaga-section">
                            {vagas.length === 0 ? (
                                <p>Nenhuma vaga </p>
                            ) : (
                                vagas.map((vaga, index) => (
                                    <div key={index} className="vaga-card">
                                        <img
                                            className="vaga-image"
                                            src={`https://mhrs-frontend.onrender.com/${vaga.imagem}`}
                                            alt={vaga.titulo_vaga || "Visita"}
                                        />
                                        <h1 className="vaga-title">{vaga.titulo_vaga || "Visita"}</h1>
                                        <p className="vaga-overview">{truncateText(vaga.descricao, 100)}</p>
                                        <a href={`/vagas/${vaga.id_vaga}`} className="btn-detalhes">Detalhes</a>
                                    </div>
                                ))
                            )}
                        </section>
                    </section>
                    <FloatButton.BackTop />
                </div>
            );
        case 'administrador':
            return (
                <div>
                    <NavBar />
                    <section className="vagas">
                        <div className='adicionar-vaga-btn'>
                            <h1 >Vagas</h1>
                            <CiCirclePlus style={{ fontSize: '40px', cursor: 'pointer'}} onClick={() => setIsModalVaga(true)} />
                        </div>
                        <Modal
                            className='modal-vaga'
                            open={isModalVaga}
                            title="Submeter Vaga!"
                            onCancel={() => setIsModalVaga(false)}
                            width={1000}
                            footer={[
                                <Button className='btn-cancel' onClick={() => setIsModalVaga(false)}>
                                    Cancelar
                                </Button>,
                                <Button
                                    className='btn-submit-vaga'
                                    onClick={handleSubmitVaga}
                                >
                                    Submeter Vaga
                                </Button>,
                            ]}
                        >
                            <p><strong>Título</strong>
                                <Input
                                    style={{ width: '100%' }}
                                    type="text"
                                    placeholder='Título'
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                /></p>
                            <p><strong>Descrição</strong>
                                <Input.TextArea
                                    type="text"
                                    placeholder='Descrição'
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                /></p>
                            <p><strong>Requisitos</strong>

                                {requisitos.map((obj, index) => (
                                    <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Input
                                            placeholder="Requisito"
                                            value={obj.value}
                                            onChange={(e) => handleRequisitoChange(e.target.value, index)}
                                        />
                                        <Button type="link" onClick={() => removerRequisito(index)}>Remover</Button>
                                    </Space>
                                ))}</p>
                            <Button type="dashed" onClick={adicionarRequisito} icon={<CiCirclePlus />}>
                                Adicionar requisito
                            </Button>

                            <p><strong>Data de Encerramento das Candidaturas</strong>
                                <DatePicker style={{ width: '100%' }} value={data_encerramento} onChange={(data) => setDataEncerramento(data)} />
                            </p>
                        </Modal>

                        <section className="vaga-section">
                            {vagas.length === 0 ? (
                                <p>Nenhuma vaga </p>
                            ) : (
                                vagas.map((vaga, index) => (
                                    <div key={index} className="vaga-card">
                                        <img
                                            className="vaga-image"
                                            src={`http://localhost:8080/${vaga.imagem}`}
                                            alt={vaga.titulo_vaga || "Visita"}
                                        />
                                        <h1 className="vaga-title">{vaga.titulo_vaga || "Visita"}</h1>
                                        <p className="vaga-overview">{truncateText(vaga.descricao, 100)}</p>
                                        <a href={`/vagas/${vaga.id_vaga}`} className="btn-detalhes">Detalhes</a>
                                    </div>
                                ))
                            )}
                        </section>
                    </section>
                    <FloatButton.BackTop />

                </div>

            );
        default:
            return (
                <div>
                    <NavBar />
                    <section className="vagas">
                        <h1>Vagas</h1>
                        <section className="vaga-section">
                            {vagas.length === 0 ? (
                                <p>Nenhuma vaga </p>
                            ) : (
                                vagas.map((vaga, index) => (
                                    <div key={index} className="vaga-card">
                                        <img
                                            className="vaga-image"
                                            src={`http://localhost:8080/${vaga.imagem}`}
                                            alt={vaga.titulo_vaga || "Visita"}
                                        />
                                        <h1 className="vaga-title">{vaga.titulo_vaga || "Visita"}</h1>
                                        <p className="vaga-overview">{truncateText(vaga.descricao, 100)}</p>
                                        <a href={`/vagas/${vaga.id_vaga}`} className="btn-detalhes">Detalhes</a>
                                    </div>
                                ))
                            )}
                        </section>
                    </section>
                    <FloatButton.BackTop />
                </div>
            );
    }
}