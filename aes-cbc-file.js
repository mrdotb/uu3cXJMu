(() => {

  function downloadBlob(blob, name = 'file.txt') {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true, 
        view: window 
      })
    );

    // Remove link from body
    document.body.removeChild(link);
  }

  // C'est pour transformer l'input file en arrayBuffer
  const readUploadedFileAsText = (inputFile) => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsArrayBuffer(inputFile);
    });
  };
  async function getFileEncoding() {
    const input = document.querySelector("#aes-cbc-file");
    const file = input.files[0];
    // fr.onload = receivedText;
    const fileContents = await readUploadedFileAsText(file)  
    return fileContents
  }

  // J'ai pris cette function ds le code source de izneo je sais pas vraiment a quoi elle sert
  function f(e) {
    for (var t = self.atob(e), n = t.length, i = new Uint8Array(n), o = 0; o < n; o++)
      i[o] = t.charCodeAt(o);
    return i.buffer
  }


  async function decryptMessage(key, iv) {

    // On importe la cle
    const rkey = await window.crypto.subtle.importKey("raw", key, "AES-CBC", !0, ["encrypt", "decrypt"])
    console.log(rkey)
    let encoded = await getFileEncoding();
    console.log(encoded)
    let decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv
      },
      rkey,
      encoded 
    );
    // convertit le le decrypted array en blob
    let blob = new Blob([new Uint8Array(decrypted)])
    // Dl le blob en image
    downloadBlob(blob, "image.jpeg")
  }

  // event
  const decryptButton = document.querySelector(".aes-cbc-file .decrypt-button");
  decryptButton.addEventListener("click", () => {
    const key = document.getElementById('aes-cbc-key').value
    const iv = document.getElementById('aes-cbc-iv').value
    let encryption = {
      "key": f(key),
      "iv": f(iv),
    }
    decryptMessage(encryption.key, encryption.iv);
  });


})();
