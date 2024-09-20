import React, { useEffect, useState } from 'react';
import './Perfil.css';
import NavBar from '../../layout/NavBar';
import axios from 'axios';
import { notification, Input, Button, FloatButton } from 'antd';
import AuthService from '../../auth.service';
import { FaInfoCircle, FaRegCalendarAlt } from "react-icons/fa";
import { PiGenderIntersexBold } from "react-icons/pi";
import { MdOutlineLocalPhone, MdOutlineMail } from "react-icons/md";
import { TbLock } from "react-icons/tb";

import { FiMapPin } from "react-icons/fi";
import moment from 'moment';

export default function VerPerfil() {
  const [perfil, setPerfil] = useState({});
  const currentUser = AuthService.getCurrentUser();
  const [passNova, setPassNova] = useState('');
  const [passAntiga, setPassAntiga] = useState('');
  const [confirmaPass, setConfirmaPass] = useState('');
const passValidacao = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

  useEffect(() => {
    if (currentUser && currentUser.id) {
      verPerfil(currentUser.id);
    } else {
      notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
    }
  }, []);

  const verPerfil = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/user/perfil/${currentUser.id}`);
      if (res.data.success) {
        setPerfil(res.data.perfil);
      } else {
        notification.error({ message: res.data.message || "Erro ao visualizar perfil." });
      }
    } catch (error) {
      notification.error({ message: "Erro ao visualizar perfil." });
    }
  };

  const handleAlterarPassword = async () => {
    try {
      if (passNova !== confirmaPass) {
        notification.error({ message: 'A nova senha e a confirmação não coincidem.' });
        return;
      }
      console.log(passAntiga);
      console.log(passNova);
      console.log(confirmaPass);
      const res = await axios.put(`http://localhost:8080/user/alterarPass/${currentUser.id}`,
        {
          passAntiga,
          passNova,
          confirmaPass
        }

      );
      if (res.data.success) {
        notification.success({ message: res.data.message });
        setPassNova('');
        setPassAntiga('');
        setConfirmaPass('');
      } else {
        notification.error({ message: res.data.message || "Erro ao alterar password." });
      }
    }
    catch (error) {
      notification.error({ message: "Erro ao alterar password." });
    }
  }


  return (
    <div>
      <NavBar />
      <section className='perfil'>
        <section className='container-gradiente'>
        </section>
        <h1><strong>{perfil.nome_utilizador}</strong></h1>
        <h2>{perfil.tipo_user}</h2>
        <img src={`http://localhost:8080/${perfil.foto_perfil}`} alt="Perfil" />
        <section className='container-perfil'>
          <h6><FaInfoCircle style={{ marginRight: '10px' }} /><strong>Informações Pessoais</strong></h6>
          <div className='informacoes'>
            <div className='info'>
              <FaRegCalendarAlt style={{ marginRight: '10px', fontSize: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              <h8><strong>Data de nascimento:</strong> {perfil.data_nascimento ? moment(perfil.data_nascimento).format('DD/MM/YYYY') : ''}</h8>
            </div>
            <div className='info'>
              <PiGenderIntersexBold style={{ marginRight: '10px', fontSize: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              <h8><strong>Género:</strong> {perfil.genero}</h8>
            </div>
            <div className='info'>
              <MdOutlineLocalPhone style={{ marginRight: '10px', fontSize: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              <h8><strong>Telemóvel:</strong> {perfil.telemovel}</h8>
            </div>
            <div className='info'>
              <MdOutlineMail style={{ marginRight: '10px', fontSize: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              <h8><strong>Email:</strong> {perfil.email}</h8>
            </div>
            <div className='info'>
              <FiMapPin style={{ marginRight: '10px', fontSize: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              <h8><strong>Morada:</strong> {perfil.morada}</h8>
            </div>
          </div>
        </section>
        <section className='container-password'>
          <div className='info'>
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <TbLock style={{ marginRight: '10px', fontSize: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              <h8><strong>Alterar Password</strong></h8>
            </div>
            <div style={{ marginLeft: '50px' }}>
              <h8>Password Atual:</h8>
              <Input style={{ marginLeft: '10px', width: '50%' }} type="password" placeholder='Insere a tua palavra passe antiga' value={passAntiga} onChange={(e) => setPassAntiga(e.target.value)} />
              <h8>Nova Password:</h8>
              <Input style={{ marginLeft: '10px', width: '50%' }} type="password" placeholder='Insere a  nova palavra-passe' value={passNova}
                onChange={(e) => setPassNova(e.target.value)} />
              <h8>Confirmar Password:</h8>
              <Input style={{ marginLeft: '10px', width: '50%' }} type="password" placeholder='Confirma a nova palavra-passe' value={confirmaPass}
                onChange={(e) => setConfirmaPass(e.target.value)} />
              <Button className='btn-pass' onClick={handleAlterarPassword}>Alterar Password</Button>
            </div>
          </div>
        </section>
      </section>
      <FloatButton.BackTop/>
    </div>
  );
}
