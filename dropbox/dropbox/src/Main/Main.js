import React from "react";
import "../utils.js";
import { Dropbox } from "dropbox";
import Download from "../Download/Download";
import Upload from "../Upload/Upload";

export default class Main extends React.Component {
  //state som innehåller files,path,starred och previusPath
  state = {
    files: [],
    path: "",
    starred: [],
    previousPath: []
  };

  //
  componentWillMount() {
    this.loadPath(this.state.path);
  }

  //för att hitta informationen om den filen som är favorit markerad och slänga den i state
  findStarInfo = value => {
    let starredArray = this.state.starred;
    let idExistsInFiles = false;
    let idExistsInFilesIndex = "";
    let idExistsInStarred = false;

    //går genom files i state och kollar om id stämmer, om ja sätter Idexist to true och spara indexet
    this.state.files.map((element, indexOf) => {
      if (element.id === value) {
        idExistsInFiles = true;
        idExistsInFilesIndex = indexOf;
      }
    });

    starredArray.map(item => {
      if (item.id === value) {
        idExistsInStarred = true;
      }
    });

    //om id finns inte i starred men finns i files då ska man pusha den till starredarray
    if (idExistsInStarred === false && idExistsInFiles === true) {
      starredArray.push(this.state.files[idExistsInFilesIndex]);
      this.setState({
        starred: starredArray
      });
    }
  };

  checkIfItemIsStarred = id => {
    let starredArray = this.state.starred;
    let answer = false;
    starredArray.map(element => {
      if (element.id === id) {
        answer = true;
      }
    });
    return answer;
  };

  changeStar = id => {
    if (this.checkIfItemIsStarred(id)) {
      this.removeStar(id);
    } else {
      this.findStarInfo(id);
    }
  };

  //för att hitta vilken fil ska tas bort från favoriter
  removeStar = value => {
    let removeFromArray = this.state.starred;
    removeFromArray.map((element, indexOf) => {
      if (element.id === value) {
        removeFromArray.splice(indexOf, 1);
      }
    });
    this.setState({
      starred: removeFromArray
    });
  };

  starredList = () => {
    this.setState({
      path: ""
    });
    let starred = this.state.starred;
    this.setState({
      files: starred
    });
  };

  loadPath = x => {
    if (localStorage.getItem("access_token")) {
      const self = this;
      let data = [];
      var dbx = new Dropbox({
        accessToken: localStorage.getItem("access_token")
      });
      dbx.filesListFolder({ path: x }).then(function(response) {
        let temp = [];
        temp.push(response.entries);
        let result = temp[0].map(function(obj) {
          let tempresult = [];
          tempresult[".tag"] = obj[".tag"];
          tempresult["id"] = obj.id;
          tempresult["name"] = obj.name;
          tempresult["path_display"] = obj.path_display;
          tempresult["path_lower"] = obj.path_lower;
          tempresult["size"] = obj.size;
          tempresult["server_modified"] = obj.server_modified;
          tempresult["client_modified"] = obj.client_modified;
          return tempresult;
        });

        data = result;
        self.setState({
          files: data
        });
      });
    }
  };

  changePath = e => {
    this.setState({
      previousPath: this.state.path,
      path: e
    });
    this.loadPath(e);
  };

  goBack = () => {
    this.setState({
      path: this.state.previousPath
    });
    this.loadPath(this.state.previousPath);
  };

  goToParent = () => {
    let newPathArray = this.state.path.split("/");
    newPathArray.splice(0, 1);
    newPathArray.splice(-1, 1);
    newPathArray = "/" + newPathArray.join("/");
    this.changePath(newPathArray);
  };

  //printar breadcrumps
  printBreadCrumbs = path => {
    let thisPath = path.toString();
    let adress = "";
    let dataToPrint = [];

    if (thisPath !== "") {
      let newPathArray = thisPath.split("/");
      newPathArray.splice(0, 1);

      newPathArray.map(name => {
        let names = name;
        adress = adress + "/" + names;
        dataToPrint.push([adress, names]);
      });
    }
    return dataToPrint;
  };

