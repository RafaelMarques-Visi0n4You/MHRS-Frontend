import React, { useState, useEffect, useRef } from 'react';
import './Registar.css';
import Logo from '../../../img/Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const baseUrl = "https://mhrs-frontend.onrender.com";
const URLRegisto = baseUrl + '/user/registo';

const userValidacao = /^[a-zA-Z]+[a-zA-Z0-9-_]{3,23}$/;
const passValidacao = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const generoValidacao = /^[a-zA-Z]{3,23}$/;
const telemovelValidacao = /^[0-9]{9}$/;
const emailValidacao = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const dataNascimentoValidacao = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

function Registar() {
  const navigate = useNavigate();
  const userRef = useRef(null);
  const errRef = useRef(null);

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [dataNascimento, setDataNascimento] = useState('');
  const [validDataNascimento, setValidDataNascimento] = useState(false);
  const [dataNascimentoFocus, setDataNascimentoFocus] = useState(false);

  const [genero, setGenero] = useState('');
  const [validGenero, setValidGenero] = useState(false);
  const [generoFocus, setGeneroFocus] = useState(false);

  const [telemovel, setTelemovel] = useState('');
  const [validTelemovel, setValidTelemovel] = useState(false);
  const [telemovelFocus, setTelemovelFocus] = useState(false);

  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pass, setPass] = useState('');
  const [validPass, setValidPass] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const [matchPass, setMatchPass] = useState('');
  const [validMatchPass, setValidMatchPass] = useState(false);
  const [matchPassFocus, setMatchPassFocus] = useState(false);

  const [errMessage, setErrMessage] = useState('');
  const [sucess, setSucess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    const result = userValidacao.test(user);
    setValidName(result);
  }, [user]);

  useEffect(() => {
    const result = dataNascimentoValidacao.test(dataNascimento);
    setValidDataNascimento(result);
  }, [dataNascimento]);

  useEffect(() => {
    const result = generoValidacao.test(genero);
    setValidGenero(result);
  }, [genero]);

  useEffect(() => {
    const result = telemovelValidacao.test(telemovel);
    setValidTelemovel(result);
  }, [telemovel]);

  useEffect(() => {
    const result = emailValidacao.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = passValidacao.test(pass);
    setValidPass(result);
    const match = pass === matchPass;
    setValidMatchPass(match);
  }, [pass, matchPass]);

  useEffect(() => {
    setErrMessage('');
  }, [user, pass, matchPass, email, telemovel, genero, dataNascimento]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validName || !validPass || !validMatchPass || !validEmail || !validTelemovel || !validGenero || !validDataNascimento) {
      setErrMessage('Preencha todos os campos corretamente!');
      return;
    }
    try {
      const response = await axios.post(
        URLRegisto,
        JSON.stringify({
          nome_utilizador: user,
          pass,
          email,
          telemovel,
          genero,
          data_nascimento: dataNascimento,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      console.log(response.data);
      navigate('/user/login')
      setSucess(true);
    } catch (err) {
      if (!err?.response) {
        setErrMessage("Servidor não responde");
      } if (err.response?.status === 409) {
        const conflictField = err.response?.data?.field;
        if (conflictField === 'nome_utilizador') {
          setErrMessage('Nome de utilizador já em uso');
        } else if (conflictField === 'email') {
          setErrMessage('Email já em uso');
        }
      } else if (err.response?.status === 500) {
        setErrMessage("Erro interno do servidor");
      } else {
        setErrMessage("O seu registo falhou! Tente novamente!");
      }
      errRef.current.focus();
    }
  };

  return (
    <div className="background">
      <div className="container-registar">
        <p ref={errRef} className={errMessage ? "errMessage" : "offscreen"} aria-live="assertive">{errMessage}</p>
        <img className="logo-login-registo" src={Logo} alt="mhr" />
        <h1 className="registo">Registo</h1>
        <form onSubmit={handleSubmit}>
          <div className="container-input-grande">
            <input
              className="registo-input"
              type="text"
              id="user"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              placeholder="Nome de utilizador"
              required
              aria-invalid={validName ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
            />
            <div className="icon-registo">
              <i className="fa fa-user" aria-hidden="true"></i>
            </div>
          </div>
          <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
            <FontAwesomeIcon icon={faInfoCircle} />
            Entre 4 a 24 caracteres.
            Tem de começar com uma letra.
            Letras, números, _ e - são permitidos!
          </p>

          <div className="container-input-pequeno">
            <input
              htmlFor="Data-nascimento"
              className="registo-input-pequeno"
              type="date"
              id="Data-nascimento"
              onChange={(e) => setDataNascimento(e.target.value)}
              required
              aria-invalid={validDataNascimento ? "false" : "true"}
              aria-describedby="datanascimentoidnote"
              onFocus={() => setDataNascimentoFocus(true)}
              onBlur={() => setDataNascimentoFocus(false)}
            />
            <div className="icon-registo-pequeno-primeiro">
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </div>

            <input
              className="registo-input-pequeno"
              type="text"
              id="Genero"
              placeholder="Género"
              onChange={(e) => setGenero(e.target.value)}
              required
              aria-invalid={validGenero ? "false" : "true"}
              aria-describedby="generoidnote"
              onFocus={() => setGeneroFocus(true)}
              onBlur={() => setGeneroFocus(false)}
            />
            <div className="icon-registo-pequeno-segundo">
              <i className="fa fa-venus-mars" aria-hidden="true"></i>
            </div>
          </div>
          <div className="container-input-pequeno">
            <input
              className="registo-input-pequeno"
              type="tel"
              id="Telemovel"
              placeholder="Telemóvel"
              onChange={(e) => setTelemovel(e.target.value)}
              required
              aria-invalid={validTelemovel ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setTelemovelFocus(true)}
              onBlur={() => setTelemovelFocus(false)}
            />
            <div className="icon-registo-pequeno-primeiro">
              <i className="fa fa-phone" aria-hidden="true"></i>
            </div>
            <input
              className="registo-input-pequeno"
              id="Email"
              placeholder="Email"
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
            <div className="icon-registo-pequeno-segundo">
              <i className="fa fa-envelope" aria-hidden="true"></i>
            </div>
          </div>

          <div className="container-input-grande">
            <input
              className="registo-input"
              type="password"
              id="password"
              placeholder="Palavra-Passe"
              onChange={(e) => setPass(e.target.value)}
              required
              aria-invalid={validPass ? "false" : "true"}
              aria-describedby="passidnote"
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
            />
            <div className="icon-registo">
              <i className="fa fa-key" aria-hidden="true"></i>
            </div>
          </div>
          <p id="passidnote" className={passFocus && !validPass ? "instructions" : "offscreen"}>
            <FontAwesomeIcon icon={faInfoCircle} />
            Entre 8 a 24 caracteres.
            Deve incluir letras maiúsculas e minúsculas, números e caracteres especiais.
            Caracteres especiais permitidos:
            <span aria-label="exclamation mark">!</span>
            <span aria-label="at symbol">@</span>
            <span aria-label="hashtag">#</span>
            <span aria-label="dollar sign">$</span>
            <span aria-label="percent">%</span>
          </p>

          <div className="container-input-grande">
            <input
              className="registo-input"
              type="password"
              id="confirmar-password"
              placeholder="Confirmar palavra-passe"
              onChange={(e) => setMatchPass(e.target.value)}
              required
              aria-invalid={validMatchPass ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setMatchPassFocus(true)}
              onBlur={() => setMatchPassFocus(false)}
            />
            <div className="icon-registo">
              <i className="fa fa-key" aria-hidden="true"></i>
            </div>
          </div>
          <button className="btn-registo" disabled={!validName || !validPass || !validMatchPass || !validEmail || !validTelemovel || !validGenero || !validDataNascimento}>
            Registar
          </button>
        </form>
        <a className="conta" href="/user/login">Já tenho conta!</a>
      </div>
    </div>
  )
}


export default Registar;
