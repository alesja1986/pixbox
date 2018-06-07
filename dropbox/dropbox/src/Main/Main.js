import React from 'react';
import '../utils.js';
import { Dropbox } from 'dropbox';
import Download from "../Download/Download";
import Upload from "../Upload/Upload";

export default class Main extends React.Component {
    state = {
        files: [],
        path: '',
        starred: [],
        previousPath: []
    };

    componentWillMount() {
        this.loadPath(this.state.path)
    }

    //för att hitta informationen om den filen som är favorit markerad och slänga den i state
    findStarInfo = (value) => {
        let starredArray = this.state.starred;
        let idExistsInFiles = false;
        let idExistsInFilesIndex = "";
        let idExistsInStarred = false;
        this.state.files.map((element, indexOf) => {
            if (element.id === value) {
                idExistsInFiles = true;
                idExistsInFilesIndex = indexOf;
            }
        })

        starredArray.map((item) => {
            if (item.id === value) {
                idExistsInStarred = true;
            }
        })

        if (idExistsInStarred === false && idExistsInFiles === true) {
            starredArray.push(this.state.files[idExistsInFilesIndex]);
            this.setState({
                starred: starredArray

            })
        }
    }

    checkIfItemIsStarred = (id) => {
        let starredArray = this.state.starred;
        let answer = false
        starredArray.map((element) => {
            if (element.id === id) {
                answer = true
            }
        })
        return answer
    }

    changeStar = (id) => {
        if (this.checkIfItemIsStarred(id)) {
            this.removeStar(id);
        }
        else {
            this.findStarInfo(id);
        }
    }

    //för att hitta vilken fil ska tas bort från favoriter
    removeStar = (value) => {
        let removeFromArray = this.state.starred;
        removeFromArray.map((element, indexOf) => {
            if (element.id === value) {
                removeFromArray.splice(indexOf, 1);
            }
        });
        this.setState({
            starred: removeFromArray
        })
        console.log(this.state.starred);
    }

    starredList = () => {
        this.setState({
            path: ''
        })
        let starred = this.state.starred;
        this.setState({
            files: starred
        })
    }

    loadPath = (x) => {
        if (localStorage.getItem("access_token")) {
            const self = this;
            let data = [];
            var dbx = new Dropbox({accessToken: localStorage.getItem("access_token")});
            dbx.filesListFolder({path: x})
                .then(function (response) {
                    let temp = [];
                    temp.push(response.entries);
                    let result = temp[0].map(function (obj) {
                        let tempresult = [];
                        tempresult['.tag'] = obj[".tag"];
                        tempresult['id'] = obj.id;
                        tempresult['name'] = obj.name;
                        tempresult['path_display'] = obj.path_display;
                        tempresult['path_lower'] = obj.path_lower;
                        tempresult['size'] = obj.size;
                        tempresult['server_modified'] = obj.lastmod;
                        tempresult['client_modified'] = obj.client_modified;
                        return tempresult;
                    });

                    data = result;
                    self.setState({
                            files: data
                        },
                    );
                })
        }
        ;
    }


    changePath = (e) => {
        this.setState({
            previousPath: this.state.path,
            path: e
        })
        this.loadPath(e);
    }

    goBack = () => {
        this.setState({
            path: this.state.previousPath
        })
        this.loadPath(this.state.previousPath)
    }

    goToParent = () => {
        let newPathArray = this.state.path.split("/");
        newPathArray.splice(0, 1);
        newPathArray.splice(-1,1);
        newPathArray = "/" + newPathArray.join('/');
        this.changePath(newPathArray)
    }

    printBreadCrumbs = (path) => {

        let thisPath = path.toString();
        let adress = ''
        let dataToPrint = []

        if (thisPath !== '') {
            let newPathArray = thisPath.split("/");
            newPathArray.splice(0, 1);

            newPathArray.map((name) => {
                console.log(name);
                let names = name;
                adress = adress + "/" + names;
                dataToPrint.push([adress, names])
            })
        }
        return dataToPrint;
    }

   upLoadAndChangePath=(files,path)=> {
                    let successfulUpload = Upload(files,path)

                    let checkIfDone = () => {
                        console.log(successfulUpload)
                        if(successfulUpload === null){
                            this.changePath(path);
                            clearInterval(timer);
                        }
                    }
       let timer = setInterval(checkIfDone, 1000);
   }


   signOut =()=>{
       localStorage.removeItem('access_token');
}

        render()
        {
            return (
                <div>
                    <h1 id="firstmessage">Welcome to your PIX-BOX</h1>
                    <button onClick={this.signOut} className="btn btn-lg">Sign Out</button>
                    <div className="navigation">
                        <p onClick={() => this.loadPath('')}><i className="fas fa-home text-info"></i></p>
                        <p onClick={() => this.starredList()}><i className="fas fa-star text-warning"></i>Starred</p>
                        <p onClick={() => this.goBack()}><i className="fas fa-arrow-circle-left"></i>Go back</p>
                        <p onClick={() => this.goToParent()}><i className="fas fa-arrow-circle-left"></i>Go to daddy</p>

                        <hr></hr>
                        {this.printBreadCrumbs(this.state.path).map((obj) => {
                            return <line><breadcrumb onClick={()=>this.changePath(obj[0])}>{obj[1]}</breadcrumb>/</line>
                        })}


                    </div>
                    <table className="table">
                        <thead className="thead-dark">
                        <tr>
                            <th scope="col">Filename</th>
                            <th scope="col">Size</th>
                            <th scope="col">Timestamp</th>
                            <th scope="col">Last modified</th>
                            <th scope="col"></th>
                        </tr>
                        </thead>

                        <tbody>
                        {this.state.files.map(function (obj) {
                                let icon = '';
                                let star = '';
                                if (obj[".tag"] === "folder") {
                                    icon = "fas fa-folder";
                                    if (this.checkIfItemIsStarred(obj.id)) {
                                        star = "fas fa-star"
                                    }
                                    else {
                                        star = "far fa-star"
                                    }
                                    return (
                                        <tr key={obj.id}>
                                            <td onClick={() => this.changePath(obj.path_lower)}
                                                className={icon}>
                                                {obj.name}</td>
                                            <td>{obj.size}</td>
                                            <td>{obj.lastmod}</td>
                                            <td>{obj.client_modified}</td>
                                            <td className={star} onClick={() => this.changeStar(obj.id)}></td>
                                        </tr>
                                    )
                                }

                                else if (obj[".tag"] === "file") {
                                    icon = "fas fa-file";
                                    if (this.checkIfItemIsStarred(obj.id)) {
                                        star = "fas fa-star"
                                    }
                                    else {
                                        star = "far fa-star"
                                    }
                                    return (
                                        <tr key={obj.id}>
                                            <td onClick={() => {
                                                Download(obj[".tag"], obj.path_lower);
                                            }}
                                                className={icon}>
                                                {obj.name}</td>
                                            <td>{obj.size}</td>
                                            <td>{obj.lastmod}</td>
                                            <td>{obj.client_modified}</td>
                                            <td className={star} onClick={() => this.changeStar(obj.id)}></td>
                                        </tr>
                                    )
                                }
                                ;
                            }
                            , this)}
                        </tbody>
                    </table>
                    <form>
                        <input type="file" id="upload" onChange={(e)=> this.upLoadAndChangePath(e.target.files,this.state.path)}></input>
                    </form>
                </div>
            )
        }
    }