  upLoadAndChangePath = (files, path) => {
    let successfulUpload = Upload(files, path);

    let checkIfDone = () => {
      if (successfulUpload === null) {
        this.changePath(path);
        clearInterval(timer);
      }
    };
    let timer = setInterval(checkIfDone, 1000);
  };

  signOut = () => {
    localStorage.removeItem("access_token");
    if (!localStorage.getItem("access_token")) {
      console.log("hellllloooooo");
      this.setState({
        files: [],
        path: "",
        starred: [],
        previousPath: []
      });
      window.location.href = "https://pixbox.netlify.com";
    }
  };

  render() {
    if (localStorage.getItem("access_token")) {
      return (
        <div>
          <h1 className="firstm">Welcome to your PIX-BOX</h1>
          <button onClick={this.signOut} className="button-signout">
            Sign Out
          </button>
          <div className="navigation">
            <p onClick={() => this.changePath("")} className="iconWrap">
              <i className="fas fa-home  text-white" />
            </p>
            <p onClick={() => this.starredList()} className="iconWrap">
              <i className="fas fa-star text-warning" />
              Starred
            </p>
            <p onClick={() => this.goBack()} className="iconWrap">
              <i className="fas fa-arrow-circle-left  text-white" />
              Go back
            </p>
            <hr />
            {this.printBreadCrumbs(this.state.path).map(obj => {
              return (
                <line>
                  <breadcrumb onClick={() => this.changePath(obj[0])}>
                    {obj[1]}
                  </breadcrumb>
                  /
                </line>
              );
            })}
          </div>
          <table className="table">
            <thead className="thead-dark" style={{ fontSize: "20px" }}>
              <tr>
                <th scope="col">Filename</th>
                <th scope="col">Size</th>
                <th scope="col">Timestamp</th>
                <th scope="col">Last modified</th>
                <th scope="col" />
              </tr>
            </thead>

            <tbody>
              {this.state.files.map(function(obj) {
                let icon = "";
                let star = "";
                if (obj[".tag"] === "folder") {
                  icon = "fas fa-folder";
                  if (this.checkIfItemIsStarred(obj.id)) {
                    star = "fas fa-star";
                  } else {
                    star = "far fa-star";
                  }
                  return (
                    <tr key={obj.id}>
                      <td
                        onClick={() => this.changePath(obj.path_lower)}
                        className={icon}
                      >
                        <p
                          style={{
                            paddingLeft: "1em",
                            display: "inline-block"
                          }}
                        >
                          {obj.name}
                        </p>
                      </td>
                      <td>{obj.size}</td>
                      <td>{obj.client_modified}</td>
                      <td>{obj.server_modified}</td>
                      <td
                        className={star}
                        onClick={() => this.changeStar(obj.id)}
                      />
                    </tr>
                  );
                } else if (obj[".tag"] === "file") {
                  icon = "fas fa-file";
                  if (this.checkIfItemIsStarred(obj.id)) {
                    star = "fas fa-star";
                  } else {
                    star = "far fa-star";
                  }
                  return (
                    <tr key={obj.id}>
                      <td
                        onClick={() => {
                          Download(obj[".tag"], obj.path_lower);
                        }}
                        className={icon}
                      >
                        <p
                          style={{
                            paddingLeft: "1em",
                            display: "inline-block"
                          }}
                        />
                        {obj.name}
                        />
                      </td>
                      <td>{obj.size}</td>
                      <td>{obj.client_modified}</td>
                      <td>{obj.server_modified}</td>
                      <td
                        className={star}
                        onClick={() => this.changeStar(obj.id)}
                      />
                    </tr>
                  );
                }
              }, this)}
            </tbody>
          </table>
          <form>
            <input
              type="file"
              id="upload"
              onChange={e =>
                this.upLoadAndChangePath(e.target.files, this.state.path)
              }
            />
          </form>
        </div>
      );
    } else return null;
  }
}
