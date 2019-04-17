import "./Download.css";
import { Dropbox } from "dropbox/src/index";

export default function Download(type, path) {
  var dbx = new Dropbox({ accessToken: localStorage.getItem("access_token") });
  dbx.filesGetTemporaryLink({ path: path }).then(function(response) {
    window.open(response.link, "_blank");
  });

  return null;
}
