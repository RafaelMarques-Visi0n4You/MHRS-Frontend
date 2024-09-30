import axios from "axios";

class AuthService {
    login(nome_utilizador, pass) {
        return axios
            .post("https://mhrs-frontend.onrender.com/user/login", { nome_utilizador, pass })
            .then(res => {
                if (res.data.token) {
                    localStorage.setItem("user", JSON.stringify(res.data));
                }
                return res.data;
            }, reason => { throw new Error('Utilizador Inválido'); });
    }
    loginVisitante(email, pass){
        return axios
            .post("https://mhrs-frontend.onrender.com/user/loginUserVisitante", { email, pass })
            .then(res => {
                if (res.data.token) {
                    localStorage.setItem("user", JSON.stringify(res.data));
                }
                return res.data;
            }, reason => { throw new Error('Utilizador Inválido'); });
    }
    logout() { localStorage.removeItem("user"); }
    getCurrentUser() { 
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Retrieved user from localStorage:', user);
        return user ? user.user : null;
    }
    

} export default new AuthService();