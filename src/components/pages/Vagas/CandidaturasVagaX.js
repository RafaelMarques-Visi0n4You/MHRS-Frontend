import React, { useEffect, useState } from 'react';
import NavBar from '../../layout/NavBar';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import './Vagas.css';
import { Button, Modal, notification, Table } from 'antd';
import axios from 'axios';
import AuthService from '../../auth.service';
import './Vagas.css';
import { BsFileText } from 'react-icons/bs';
import { FaListCheck } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import moment from 'moment';

export default function CandidaturasVagaX() {
    const currentUser = AuthService.getCurrentUser();
    const { id_vaga } = useParams();
    const [candidaturas, setCandidaturas] = useState([]);
    const [selectedCandidatura, setSelectedCandidatura] = useState(null);
    const [isModalCandidaturaIndividual, setIsModalCandidaturaIndividual] = useState(false);
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            LoadCandidaturas();
        } else {
            notification.error({ message: "Usuário não autenticado!" });
        }
    }, [id_vaga]);

    const columns = [
        {
            title: 'Candidatos',
            dataIndex: 'nome_candidato',
            key: 'nome_candidato',
        },
        {
            title: '', key: 'acoes', render: (record) => (
                <FaSearch style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setSelectedCandidatura(record);
                        setIsModalCandidaturaIndividual(true);
                    }}
                />
            )
        },
    ];

    const LoadCandidaturas = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/candidaturas/listAll/${id_vaga}`);
            console.log(res.data);
            if (res.data.success) {
                setCandidaturas(res.data.candidaturasComInfo);
            } else {
                notification.error({ message: "Erro ao carregar candidaturas!" });
            }
        } catch (error) {
            console.error('Erro ao carregar candidaturas:', error);
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const atribuirVaga = async () => {
        try {
            const res = await axios.put(`http://localhost:8080/vaga/vagaAtribuir/${selectedCandidatura.id_candidatura}`);
            console.log(res.data);
            if (res.data.success) {
                notification.success({ message: "Candidatura atribuída com sucesso!" });
                LoadCandidaturas();
                setIsModalCandidaturaIndividual(false);
                navigate('/vagas');
            } else {
                notification.error({ message: "Erro ao atribuir candidatura!" });
            }
        } catch (error) {
            console.error('Erro ao atribuir candidatura:', error);
            notification.error({ message: `Erro: ${error.message}` });
        }
    }
    return (
        <div>
            <NavBar />
            <section className='candidaturas-vaga'>
                <h1>Candidaturas - Vaga {id_vaga}</h1>

                <div className='info-vaga'>
                    <h2><BsFileText style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Descrição</strong></h2>
                    <h3>{candidaturas.length > 0 ? candidaturas[0].descricao : 'Descrição não disponível'}</h3>
                </div>

                <div className='requisitos'>
                    <h2><FaListCheck style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Requisitos</strong></h2>
                    <ul>
                        {candidaturas.length > 0 && candidaturas[0].requisitos ? (
                            candidaturas[0].requisitos.map((requisito, index) => (
                                <li key={index}>{requisito}</li>
                            ))
                        ) : (
                            <li>Requisitos não disponíveis</li>
                        )}
                    </ul>
                </div>

                <Table
                    className='tabela-candidaturas'
                    dataSource={candidaturas}
                    columns={columns}
                />
                <Modal className='modal-candidatura'
                    title='Candidatura'
                    open={isModalCandidaturaIndividual}
                    onCancel={() => setIsModalCandidaturaIndividual(false)}
                    width={900}
                    footer={[
                        <>
                            <Button className="btn-cancel" onClick={() => setIsModalCandidaturaIndividual(false)}>
                                Cancelar
                            </Button>
                            <Button className="btn-atribuir-vaga" onClick={atribuirVaga}>
                                Atribuir vaga
                            </Button>
                        </>
                    ]}
                >
                    <div className="modal-conteudo">
                        <div className='dados-candidatura'>
                            <p style={{ fontSize: '14px', color: 'gray' }}>
                                {selectedCandidatura?.data_submissao
                                    ? moment(selectedCandidatura.data_submissao).format('DD-MM-YYYY')
                                    : 'Não disponível'} </p>
                            <p><strong>Nome do candidato: </strong></p>
                            <p>{selectedCandidatura?.nome_candidato}</p>
                            <p><strong>Email: </strong></p>
                            <p>{selectedCandidatura?.informacoes_contacto}</p>
                            <p><strong>Currículo</strong></p>
                            <p>{selectedCandidatura?.curriculo
                                ? (
                                    <a
                                        href={`http://localhost:8080/${selectedCandidatura?.curriculo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver ficheiro
                                    </a>
                                ) : (
                                    'Nenhum ficheiro disponível'
                                )}</p>
                        </div>
                    </div>
                </Modal>
            </section>
        </div>



    );
}
