import { Dropbox } from "dropbox/src/index";

export default function Upload(files, path) {
  let filesinput = files[0];
  if (filesinput) {
    var dbx = new Dropbox({
      accessToken: localStorage.getItem("access_token")
    });
    dbx
      .filesUpload({
        contents: filesinput,
        path: path + "/" + filesinput.name,
        autorename: true
      })
      .then(function(response) {
        alert("Your File Has been uploaded! á la success");
        return null;
      })
      .catch(function(error) {
        console.error("ooo nooooo,its a error! Try again!");
      });
  }
  return null;
}
