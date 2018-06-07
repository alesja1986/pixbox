import React from 'react';
import '../utils.js';
import { Dropbox } from 'dropbox';

export default class Auth extends React.Component {
    CLIENT_ID = 'dwzodxx4tsontje';  //app key

    state = {
        isAuthenticated: false,
        token: '',
        authUrl: '',
        files:''
    };

    //component ska ha Class
    componentWillMount() {

        //Parses the url and gets the access token if it is in the urls hash
        function getAccessTokenFromUrl() {
            return window.utils.parseQueryString(window.location.hash).access_token;
        }

        //kollar om det finns token i localStorage och om det finns sätter Authenticated till true och sparar token
        if (localStorage.getItem("access_token")) {
            this.setState({
                 isAuthenticated: true,
                 token: localStorage.getItem("access_token")

            })
            console.log("localstorage is true");
        }

        //om inte token finns i localstorage ska den hämta token från URL och spara i localstorage
        else if (getAccessTokenFromUrl()) {
            let access_token = getAccessTokenFromUrl();
            localStorage.setItem("access_token", access_token);
            this.setState({
                token: access_token
            })
        }

        //om inte man har ingen token i localstorage och url då anvisas man till dropbox inloggnings sidan.
        else {
            const dbx = new Dropbox({ clientId: this.CLIENT_ID});
            this.setState({
            authUrl: dbx.getAuthenticationUrl('https://pix-box.netlify.com')
            })
        }
    }


     //class ska alltid ha render när man använder return!
    render() {
        //if-sats som kontrollerar om token existerar om ja laddar inloggade sidan
        if(this.state.token){
        return (
            null
        );}
        //annars laddas login-knappcd
        if(!this.state.token){
            return (
                <div>
                    <a href={this.state.authUrl} id="authlink" className="button"> Logga in på din Pix-Box</a>
                </div>
            );}
    }
}






